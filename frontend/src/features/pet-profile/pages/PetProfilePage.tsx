/* eslint  react/jsx-props-no-spreading: 0 */ // --> OFF
import { Flex, Spinner, Text } from "@chakra-ui/react";
import React, { useContext, useEffect, useState } from "react";
import {
  Route,
  Switch,
  useHistory,
  useParams,
  useRouteMatch,
} from "react-router-dom";
import NavBar from "../../../components/common/navbar/NavBar";
import PetAPIClient from "../../../APIClients/PetAPIClient";
import { Pet } from "../../../types/PetTypes";
import { colorLevelMap, ScheduledTaskDTO } from "../../../types/TaskTypes";
import UserRoles from "../../../constants/UserConstants";
import * as AuthConstants from "../../../constants/AuthConstants";
import AuthContext from "../../../contexts/AuthContext";
import PrivateRoute from "../../../components/auth/PrivateRoute";
import PetProfileSidebar from "../components/PetProfileSidebar";
import AddTaskForm from "./AddTaskForm";
import { TableColumn, TableHeader } from "../../../components/common/table";
import { getPetTasksByDate } from "../../../APIClients/TaskAPIClient";
import PetProfileTaskTableSection from "./PetProfileTaskTableSection";
import CalendarDateSelector from "../../user-profile/components/CalendarDateSelector";

const PetProfilePage = (): React.ReactElement => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const params = useParams<{ id: string }>();
  const petId = Number(params.id);
  const { path } = useRouteMatch();
  const history = useHistory();
  const { authenticatedUser } = useContext(AuthContext);
  const isDefaultTaskView = useRouteMatch({ path, exact: true });
  const taskTableColumns: TableColumn[] = [
    { label: "TASK" },
    { label: "TIME START" },
    { label: "TIME END" },
    { label: "ASSIGNED TO" },
    { label: "STATUS" },
  ];
  const gridTemplateColumns = "20rem 10rem 10rem 15rem 15rem";
  const [tasks, setTasks] = useState<ScheduledTaskDTO[]>([]);
  const sortTask = (task: ScheduledTaskDTO): number => {
    const isCompleted = !!task.endTime;
    const isAssigned = !!task.userId;
    const isPastStartTime = task.scheduledStartTime
      ? new Date(task.scheduledStartTime) < new Date()
      : false;

    if (isCompleted) return 3;
    if (!isAssigned && isPastStartTime && !task.endTime) return 0;
    if (isAssigned && !task.endTime) return 1;
    return 2;
  };

  const canAddTask =
    authenticatedUser?.role === UserRoles.ADMIN ||
    authenticatedUser?.role === UserRoles.BEHAVIOURIST;

  const [petData, setPetData] = useState<Pet | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTasks = async () => {
      if (!petId || Number.isNaN(petId)) {
        history.push("/not-found");
        return;
      }

      try {
        const dateString = [
          selectedDate.getFullYear(),
          String(selectedDate.getMonth() + 1).padStart(2, "0"),
          String(selectedDate.getDate()).padStart(2, "0"),
        ].join("-");
        const fetchedTasks = await getPetTasksByDate(petId, dateString);
        const sortedTasks = [...fetchedTasks].sort(
          (a, b) => sortTask(a) - sortTask(b),
        );
        setTasks(sortedTasks);
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error(err);
      }
    };
    fetchTasks();
    setLoading(false);
  }, [petId, selectedDate, history]);

  useEffect(() => {
    const fetchPet = async () => {
      if (!petId) {
        history.push("/not-found");
        return;
      }
      try {
        const data = await PetAPIClient.getPet(petId);
        setPetData(data);
      } catch (error) {
        history.push("/not-found");
      } finally {
        setLoading(false);
      }
    };
    fetchPet();
  }, [petId, history]);

  if (loading || !petData) {
    return (
      <Flex
        width="100%"
        height="100vh"
        alignItems="center"
        justifyContent="center"
      >
        <Spinner size="xl" />
      </Flex>
    );
  }

  // Map numeric colorLevel to ColorLevel enum for sidebar props
  const sidebarProps = {
    ...petData,
    colorLevel: colorLevelMap[petData.colorLevel],
  };

  let content;
  if (loading) {
    content = <Spinner />;
  } else if (tasks.length === 0) {
    content = <Text>No tasks currently.</Text>;
  } else {
    content = (
      <PetProfileTaskTableSection
        tasks={tasks}
        gridTemplateColumns={gridTemplateColumns}
      />
    );
  }

  return (
    <>
      <NavBar pageName="Pet Profile" />
      <Flex flex="1">
        <PetProfileSidebar {...sidebarProps} />
        <Flex
          backgroundColor={isDefaultTaskView ? "gray.100" : "gray.50"}
          flex="1"
          paddingTop="8.5rem"
          paddingLeft="2rem"
          paddingRight="2rem"
          paddingBottom="2rem"
          flexDirection="column"
        >
          <Switch>
            <Route exact path={path}>
              <Flex flexDirection="column">
                {canAddTask}
                <CalendarDateSelector
                  selectedDate={selectedDate}
                  onChange={(date) => setSelectedDate(date)}
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
                {content}
              </Flex>
            </Route>
            <PrivateRoute
              path={`${path}/add-task`}
              component={() => (
                <AddTaskForm petId={petData.id} petName={petData.name} />
              )}
              allowedRoles={AuthConstants.ADMIN_AND_BEHAVIOURISTS}
              exact
            />
          </Switch>
        </Flex>
      </Flex>
    </>
  );
};

export default PetProfilePage;
