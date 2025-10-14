import { Alert, AlertIcon, CloseButton, Flex } from "@chakra-ui/react";
import React, { useEffect, useMemo, useState } from "react";
import PetAPIClient from "../APIClients/PetAPIClient";
import Filter from "../components/common/Filter";
import Search from "../components/common/Search";
import PetListTable from "../components/pet-list/PetListTable";
import { PetInfo } from "../components/pet-list/PetListTableSection";
import { STAFF_BEHAVIOURISTS_ADMIN } from "../constants/AuthConstants";
import { Pet } from "../types/PetTypes";
import {
  AnimalTag,
  ColorLevel,
  colorLevelMap,
  TaskCategory,
  TaskStatus,
} from "../types/TaskTypes";
import getCurrentUserRole from "../utils/CommonUtils";

const PetListPage = (): React.ReactElement => {
  const [pets, setPets] = useState<Pet[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [filters, setFilters] = useState<Record<string, string[]>>({});
  const [search, setSearch] = useState<string>("");

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

  const getPets = async () => {
    try {
      const fetchedPets = await PetAPIClient.getPets();

      if (fetchedPets != null) {
        setPets(fetchedPets);
      }
    } catch (error) {
      setErrorMessage(`${error}`);
    }
  };

  useEffect(() => {
    getPets();
  }, []);

  // Convert Pet[] in backend to PetInfo[] in frontend for the table component
  const convertedPets: PetInfo[] = pets.map((pet) => ({
    id: pet.id,
    name: pet.name,
    skill: colorLevelMap[pet.colorLevel] || ColorLevel.GREEN,
    image: pet.photo || "/images/cat.png",
    taskCategories: [],
    status: pet.status as TaskStatus,
    lastCaredFor: "Unknown",
    allTasksAssigned: false,
    animalTag: pet.animalTag as AnimalTag,
  }));

  const filteredPets = useMemo(() => {
    return convertedPets
      .filter((prev) => {
        return Object.keys(filters).every((key) => {
          if (filters[key].length === 0) return true;
          if (Array.isArray(prev[key as keyof PetInfo])) {
            return filters[key].some((filter) =>
              (
                prev[key as keyof PetInfo] as (string | TaskCategory)[]
              ).includes(filter),
            );
          }
          return filters[key].includes(prev[key as keyof PetInfo] as string);
        });
      })
      .filter((prev) => {
        return prev.name.toLowerCase().includes(search.toLowerCase());
      });
  }, [filters, search, convertedPets]);

  const isVolunteer = !STAFF_BEHAVIOURISTS_ADMIN.has(
    getCurrentUserRole() as string,
  );
  const petListFilterType = isVolunteer ? "petListVolunteer" : "petListAdmin";

  return (
    <Flex direction="column" gap="2rem" width="100%" pt="2rem">
      {errorMessage && (
        <Alert status="error" mb={4}>
          <AlertIcon />
          {errorMessage}
          <CloseButton
            position="absolute"
            right="8px"
            top="8px"
            onClick={() => setErrorMessage(null)}
          />
        </Alert>
      )}
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
        <Search
          placeholder="Search for a pet..."
          onChange={handleSearchChange}
          search={search}
        />
      </Flex>
      <PetListTable
        pets={filteredPets as PetInfo[]}
        clearFilters={handleClearFilters}
      />
    </Flex>
  );
};

export default PetListPage;
