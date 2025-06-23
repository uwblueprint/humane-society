import React from "react";
import { Flex, Icon, Tbody, Td, Text, Tr } from "@chakra-ui/react";

// TODO: move these into index.ts
import { ReactComponent as BirdTag } from "../../assets/icons/animal-tag/bird.svg";
import { ReactComponent as BunnyTag } from "../../assets/icons/animal-tag/bunny.svg";
import { ReactComponent as CatTag } from "../../assets/icons/animal-tag/cat.svg";
import { ReactComponent as DogTag } from "../../assets/icons/animal-tag/dog.svg";
import { ReactComponent as SmallAnimalTag } from "../../assets/icons/animal-tag/small-animal.svg";

import { ReactComponent as InvitedBirdTag } from "../../assets/icons/animal-tag/invited-bird.svg";
import { ReactComponent as InvitedBunnyTag } from "../../assets/icons/animal-tag/invited-bunny.svg";
import { ReactComponent as InvitedCatTag } from "../../assets/icons/animal-tag/invited-cat.svg";
import { ReactComponent as InvitedDogTag } from "../../assets/icons/animal-tag/invited-dog.svg";
import { ReactComponent as InvitedSmallAnimalTag } from "../../assets/icons/animal-tag/invited-small-animal.svg";

import { ReactComponent as AdminTag } from "../../assets/icons/user-role/admin.svg";
import { ReactComponent as BehaviouristTag } from "../../assets/icons/user-role/behaviourist.svg";
import { ReactComponent as StaffTag } from "../../assets/icons/user-role/staff.svg";
import { ReactComponent as VolunteerTag } from "../../assets/icons/user-role/volunteer.svg";

import { ReactComponent as InvitedAdminTag } from "../../assets/icons/user-role/invited-admin.svg";
import { ReactComponent as InvitedBehaviouristTag } from "../../assets/icons/user-role/invited-behaviourist.svg";
import { ReactComponent as InvitedStaffTag } from "../../assets/icons/user-role/invited-staff.svg";
import { ReactComponent as InvitedVolunteerTag } from "../../assets/icons/user-role/invited-volunteer.svg";

import { UserRoles } from "../../constants/UserConstants";
import { AnimalTag, ColorLevel } from "../../types/TaskTypes";
import { User } from "../../types/UserTypes";
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

  const animalTagIcons: Record<AnimalTag, React.ElementType> = {
    [AnimalTag.BIRD]: BirdTag,
    [AnimalTag.BUNNY]: BunnyTag,
    [AnimalTag.CAT]: CatTag,
    [AnimalTag.DOG]: DogTag,
    [AnimalTag.SMALL_ANIMAL]: SmallAnimalTag,
  };

  const invitedAnimalTagIcons: Record<AnimalTag, React.ElementType> = {
    [AnimalTag.BIRD]: InvitedBirdTag,
    [AnimalTag.BUNNY]: InvitedBunnyTag,
    [AnimalTag.CAT]: InvitedCatTag,
    [AnimalTag.DOG]: InvitedDogTag,
    [AnimalTag.SMALL_ANIMAL]: InvitedSmallAnimalTag,
  };

  const colorLevelMap: Record<number, ColorLevel> = {
    1: ColorLevel.GREEN,
    2: ColorLevel.YELLOW,
    3: ColorLevel.ORANGE,
    4: ColorLevel.RED,
    5: ColorLevel.BLUE,
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
              <Flex gap="1rem" minWidth="max-content" align="center">
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
                {user.animalTags.map((tag) => {
                  const AnimalIcon = isInvited
                    ? invitedAnimalTagIcons[tag]
                    : animalTagIcons[tag];
                  return (
                    <Flex gap="0.5rem" key={tag}>
                      <Icon
                        minWidth="max-content"
                        boxSize="2rem"
                        as={AnimalIcon}
                      />
                    </Flex>
                  );
                })}
              </Flex>
            </Td>
          </Tr>
        );
      })}
    </Tbody>
  );
};

export default UserListTableSection;
