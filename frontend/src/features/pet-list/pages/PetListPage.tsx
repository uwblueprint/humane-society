import {
  Alert,
  AlertIcon,
  CloseButton,
  Flex,
  useToast,
} from "@chakra-ui/react";
import React, { useEffect, useMemo, useState } from "react";
import PetAPIClient from "../../../APIClients/PetAPIClient";
import Button from "../../../components/common/Button";
import { TableWrapper } from "../../../components/common/table";
import AUTHENTICATED_USER_KEY, {
  STAFF,
  STAFF_BEHAVIOURISTS_ADMIN,
} from "../../../constants/AuthConstants";
import {
  PetInfo,
  PetListItemDTO,
  PetListRecord,
  PetListSectionKey,
  PetListSections,
} from "../../../types/PetTypes";
import { TaskCategory } from "../../../types/TaskTypes";
import { getCurrentUserRole } from "../../../utils/CommonUtils";
import { getLocalStorageObjProperty } from "../../../utils/LocalStorageUtils";
import PetListTable from "../components/PetListTable";

const PetListPage = (): React.ReactElement => {
  const [petsSections, setPetsSections] = useState<PetListSections>({});
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
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

  const getPets = async () => {
    try {
      const userId = getLocalStorageObjProperty(AUTHENTICATED_USER_KEY, "id");
      if (!userId || typeof userId !== "number") {
        setErrorMessage("User not authenticated");
        return;
      }

      const fetchedPetsSections = await PetAPIClient.getPetList(userId);

      if (fetchedPetsSections != null) {
        setPetsSections(fetchedPetsSections);
      }
    } catch (error) {
      setErrorMessage(`${error}`);
    }
  };

  useEffect(() => {
    getPets();
  }, []);

  // Convert PetListSections from backend to PetListRecord format for role-based view
  const convertToPetListRecord = (sections: PetListSections): PetListRecord => {
    const result: PetListRecord = {};

    // Helper to convert PetListItemDTO to PetInfo
    const convertToPetInfo = (pet: PetListItemDTO): PetInfo => {
      return {
        id: pet.id,
        name: pet.name,
        color: pet.color,
        photo: pet.photo || "/images/cat.png", // TODO: will replace placeholder image in the future
        taskCategories: pet.taskCategories,
        status: pet.status,
        lastCaredFor: pet.lastCaredFor,
        allTasksAssigned: pet.allTasksAssigned,
        animalTag: pet.animalTag,
      };
    };

    // Map backend section names to frontend section keys
    Object.entries(sections).forEach(([sectionName, pets]) => {
      const petInfos = pets.map(convertToPetInfo);

      // Map section names to PetListSectionKey
      if (sectionName === "Assigned to You") {
        result["Assigned to You"] = petInfos;
      } else if (sectionName === "Has Unassigned Tasks") {
        result["Has Unassigned Tasks"] = petInfos;
      } else if (sectionName === "All Tasks Assigned") {
        result["All Tasks Assigned"] = petInfos;
      } else if (sectionName === "No Tasks") {
        result["No Tasks"] = petInfos;
      } else if (sectionName === "Other Pets") {
        result["Other Pets"] = petInfos;
      }
    });

    return result;
  };

  const filteredPets = useMemo(() => {
    // Convert backend PetListSections to PetListRecord
    const petListRecord = convertToPetListRecord(petsSections);

    const result: PetListRecord = {};

    // Apply filters and search to each section
    Object.entries(petListRecord).forEach(([section, pets]) => {
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
  }, [petsSections, filters, search]);

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
