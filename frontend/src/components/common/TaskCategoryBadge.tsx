import { Flex, Icon, Text } from "@chakra-ui/react";
import React from "react";
import { ReactComponent as GamesIcon } from "../../assets/icons/games.svg";
import { ReactComponent as HusbandryIcon } from "../../assets/icons/husbandry.svg";
import { ReactComponent as MiscIcon } from "../../assets/icons/misc.svg";
import { ReactComponent as PenTimeIcon } from "../../assets/icons/pen_time.svg";
import { ReactComponent as TrainingIcon } from "../../assets/icons/training.svg";
import { ReactComponent as WalkIcon } from "../../assets/icons/walk.svg";
import { TaskCategory } from "../../types/TaskTypes";

const taskCategoryIcons: Record<TaskCategory, React.ElementType> = {
  [TaskCategory.WALK]: WalkIcon,
  [TaskCategory.GAMES]: GamesIcon,
  [TaskCategory.PEN_TIME]: PenTimeIcon,
  [TaskCategory.HUSBANDRY]: HusbandryIcon,
  [TaskCategory.TRAINING]: TrainingIcon,
  [TaskCategory.MISC]: MiscIcon,
};

export interface TaskCategoryBadgeProps {
  taskCategory: TaskCategory;
}

const TaskCategoryBadge = ({
  taskCategory,
}: TaskCategoryBadgeProps): React.ReactElement => (
  <Flex flexDirection="row" alignItems="center" gap="0.8125rem">
    <Icon as={taskCategoryIcons[taskCategory]} boxSize="2.5rem" />
    <Text textStyle="body" m={0}>
      {taskCategory}
    </Text>
  </Flex>
);

export default TaskCategoryBadge;
