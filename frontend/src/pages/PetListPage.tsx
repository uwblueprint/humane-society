import React from "react";
import rawData from "../temp/mock/petlist/mockPetList.json";
import { SkillLevel, TaskCategory, TaskStatus } from "../types/TaskTypes";
import PetListTable from "../components/common/petlist/PetListTable";
import { PetInfo } from "../components/common/petlist/PetListTableSection";

const mockData: PetInfo[] = rawData.map((pet) => ({
  ...pet,
  skill: SkillLevel[pet.skill as keyof typeof SkillLevel],
  taskCategories: pet.taskCategories.map(
    (category) => TaskCategory[category as keyof typeof TaskCategory],
  ),
  status: TaskStatus[pet.status as keyof typeof TaskStatus],
}));

const GetPage = (): React.ReactElement => {
  return <PetListTable pets={mockData} />;
};

export default GetPage;
