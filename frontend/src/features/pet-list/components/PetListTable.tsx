import React, { useMemo } from "react";
import { Text, Flex, Table, Thead, Tr, Th, Td, Tbody } from "@chakra-ui/react";
import getCurrentUserRole from "../../../utils/CommonUtils";
import VolunteerPetListTableContent from "./VolunteerPetListTableContent";
import AdminPetListTableContent from "./AdminPetListTableContent";
import { PetListRecord } from "../../../types/PetTypes";
import { STAFF_BEHAVIOURISTS_ADMIN } from "../../../constants/AuthConstants";

export interface PetListTableProps {
  petsRecord: PetListRecord;
  clearFilters: () => void;
}

const PetListTable = ({
  petsRecord,
  clearFilters,
}: PetListTableProps): React.ReactElement => {
  const isStaffBehaviouristAdmin = STAFF_BEHAVIOURISTS_ADMIN.has(
    getCurrentUserRole() ?? "",
  );
  const allSectionsEmpty = useMemo(
    () => Object.values(petsRecord).every((pets) => pets.length === 0),
    [petsRecord],
  );

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

      {allSectionsEmpty ? (
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

      {!isStaffBehaviouristAdmin && !allSectionsEmpty ? (
        <VolunteerPetListTableContent petsRecord={petsRecord} />
      ) : null}

      {isStaffBehaviouristAdmin && !allSectionsEmpty ? (
        <AdminPetListTableContent petsRecord={petsRecord} />
      ) : null}
    </Table>
  );
};

export default PetListTable;
