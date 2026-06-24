import React, { useState } from "react";
import { useHistory } from "react-router-dom";
import { Flex, Text, Icon, Grid } from "@chakra-ui/react";
import { ScheduledTaskDTO } from "../../../types/TaskTypes";
import formatTimeFromISO from "../../../utils/dateTimeUtils";
import Button from "../../../components/common/Button";
import ProfilePhoto from "../../../components/common/ProfilePhoto";
import TaskDetailsModal from "../components/TaskDetailsModal";
import { taskCategoryIcons } from "../../../components/common/TaskCategoryBadge";

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
        onClick={(e) => {
          e.stopPropagation();
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

const PetProfileTaskTableSection = ({
  petId,
  tasks,
  gridTemplateColumns,
}: PetProfileTaskTableSectionProps): React.ReactElement => {
  const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null);

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
          onClick={() => setSelectedTaskId(task.id)}
          cursor="pointer"
        >
          <Flex align="center" gap="0.75rem" overflow="hidden" pr="1rem">
            <Icon
              as={taskCategoryIcons[task.category]}
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
            <ProfilePhoto
              image={task.assignedUser?.profilePhoto ?? undefined}
              size="small"
              type="user"
            />
            <Text textStyle="body" m={0} isTruncated>
              {task.assignedUser
                ? `${task.assignedUser.firstName} ${task.assignedUser.lastName}`
                : "Unassigned"}
            </Text>
          </Flex>
          <StatusBadge task={task} petId={petId} />
        </Grid>
      ))}
      {selectedTaskId !== null && (
        <TaskDetailsModal
          taskId={selectedTaskId}
          isOpen={selectedTaskId !== null}
          onClose={() => setSelectedTaskId(null)}
        />
      )}
    </Flex>
  );
};

export default PetProfileTaskTableSection;