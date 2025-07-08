import React from "react";
import { Text, Tbody, Tr, Td, Icon, HStack, Box } from "@chakra-ui/react";
import { Task, TaskCategory } from "../../../types/TaskTypes";
import { ReactComponent as HusbandryIcon } from "../../../assets/icons/husbandry.svg";
import { ReactComponent as PenTimeIcon } from "../../../assets/icons/pen_time.svg";
import { ReactComponent as GamesIcon } from "../../../assets/icons/games.svg";
import { ReactComponent as TrainingIcon } from "../../../assets/icons/training.svg";
import { ReactComponent as WalkIcon } from "../../../assets/icons/walk.svg";
import { ReactComponent as MiscIcon } from "../../../assets/icons/misc.svg";

interface TaskManagementTableSectionProps {
  tasks: Task[];
}

const TaskManagementTableSection = ({
  tasks,
}: TaskManagementTableSectionProps): React.ReactElement => {
  const taskCategoryIcons: Record<TaskCategory, React.ElementType> = {
    [TaskCategory.WALK]: WalkIcon,
    [TaskCategory.GAMES]: GamesIcon,
    [TaskCategory.PEN_TIME]: PenTimeIcon,
    [TaskCategory.HUSBANDRY]: HusbandryIcon,
    [TaskCategory.TRAINING]: TrainingIcon,
    [TaskCategory.MISC]: MiscIcon,
  };

  return (
    <Tbody>
      {tasks.map((task) => (
        <Tr key={task.id}>
          <Td width="20%" py="1rem" px="2.5rem">
            <Text textStyle="body" m={0} noOfLines={1}>
              {task.name}
            </Text>
          </Td>
          <Td width="20%" py="1rem" px="0">
            <HStack gap="0.8125rem" p={0}>
              <Icon as={taskCategoryIcons[task.category]} boxSize="2.5rem" />
              <Text textStyle="body" m={0}>
                {task.category}
              </Text>
            </HStack>
          </Td>
          <Td width="60%" py="1rem" pr="2.5rem" pl="4rem">
            <Box>
              <Text textStyle="body" m={0} noOfLines={2}>
                {task.instructions}
              </Text>
            </Box>
          </Td>
        </Tr>
      ))}
    </Tbody>
  );
};

export default TaskManagementTableSection;
