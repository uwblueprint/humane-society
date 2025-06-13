import {
  Box,
  Grid,
  GridItem,
  HStack,
  Image,
  Spacer,
  Text,
  VStack,
} from "@chakra-ui/react";
import React from "react";
import { capitalize } from "lodash";
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
import { CareInfo, SexEnum } from "../../../types/PetTypes";
import { ColorLevel, TaskStatus } from "../../../types/TaskTypes";
import ArrowDropdown from "../ArrowDropdown";
import PetStatus from "../PetStatus";
import ColourLevelBadge from "./ColourLevelBadge";

export interface PetProfileSidebarProps {
  name: string;
  status: TaskStatus;
  colourLevel: ColorLevel;
  breed: string;
  age: number;
  weightKg: number;
  spayedNeutered: boolean;
  sex: SexEnum;
  avatarUrl: string;
  petCare: CareInfo;
}

function getCareInfoIcon(key: string): string {
  switch (key) {
    case "safety":
      return AlertCircleIcon;
    case "management":
      return DonateHeartIcon;
    case "medical":
      return MedicalServicesIcon;
    default:
      return ""; // No image
  }
}

function PetProfileSidebar({
  name,
  status,
  colourLevel,
  breed,
  age,
  weightKg,
  spayedNeutered,
  sex,
  avatarUrl,
  petCare,
}: PetProfileSidebarProps): React.ReactElement {
  return (
    <VStack
      paddingInline={{ base: "1rem", lg: "1.5rem" }}
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
            src={avatarUrl}
            alt={name}
            fit="cover"
            borderRadius="full"
            boxSize="2.4rem"
          />
          <Text margin="0" fontWeight="600" textStyle={{ base: "h2Mobile" }}>
            {name}
          </Text>
          <Spacer />
          <Image src={PencilIcon} alt="close" boxSize="1.2rem" />
        </HStack>
        <PetStatus status={status} />
      </VStack>

      <VStack alignItems="start" gap="0.6rem">
        <Text margin="0" fontWeight="600" textStyle={{ base: "h3" }}>
          Colour Level
        </Text>
        <ColourLevelBadge colourLevel={colourLevel} />
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
              {breed}
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
              >
                {`${age} ${age === 1 ? "year" : "years"} old`}
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
              >{`${weightKg} kg`}</Text>
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
              >
                {spayedNeutered ? "Spayed" : "Not spayed"}
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
              >
                {`${age} ${age === 1 ? "year" : "years"} old`}
              </Text>
            </VStack>
          </GridItem>
        </Grid>
      </VStack>

      <VStack alignItems="start" gap="0.6rem" width="100%">
        <Text margin="0" fontWeight="600" textStyle={{ base: "h3" }}>
          Care Info
        </Text>

        {Object.entries(petCare).map(([key, description]) => (
          <ArrowDropdown
            key={key}
            headerText={capitalize(key)}
            iconSrc={getCareInfoIcon(key)}
            bodyText={description}
          />
        ))}
      </VStack>
    </VStack>
  );
}

export default PetProfileSidebar;
