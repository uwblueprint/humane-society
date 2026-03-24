import React, { useEffect, useState, useContext } from "react";
import { useParams, useHistory } from "react-router-dom";
import { Flex, Spinner, Text } from "@chakra-ui/react";
import NavBar from "../../../components/common/navbar/NavBar";
import { User } from "../../../types/UserTypes";
import UserAPIClient from "../../../APIClients/UserAPIClient";
import UserProfileSidebar from "../components/UserProfileSidebar";
import CalendarDateSelector from "../components/CalendarDateSelector";
import AuthContext from "../../../contexts/AuthContext";
import UserRoles from "../../../constants/UserConstants";
import { TableColumn, TableHeader } from "../../../components/common/table";
import { getPetTasksByDate, getUserTasksByDate } from "../../../APIClients/TaskAPIClient";
import { ScheduledTaskDTO } from "../../../types/TaskTypes";
import UserProfilePageTableSection from "./UserProfilePageTableSection";

const ProfilePage = (): React.ReactElement => {
  const params = useParams<{ id: string }>();
  const userId = Number(params.id);
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState<User | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const history = useHistory();
  const { authenticatedUser } = useContext(AuthContext);
  const taskTableColumns: TableColumn[] = [
    { label: "TASK" },
    { label: "TIME START" },
    { label: "TIME END" },
    { label: "PET NAME" },
    { label: "STATUS" },
  ];
  const gridTemplateColumns = "20rem 10rem 10rem 15rem 15rem";
  const [tasks, setTasks] = useState<ScheduledTaskDTO[]>([]);
  const sortTask = (task: ScheduledTaskDTO): number => {
    const isCompleted = !!task.endTime;
    const isPastStartTime = task.scheduledStartTime
      ? new Date(task.scheduledStartTime) < new Date()
      : false;

    if (isCompleted) return 3;
    if (!isPastStartTime && !task.endTime) return 0;
    if (!task.endTime) return 1;
    return 2;
  };

  useEffect(() => {
    const fetchUser = async () => {
      if (!userId) {
        // console.error(`Invalid userid ${params.id}`);
        history.push("/not-found");
      } else {
        try {
          const data = await UserAPIClient.get(Number(userId));

          const isAdmin = authenticatedUser?.role === UserRoles.ADMIN;
          const isOwnPage = authenticatedUser?.id === userId;

          if (!isAdmin && !isOwnPage) {
            history.push("/not-found");
            return;
          }

          setUserData(data);
        } catch (error) {
          // console.error(`Failed to fetch user ${userId}:`, error);
          history.push("/not-found");
        }
      }
    };
    fetchUser();
  }, [userId, history, params, authenticatedUser]);

  useEffect(() => {
    const fetchTasks = async () => {
      if (!userId || Number.isNaN(userId)) {
        history.push("/not-found");
        return;
      }

      try {
        const dateString = [
          selectedDate.getFullYear(),
          String(selectedDate.getMonth() + 1).padStart(2, "0"),
          String(selectedDate.getDate()).padStart(2, "0"),
        ].join("-");
        const fetchedTasks = await getUserTasksByDate(dateString);
        const sortedTasks = [...fetchedTasks].sort(
          (a, b) => sortTask(a) - sortTask(b),
        );
        setTasks(sortedTasks);
      } catch (err) {
        console.error(err);
      }
    };
    fetchTasks();
    setLoading(false);
  }, [userId, selectedDate, history]);

  let content;
  if (loading) {
    content = <Spinner />;
  } else if (tasks.length === 0) {
    content = <Text>No tasks currently.</Text>;
  } else {
    content = (
      <UserProfilePageTableSection
        tasks={tasks}
        gridTemplateColumns={gridTemplateColumns}
      />
    );
  }

  return (
    <>
      <NavBar pageName="User Profile" />
      {/* Only load the page once the data is loaded */}
      {userData && (
        <Flex flex="1">
          <UserProfileSidebar
            id={userData.id}
            firstName={userData.firstName}
            lastName={userData.lastName}
            profilePhoto={userData.profilePhoto}
            email={userData.email}
            phoneNumber={userData.phoneNumber}
            role={userData.role}
            status={userData.status}
            colorLevel={userData.colorLevel}
            animalTags={userData.animalTags}
          />
          <Flex
            backgroundColor="gray.100"
            flex="1"
            paddingTop="8.5rem"
            paddingInline="2rem"
            direction="column"
          >
            <CalendarDateSelector
              selectedDate={selectedDate}
              onChange={setSelectedDate}
            />
            <Flex
              backgroundColor="gray.50"
              alignItems="center"
              borderBottom="1px solid"
              borderColor="gray.200"
              marginBottom="0.5rem"
              marginTop="0.5rem"
              borderRadius="0.75rem"
            >
              <TableHeader
                columns={taskTableColumns}
                gridTemplateColumns={gridTemplateColumns}
              />
          </Flex>
        </Flex>
      </Flex>
      )}
    </>
  );
};

export default ProfilePage;
