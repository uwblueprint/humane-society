import React from "react";
import { Flex, Text, Icon, Grid } from "@chakra-ui/react";
import { ScheduledTaskDTO, TaskCategory } from "../../../types/TaskTypes";
import { ReactComponent as GamesIcon } from "../../../assets/icons/games.svg";
import { ReactComponent as HusbandryIcon } from "../../../assets/icons/husbandry.svg";
import { ReactComponent as MiscIcon } from "../../../assets/icons/misc.svg";
import { ReactComponent as PenTimeIcon } from "../../../assets/icons/pen_time.svg";
import { ReactComponent as TrainingIcon } from "../../../assets/icons/training.svg";
import { ReactComponent as WalkIcon } from "../../../assets/icons/walk.svg";
import { ReactComponent as OutlinedUserProfileIcon } from "../../../assets/icons/outline-user-profile.svg";
import { ReactComponent as RoundQuestionMarkIcon } from "../../../assets/icons/round-question-mark.svg";
import formatTimeFromISO from "../../../utils/dateTimeUtils";
import Button from "../../../components/common/Button";
import ProfilePhoto from "../../../components/common/ProfilePhoto";
import { AuthenticatedUser } from "../../../types/AuthTypes";
import UserRoles from "../../../constants/UserConstants";
import { getTaskDetailedStatus, isToday } from "../../../utils/taskStatusUtils";

interface PetProfileTaskTableSectionProps {
  petId: number;
  tasks: ScheduledTaskDTO[];
  gridTemplateColumns: string;
  authenticatedUser: AuthenticatedUser;
  onTaskClick: (taskId: number) => void;
  onAssignClick: (taskId: number) => void;
}

const StatusBadge = ({
  task,
  authenticatedUser,
  onTaskClick,
  onAssignClick,
}: {
  task: ScheduledTaskDTO;
  authenticatedUser: AuthenticatedUser;
  onTaskClick: (taskId: number) => void;
  onAssignClick: (taskId: number) => void;
}) => {
  const isAdminOrBehaviourist =
    authenticatedUser?.role === UserRoles.ADMIN ||
    authenticatedUser?.role === UserRoles.BEHAVIOURIST;

  if (isAdminOrBehaviourist) {
    if (task.endTime)
      return (
        <Button as="button" variant="gray-shaded" size="medium" type="button">
          Completed
        </Button>
      );
    if (!task.assignedUser)
      return (
        <Button
          as="button"
          variant="dark-blue"
          size="medium"
          type="button"
          onClick={(e: React.MouseEvent) => {
            e.stopPropagation();
            onAssignClick(task.id);
          }}
        >
          Assign
        </Button>
      );
    if (task.assignedUser && !task.endTime)
      return (
        <Button as="button" variant="green" size="medium" type="button">
          In Progress
        </Button>
      );
    return <></>;
  }

  const status = getTaskDetailedStatus(task, authenticatedUser);
  const isMyTask = task.userId === authenticatedUser?.id;

  if (status === null)
    return (
      <Button
        as="button"
        variant="gray"
        size="medium"
        type="button"
        onClick={() => onTaskClick(task.id)}
      >
        Assign to Me
      </Button>
    );

  if (status === "Assigned" && isMyTask && isToday(task.scheduledStartTime))
    return (
      <Button
        as="button"
        variant="dark-blue"
        size="medium"
        type="button"
        onClick={() => onTaskClick(task.id)}
      >
        Start
      </Button>
    );

  if (status === "Assigned" && isMyTask)
    return (
      <Button as="button" variant="gray-shaded" size="medium" type="button">
        Assigned
      </Button>
    );

  if (status === "Assigned") return <></>;

  if (status === "In-Progress")
    return (
      <Button
        as="button"
        variant="green"
        size="medium"
        type="button"
        onClick={() => onTaskClick(task.id)}
      >
        In Progress
      </Button>
    );

  if (status === "Occupied")
    return (
      <Button as="button" variant="gray-shaded" size="medium" type="button">
        Occupied
      </Button>
    );

  if (status === "Completed")
    return (
      <Button as="button" variant="gray-shaded" size="medium" type="button">
        Completed
      </Button>
    );

  if (status === "Incomplete")
    return (
      <Button as="button" variant="red" size="medium" type="button">
        Incomplete
      </Button>
    );

  return <></>;
};

