import React, { useEffect, useMemo, useState } from "react";
import { useHistory } from "react-router-dom";
import PetAPIClient from "../../../APIClients/PetAPIClient";
import Button from "../../../components/common/Button";
import { TableWrapper } from "../../../components/common/table";
import AUTHENTICATED_USER_KEY, {
  STAFF,
  STAFF_BEHAVIOURISTS_ADMIN,
} from "../../../constants/AuthConstants";
import {
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
  /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [filters, setFilters] = useState<Record<string, string[]>>({});
  const [search, setSearch] = useState<string>("");

  const currentUserRole = getCurrentUserRole();
  const isAdmin = STAFF_BEHAVIOURISTS_ADMIN.has(currentUserRole as string);
  const isStaff = currentUserRole === STAFF;
  const petListFilterType = isAdmin ? "petListAdmin" : "petListVolunteer";

  const history = useHistory();

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
    history.push("/add-pet-form");
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

  const filteredPets = useMemo(() => {
    const petListRecord = petsSections as PetListRecord;

    const result: PetListRecord = {};

    // Apply filters and search to each section
    Object.entries(petListRecord).forEach(([section, pets]) => {
      result[section as PetListSectionKey] = pets
        .filter((pet) =>
          Object.keys(filters).every((key) => {
            if (filters[key].length === 0) return true;

            if (key === "status") {
              const { ["Assigned to You"]: assignedToYouSelected, ...rest } =
                Object.fromEntries(
                  filters[key].map((value) => [value, true]),
                );
              const statusValues = Object.keys(rest);
              return (
                (assignedToYouSelected && pet.isAssignedToMe) ||
                statusValues.includes(pet.status)
              );
            }

            if (Array.isArray(pet[key as keyof PetListItemDTO])) {
              return filters[key].some((filter) =>
                (
                  pet[key as keyof PetListItemDTO] as (string | TaskCategory)[]
                ).includes(filter),
              );
            }
            return filters[key].includes(pet[key as keyof PetListItemDTO] as string);
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
