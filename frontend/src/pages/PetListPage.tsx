import { Flex } from "@chakra-ui/react";
import React, { useMemo, useState, useEffect } from "react";
// import mockData from "../temp/mock/petlist/mockPetList.json";
import PetAPIClient from "../APIClients/PetAPIClient";
import PetListTable from "../components/pet-list/PetListTable";
import { PetInfo } from "../components/pet-list/PetListTableSection";
import Search from "../components/common/Search";
import Filter from "../components/common/Filter";
import { TaskCategory } from "../types/TaskTypes";
import { STAFF_BEHAVIOURISTS_ADMIN } from "../constants/AuthConstants";
import getCurrentUserRole from "../utils/CommonUtils";

const PetListPage = (): React.ReactElement => {
  const [filters, setFilters] = useState<Record<string, string[]>>({});
  const [search, setSearch] = useState<string>("");
  const [pets, setPets] = useState<PetInfo[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    PetAPIClient.get()
      .then((data) => {
        setPets(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || "Failed to load pets");
        setLoading(false);
      });
  }, []);

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
    return pets
      .filter((prev: PetInfo) => {
        return Object.keys(filters).every((key) => {
          if (filters[key].length === 0) return true;
          if (Array.isArray(prev[key as keyof PetInfo])) {
            return filters[key].some((filter: string) =>
              (
                prev[key as keyof PetInfo] as (string | TaskCategory)[]
              ).includes(filter),
            );
          }
          return filters[key].includes(prev[key as keyof PetInfo] as string);
        });
      })
      .filter((prev: PetInfo) => {
        return prev.name.toLowerCase().includes(search.toLowerCase());
      });
  }, [filters, search, pets]);

  const isVolunteer = !STAFF_BEHAVIOURISTS_ADMIN.has(
    getCurrentUserRole() as string,
  );
  const petListFilterType = isVolunteer ? "petListVolunteer" : "petListAdmin";

  return (
    <Flex direction="column" gap="2rem" width="100%">
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
      {loading ? (
        <Flex justify="center" align="center" minH="200px">
          Loading pets...
        </Flex>
      ) : error ? (
        <Flex justify="center" align="center" minH="200px" color="red.500">
          {error}
        </Flex>
      ) : (
        <PetListTable
          pets={filteredPets as PetInfo[]}
          clearFilters={handleClearFilters}
        />
      )}
    </Flex>
  );
};

export default PetListPage;
