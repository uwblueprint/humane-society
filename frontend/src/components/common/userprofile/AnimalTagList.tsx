import React from "react";
import { HStack, Box, Icon } from "@chakra-ui/react";
import { AnimalTag } from "../../../types/TaskTypes";
import { ReactComponent as BirdTag } from "../../../assets/icons/animal-tag/bird.svg";
import { ReactComponent as BunnyTag } from "../../../assets/icons/animal-tag/bunny.svg";
import { ReactComponent as CatTag } from "../../../assets/icons/animal-tag/cat.svg";
import { ReactComponent as DogTag } from "../../../assets/icons/animal-tag/dog.svg";
import { ReactComponent as SmallAnimalTag } from "../../../assets/icons/animal-tag/small-animal.svg";

import { ReactComponent as InvitedBirdTag } from "../../../assets/icons/animal-tag/invited-bird.svg";
import { ReactComponent as InvitedBunnyTag } from "../../../assets/icons/animal-tag/invited-bunny.svg";
import { ReactComponent as InvitedCatTag } from "../../../assets/icons/animal-tag/invited-cat.svg";
import { ReactComponent as InvitedDogTag } from "../../../assets/icons/animal-tag/invited-dog.svg";
import { ReactComponent as InvitedSmallAnimalTag } from "../../../assets/icons/animal-tag/invited-small-animal.svg";

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

export interface ColourLevelProps {
  isInvited: boolean;
  animalTags: AnimalTag[];
}

const AnimalTagList = ({
  isInvited,
  animalTags,
}: ColourLevelProps): React.ReactElement => {
  const tags = Array.isArray(animalTags) ? animalTags : [];
  return (
    <HStack wrap="wrap">
      {tags.map((tag) => {
        const AnimalIcon = isInvited
          ? invitedAnimalTagIcons[tag]
          : animalTagIcons[tag];
        return (
          <Box key={tag}>
            <HStack gap="0.5rem">
              <Icon minWidth="max-content" boxSize="2rem" as={AnimalIcon} />
            </HStack>
          </Box>
        );
      })}
    </HStack>
  );
};

export default AnimalTagList;
