import React from "react";
import { Box, VStack, Flex, Text } from "@chakra-ui/react";
import PetListCard, { PetListCardProps } from "../common/PetListCard";
import rawData from "./mockPetList.json"
import { SkillLevel, TaskCategory, TaskStatus } from "../../types/TaskTypes";

const mockData: PetListCardProps[] = rawData.map((pet) => ({
  ...pet,
  skill: SkillLevel[pet.skill as keyof typeof SkillLevel],
  taskCategories: pet.taskCategories.map(
    (category) => TaskCategory[category as keyof typeof TaskCategory]
  ),
  status: TaskStatus[pet.status as keyof typeof TaskStatus],
  lastCaredFor: new Date(pet.lastCaredFor),
}));

const GetPage = (): React.ReactElement => {
  return (
    // <div style={{ textAlign: "center", width: "25%", margin: "0px auto" }}>
    //   <h1>Pets</h1>
    //   <Box p="4">
    //     <VStack>
    //       {mockData.map((pet) => (
    //         <PetListCard key={pet.id} {...pet} />
    //       ))}
    //     </VStack>
    //   </Box>
    // </div>
    <table style={{ width: "100%", borderCollapse: "collapse" }}>
      <thead>
        <tr>
          <th><Text textStyle="subheading" style={{ width: "31.12rem" }}>PET & STATUS</Text></th>
          <th><Text textStyle="subheading" style={{ width: "36.31rem" }}>TASKS</Text></th>
          <th><Text textStyle="subheading" style={{ width: "12.56rem" }}>LAST CARED FOR</Text></th>
        </tr>
      </thead>
      <tbody>
          {mockData.map((pet) => (
            <tr key={pet.id}>
              {/* <td colSpan={3}> */}
                <PetListCard
                  {...pet}
                />
              {/* </td> */}
            </tr>
          ))}
        </tbody>
    </table>
  );
};

export default GetPage;
