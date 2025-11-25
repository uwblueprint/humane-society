import { useToast } from "@chakra-ui/react";
import React, { useMemo, useState } from "react";
import Button from "../../../components/common/Button";
import { TableWrapper } from "../../../components/common/table";
import {
  ADMIN,
  BEHAVIOURIST,
  STAFF,
  STAFF_BEHAVIOURISTS_ADMIN,
} from "../../../constants/AuthConstants";
import {
  PetInfo,
  PetListRecord,
  PetListSectionKey,
} from "../../../types/PetTypes";
import { TaskCategory } from "../../../types/TaskTypes";
import { getCurrentUserRole } from "../../../utils/CommonUtils";
import PetListTable from "../components/PetListTable";
import adminMockData from "../temp/mock/petlist/adminMockPetList.json";
import staffMockData from "../temp/mock/petlist/staffMockPetList.json";
import volunteerMockData from "../temp/mock/petlist/volunteerMockPetList.json";

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
    <TableWrapper
      filterBarProps={{
        filterType: petListFilterType,
        filters,
        onFilterChange: handleFilterChange,
        search,
        onSearchChange: handleSearchChange,
        searchPlaceholder: "Search for a pet...",
        actionButton: isAdmin ? (
          <Button
            variant="dark-blue"
            size="medium"
            onClick={handleAddPet}
            disabled={isStaff}
          >
            Add Pet
          </Button>
        ) : undefined,
      }}
    >
      <PetListTable
        petsRecord={filteredPets}
        clearFilters={handleClearFilters}
      />
    </TableWrapper>
  );
};

export default PetListPage;
