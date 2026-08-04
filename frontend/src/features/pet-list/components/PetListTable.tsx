import { Table, Tbody, Td, Text, Th, Thead, Tr } from "@chakra-ui/react";
import React, { useMemo } from "react";
import { TableEmptyState } from "../../../components/common/table";
import { STAFF_BEHAVIOURISTS_ADMIN } from "../../../constants/AuthConstants";
import { PetListRecord } from "../../../types/PetTypes";
import { getCurrentUserRole } from "../../../utils/CommonUtils";
import AdminPetListTableContent from "./AdminPetListTableContent";
import VolunteerPetListTableContent from "./VolunteerPetListTableContent";

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
              <TableEmptyState
                message="No pets currently match."
                onClearFilters={clearFilters}
              />
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
