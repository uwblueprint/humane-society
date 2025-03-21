import { Flex } from "@chakra-ui/react";
import React, { useState, useEffect } from "react";
import rawData from "../temp/mock/petlist/mockPetList.json";
import { PetTag, SkillLevel, TaskCategory, TaskStatus } from "../types/TaskTypes";
import PetListTable from "../components/common/petlist/PetListTable";
import { PetInfo } from "../components/common/petlist/PetListTableSection";
import Search from "../components/common/Search";
import Filter from "../components/common/Filter";



const mockData: PetInfo[] = rawData.map((pet) => ({
  ...pet,
  skill: SkillLevel[pet.skill as keyof typeof SkillLevel],
  taskCategories: pet.taskCategories.map(
    (category) => TaskCategory[category as keyof typeof TaskCategory],
  ),
  status: TaskStatus[pet.status as keyof typeof TaskStatus],
  petTag: PetTag[pet.petTag as keyof typeof PetTag]
}));

const GetPage = (): React.ReactElement => {
  const [filters, setFilters] = useState<Record<string, string[]>>({});
  const [search, setSearch] = useState<string>("");

  useEffect(() => {
    

  }, [filters, search])

  const handleFilterChange = (selectedFilters: Record<string, string[]>) => {
    setFilters(selectedFilters);
    console.log("Selected filters:", selectedFilters);
  };

  const handleSearchChange = (value: string) => {
    setSearch(value);
    console.log("Search query:", value);
  };

  return (
    <Flex direction="column" gap="1rem">
      <Flex
      padding="1rem"
        maxWidth="100vw"
      >
        {JSON.stringify(mockData)}
        {JSON.stringify(filters)}
        <Filter
          type="petListAdmin"
          onChange={handleFilterChange}
          selected={filters}
        />
        <Search
          placeholder="Search for a pet..."
          onChange={handleSearchChange}
          search={search}
        />
      </Flex>
      <PetListTable pets={mockData} />
    </Flex>
  );
};

export default GetPage;
