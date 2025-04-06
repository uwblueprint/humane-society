import React from "react";
import { Flex, Image } from "@chakra-ui/react";
import { ColorLevel } from "../../types/TaskTypes";
import defaultUserProfile from "../../assets/icons/default-user-profile.svg";
import defaultPetProfile from "../../assets/icons/default-pet-profile.svg";

export interface ProfilePhotoProps {
  // name: string;
  color: ColorLevel;
  image?: string;
  size: "small" | "large";
  type: "user" | "pet";
}

const borderColor: Record<ColorLevel, string> = {
  [ColorLevel.GREEN]: "green.300",
  [ColorLevel.YELLOW]: "yellow.400",
  [ColorLevel.ORANGE]: "orange.400",
  [ColorLevel.BLUE]: "blue.500",
  [ColorLevel.RED]: "red.600",
};

const ProfilePhoto = ({
  color,
  image,
  size = "large",
  type,
}: ProfilePhotoProps): React.ReactElement => {
  const isSmall = size === "small";
  const containerSize = isSmall ? "2.625rem" : "8.69rem";
  const imageSize = isSmall ? "2.25rem" : "8.06rem";

  const fallbackImage = type === "user" ? defaultUserProfile : defaultPetProfile;

  return (
    <Flex
      padding="0.19rem"
      boxSize={containerSize}
      justify="center"
      align="center"
      borderRadius="full"
      backgroundColor={borderColor[color]}
    >
      <Image
        src={image || fallbackImage}
        fit="cover"
        borderRadius="full"
        boxSize={imageSize}
      />
    </Flex>
  );
};

export default ProfilePhoto;
