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

export interface PetInfo {
    id: number;
    name: string;
    skill: SkillLevel;
    image: string;
    taskCategories: TaskCategory[];
    status: TaskStatus;
    lastCaredFor: string;
}

export interface PetListTableProps {
    pets: PetInfo[];
}

const PetListTable = ({ pets }: PetListTableProps): React.ReactElement => {
    const borderColor: Record<SkillLevel, string> = {
        [SkillLevel.GREEN]: "green.300",
        [SkillLevel.YELLOW]: "yellow.400",
        [SkillLevel.ORANGE]: "orange.400",
        [SkillLevel.BLUE]: "blue.500",
        [SkillLevel.RED]: "red.600",
    };

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

    const getDisplayedCategories = (taskCategories: TaskCategory[]) => (taskCategories.slice(0, 4));
    const getExtraTasks = (taskCategories: TaskCategory[]) => (taskCategories.length > 4 ? `+${taskCategories.length - 4}` : null);

    return (
        <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
            <thead >
                <tr style={{ borderTop: "1px solid var(--gray-200, #E2E8F0)" }}>
                    <th style={{ width: "39.29%", padding: "0.8rem 0rem 0.8rem 2.5rem"}}><Text textStyle="subheading" m={0}>PET & STATUS</Text></th>
                    <th style={{ width: "42.44%", padding: "0.8rem 0rem"}}><Text textStyle="subheading" m={0}>TASKS</Text></th>
                    <th style={{ width: "18.27%", padding: "0.8rem 0rem"}}><Text textStyle="subheading" m={0}>LAST CARED FOR</Text></th>
                </tr>
            </thead>
            <tbody>

                <tr >
                    <td colSpan={3} style={{ padding: "0.8125rem 0.1875rem 0.625rem 2.62rem", backgroundColor: "#EDF2F7" }}>
                        <Text textStyle="subheading" m={0}>Unassinged Tasks</Text>
                    </td>
                </tr>
                {pets.map((pet) => (
                    <tr
                        key={pet.id}
                        style={{
                            borderTop: "1px solid var(--gray-200, #E2E8F0)",
                            borderBottom: "1px solid var(--gray-200, #E2E8F0)",
                            height: "10.3125rem",
                        }}>
                        <td style={{ padding: "0.625rem 0rem 0.625rem 2.625rem" }}>
                            {/* Pet & Status */}
                            <HStack gap="3.19rem">
                                <ProfilePhoto
                                    name={pet.name}
                                    color={borderColor[pet.skill]}
                                    image={pet.image}
                                />
                                <VStack height="5.0625rem" minWidth="12.125rem" align="flex-start" gap='0'>
                                    <Flex height="2.94rem" align="center" >
                                        <Text textStyle="h3" m={0}>
                                            {pet.name}
                                        </Text>
                                    </Flex>
                                    <Flex align="center" gap="0.56rem">
                                        <Box
                                            boxSize="0.93rem"
                                            bg={statusColor[pet.status]}
                                            borderRadius="full"
                                        />
                                        <Text textStyle="body" m={0} >{pet.status}</Text>
                                    </Flex>
                                </VStack>
                            </HStack>
                        </td>
                        <td >
                            {/* Task Categories */}
                            <HStack gap={0}>
                                <SimpleGrid columns={2} rowGap="1.125rem" columnGap="0.4375rem" width="20.18rem">
                                    {getDisplayedCategories(pet.taskCategories).map((category, index) => {
                                        return (
                                            <HStack key={index} gap="0.8125rem" p={0}>
                                                <Icon as={taskCategoryIcons[category]} boxSize="2.5rem" />
                                                <Text textStyle="caption" m={0}>{category}</Text>
                                            </HStack>
                                        );
                                    })}
                                </SimpleGrid>
                                {getExtraTasks(pet.taskCategories) && (
                                    <Flex borderRadius="0.375rem" boxSize="2.5rem" justify="center" align="center" bg="gray.400">
                                        <Text
                                            color="gray.50"
                                            textStyle="bodyBold"
                                            m={0}
                                        >
                                            {getExtraTasks(pet.taskCategories)}
                                        </Text>
                                    </Flex>
                                )}
                            </HStack>
                        </td>
                        <td>

                            {/* Last Cared For */}
                            <Text textStyle="body" color="gray.700" m={0}>
                                {pet.lastCaredFor}
                            </Text>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table >

    );
};


export default PetListTable;
