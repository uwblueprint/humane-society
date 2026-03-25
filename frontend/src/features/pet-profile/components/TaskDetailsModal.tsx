import { CloseIcon } from "@chakra-ui/icons";
import {
  Flex,
  Grid,
  GridItem,
  Icon,
  IconButton,
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Spinner,
  Text,
  useToast,
} from "@chakra-ui/react";
import React, { useContext, useEffect, useState } from "react";
import PetAPIClient from "../../../APIClients/PetAPIClient";
import TaskAPIClient from "../../../APIClients/TaskAPIClient";
import TaskTemplateAPIClient from "../../../APIClients/TaskTemplateAPIClient";
import UserAPIClient from "../../../APIClients/UserAPIClient";
import ProfilePhoto from "../../../components/common/ProfilePhoto";
import AuthContext from "../../../contexts/AuthContext";
import { AuthenticatedUser } from "../../../types/AuthTypes";
import { Pet } from "../../../types/PetTypes";
import {
  PetTask,
  RecurrenceTask,
  Task,
  TaskCategory,
  colorLevelMap,
} from "../../../types/TaskTypes";
import { User } from "../../../types/UserTypes";
import Button from "../../../components/common/Button";
import StatusLabel from "../../../components/common/StatusLabel";
import UserRoles from "../../../constants/UserConstants";

import { ReactComponent as GamesIcon } from "../../../assets/icons/games.svg";
import { ReactComponent as HusbandryIcon } from "../../../assets/icons/husbandry.svg";
import { ReactComponent as MiscIcon } from "../../../assets/icons/misc.svg";
import { ReactComponent as PenTimeIcon } from "../../../assets/icons/pen_time.svg";
import { ReactComponent as TrainingIcon } from "../../../assets/icons/training.svg";
import { ReactComponent as WalkIcon } from "../../../assets/icons/walk.svg";
import { ReactComponent as RoundQuestionMarkIcon } from "../../../assets/icons/round-question-mark.svg";
import { ReactComponent as OutlinedUserProfileIcon } from "../../../assets/icons/outline-user-profile.svg";

const taskCategoryIcons: Record<TaskCategory, React.ElementType> = {
  [TaskCategory.WALK]: WalkIcon,
  [TaskCategory.GAMES]: GamesIcon,
  [TaskCategory.PEN_TIME]: PenTimeIcon,
  [TaskCategory.HUSBANDRY]: HusbandryIcon,
  [TaskCategory.TRAINING]: TrainingIcon,
  [TaskCategory.MISC]: MiscIcon,
};

const isPastDay = (dateStr?: string) => {
  if (!dateStr) return false;
  const date = new Date(dateStr);
  const now = new Date();
  // Compare dates only (ignoring time)
  return (
    new Date(date.getFullYear(), date.getMonth(), date.getDate()) <
    new Date(now.getFullYear(), now.getMonth(), now.getDate())
  );
};

const isToday = (dateStr?: string) => {
  if (!dateStr) return false;
  const date = new Date(dateStr);
  const now = new Date();
  return (
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate()
  );
};

const userQualifiesForPet = (
  user: AuthenticatedUser | null | undefined,
  pet: Pet | null | undefined,
) => {
  if (!user || !pet) return false;
  return user.colorLevel >= pet.colorLevel;
};

const getTaskDetailedStatus = (
  task: PetTask | null,
  authenticatedUser?: AuthenticatedUser | null,
) => {
  if (!task) return null;
  if (task.endTime) return "Completed";
  if (isPastDay(task.scheduledStartTime)) return "Incomplete";
  if (task.startTime) {
    return task.userId === authenticatedUser?.id ? "In-Progress" : "Occupied";
  }
  if (task.userId) return "Assigned";
  return null;
};

interface AssigneeDisplayProps {
  assigneeData: User | null;
  authenticatedUser?: AuthenticatedUser | null;
  taskData: PetTask | null;
}

