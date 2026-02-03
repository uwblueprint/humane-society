import React from "react";
import { PetListTableSection } from "./PetListTableSection";
import { PetListRecord } from "../../../types/PetTypes";

export interface VolunteerPetListTableContentProps {
  petsRecord: PetListRecord;
}

const VolunteerPetListTableContent = ({
  petsRecord,
}: VolunteerPetListTableContentProps): React.ReactElement => {
  return (
    <>
      <PetListTableSection
        pets={petsRecord["Assigned to You"] ?? []}
        sectionTitle="Assigned to You"
      />
      <PetListTableSection
        pets={petsRecord["Other Pets"] ?? []}
        sectionTitle="Other Pets"
      />
    </>
  );
};

export default VolunteerPetListTableContent;
