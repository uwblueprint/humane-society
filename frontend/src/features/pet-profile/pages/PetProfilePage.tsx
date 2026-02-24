/* eslint  react/jsx-props-no-spreading: 0 */ // --> OFF
import { Flex, Spinner, Text } from "@chakra-ui/react";
import React, { useEffect, useState } from "react";
import { useHistory, useParams } from "react-router-dom";
import NavBar from "../../../components/common/navbar/NavBar";
import { PetStatus, SexEnum } from "../../../types/PetTypes";
import { ColorLevel, ScheduledTaskDTO } from "../../../types/TaskTypes";
import PetProfileSidebar from "../components/PetProfileSidebar";
import CalendarDateSelector from "../../user-profile/components/CalendarDateSelector";
import { TableColumn, TableHeader } from "../../../components/common/table";
import PetProfileTaskTableSection from "./PetProfileTaskTableSection";
import { getPetTasksByDate } from "../../../APIClients/TaskAPIClient";

const PetProfilePage = (): React.ReactElement => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [loading, setLoading] = useState(true);
  const history = useHistory();
  const { id } = useParams<{ id: string }>();
  const petId = Number(id);
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
    const isPastStartTime = task.startTime
      ? new Date(task.startTime) < new Date()
      : false;

    if (isCompleted) return 3;
    if (!isAssigned && isPastStartTime) return 0;
    if (isAssigned && !task.endTime) return 1;
    return 2;
  };
  // TODO: Connect endpoint
  // const params = useParams<{ id: string }>();
  // const petId = Number(params.id);

  useEffect(() => {
    const fetchTasks = async () => {
      if (!petId || Number.isNaN(petId)) {
        history.push("/not-found");
        return;
      }

      try {
        const dateString = selectedDate.toISOString().split("T")[0];
        const fetchedTasks = await getPetTasksByDate(petId, dateString);
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
  }, [petId, selectedDate, history]);

  const sampleProp = {
    id: 1,
    name: "Benji",
    status: PetStatus.NEEDS_CARE,
    colourLevel: ColorLevel.YELLOW,
    breed: "Siberian Husky",
    birthday: "2025-07-27",
    weightKg: 25.5,
    spayedNeutered: true,
    sex: SexEnum.MALE,
    photo: "/images/dog2.png",
    petCare: {
      safetyInfo: "safety info",
      managementInfo: "management info",
      medicalInfo: "medical",
    },
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
        <PetProfileSidebar {...sampleProp} />
        <Flex
          backgroundColor="gray.100"
          flex="1"
          paddingTop="8.5rem"
          paddingLeft="2rem"
          paddingRight="2rem"
          paddingBottom="2rem"
          flexDirection="column"
        >
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
      </Flex>
    </>
  );
};

export default PetProfilePage;
