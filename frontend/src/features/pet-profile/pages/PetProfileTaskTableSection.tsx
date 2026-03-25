import React from "react";
import { useHistory } from "react-router-dom";
import { Flex, Text, Icon, Grid } from "@chakra-ui/react";
import { ScheduledTaskDTO, TaskCategory } from "../../../types/TaskTypes";
import { ReactComponent as GamesIcon } from "../../../assets/icons/games.svg";
import { ReactComponent as HusbandryIcon } from "../../../assets/icons/husbandry.svg";
import { ReactComponent as MiscIcon } from "../../../assets/icons/misc.svg";
import { ReactComponent as PenTimeIcon } from "../../../assets/icons/pen_time.svg";
import { ReactComponent as TrainingIcon } from "../../../assets/icons/training.svg";
import { ReactComponent as WalkIcon } from "../../../assets/icons/walk.svg";
import formatTimeFromISO from "../../../utils/dateTimeUtils";
import Button from "../../../components/common/Button";
import ProfilePhoto from "../../../components/common/ProfilePhoto";

interface PetProfileTaskTableSectionProps {
  petId: number;
  tasks: ScheduledTaskDTO[];
  gridTemplateColumns: string;
}

const StatusBadge = ({
  task,
  petId,
}: {
  task: ScheduledTaskDTO;
  petId: number;
}) => {
  const history = useHistory();

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
        onClick={() => {
          history.push(`/pet-profile/${petId}/assign-task/${task.id}`);
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
  petId,
  tasks,
  gridTemplateColumns,
}: PetProfileTaskTableSectionProps): React.ReactElement => {
  return (
    <Flex direction="column">
      {tasks.map((task) => (
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
        >
          <Flex align="center" gap="0.75rem" overflow="hidden" pr="1rem">
            <Icon as={taskTypeIcons[task.category]} boxSize="1.5rem" flexShrink={0} />
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
          <Text textStyle="body" m={0}>
            {task.assignedUser
              ? `${task.assignedUser.firstName} ${task.assignedUser.lastName}`
              : "Unassigned"}
          </Text>
          <StatusBadge task={task} petId={petId} />
        </Grid>
      ))}
    </Flex>
  );
};

export default PetProfileTaskTableSection;
