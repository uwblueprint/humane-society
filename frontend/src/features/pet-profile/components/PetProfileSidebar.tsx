import {
  Box,
  Grid,
  GridItem,
  HStack,
  Image,
  Link,
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
import DefaultPetProfilePhoto from "../../../assets/icons/default-pet-profile.svg";
import ArrowDropdown from "../../../components/common/ArrowDropdown";
import ColourLevelBadge from "../../../components/common/ColourLevelBadge";
import PetStatus from "../../../components/common/PetStatus";
import { ADMIN_AND_BEHAVIOURISTS } from "../../../constants/AuthConstants";
import { EDIT_PET_PROFILE_PAGE } from "../../../constants/Routes";
import { PetStatus as PetStatusEnum, SexEnum } from "../../../types/PetTypes";
import { ColorLevel } from "../../../types/TaskTypes";
import { getAgeInMonths, getCurrentUserRole } from "../../../utils/CommonUtils";

export interface PetProfileSidebarProps {
  id: number;
  name: string;
  status: PetStatusEnum;
  colorLevel: ColorLevel;
  breed?: string;
  birthday?: string;
  weight?: number;
  neutered?: boolean;
  sex?: SexEnum;
  photo?: string;
  careInfo?: {
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

const getSexLabel = (sex?: SexEnum) => {
  if (sex === undefined) return "Unknown sex";
  return sex === SexEnum.MALE ? "Male" : "Female";
};

const getAgeLabel = (birthday: string) => {
  const ageInMonths = getAgeInMonths(birthday);
  if (ageInMonths < 12) {
    return `${ageInMonths} ${ageInMonths === 1 ? "month" : "months"} old`;
  }
  const age = Math.floor(ageInMonths / 12);
  return `${age} ${age === 1 ? "year" : "years"} old`;
};

function PetProfileSidebar({
  id,
  name,
  status,
  colorLevel,
  breed,
  birthday,
  weight,
  neutered,
  sex,
  photo,
  careInfo,
}: PetProfileSidebarProps): React.ReactElement {
  const role = getCurrentUserRole();
  const isAdminBehaviourist =
    role !== null && ADMIN_AND_BEHAVIOURISTS.has(role);

  return (
    <VStack
      paddingInline={{ base: "1rem", lg: "1.5rem" }}
      paddingTop="8.5rem"
      paddingBottom="1rem"
      width="28%"
      maxW="20rem"
      flexShrink={0}
      backgroundColor="white"
      alignItems="start"
      gap="2.4rem"
    >
      <VStack gap="0.6rem" alignItems="start" width="100%">
        <HStack gap="0.6rem" width="100%">
          <Image
            src={photo ?? DefaultPetProfilePhoto}
            alt={name}
            fit="cover"
            borderRadius="full"
            boxSize="2.4rem"
            flexShrink="0"
          />
          <Text
            margin="0"
            fontWeight="600"
            textStyle={{ base: "h2Mobile" }}
            flex="1"
            minWidth="0"
            isTruncated
          >
            {name}
          </Text>
          {isAdminBehaviourist && (
            <Link href={`${EDIT_PET_PROFILE_PAGE}/${id}`} flexShrink="0">
              <Image src={PencilIcon} alt="edit" boxSize="1.2rem" />
            </Link>
          )}
        </HStack>
        <PetStatus status={status} />
      </VStack>

      <VStack alignItems="start" gap="0.6rem">
        <Text margin="0" fontWeight="600" textStyle={{ base: "h3" }}>
          Colour Level
        </Text>
        <ColourLevelBadge colourLevel={colorLevel} size="large" />
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
                {weight ? `${weight} kg` : "Unknown weight"}
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
                {getSpayStatusLabel(neutered)}
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
                alt="sex"
                boxSize="1.2rem"
              />
              <Text
                textStyle="body"
                fontSize="1rem"
                margin="0"
                lineHeight="100%"
                textAlign="center"
              >
                {getSexLabel(sex)}
              </Text>
            </VStack>
          </GridItem>
        </Grid>
      </VStack>

      <VStack alignItems="start" gap="0.6rem" width="100%">
        <Text margin="0" fontWeight="600" textStyle={{ base: "h3" }}>
          Care Info
        </Text>

        {careInfo ? (
          Object.entries(careInfo).map(
            ([key, description]) =>
              key !== "id" && (
                <ArrowDropdown
                  key={key}
                  headerText={CARE_INFO_KEY_TO_LABEL[key]}
                  iconSrc={getCareInfoIcon(key)}
                  bodyText={description}
                />
              ),
          )
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