const taskTypeIcons: Record<TaskCategory, React.ElementType> = {
  [TaskCategory.WALK]: WalkIcon,
  [TaskCategory.GAMES]: GamesIcon,
  [TaskCategory.PEN_TIME]: PenTimeIcon,
  [TaskCategory.HUSBANDRY]: HusbandryIcon,
  [TaskCategory.TRAINING]: TrainingIcon,
  [TaskCategory.MISC]: MiscIcon,
};

const PetProfileTaskTableSection = ({
  tasks,
  gridTemplateColumns,
  authenticatedUser,
  onTaskClick,
  onAssignClick,
}: PetProfileTaskTableSectionProps): React.ReactElement => {
  return (
    <Flex direction="column">
      {tasks.map((task) => {
        const isMyTask = task.userId === authenticatedUser?.id;
        const isVolunteerOrStaff =
          authenticatedUser?.role === UserRoles.VOLUNTEER ||
          authenticatedUser?.role === UserRoles.STAFF;
        const hideAssigneeDetails = isVolunteerOrStaff && !isMyTask;

        const renderAssignee = () => {
          if (!task.assignedUser) {
            return (
              <>
                <Flex
                  boxSize="2.25rem"
                  borderRadius="full"
                  border="1px solid"
                  borderColor="gray.300"
                  alignItems="center"
                  justifyContent="center"
                  bg="gray.700"
                  flexShrink={0}
                >
                  <Icon as={RoundQuestionMarkIcon} boxSize="1.25rem" />
                </Flex>
                <Text textStyle="body" m={0} isTruncated>
                  Unassigned
                </Text>
              </>
            );
          }
          if (hideAssigneeDetails) {
            return <Icon as={OutlinedUserProfileIcon} boxSize="2.25rem" />;
          }
          return (
            <>
              <ProfilePhoto
                image={task.assignedUser.profilePhoto ?? undefined}
                size="small"
                type="user"
              />
              <Text textStyle="body" m={0} isTruncated>
                {isVolunteerOrStaff && isMyTask
                  ? "Me"
                  : `${task.assignedUser.firstName} ${task.assignedUser.lastName}`}
              </Text>
            </>
          );
        };

        return (
          <Grid
            key={task.id}
            gridTemplateColumns={gridTemplateColumns}
            padding="1rem 1.5rem"
            alignItems="center"
            borderBottom="1px solid"
            borderColor="gray.200"
            backgroundColor="white"
            marginBottom="0.5rem"
            marginTop="0.5rem"
            borderRadius="0.75rem"
            onClick={() => onTaskClick(task.id)}
            cursor="pointer"
          >
            <Flex align="center" gap="0.75rem" overflow="hidden" pr="1rem">
              <Icon
                as={taskTypeIcons[task.category]}
                boxSize="1.5rem"
                flexShrink={0}
              />
              <Text textStyle="body" m={0} isTruncated>
                {task.taskName}
              </Text>
            </Flex>
            <Text textStyle="body" m={0}>
              {task.scheduledStartTime
                ? formatTimeFromISO(task.scheduledStartTime.toString())
                : "—"}
            </Text>
            <Text textStyle="body" m={0}>
              {task.endTime ? formatTimeFromISO(task.endTime.toString()) : "—"}
            </Text>
            <Flex align="center" gap="0.75rem" overflow="hidden" pr="1rem">
              {renderAssignee()}
            </Flex>
            <StatusBadge
              task={task}
              authenticatedUser={authenticatedUser}
              onTaskClick={onTaskClick}
              onAssignClick={onAssignClick}
            />
          </Grid>
        );
      })}
    </Flex>
  );
};

export default PetProfileTaskTableSection;
