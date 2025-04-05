import { Button, Flex } from "@chakra-ui/react";
import React, { useMemo, useState } from "react";
import { useHistory } from "react-router-dom";
import mockData from "../temp/mock/petlist/mockPetList.json";
import PetListTable from "../components/common/petlist/PetListTable";
import { PetInfo } from "../components/common/petlist/PetListTableSection";
import Search from "../components/common/Search";
import Filter from "../components/common/Filter";
import { TaskCategory } from "../types/TaskTypes";
import { STAFF_BEHAVIOURISTS_ADMIN } from "../constants/AuthConstants";
import getCurrentUserRole from "../utils/CommonUtils";
import { ADD_PET_LIST_PAGE } from "../constants/Routes";

const PetListPage = (): React.ReactElement => {
  const [filters, setFilters] = useState<Record<string, string[]>>({});
  const [search, setSearch] = useState<string>("");

  const history = useHistory();

  const handleAddNewPetClick = () => history.push(ADD_PET_LIST_PAGE);

  const handleClearFilters = () => {
    setFilters({});
    setSearch("");
  };

  const handleFilterChange = (selectedFilters: Record<string, string[]>) => {
    setFilters(selectedFilters);
  };

  const handleSearchChange = (value: string) => {
    setSearch(value);
  };

  const filteredPets = useMemo(() => {
    return mockData
      .filter((prev) => {
        return Object.keys(filters).every((key) => {
          if (filters[key].length === 0) return true;
          if (Array.isArray(prev[key as keyof PetInfo])) {
            return filters[key].some((filter) =>
              (prev[key as keyof PetInfo] as (
                | string
                | TaskCategory
              )[]).includes(filter)
            );
          }
          return filters[key].includes(prev[key as keyof PetInfo] as string);
        });
      })
      .filter((prev) => {
        return prev.name.toLowerCase().includes(search.toLowerCase());
      });
  }, [filters, search]);

  const isVolunteer = !STAFF_BEHAVIOURISTS_ADMIN.has(
    getCurrentUserRole() as string
  );
  const petListFilterType = isVolunteer ? "petListVolunteer" : "petListAdmin";

  return (
    <Flex direction="column" gap="2rem">
      <Flex
        padding="0 2.5rem"
        maxWidth="100vw"
        justifyContent="space-between"
        gap="1rem"
      >
        <Filter
          type={petListFilterType}
          onChange={handleFilterChange}
          selected={filters}
        />
        <Flex gap="1rem" flexShrink="0" alignItems="center">
          <Search
            placeholder="Search for a pet..."
            onChange={handleSearchChange}
            search={search}
          />
          <Button
            textStyle="button"
            color="gray.100"
            bgColor="blue.700"
            onClick={handleAddNewPetClick}
            padding="0.5rem 2rem"
          >
            Add Pet
          </Button>
        </Flex>
      </Flex>
      <PetListTable
        pets={filteredPets as PetInfo[]}
        clearFilters={handleClearFilters}
      />
    </Flex>
  );
};

export default PetListPage;