const AssigneeDisplay = ({
  assigneeData,
  authenticatedUser,
  taskData,
}: AssigneeDisplayProps): React.ReactElement => {
  const status = getTaskDetailedStatus(taskData, authenticatedUser);
  const isSelf = authenticatedUser?.id === assigneeData?.id;
  const isVolunteerOrStaff =
    authenticatedUser?.role === UserRoles.VOLUNTEER ||
    authenticatedUser?.role === UserRoles.STAFF;

  const showStatusLabel =
    status &&
    (status !== "Assigned" ||
      (isVolunteerOrStaff && isSelf && !isToday(taskData?.scheduledStartTime)));

  const hideAssigneeDetails = isVolunteerOrStaff && !isSelf;

  let displayName = "Unassigned";

  if (hideAssigneeDetails && assigneeData) {
    displayName = "";
  } else if (assigneeData) {
    displayName = isSelf
      ? "Me"
      : `${assigneeData.firstName} ${assigneeData.lastName}`;
  }

  return (
    <Flex align="center" gap="1rem" justifyContent="space-between">
      <Flex align="center" gap="1rem">
        {(() => {
          if (!assigneeData) {
            return (
              <Flex
                boxSize="2.25rem"
                borderRadius="full"
                border="1px solid"
                borderColor="gray.300"
                alignItems="center"
                justifyContent="center"
                bg="gray.700"
              >
                <Icon as={RoundQuestionMarkIcon} boxSize="1.25rem" />
              </Flex>
            );
          }
          if (hideAssigneeDetails) {
            return <Icon as={OutlinedUserProfileIcon} boxSize="2.25rem" />;
          }
          return (
            <ProfilePhoto
              image={assigneeData.profilePhoto}
              color={colorLevelMap[assigneeData.colorLevel]}
              size="small"
              type="user"
              showColorBorder={!isVolunteerOrStaff}
            />
          );
        })()}
        {displayName && (
          <Text textStyle="body" margin="0">
            {displayName}
          </Text>
        )}
      </Flex>
      {showStatusLabel && <StatusLabel status={status} />}
    </Flex>
  );
};

interface TaskDetailsModalProps {
  taskId: number;
  isOpen: boolean;
  onClose: () => void;
}

