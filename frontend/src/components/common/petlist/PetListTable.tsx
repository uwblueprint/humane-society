import React from "react";
import { Text } from "@chakra-ui/react";
import { TaskStatus } from "../../../types/TaskTypes";
import { PetListTableSection, PetInfo } from "./PetListTableSection";

export interface PetListTableProps {
  pets: PetInfo[];
}

export const filterByStatus = (
  pets: PetInfo[],
  status: TaskStatus,
): PetInfo[] => {
  return pets.filter((pet) => pet.status === status);
};

const PetListTable = ({ pets }: PetListTableProps): React.ReactElement => {
  return (
    <table
      style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}
    >
      <thead>
        <tr style={{ borderTop: "1px solid var(--gray-200, #E2E8F0)" }}>
          <th style={{ width: "39.29%", padding: "0.8rem 0rem 0.8rem 2.5rem" }}>
            <Text textStyle="subheading" m={0}>
              PET & STATUS
            </Text>
          </th>
          <th style={{ width: "42.44%", padding: "0.8rem 0rem" }}>
            <Text textStyle="subheading" m={0}>
              TASKS
            </Text>
          </th>
          <th style={{ width: "18.27%", padding: "0.8rem 0rem" }}>
            <Text textStyle="subheading" m={0}>
              LAST CARED FOR
            </Text>
          </th>
        </tr>
      </thead>

      <PetListTableSection
        pets={filterByStatus(pets, TaskStatus.NEEDS_CARE)}
        sectionTitle="Unassigned Tasks"
      />
      <PetListTableSection
        pets={filterByStatus(pets, TaskStatus.ASSIGNED)}
        sectionTitle="Assigned Tasks"
      />
      <PetListTableSection
        pets={filterByStatus(pets, TaskStatus.DOES_NOT_NEED_CARE)}
        sectionTitle="No Tasks"
      />
    </table>
  );
};

export default PetListTable;
