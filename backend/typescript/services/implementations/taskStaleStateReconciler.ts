import { Op } from "sequelize";
import { DateTime } from "luxon";
import PgTask from "../../models/task.model";
import TaskTemplate from "../../models/taskTemplate.model";
import Pet from "../../models/pet.model";
import User from "../../models/user.model";
import { InteractionTypeEnum } from "../../types";
import { getSystemUserId } from "../../utilities/systemUser";
import InteractionService from "./interactionService";

const TIME_ZONE = "America/New_York";

export function isTaskIncomplete(
  task: Pick<
    PgTask,
    "end_time" | "incomplete_logged_at" | "scheduled_start_time"
  >,
  today: DateTime,
): boolean {
  return (
    !task.end_time &&
    !task.incomplete_logged_at &&
    !!task.scheduled_start_time &&
    DateTime.fromJSDate(task.scheduled_start_time)
      .setZone(TIME_ZONE)
      .startOf("day") < today
  );
}

export function isTaskStaleAssignment(
  task: Pick<
    PgTask,
    "start_time" | "end_time" | "user_id" | "scheduled_end_time"
  >,
  now: Date,
): boolean {
  return (
    !task.start_time &&
    !task.end_time &&
    task.user_id != null &&
    !!task.scheduled_end_time &&
    task.scheduled_end_time.getTime() < now.getTime()
  );
}

/**
 * Lazily reconciles task rows on read: unassigns tasks whose scheduled
 * window has passed with nobody having started/completed them, and logs a
 * task as incomplete once its scheduled start day has passed with no end
 * time. Both are self-guarded conditional updates, so a row can only ever
 * fire once each - safe to call on every read.
 *
 * Shadow rows (origin_task_id set - see s26/alice/rehaul-recurring-tasks)
 * carry none of their own schedule/pet/template fields, those live on the
 * anchor they decorate. This resolves an "effective" view (pet_id,
 * task_template_id, scheduled_start_time, scheduled_end_time) from the
 * anchor for staleness checks and message text, without changing what
 * actually gets persisted - only the shadow's own end_time/
 * incomplete_logged_at/user_id/start_time are ever written.
 */
// Callers may pass raw plain objects (raw: true queries) or live Sequelize
// model instances (e.g. resolveShadowTask's find/create calls don't use
// raw: true). Object spread on a live instance isn't guaranteed to carry
// over its column values, so normalize to a plain object once, up front,
// via explicit field references - safe for either source.
function toPlainTask(task: PgTask): PgTask {
  return {
    id: task.id,
    origin_task_id: task.origin_task_id,
    occurrence_date: task.occurrence_date,
    pet_id: task.pet_id,
    task_template_id: task.task_template_id,
    user_id: task.user_id,
    scheduled_start_time: task.scheduled_start_time,
    scheduled_end_time: task.scheduled_end_time,
    start_time: task.start_time,
    end_time: task.end_time,
    incomplete_logged_at: task.incomplete_logged_at,
    notes: task.notes,
  } as PgTask;
}

