import {
  Box,
  Grid,
  GridItem,
  HStack,
  Image,
  Link,
  Spacer,
  Text,
  VStack,
} from "@chakra-ui/react";
import React from "react";
import {
  AlertCircleIcon,
  CakeIcon,
  DonateHeartIcon,
  FemaleIcon,
  HeartIcon,
  MaleIcon,
  MedicalServicesIcon,
  PencilIcon,
  RulerIcon,
} from "../../../assets/icons";
import { SexEnum } from "../../../types/PetTypes";
import { ColorLevel, TaskStatus } from "../../../types/TaskTypes";
import ArrowDropdown from "../../../components/common/ArrowDropdown";
import PetStatus from "../../../components/common/PetStatus";
import ColourLevelBadge from "../../../components/common/ColourLevelBadge";
import { getAge, getCurrentUserRole } from "../../../utils/CommonUtils";
import { ADMIN_AND_BEHAVIOURISTS } from "../../../constants/AuthConstants";
import { EDIT_PET_PROFILE_PAGE } from "../../../constants/Routes";
import DefaultPetProfilePhoto from "../../../assets/icons/default-pet-profile.svg";

export interface PetProfileSidebarProps {
  id: number;
  name: string;
  status: TaskStatus;
  colourLevel: ColorLevel;
  breed?: string;
  birthday?: string;
  weightKg?: number;
  spayedNeutered?: boolean;
  sex: SexEnum;
  photo?: string;
  petCare?: {
    safetyInfo?: string;
    medicalInfo?: string;
    managementInfo?: string;
  };
}

const CARE_INFO_KEY_TO_LABEL: Record<string, string> = {
  safetyInfo: "Safety",
  managementInfo: "Management",
  medicalInfo: "Medical",
};

function getCareInfoIcon(key: string): string {
  switch (key) {
    case "safetyInfo":
      return AlertCircleIcon;
    case "managementInfo":
      return DonateHeartIcon;
    case "medicalInfo":
      return MedicalServicesIcon;
    default:
      return ""; // No image
  }
}

const getSpayStatusLabel = (spayedNeutered?: boolean) => {
  if (spayedNeutered === undefined) return "Spay status unknown";
  return spayedNeutered ? "Spayed" : "Not spayed";
};

const getAgeLabel = (birthday: string) => {
  const age = getAge(birthday);
  if (age < 1) {
    const ageDisplay = Math.floor(age * 12);
    return `${ageDisplay} ${ageDisplay === 1 ? "month" : "months"} old`;
  }
  const ageDisplay = Math.floor(age);
  return `${ageDisplay} ${ageDisplay === 1 ? "year" : "years"} old`;
};

