import React from "react";
import {
  Box,
  Flex,
  SimpleGrid,
  Text,
  HStack,
  VStack,
  Icon,
  Tbody,
  Tr,
  Td,
} from "@chakra-ui/react";
import useOpenController from "./useOpenController";
import ProfilePhoto from "../ProfilePhoto";
import { ReactComponent as HusbandryIcon } from "../../../assets/icons/husbandry.svg";
import { ReactComponent as PenTimeIcon } from "../../../assets/icons/pen_time.svg";
import { ReactComponent as GamesIcon } from "../../../assets/icons/games.svg";
import { ReactComponent as TrainingIcon } from "../../../assets/icons/training.svg";
import { ReactComponent as WalkIcon } from "../../../assets/icons/walk.svg";
import { ReactComponent as MiscIcon } from "../../../assets/icons/misc.svg";
import { ReactComponent as ExpandIcon } from "../../../assets/icons/expand.svg";
import {
  AnimalTag,
  SkillLevel,
  TaskCategory,
  TaskStatus,
} from "../../../types/TaskTypes";

export interface PetInfo {
  id: number;
  name: string;
  skill: SkillLevel;
  image: string;
  taskCategories: TaskCategory[];
  status: TaskStatus;
  lastCaredFor: string;
  allTasksAssigned: boolean;
  animalTag: AnimalTag;
}

interface PetListTableSectionProps {
  pets: PetInfo[];
  sectionTitle?: string;
}

export const PetListTableSection = ({
  pets,
  sectionTitle,
}: PetListTableSectionProps) => {
  const { isOpen, toggle } = useOpenController(true);

  const statusColor: Record<TaskStatus, string> = {
    [TaskStatus.NEEDS_CARE]: "red.400",
    [TaskStatus.DOES_NOT_NEED_CARE]: "gray.500",
    [TaskStatus.ASSIGNED]: "blue.500",
  };

  const taskCategoryIcons: Record<TaskCategory, React.ElementType> = {
    [TaskCategory.WALK]: WalkIcon,
    [TaskCategory.GAMES]: GamesIcon,
    [TaskCategory.PEN_TIME]: PenTimeIcon,
    [TaskCategory.HUSBANDRY]: HusbandryIcon,
    [TaskCategory.TRAINING]: TrainingIcon,
    [TaskCategory.MISC]: MiscIcon,
  };

  const getDisplayedCategories = (taskCategories: TaskCategory[]) =>
    taskCategories.slice(0, 4);
  const getExtraTasks = (taskCategories: TaskCategory[]) =>
    taskCategories.length > 4 ? `+${taskCategories.length - 4}` : null;

  return (
    <Tbody>
      {/* Section Title */}
      {sectionTitle && (
        <Tr>
          <Td colSpan={3} px="2.62rem" py="0.625rem" bgColor="gray.100">
            <Flex justify="space-between">
              <Text textStyle="subheading" m={0}>
                {sectionTitle}
              </Text>
              <Box
                as="button"
                type="button"
                aria-label="expand or close section"
                onClick={toggle}
              >
                <Icon
                  boxSize="1.5rem"
                  as={ExpandIcon}
                  transform={`rotate(${isOpen ? 180 : 0}deg)`}
                  transition="all 0.25s"
                />
              </Box>
            </Flex>
          </Td>
        </Tr>
      )}
      {isOpen &&
        pets.map((pet) => (
          <Tr
            key={pet.id}
            borderTop="1px solid"
            borderBottom="1px solid"
            borderColor="gray.200"
          >
            <Td pl="2.625rem" pr="2rem" py="1rem">
              {/* Pet & Status */}
              <HStack gap="3rem" minWidth="max-content">
                <ProfilePhoto
                  // name={pet.name}
                  color={pet.skill}
                  image={pet.image}
                  size="large"
                />
                <VStack align="flex-start" gap="0.5rem">
                  <Text textStyle="h3" m={0}>
                    {pet.name}
                  </Text>
                  <Flex align="center" gap="0.5rem">
                    <Box
                      boxSize="1rem"
                      bg={statusColor[pet.status]}
                      borderRadius="full"
                    />
                    <Text textStyle="body" m={0}>
                      {pet.status}
                    </Text>
                  </Flex>
                </VStack>
              </HStack>
            </Td>
            <Td padding="0" pr="2rem">
              {/* Task Categories */}
              <HStack gap="2rem" minWidth="max-content">
                <SimpleGrid columns={2} rowGap="1rem" columnGap="2rem">
                  {getDisplayedCategories(pet.taskCategories).map(
                    (category, index) => {
                      return (
                        <HStack key={index} gap="0.8125rem" p={0}>
                          <Icon
                            as={taskCategoryIcons[category]}
                            boxSize="2.5rem"
                          />
                          <Text textStyle="caption" m={0}>
                            {category}
                          </Text>
                        </HStack>
                      );
                    },
                  )}
                </SimpleGrid>
                {getExtraTasks(pet.taskCategories) && (
                  <Flex
                    borderRadius="0.375rem"
                    boxSize="2.5rem"
                    justify="center"
                    align="center"
                    bg="gray.400"
                  >
                    <Text color="gray.50" textStyle="bodyBold" m={0}>
                      {getExtraTasks(pet.taskCategories)}
                    </Text>
                  </Flex>
                )}
              </HStack>
            </Td>
            <Td padding="0">
              {/* Last Cared For */}
              <Text textStyle="body" color="gray.700" m={0}>
                {pet.lastCaredFor}
              </Text>
            </Td>
          </Tr>
        ))}
    </Tbody>
  );
};