export async function reconcileLazyTaskStates(
  rawTasks: PgTask[],
): Promise<PgTask[]> {
  const tasks = rawTasks.map(toPlainTask);
  const now = new Date();
  const today = DateTime.now().setZone(TIME_ZONE).startOf("day");

  const anchorIds = [
    ...new Set(
      tasks
        .filter((task) => task.origin_task_id != null)
        .map((task) => task.origin_task_id as number),
    ),
  ];
  const anchorsById = new Map(
    anchorIds.length > 0
      ? (
          await PgTask.findAll({
            where: { id: { [Op.in]: anchorIds } },
            raw: true,
          })
        ).map((anchor) => [anchor.id, anchor])
      : [],
  );

  const effective = (task: PgTask): PgTask => {
    if (task.origin_task_id == null) return task;
    const anchor = anchorsById.get(task.origin_task_id);
    if (!anchor || !anchor.scheduled_start_time || !task.occurrence_date) {
      return task;
    }

    const effectiveStart = new Date(task.occurrence_date);
    effectiveStart.setUTCHours(anchor.scheduled_start_time.getUTCHours());
    effectiveStart.setUTCMinutes(anchor.scheduled_start_time.getUTCMinutes());
    effectiveStart.setUTCSeconds(anchor.scheduled_start_time.getUTCSeconds());
    effectiveStart.setUTCMilliseconds(
      anchor.scheduled_start_time.getUTCMilliseconds(),
    );

    const durationMs = anchor.scheduled_end_time
      ? anchor.scheduled_end_time.getTime() -
        anchor.scheduled_start_time.getTime()
      : undefined;

    return {
      id: task.id,
      origin_task_id: task.origin_task_id,
      occurrence_date: task.occurrence_date,
      user_id: task.user_id,
      start_time: task.start_time,
      end_time: task.end_time,
      incomplete_logged_at: task.incomplete_logged_at,
      notes: task.notes,
      pet_id: anchor.pet_id,
      task_template_id: anchor.task_template_id,
      scheduled_start_time: effectiveStart,
      scheduled_end_time:
        durationMs !== undefined
          ? new Date(effectiveStart.getTime() + durationMs)
          : undefined,
    } as PgTask;
  };

  const isIncomplete = (task: PgTask): boolean =>
    isTaskIncomplete(effective(task), today);

  const isStaleAssignment = (task: PgTask): boolean =>
    isTaskStaleAssignment(effective(task), now);

  const staleTasks = tasks.filter(
    (task) => isIncomplete(task) || isStaleAssignment(task),
  );

  if (staleTasks.length === 0) return tasks;

  const taskTemplateIds = [
    ...new Set(staleTasks.map((task) => effective(task).task_template_id)),
  ];
  const petIds = [...new Set(staleTasks.map((task) => effective(task).pet_id))];
  const userIds = [
    ...new Set(
      staleTasks
        .map((task) => task.user_id)
        .filter((id): id is number => id != null),
    ),
  ];

  const [taskTemplates, pets, users] = await Promise.all([
    TaskTemplate.findAll({
      where: { id: { [Op.in]: taskTemplateIds } },
      raw: true,
    }),
    Pet.findAll({ where: { id: { [Op.in]: petIds } }, raw: true }),
    userIds.length > 0
      ? User.findAll({ where: { id: { [Op.in]: userIds } }, raw: true })
      : Promise.resolve([]),
  ]);

  const taskTemplateNameById = new Map(
    taskTemplates.map((taskTemplate) => [
      taskTemplate.id,
      taskTemplate.task_name,
    ]),
  );
  const petNameById = new Map(pets.map((pet) => [pet.id, pet.name]));
  const userNameById = new Map(
    users.map((user) => [user.id, `${user.first_name} ${user.last_name}`]),
  );

  const systemUserId = await getSystemUserId();
  const updatedById = new Map<number, PgTask>();

  await Promise.all(
    staleTasks.map(async (task) => {
      const effectiveTask = effective(task);
      const taskTemplateName = taskTemplateNameById.get(
        effectiveTask.task_template_id,
      );
      const petName = petNameById.get(effectiveTask.pet_id);
      const oldUserName =
        task.user_id != null ? userNameById.get(task.user_id) : undefined;

      let current = task;

      if (isIncomplete(current)) {
        const [affected] = await PgTask.update(
          { incomplete_logged_at: now },
          {
            where: {
              id: current.id,
              incomplete_logged_at: { [Op.is]: null },
            },
          },
        );
        if (affected > 0) {
          current = { ...current, incomplete_logged_at: now } as PgTask;
          const interactionTypeId =
            await InteractionService.getInteractionTypeId(
              InteractionTypeEnum.MARKED_TASK_INCOMPLETE,
            );
          await InteractionService.log({
            actorId: systemUserId,
            targetUserId: null,
            targetPetId: null,
            targetTaskId: current.id,
            targetTaskTemplateId: null,
            interactionTypeId,
            metadata: [],
            short_description: `${taskTemplateName} is an incomplete task with ${petName}`,
            long_description: oldUserName
              ? `${taskTemplateName} is an incomplete task. It was last assigned to ${oldUserName}.`
              : `${taskTemplateName} is an incomplete task. Nobody was assigned this task.`,
          });
        }
      }

      if (isStaleAssignment(current)) {
        const [affected] = await PgTask.update(
          { user_id: null },
          {
            where: {
              id: current.id,
              user_id: { [Op.ne]: null },
              start_time: { [Op.is]: null },
              end_time: { [Op.is]: null },
            },
          },
        );
        if (affected > 0) {
          current = { ...current, user_id: undefined } as PgTask;
          const interactionTypeId =
            await InteractionService.getInteractionTypeId(
              InteractionTypeEnum.MARKED_TASK_INACTIVE,
            );
          await InteractionService.log({
            actorId: systemUserId,
            targetUserId: null,
            targetPetId: null,
            targetTaskId: current.id,
            targetTaskTemplateId: null,
            interactionTypeId,
            metadata: [],
            short_description: `${taskTemplateName} is an inactive task with ${petName}`,
            long_description: `${taskTemplateName} is an inactive task. It was last assigned to ${
              oldUserName ?? "N/A"
            }`,
          });
        }
      }

      updatedById.set(task.id, current);
    }),
  );

  return tasks.map((task) => updatedById.get(task.id) ?? task);
}
