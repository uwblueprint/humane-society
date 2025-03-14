import React from "react";
import { Box, Flex, SimpleGrid, Text, HStack, VStack, Icon } from "@chakra-ui/react";
import { SkillLevel, TaskCategory, TaskStatus } from "../../types/TaskTypes";
import ProfilePhoto from "./ProfilePhoto";
import { ReactComponent as HusbandryIcon } from "../assets/icons/husbandry.svg";
import { ReactComponent as PenTimeIcon } from "../assets/icons/pen_time.svg";
import { ReactComponent as GamesIcon } from "../assets/icons/games.svg";
import { ReactComponent as TrainingIcon } from "../assets/icons/training.svg";
import { ReactComponent as WalkIcon } from "../assets/icons/walk.svg";
import { ReactComponent as MiscIcon } from "../assets/icons/misc.svg";

export interface PetListCardProps {
    id: number;
    name: string;
    skill: SkillLevel;
    image: string;
    taskCategories: TaskCategory[];
    status: TaskStatus;
    lastCaredFor: Date;
}

const PetListCard = ({ id, name, skill, image, taskCategories, status, lastCaredFor }: PetListCardProps): React.ReactElement => {
    const borderColor = {
        [SkillLevel.GREEN]: "green.300",
        [SkillLevel.YELLOW]: "yellow.400",
        [SkillLevel.ORANGE]: "orange.400",
        [SkillLevel.BLUE]: "blue.500",
        [SkillLevel.RED]: "red.600",
    }[skill];

    const statusColor = {
        [TaskStatus.NEEDS_CARE]: "red.400",
        [TaskStatus.DOES_NOT_NEED_CARE]: "gray.500",
        [TaskStatus.ASSIGNED]: "blue.500",
    }[status];

    const taskCategoryIcons: Record<TaskCategory, React.ElementType> = {
        [TaskCategory.WALK]: WalkIcon,
        [TaskCategory.GAMES]: GamesIcon,
        [TaskCategory.PEN_TIME]: PenTimeIcon,
        [TaskCategory.HUSBANDRY]: HusbandryIcon,
        [TaskCategory.TRAINING]: TrainingIcon,
        [TaskCategory.MISC]: MiscIcon,
    };

    const displayedCategories = taskCategories.slice(0, 4);
    const extraTasks = taskCategories.length > 4 ? `+${taskCategories.length - 4}` : null;

    return (
        <Flex
            align="center"
            pt="0.63rem"
            pb="0.63rem"
            pl="2.63rem"
            pr="0.63rem"
            borderWidth="0.06rem"
            borderColor="gray.200"
            width="100vw"
            height="10.3125rem"
        >


            {/* Pet & Status */}
            <HStack gap="3.19rem">
                <ProfilePhoto
                    name={name}
                    color={borderColor}
                    image={image}
                />
                <VStack height="5.0625rem" minWidth="12.125rem" align="flex-start" gap='0'>
                    <Flex height="2.94rem" align="center" >
                        <Text textStyle="h3" m={0}>
                            {name}
                        </Text>
                    </Flex>
                    <Flex align="center" gap="0.56rem">
                        <Box
                            boxSize="0.93rem"
                            bg={statusColor}
                            borderRadius="full"
                        />
                        <Text textStyle="body" m={0} >{status}</Text>
                    </Flex>
                </VStack>
            </HStack>


            {/* Task Categories */}
            <HStack>
                <SimpleGrid columns={2} rowGap="1.125rem" columnGap="0.4375rem" width="20.18rem">
                    {displayedCategories.map((category, index) => {
                        return (
                            <HStack key={index} gap="0.4375rem" p={0}>
                                <Icon as={taskCategoryIcons[category]} boxSize="2.5rem" />
                                <Text textStyle="caption" m={0}>{category}</Text>
                            </HStack>
                        );
                    })}
                </SimpleGrid>
                {extraTasks && (
                    <Flex borderRadius="0.375rem" boxSize="2.5rem" justify="center" align="center" bg="gray.400">
                        <Text
                            color="gray.50"
                            textStyle="bodyBold"
                            m={0}
                        >
                            {extraTasks}
                        </Text>
                    </Flex>
                )}
            </HStack>

            {/* Last Cared For */}
            <Text textStyle="body" color="gray.700" m={0}>
                {lastCaredFor.toDateString()}
            </Text>

        </Flex >
    );
};


export default PetListCard;