const TaskDetailsModal = ({
  taskId,
  isOpen,
  onClose,
}: TaskDetailsModalProps): React.ReactElement => {
  const { authenticatedUser } = useContext(AuthContext);
  const toast = useToast();

  const [loading, setLoading] = useState(true);
  const [taskData, setTaskData] = useState<PetTask | null>(null);
  const [templateData, setTemplateData] = useState<Task | null>(null);
  const [petData, setPetData] = useState<Pet | null>(null);
  const [assigneeData, setAssigneeData] = useState<User | null>(null);
  const [recurrenceData, setRecurrenceData] = useState<RecurrenceTask | null>(
    null,
  );
  const [userTasks, setUserTasks] = useState<PetTask[]>([]);
  const [petTasks, setPetTasks] = useState<PetTask[]>([]);

  const status = getTaskDetailedStatus(taskData, authenticatedUser);

  const isVolunteerOrStaff =
    authenticatedUser?.role === UserRoles.VOLUNTEER ||
    authenticatedUser?.role === UserRoles.STAFF;

  const isPetOccupied = petTasks.some(
    (t) =>
      t.startTime &&
      !t.endTime &&
      t.id !== taskId &&
      isToday(t.scheduledStartTime),
  );

  const hasInProgressTask = userTasks.some(
    (t) => t.startTime && !t.endTime && !isPastDay(t.scheduledStartTime),
  );

  // Indicates if all assigned tasks for the user on the current day are complete
  const hasCompletedAllAssignedTasks = userTasks.every(
    (t) => !isToday(t.scheduledStartTime) || !!t.endTime,
  );

  useEffect(() => {
    if (!isOpen) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        const tTask = await TaskAPIClient.getTask(taskId);
        setTaskData(tTask);

        const [tTemplate, tPet, tRecurrence] = await Promise.all([
          TaskTemplateAPIClient.getTaskTemplate(tTask.taskTemplateId),
          PetAPIClient.getPet(tTask.petId),
          TaskAPIClient.getRecurrence(taskId),
        ]);

        setTemplateData(tTemplate);
        setPetData(tPet);
        setRecurrenceData(tRecurrence);

        if (tTask.userId) {
          const tAssignee = await UserAPIClient.get(tTask.userId);
          setAssigneeData(tAssignee);
        } else {
          setAssigneeData(null);
        }

        if (
          authenticatedUser &&
          (authenticatedUser.role === UserRoles.VOLUNTEER ||
            authenticatedUser.role === UserRoles.STAFF)
        ) {
          const [uTasks, pTasks] = await Promise.all([
            TaskAPIClient.getUserTasks(authenticatedUser.id),
            TaskAPIClient.getPetTasks(tTask.petId),
          ]);
          setUserTasks(uTasks);
          setPetTasks(pTasks);
        }
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to fetch task details",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [taskId, isOpen, toast, authenticatedUser]);

  if (loading) {
    return (
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent p="4">
          <Flex justify="center" align="center" minH="200px">
            <Spinner size="xl" color="blue.500" />
          </Flex>
        </ModalContent>
      </Modal>
    );
  }

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "-";
    return new Date(dateStr).toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatTime = (dateStr?: string) => {
    if (!dateStr) return "-";
    return new Date(dateStr).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    });
  };

  const getRecurrenceDisplay = () => {
    if (!recurrenceData) return "One-time";
    if (recurrenceData.days && recurrenceData.days.length > 0) {
      return `Every ${recurrenceData.days.join(", ")}`;
    }
    return "Recurring";
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent bg="gray.50" maxHeight="min(831px, calc(100vh - 8rem))">
        <ModalHeader paddingBlock="2rem" paddingInline="2.5rem">
          <Flex align="center" justify="space-between">
            <Flex align="center" gap="1rem">
              {templateData && (
                <Icon
                  as={taskCategoryIcons[templateData.category]}
                  boxSize="1.75rem"
                />
              )}
              <Text m={0} textStyle="h2Mobile" color="gray.700">
                {templateData?.name || "Task Details"}
              </Text>
            </Flex>
            <IconButton
              icon={<CloseIcon boxSize={4} />}
              variant="ghost"
              size="sm"
              onClick={onClose}
              aria-label="Close modal"
            />
          </Flex>
        </ModalHeader>

        <Flex direction="column" height="100%" overflowY="auto">
          <ModalBody
            flex="1"
            display="flex"
            flexDirection="column"
            gap="2rem"
            paddingTop="0"
            paddingBottom="2.5rem"
            paddingInline="2.5rem"
            overflowY="auto"
          >
            {/* Task For Section */}
            <Flex flexDirection="column" gap="1rem">
              <Text textStyle="h3" fontWeight="600" m={0}>
                Task for
              </Text>
              <Flex align="center" gap="1rem">
                <ProfilePhoto
                  image={petData?.photo}
                  color={
                    petData ? colorLevelMap[petData.colorLevel] : undefined
                  }
                  size="small"
                  type="pet"
                  showColorBorder
                />
                <Text textStyle="body" m={0}>
                  {petData?.name}
                </Text>
              </Flex>
            </Flex>

            {/* Task Instructions Section */}
            <Flex flexDirection="column" gap="1rem">
              <Text textStyle="h3" fontWeight="600" m={0}>
                Task Instructions
              </Text>
              <Text color="gray.700" marginBottom="0" textStyle="body">
                {templateData?.instructions || "No instructions to display."}
              </Text>
            </Flex>

            {/* Schedule Section */}
            <Grid templateColumns="repeat(2, 1fr)" rowGap="2rem">
              <GridItem>
                <Flex flexDirection="column" gap="1rem">
                  <Text textStyle="h3" fontWeight="600" m={0}>
                    Start Date
                  </Text>
                  <Text textStyle="body" margin="0">
                    {formatDate(taskData?.scheduledStartTime)}
                  </Text>
                </Flex>
              </GridItem>
              <GridItem>
                <Flex flexDirection="column" gap="1rem">
                  <Text textStyle="h3" fontWeight="600" m={0}>
                    End Date
                  </Text>
                  <Text textStyle="body" margin="0">
                    {formatDate(recurrenceData?.endDate)}
                  </Text>
                </Flex>
              </GridItem>

              <GridItem>
                <Flex flexDirection="column" gap="1rem">
                  <Text textStyle="h3" fontWeight="600" m={0}>
                    Time Start
                  </Text>
                  <Text textStyle="body" margin="0">
                    {formatTime(taskData?.scheduledStartTime)}
                  </Text>
                </Flex>
              </GridItem>
              <GridItem>
                <Flex flexDirection="column" gap="1rem">
                  <Text textStyle="h3" fontWeight="600" m={0}>
                    Time End
                  </Text>
                  <Text textStyle="body" margin="0">
                    {formatTime(taskData?.endTime)}
                  </Text>
                </Flex>
              </GridItem>

              {recurrenceData && (
                <>
                  <GridItem>
                    <Flex flexDirection="column" gap="1rem">
                      <Text textStyle="h3" fontWeight="600" m={0}>
                        Recurrence
                      </Text>
                      <Text textStyle="body" margin="0">
                        {getRecurrenceDisplay()}
                      </Text>
                    </Flex>
                  </GridItem>
                  <GridItem>
                    <Flex flexDirection="column" gap="1rem">
                      <Text textStyle="h3" fontWeight="600" m={0}>
                        Cadence
                      </Text>
                      <Text textStyle="body" margin="0">
                        {recurrenceData.cadence || "-"}
                      </Text>
                    </Flex>
                  </GridItem>
                </>
              )}
            </Grid>

            <Flex flexDirection="column" gap="1rem">
              {/* Assigned To Section */}
              <Text textStyle="h3" fontWeight="600" m={0}>
                Assigned to
              </Text>
              <AssigneeDisplay
                assigneeData={assigneeData}
                authenticatedUser={authenticatedUser}
                taskData={taskData}
              />

              {/* Admin and Behaviourist Task Actions */}
              {(authenticatedUser?.role === UserRoles.ADMIN ||
                authenticatedUser?.role === UserRoles.BEHAVIOURIST) && (
                <Flex direction="column" gap="1rem">
                  {status === null && (
                    <Button variant="dark-blue" size="medium" width="100%">
                      Assign
                    </Button>
                  )}
                  {status === "Assigned" && (
                    <Button variant="dark-blue" size="medium" width="100%">
                      Reassign
                    </Button>
                  )}
                  {status === "In-Progress" && (
                    <Button variant="dark-blue" size="medium" width="100%">
                      Complete Task
                    </Button>
                  )}
                  <Button variant="blue-outline" size="medium" width="100%">
                    Edit Task
                  </Button>
                </Flex>
              )}

              {/* Volunteer and Staff Task Actions */}
              {isVolunteerOrStaff && (
                <Flex direction="column" gap="1rem">
                  {status === null && (
                    <Button
                      variant="dark-blue"
                      size="medium"
                      width="100%"
                      disabled={
                        isPastDay(taskData?.scheduledStartTime) ||
                        !userQualifiesForPet(authenticatedUser, petData) ||
                        !hasCompletedAllAssignedTasks
                      }
                    >
                      Assign to Me
                    </Button>
                  )}
                  {status === "Assigned" &&
                    isToday(taskData?.scheduledStartTime) && (
                      <Button
                        variant="dark-blue"
                        size="medium"
                        width="100%"
                        disabled={isPetOccupied || hasInProgressTask}
                      >
                        Start
                      </Button>
                    )}
                  {status === "In-Progress" && (
                    <Flex gap="1rem">
                      <Button variant="blue-outline" size="medium" width="100%">
                        Restart
                      </Button>
                      <Button variant="dark-blue" size="medium" width="100%">
                        Complete Task
                      </Button>
                    </Flex>
                  )}
                </Flex>
              )}
            </Flex>
          </ModalBody>
        </Flex>
      </ModalContent>
    </Modal>
  );
};

export default TaskDetailsModal;
