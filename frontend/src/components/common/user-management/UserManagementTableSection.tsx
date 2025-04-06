import React from "react";
import { Box, HStack, Icon, Tbody, Td, Text, Tr } from "@chakra-ui/react";
import ProfilePhoto from "../ProfilePhoto";
import { ReactComponent as BirdTag } from "../../../assets/icons/animal-tag/bird.svg";
import { ReactComponent as BunnyTag } from "../../../assets/icons/animal-tag/bunny.svg";
import { ReactComponent as CatTag } from "../../../assets/icons/animal-tag/cat.svg";
import { ReactComponent as DogTag } from "../../../assets/icons/animal-tag/dog.svg";
import { ReactComponent as SmallAnimalTag } from "../../../assets/icons/animal-tag/small-animal.svg";
import { ReactComponent as AdminTag } from "../../../assets/icons/user-role/admin.svg";
import { ReactComponent as BehaviouristTag } from "../../../assets/icons/user-role/behaviourist.svg";
import { ReactComponent as StaffTag } from "../../../assets/icons/user-role/staff.svg";
import { ReactComponent as VolunteerTag } from "../../../assets/icons/user-role/volunteer.svg";

import { UserRoles } from "../../../constants/UserConstants";
import { AnimalTag, ColorLevel } from "../../../types/TaskTypes";
import { User } from "../../../types/UserTypes";

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

  const colorLevelMap: Record<number, ColorLevel> = {
    1: ColorLevel.GREEN,
    2: ColorLevel.YELLOW,
    3: ColorLevel.ORANGE,
    4: ColorLevel.RED,
    5: ColorLevel.BLUE,
  };

  const animalTagIcons: Record<AnimalTag, React.ElementType> = {
    [AnimalTag.BIRD]: BirdTag,
    [AnimalTag.BUNNY]: BunnyTag,
    [AnimalTag.CAT]: CatTag,
    [AnimalTag.DOG]: DogTag,
    [AnimalTag.SMALL_ANIMAL]: SmallAnimalTag,
  };
  return (
    <Tbody>
      {users.map((user) => (
        <Tr
          key={user.id}
          borderTop="1px solid"
          borderBottom="1px solid"
          borderColor="gray.200"
        >
          {/* NAME */}
          <Td pl="2.625rem" pr="7rem" py="0.25rem">
            <HStack gap="1rem" minWidth="max-content">
              <ProfilePhoto
                // name={user.name}
                color={colorLevelMap[user.colorLevel || 1]}
                image={user.profilePhoto}
                size="small"
                type="user"
              />
              <Text textStyle="body" m={0} color="gray.700">
                {user.name}
              </Text>
            </HStack>
          </Td>

          {/* ROLE */}
          <Td padding="0" pr="12rem" py="0.25rem">
            <HStack>
              <Box borderRadius="full">
                <Icon
                  as={roleIcons[user.role]}
                  boxSize="2rem"
                  minWidth="max-content"
                />
              </Box>
            </HStack>
          </Td>

          {/* ANIMAL TAGS */}
          <Td padding="0" pr="2rem" py="0.25rem">
            <HStack wrap="wrap">
              {user.animalTags.map((tag) => (
                <Box key={tag}>
                  <HStack gap="0.5rem">
                    <Icon
                      minWidth="max-content"
                      boxSize="2rem"
                      as={animalTagIcons[tag as keyof typeof animalTagIcons]}
                    />
                  </HStack>
                </Box>
              ))}
            </HStack>
          </Td>
        </Tr>
      ))}
    </Tbody>
  );
};

export default UserListTableSection;
