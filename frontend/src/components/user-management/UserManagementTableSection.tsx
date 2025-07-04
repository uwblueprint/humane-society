import React from "react";
import { Flex, Icon, Tbody, Td, Text, Tr } from "@chakra-ui/react";

// TODO: move these into index.ts

import { ReactComponent as AdminTag } from "../../assets/icons/user-role/admin.svg";
import { ReactComponent as BehaviouristTag } from "../../assets/icons/user-role/behaviourist.svg";
import { ReactComponent as StaffTag } from "../../assets/icons/user-role/staff.svg";
import { ReactComponent as VolunteerTag } from "../../assets/icons/user-role/volunteer.svg";

import { ReactComponent as InvitedAdminTag } from "../../assets/icons/user-role/invited-admin.svg";
import { ReactComponent as InvitedBehaviouristTag } from "../../assets/icons/user-role/invited-behaviourist.svg";
import { ReactComponent as InvitedStaffTag } from "../../assets/icons/user-role/invited-staff.svg";
import { ReactComponent as InvitedVolunteerTag } from "../../assets/icons/user-role/invited-volunteer.svg";

import { UserRoles } from "../../constants/UserConstants";
import { colorLevelMap } from "../../types/TaskTypes";
import { User } from "../../types/UserTypes";
import AnimalTagList from "../common/userprofile/AnimalTagList";
import ProfilePhoto from "../common/ProfilePhoto";

interface UserListTableSectionProps {
  users: User[];
}

const UserListTableSection = ({
  users,
}: UserListTableSectionProps): React.ReactElement => {
  const roleIcons: Record<UserRoles, React.ElementType> = {
    [UserRoles.ADMIN]: AdminTag,
    [UserRoles.BEHAVIOURIST]: BehaviouristTag,
    [UserRoles.STAFF]: StaffTag,
    [UserRoles.VOLUNTEER]: VolunteerTag,
  };

  const invitedRoleIcons: Record<UserRoles, React.ElementType> = {
    [UserRoles.ADMIN]: InvitedAdminTag,
    [UserRoles.BEHAVIOURIST]: InvitedBehaviouristTag,
    [UserRoles.STAFF]: InvitedStaffTag,
    [UserRoles.VOLUNTEER]: InvitedVolunteerTag,
  };

  return (
    <Tbody>
      {users.map((user) => {
        const isInvited = user.status === "Invited";
        const RoleIcon = isInvited
          ? invitedRoleIcons[user.role]
          : roleIcons[user.role];
        const textColor = isInvited ? "gray.400" : "gray.700";
        const imageType = isInvited ? "invitedUser" : "user";

        return (
          <Tr
            key={user.id}
            borderTop="1px solid"
            borderBottom="1px solid"
            borderColor="gray.200"
          >
            {/* NAME */}
            <Td pl="2.625rem" pr="7rem" py="0.25rem">
              <Flex gap="1rem" minWidth="max-content">
                <ProfilePhoto
                  image={user.profilePhoto}
                  color={colorLevelMap[user.colorLevel || 1]}
                  size="small"
                  type={imageType}
                />
                <Text textStyle="body" m={0} color={textColor}>
                  {user.name}
                </Text>
              </Flex>
            </Td>

            {/* ROLE */}
            <Td padding="0" pr="12rem" py="0.25rem">
              <Flex borderRadius="full">
                <Icon as={RoleIcon} boxSize="2rem" minWidth="max-content" />
              </Flex>
            </Td>

            {/* ANIMAL TAGS */}
            <Td padding="0" pr="2rem" py="0.25rem">
              <Flex wrap="wrap">
                <AnimalTagList
                  isInvited={isInvited}
                  animalTags={user.animalTags}
                />
              </Flex>
            </Td>
          </Tr>
        );
      })}
    </Tbody>
  );
};

export default UserListTableSection;
