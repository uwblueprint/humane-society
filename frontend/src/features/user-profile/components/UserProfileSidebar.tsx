import { Link } from "react-router-dom";
import {
  Box,
  Flex,
  HStack,
  Icon,
  Image,
  Spacer,
  Text,
  VStack,
  Link as ChakraLink,
} from "@chakra-ui/react";
import React from "react";
import { MailIcon, PencilIcon, PhoneIcon } from "../../../assets/icons";
import ProfilePhoto from "../../../components/common/ProfilePhoto";

import { ReactComponent as AdminTag } from "../../../assets/icons/user-role/admin.svg";
import { ReactComponent as BehaviouristTag } from "../../../assets/icons/user-role/behaviourist.svg";
import { ReactComponent as StaffTag } from "../../../assets/icons/user-role/staff.svg";
import { ReactComponent as VolunteerTag } from "../../../assets/icons/user-role/volunteer.svg";

import UserRoles from "../../../constants/UserConstants";
import ColourLevelBadge from "../../../components/common/ColourLevelBadge";
import { AnimalTag, colorLevelMap } from "../../../types/TaskTypes";
import AnimalTagList from "../../../components/common/AnimalTagList";
import Logout from "../../../components/auth/Logout";
import InviteUser from "./InviteUser";
import getCurrentUserRole from "../../../utils/CommonUtils";

export interface UserProfileSidebarProps {
  id: number;
  firstName: string;
  lastName: string;
  profilePhoto?: string;
  email: string;
  phoneNumber?: string | null;
  role: UserRoles;
  status: string;
  colorLevel: number;
  animalTags: AnimalTag[];
}

function UserProfileSidebar({
  id,
  firstName,
  lastName,
  profilePhoto,
  email,
  phoneNumber,
  role,
  status,
  colorLevel,
  animalTags,
}: UserProfileSidebarProps): React.ReactElement {
  const isInvited = status === "Invited";
  const currentUserRole = getCurrentUserRole();
  const isCurrentUserAdmin = currentUserRole === UserRoles.ADMIN;

  const editUserProfilePath = isCurrentUserAdmin
    ? `/admin/edit-user-profile/${id}`
    : `/edit-user-profile/${id}`;

  const roleIcons: Record<UserRoles, React.ElementType> = {
    [UserRoles.ADMIN]: AdminTag,
    [UserRoles.BEHAVIOURIST]: BehaviouristTag,
    [UserRoles.STAFF]: StaffTag,
    [UserRoles.VOLUNTEER]: VolunteerTag,
  };

  // Role icons are the same even when invited
  const RoleIcon = roleIcons[role];

  return (
    <VStack
      paddingInline={{ base: "1rem", lg: "1.5rem" }}
      paddingTop="8.5rem"
      paddingBottom="1.5rem"
      width="28%"
      maxW="20rem"
      backgroundColor="white"
      alignItems="start"
      gap="2.4rem"
    >
      <HStack gap="0.6rem" minWidth="max-content" width="100%">
        <ProfilePhoto size="small" type="user" image={profilePhoto} />
        <Text margin="0" fontWeight="600" textStyle={{ base: "h2Mobile" }}>
          {firstName} {lastName}
        </Text>
        <Spacer />
        <ChakraLink as={Link} to={editUserProfilePath}>
          <Image src={PencilIcon} alt="edit" boxSize="1.2rem" />
        </ChakraLink>
      </HStack>

      <VStack alignItems="start" gap="0.8rem" width="100%">
        <Text margin="0" fontWeight="600" textStyle={{ base: "h3" }}>
          Profile
        </Text>

        <Box
          bg="gray.100"
          borderRadius="md"
          alignItems="center"
          paddingBlock="0.4rem"
          paddingInline="1.2rem"
          gap="0.6rem"
          width="100%"
          max-width="100%"
          display="flex"
        >
          <Image src={MailIcon} alt="mail" boxSize="1.2rem" />
          <Text margin="0" textStyle="body" fontSize="1rem" flex="1" minW="0">
            {email}
          </Text>
        </Box>

        {phoneNumber && (
          <Box
            bg="gray.100"
            borderRadius="md"
            alignItems="center"
            paddingBlock="0.4rem"
            paddingInline="1.2rem"
            gap="0.6rem"
            width="100%"
            display="flex"
          >
            <Image src={PhoneIcon} alt="mail" boxSize="1.2rem" />
            <Text margin="0" textStyle="body" fontSize="1rem" flex="1" minW="0">
              {phoneNumber}
            </Text>
          </Box>
        )}
      </VStack>

      <VStack alignItems="start" gap="0.6rem" width="100%">
        <Text margin="0" fontWeight="600" textStyle={{ base: "h3" }}>
          Role
        </Text>

        <Box borderRadius="full">
          <Icon as={RoleIcon} boxSize="2rem" minWidth="max-content" />
        </Box>
      </VStack>

      <VStack alignItems="start" gap="0.6rem">
        <Text margin="0" fontWeight="600" textStyle={{ base: "h3" }}>
          Colour Level
        </Text>
        <ColourLevelBadge
          colourLevel={colorLevelMap[colorLevel]}
          size="small"
        />
      </VStack>

      <VStack alignItems="start" gap="0.6rem">
        <Text margin="0" fontWeight="600" textStyle={{ base: "h3" }}>
          Animal Tag
        </Text>

        {/* isInvited is set to false for the profile page to avoid having grayed tags */}
        <AnimalTagList isInvited={false} animalTags={animalTags} />
      </VStack>

      {/* TODO: Make logout only available when userId matches currently signed in user */}
      <Flex marginTop="auto" width="100%" justifyContent="center">
        {isInvited ? <InviteUser email={email} /> : <Logout />}
      </Flex>
    </VStack>
  );
}

export default UserProfileSidebar;
