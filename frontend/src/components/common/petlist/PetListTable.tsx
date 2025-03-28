import React from "react";
import { Text, Flex, Table, Thead, Tr, Th, Td, Tbody } from "@chakra-ui/react";
import { TaskStatus } from "../../../types/TaskTypes";
import { PetListTableSection, PetInfo } from "./PetListTableSection";
import getCurrentUserRole from "../../../utils/CommonUtils";

export interface PetListTableProps {
  pets: PetInfo[];
  clearFilters: () => void;
}

const filterByStatus = (pets: PetInfo[], status: TaskStatus): PetInfo[] => {
  return pets.filter((pet) => pet.status === status);
};

const filterByAllTasksAssigned = (
  pets: PetInfo[],
  allTasksAssigned: boolean
) => {
  return pets.filter(
    (pet) =>
      pet.allTasksAssigned === allTasksAssigned &&
      pet.status !== TaskStatus.DOES_NOT_NEED_CARE
  );
};

const PetListTable = ({
  pets,
  clearFilters,
}: PetListTableProps): React.ReactElement => {
  const isAdmin = getCurrentUserRole() === "Administrator";

  return (
    <Table w="100%" textAlign="left">
      <Thead borderBottom="1px solid" borderColor="gray.200">
        <Tr borderTop="1px solid" borderColor="gray.200">
          <Th py="1rem" px="2.5rem">
            <Text color="gray.800" textStyle="subheading" m={0}>
              PET & STATUS
            </Text>
          </Th>
          <Th py="0.8rem" px="0">
            <Text color="gray.800" textStyle="subheading" m={0}>
              TASKS
            </Text>
          </Th>
          <Th py="0.8rem" pr="2.5rem" pl="0">
            <Text
              whiteSpace="nowrap"
              color="gray.800"
              textStyle="subheading"
              m={0}
            >
              LAST CARED FOR
            </Text>
          </Th>
        </Tr>
      </Thead>

      {!pets.length ? (
        <Tbody>
          <Tr>
            <Td colSpan={3}>
              <Flex direction="column" alignItems="center" gap="1rem" my="5rem">
                <Text m="0" textStyle="subheading">
                  No pets currently match.
                </Text>
                <Text
                  m="0"
                  textStyle="h3"
                  color="blue.500"
                  cursor="pointer"
                  textDecoration="underline"
                  onClick={() => clearFilters()}
                >
                  Clear all
                </Text>
              </Flex>
            </Td>
          </Tr>
        </Tbody>
      ) : null}

      {!isAdmin && pets.length ? (
        <>
          <PetListTableSection
            pets={filterByStatus(pets, TaskStatus.ASSIGNED)}
          />
          <PetListTableSection
            pets={filterByStatus(pets, TaskStatus.NEEDS_CARE)}
          />
        </>
      ) : null}

      {isAdmin && pets.length ? (
        <>
          <PetListTableSection
            pets={filterByAllTasksAssigned(pets, false)}
            sectionTitle="Unassigned Tasks"
          />
          <PetListTableSection
            pets={filterByAllTasksAssigned(pets, true)}
            sectionTitle="Assigned Tasks"
          />
          <PetListTableSection
            pets={filterByStatus(pets, TaskStatus.DOES_NOT_NEED_CARE)}
            sectionTitle="No Tasks"
          />
        </>
      ) : null}
    </Table>
  );
};

export default PetListTable;
