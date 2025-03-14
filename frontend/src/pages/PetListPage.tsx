import React from "react";
import rawData from "./mockPetList.json"
import { SkillLevel, TaskCategory, TaskStatus } from "../types/TaskTypes";
import PetListTable, { PetInfo } from "../components/common/PetListTable";

const mockData: PetInfo[] = rawData.map((pet) => ({
  ...pet,
  skill: SkillLevel[pet.skill as keyof typeof SkillLevel],
  taskCategories: pet.taskCategories.map(
    (category) => TaskCategory[category as keyof typeof TaskCategory]
  ),
  status: TaskStatus[pet.status as keyof typeof TaskStatus],
}));

const GetPage = (): React.ReactElement => {
  return (
    <div style={{ textAlign: "center"}}>
      <h1>Pets</h1>

    <PetListTable pets={mockData}/>

    </div>
  );
};

export default GetPage;
