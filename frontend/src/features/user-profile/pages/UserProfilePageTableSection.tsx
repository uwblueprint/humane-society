import React from "react";
import { Flex, Text, Icon, Grid } from "@chakra-ui/react";
import { useHistory } from "react-router-dom";
import { ScheduledTaskDTO } from "../../../types/TaskTypes";
import formatTimeFromISO from "../../../utils/dateTimeUtils";
import Button from "../../../components/common/Button";
import { taskCategoryIcons } from "../../../components/common/TaskCategoryBadge";

interface UserProfilePageTableSectionProps {
  tasks: ScheduledTaskDTO[];
  gridTemplateColumns: string;
}

const getStatusBadge = (task: ScheduledTaskDTO) => {
  let label = "Assigned";
  if (task.scheduledStartTime) {
    const d = new Date(task.scheduledStartTime);
    const midnight = new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1);

    if (task.endTime && new Date(task.endTime) < midnight) {
      label = "Completed";
    } else if (new Date() >= midnight) {
      label = "Incomplete";
    }
  }

  return (
    <Button as="button" variant="gray-shaded" size="medium" type="button">
      {label}
    </Button>
  );
};

const UserProfilePageTableSection = ({
  tasks,
  gridTemplateColumns,
}: UserProfilePageTableSectionProps): React.ReactElement => {
  const history = useHistory();
  return (
    <Flex direction="column">
      {tasks.map((task) => (
        <Grid
          key={task.id}
          gridTemplateColumns={gridTemplateColumns}
          padding="1rem 2.5rem"
          alignItems="center"
          borderBottom="1px solid"
          borderColor="gray.200"
          backgroundColor="white"
          marginBottom="0.5rem"
          marginTop="0.5rem"
          borderRadius="0.75rem"
          onClick={() => history.push(`/pet-profile/${task.petId}`)}
        >
          <Flex align="center" gap="0.75rem">
            <Icon as={taskCategoryIcons[task.category]} boxSize="1.5rem" />
            <Text textStyle="body" m={0}>
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
            {task.petName ?? "—"}
          </Text>
          {getStatusBadge(task)}
        </Grid>
      ))}
    </Flex>
  );
};

export default UserProfilePageTableSection;