function PetProfileSidebar({
  id,
  name,
  status,
  colourLevel,
  breed,
  birthday,
  weightKg,
  spayedNeutered,
  sex,
  photo,
  petCare,
}: PetProfileSidebarProps): React.ReactElement {
  const role = getCurrentUserRole();
  const isAdminBehaviouralist =
    role !== null && ADMIN_AND_BEHAVIOURISTS.has(role);

  return (
    <VStack
      paddingInline={{ base: "1rem", lg: "1.5rem" }}
      paddingTop="8.5rem"
      paddingBottom="1rem"
      width="28%"
      maxW="20rem"
      backgroundColor="white"
      alignItems="start"
      gap="2.4rem"
    >
      <VStack gap="0.6rem" alignItems="start" width="100%">
        <HStack gap="0.6rem" minWidth="max-content" width="100%">
          <Image
            src={photo ?? DefaultPetProfilePhoto}
            alt={name}
            fit="cover"
            borderRadius="full"
            boxSize="2.4rem"
          />
          <Text margin="0" fontWeight="600" textStyle={{ base: "h2Mobile" }}>
            {name}
          </Text>
          <Spacer />
          {isAdminBehaviouralist && (
            <Link href={`${EDIT_PET_PROFILE_PAGE}/${id}`}>
              <Image src={PencilIcon} alt="close" boxSize="1.2rem" />
            </Link>
          )}
        </HStack>
        <PetStatus status={status} />
      </VStack>

      <VStack alignItems="start" gap="0.6rem">
        <Text margin="0" fontWeight="600" textStyle={{ base: "h3" }}>
          Colour Level
        </Text>
        <ColourLevelBadge colourLevel={colourLevel} size="large" />
      </VStack>

      <VStack alignItems="start" gap="0.6rem" width="100%">
        <Text margin="0" fontWeight="600" textStyle={{ base: "h3" }}>
          Profile
        </Text>
        <Grid templateColumns="repeat(2, 1fr)" gap="0.6rem" width="100%">
          {/* Top bar spanning 2 columns */}
          <GridItem colSpan={2}>
            <Box
              bg="gray.100"
              borderRadius="md"
              textAlign="center"
              paddingBlock="0.4rem"
              textStyle="body"
              fontSize="1rem"
            >
              {breed ?? "Unknown breed"}
            </Box>
          </GridItem>

          {/* 2 x 2 Grid below */}
          <GridItem>
            <VStack
              bg="gray.100"
              borderRadius="md"
              paddingBlock="0.8rem"
              alignItems="center"
              width="100%"
              height="100%"
            >
              <Image src={CakeIcon} alt="cake" boxSize="1.2rem" />
              <Text
                textStyle="body"
                fontSize="1rem"
                margin="0"
                lineHeight="100%"
                textAlign="center"
              >
                {birthday ? getAgeLabel(birthday) : "Unknown age"}
              </Text>
            </VStack>
          </GridItem>
          <GridItem>
            <VStack
              bg="gray.100"
              borderRadius="md"
              paddingBlock="0.8rem"
              alignItems="center"
              width="100%"
              height="100%"
            >
              <Image src={RulerIcon} alt="ruler" boxSize="1.2rem" />
              <Text
                textStyle="body"
                fontSize="1rem"
                margin="0"
                lineHeight="100%"
                textAlign="center"
              >
                {weightKg ? `${weightKg} kg` : "Unknown weight"}
              </Text>
            </VStack>
          </GridItem>
          <GridItem>
            <VStack
              bg="gray.100"
              borderRadius="md"
              paddingBlock="0.8rem"
              alignItems="center"
              width="100%"
              height="100%"
            >
              <Image src={HeartIcon} alt="heart" boxSize="1.2rem" />
              <Text
                textStyle="body"
                fontSize="1rem"
                margin="0"
                lineHeight="100%"
                textAlign="center"
              >
                {getSpayStatusLabel(spayedNeutered)}
              </Text>
            </VStack>
          </GridItem>
          <GridItem>
            <VStack
              bg="gray.100"
              borderRadius="md"
              paddingBlock="0.8rem"
              alignItems="center"
              width="100%"
              height="100%"
            >
              <Image
                src={sex === SexEnum.MALE ? MaleIcon : FemaleIcon}
                alt="close"
                boxSize="1.2rem"
              />
              <Text
                textStyle="body"
                fontSize="1rem"
                margin="0"
                lineHeight="100%"
                textAlign="center"
              >
                {sex === SexEnum.MALE ? "Male" : "Female"}
              </Text>
            </VStack>
          </GridItem>
        </Grid>
      </VStack>

      <VStack alignItems="start" gap="0.6rem" width="100%">
        <Text margin="0" fontWeight="600" textStyle={{ base: "h3" }}>
          Care Info
        </Text>

        {petCare ? (
          Object.entries(petCare).map(([key, description]) => (
            <ArrowDropdown
              key={key}
              headerText={CARE_INFO_KEY_TO_LABEL[key]}
              iconSrc={getCareInfoIcon(key)}
              bodyText={description}
            />
          ))
        ) : (
          <Text textStyle="body" fontSize="1rem" margin="0" lineHeight="100%">
            No pet care info
          </Text>
        )}
      </VStack>
    </VStack>
  );
}

export default PetProfileSidebar;
