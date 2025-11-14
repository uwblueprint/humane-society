import { Flex, useToast } from "@chakra-ui/react";
import React, { useMemo, useState } from "react";
import volunteerMockData from "../temp/mock/petlist/volunteerMockPetList.json";
import adminMockData from "../temp/mock/petlist/adminMockPetList.json";
import staffMockData from "../temp/mock/petlist/staffMockPetList.json";
import PetListTable from "../components/PetListTable";
import Search from "../../../components/common/Search";
import Filter from "../../../components/common/Filter";
import { TaskCategory } from "../../../types/TaskTypes";
import {
  ADMIN,
  BEHAVIOURIST,
  STAFF,
  STAFF_BEHAVIOURISTS_ADMIN,
} from "../../../constants/AuthConstants";
import getCurrentUserRole from "../../../utils/CommonUtils";
import {
  PetInfo,
  PetListRecord,
  PetListSectionKey,
} from "../../../types/PetTypes";
import Button from "../../../components/common/Button";

const PetListPage = (): React.ReactElement => {
  const [filters, setFilters] = useState<Record<string, string[]>>({});
  const [search, setSearch] = useState<string>("");

  const currentUserRole = getCurrentUserRole();
  const isAdmin = STAFF_BEHAVIOURISTS_ADMIN.has(currentUserRole as string);
  const isStaff = currentUserRole === STAFF;
  const petListFilterType = isAdmin ? "petListAdmin" : "petListVolunteer";

  const toast = useToast();

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

  const handleAddPet = () => {
    toast({
      title: "Add Pet",
      description: "Add pet functionality not implemented yet",
      status: "info",
      duration: 3000,
      isClosable: true,
    });
  };

  const filteredPets = useMemo(() => {
    let mockData;

    switch (currentUserRole) {
      case ADMIN:
        mockData = adminMockData as PetListRecord;
        break;
      case STAFF:
      case BEHAVIOURIST:
        mockData = staffMockData as PetListRecord;
        break;
      default:
        mockData = volunteerMockData as PetListRecord;
    }

    const result: PetListRecord = {};

    Object.entries(mockData).forEach(([section, pets]) => {
      result[section as PetListSectionKey] = pets
        .filter((pet) =>
          Object.keys(filters).every((key) => {
            if (filters[key].length === 0) return true;
            if (Array.isArray(pet[key as keyof PetInfo])) {
              return filters[key].some((filter) =>
                (
                  pet[key as keyof PetInfo] as (string | TaskCategory)[]
                ).includes(filter),
              );
            }
            return filters[key].includes(pet[key as keyof PetInfo] as string);
          }),
        )
        .filter((pet) => pet.name.toLowerCase().includes(search.toLowerCase()));
    });

    return result;
  }, [currentUserRole, filters, search]);

  return (
    <Flex direction="column" gap="2rem" width="100%" pt="2rem">
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
        <Flex gap="1rem">
          <Search
            placeholder="Search for a pet..."
            onChange={handleSearchChange}
            search={search}
          />
          {isAdmin && (
            <Button
              variant="dark-blue"
              size="medium"
              onClick={handleAddPet}
              disabled={isStaff}
            >
              Add Pet
            </Button>
          )}
        </Flex>
      </Flex>
      <PetListTable
        petsRecord={filteredPets}
        clearFilters={handleClearFilters}
      />
    </Flex>
  );
};

export default PetListPage;
