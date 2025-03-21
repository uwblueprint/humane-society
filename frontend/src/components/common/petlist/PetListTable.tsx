import React from "react";
import { Text } from "@chakra-ui/react";
import { TaskStatus } from "../../../types/TaskTypes";
import { PetListTableSection, PetInfo } from "./PetListTableSection";
import getCurrentUserRole from "../../../utils/CommonUtils";

export interface PetListTableProps {
  pets: PetInfo[];
}

const filterByStatus = (pets: PetInfo[], status: TaskStatus): PetInfo[] => {
  return pets.filter((pet) => pet.status === status);
};

const filterByAllTasksAssigned = (
  pets: PetInfo[],
  allTasksAssigned: boolean,
) => {
  return pets.filter(
    (pet) =>
      pet.allTasksAssigned === allTasksAssigned &&
      pet.status !== TaskStatus.DOES_NOT_NEED_CARE,
  );
};

const PetListTable = ({ pets }: PetListTableProps): React.ReactElement => {
  const isAdmin = getCurrentUserRole() === "Administrator";

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

      {!isAdmin && (
        <>
          <PetListTableSection
            pets={filterByStatus(pets, TaskStatus.ASSIGNED)}
          />
          <PetListTableSection
            pets={filterByStatus(pets, TaskStatus.NEEDS_CARE)}
          />
        </>
      )}

      {isAdmin && (
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
      )}
    </table>
  );
};

export default PetListTable;
