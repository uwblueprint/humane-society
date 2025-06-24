import React, { useEffect, useMemo, useState } from "react";
import { Alert, AlertIcon, CloseButton, Flex } from "@chakra-ui/react";
import { Box } from "@chakra-ui/react";
import UserAPIClient from "../APIClients/UserAPIClient";
import { User } from "../types/UserTypes";

import Filter from "../components/common/Filter";
import Search from "../components/common/Search";
import SingleSelect from "../components/common/SingleSelect";
import MultiSelect from "../components/common/MultiSelect";
import UserManagementTable from "../components/user-management/UserManagementTable";
import { AnimalTag, ColorLevel } from "../types/TaskTypes";

// Import animal tag icons
import { ReactComponent as BirdIcon } from "../assets/icons/animal-tag/bird.svg";
import { ReactComponent as BunnyIcon } from "../assets/icons/animal-tag/bunny.svg";
import { ReactComponent as CatIcon } from "../assets/icons/animal-tag/cat.svg";
import { ReactComponent as DogIcon } from "../assets/icons/animal-tag/dog.svg";
import { ReactComponent as SmallAnimalIcon } from "../assets/icons/animal-tag/small-animal.svg";

// Import star icon for color levels
import { ReactComponent as StarIcon } from "../assets/icons/star.svg";

// const handleUserSubmit = async (formData: AddUserRequest) => {
// eslint-disable-next-line no-useless-catch
// try {
//   await UserAPIClient.create({
//     firstName: formData.firstName,
//     lastName: formData.lastName,
//     phoneNumber: formData.phoneNumber,
//     email: formData.email,
//     colorLevel: formData.colorLevel as unknown as string,
//     role: formData.role as
//       | "Administrator"
//       | "Animal Behaviourist"
//       | "Staff"
//       | "Volunteer",
//   });
//   await UserAPIClient.invite(formData.email);
// } catch (error) {
//   throw error;
// }
// };

const UserManagementPage = (): React.ReactElement => {
  const [users, setUsers] = useState<User[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [filters, setFilters] = useState<Record<string, string[]>>({});
  const [search, setSearch] = useState<string>("");

  // Testing for the Select Component Filters
  const [selectedColorLevel, setSelectedColorLevel] = useState<string | null>(null);
  const [selectedAnimalTags, setSelectedAnimalTags] = useState<string[]>([]);

  const handleClearFilters = () => {
    setFilters({});
    setSearch("");
    // Testing for the Select Component Filters
    setSelectedColorLevel(null);
    setSelectedAnimalTags([]);
  };

  const handleFilterChange = (selectedFilters: Record<string, string[]>) => {
    setFilters(selectedFilters);
  };

  const handleSearchChange = (value: string) => {
    setSearch(value);
  };
  const filteredUsers = useMemo(() => {
    return users
      .filter((user) => {
        return Object.keys(filters).every((key) => {
          const filterVals = filters[key as keyof typeof filters];
          if (!filterVals || filterVals.length === 0) return true;

          const value = user[key as keyof User];

          if (Array.isArray(value)) {
            return filterVals.some((filter) =>
              (value as string[]).includes(filter),
            );
          }

          return filterVals.includes(value as string);
        });
      })
      .filter((user) => user.name.toLowerCase().includes(search.toLowerCase()))
      .filter((user) => {
        // Apply SingleSelect Color Level filter
        if (selectedColorLevel) {
          const colorLevelMap: Record<string, number> = {
            "Green": 1,
            "Yellow": 2,
            "Orange": 3,
            "Red": 4,
            "Blue": 5,
          };
          return user.colorLevel === colorLevelMap[selectedColorLevel];
        }
        return true;
      })
      .filter((user) => {
        // Apply MultiSelect Animal Tags filter
        if (selectedAnimalTags.length > 0) {
          return selectedAnimalTags.some(tag => 
            user.animalTags.includes(tag as AnimalTag)
          );
        }
        return true;
      });
  }, [filters, search, users, selectedColorLevel, selectedAnimalTags]);


  const getUsers = async () => {
    try {
      const fetchedUsers = await UserAPIClient.get();

      if (fetchedUsers != null) {
        setUsers(fetchedUsers);
      }
    } catch (error) {
      setErrorMessage(`${error}`);
    }
  };

  useEffect(() => {
    getUsers();
  }, []);

  // Testing for the Select Component Filters
  const colorLevelOptions = Object.values(ColorLevel); // ["Green", "Yellow", "Orange", "Red", "Blue"]
  const animalTagOptions = Object.values(AnimalTag); // ["Bird", "Bunny", "Cat", "Dog", "Small Animal"]
  const animalTagColors = ["blue", "orange", "yellow", "green", "purple"]; // Colors for each animal tag
  const colorLevelIcons = [StarIcon, StarIcon, StarIcon, StarIcon, StarIcon]; // Star icons for each color level

  return (
    <Flex direction="column" gap="2rem" width="100%">
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
          type="userManagement"
          onChange={handleFilterChange}
          selected={filters}
        />
        <Search
          placeholder="Search for a user..."
          onChange={handleSearchChange}
          search={search}
        />
      </Flex>

      {/* Testing for the Select Component Filters */}
      <Flex
        padding="0 2.5rem"
        gap="1.5rem"
        wrap="wrap"
        align="stretch"
        maxWidth="100%"
      >
        <Box minWidth="250px" maxWidth="350px" flex="1">
          <SingleSelect
            values={colorLevelOptions}
            onSelect={setSelectedColorLevel}
            selected={selectedColorLevel}
            placeholder="Any level"
            icons={colorLevelIcons}
            label="Color Level"
            required={true}
            maxHeight="160px"
          />
        </Box>
        <Box minWidth="250px" maxWidth="350px" flex="1">
          <MultiSelect
            values={animalTagOptions}
            onSelect={setSelectedAnimalTags}
            selected={selectedAnimalTags}
            placeholder="Any tags"
            colours={animalTagColors}
            label="Animal Tags"
            maxHeight="180px"
          />
        </Box>
      </Flex>
      <UserManagementTable
        users={filteredUsers}
        clearFilters={handleClearFilters}
      />
    </Flex>
  );
};

export default UserManagementPage;
