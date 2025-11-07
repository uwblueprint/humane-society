import React from "react";
import { PetListTableSection } from "./PetListTableSection";
import { PetListRecord } from "../../../types/PetTypes";
import getCurrentUserRole from "../../../utils/CommonUtils";
import { BEHAVIOURIST, STAFF } from "../../../constants/AuthConstants";

export interface AdminPetListTableContentProps {
  petsRecord: PetListRecord;
}

const AdminPetListTableContent = ({
  petsRecord,
}: AdminPetListTableContentProps): React.ReactElement => {
  const currentUserRole = getCurrentUserRole();
  const isStaffBehaviourist =
    currentUserRole === STAFF || currentUserRole === BEHAVIOURIST;

  return (
    <>
      {isStaffBehaviourist && (
        <PetListTableSection
          pets={petsRecord["Assigned To You"] ?? []}
          sectionTitle="Assigned To You"
        />
      )}
      <PetListTableSection
        pets={petsRecord["Has Unassigned Tasks"] ?? []}
        sectionTitle="Has Unassigned Tasks"
      />
      <PetListTableSection
        pets={petsRecord["All Tasks Assigned"] ?? []}
        sectionTitle="All Tasks Assigned"
      />
      <PetListTableSection
        pets={petsRecord["No Tasks"] ?? []}
        sectionTitle="No Tasks"
      />
    </>
  );
};

export default AdminPetListTableContent;
