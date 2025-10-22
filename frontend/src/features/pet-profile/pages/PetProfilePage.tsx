/* eslint  react/jsx-props-no-spreading: 0 */ // --> OFF
import React from "react";
import { Flex } from "@chakra-ui/react";
import NavBar from "../../../components/common/navbar/NavBar";
import PetProfileSidebar from "../components/PetProfileSidebar";
import { ColorLevel, TaskStatus } from "../../../types/TaskTypes";
import { SexEnum } from "../../../types/PetTypes";

const PetProfilePage = (): React.ReactElement => {
  // TODO: Connect endpoint
  // const params = useParams<{ id: string }>();
  // const petId = Number(params.id);

  const sampleProp = {
    id: 1,
    name: "Benji",
    status: TaskStatus.NEEDS_CARE,
    colourLevel: ColorLevel.YELLOW,
    breed: "Siberian Husky",
    age: 1,
    weightKg: 25.5,
    spayedNeutered: true,
    sex: SexEnum.MALE,
    avatarUrl: "/images/dog2.png",
    petCare: {
      safety: "safety info",
      management: "management info",
      medical: "medical",
    },
  };

  return (
    <>
      <NavBar pageName="Pet Profile" />
      <Flex flex="1">
        <PetProfileSidebar {...sampleProp} />
        <Flex backgroundColor="gray.100" flex="1" paddingTop="8.5rem" />
      </Flex>
    </>
  );
};

export default PetProfilePage;
