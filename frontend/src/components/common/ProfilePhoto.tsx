import React from "react";
import { Flex, Image } from "@chakra-ui/react";
import { ColorLevel } from "../../types/TaskTypes";
import defaultUserProfile from "../../assets/icons/default-user-profile.svg";
import defaultPetProfile from "../../assets/icons/default-pet-profile.svg";
import invitedDefaultUserProfile from "../../assets/icons/invited-default-user-profile.svg";

export interface ProfilePhotoProps {
  color?: ColorLevel;
  image?: string;
  size?: "x-small" | "small" | "large" | "x-large" | "xx-large";
  type: "user" | "pet" | "invitedUser";
  showColorBorder?: boolean;
}

const borderColor: Record<ColorLevel, string> = {
  [ColorLevel.GREEN]: "green.300",
  [ColorLevel.YELLOW]: "yellow.400",
  [ColorLevel.ORANGE]: "orange.400",
  [ColorLevel.BLUE]: "blue.500",
  [ColorLevel.RED]: "red.600",
};

const fallbackImages: Record<"user" | "pet" | "invitedUser", string> = {
  user: defaultUserProfile,
  pet: defaultPetProfile,
  invitedUser: invitedDefaultUserProfile,
};

const ProfilePhoto = ({
  color,
  image,
  size = "large",
  type,
  showColorBorder,
}: ProfilePhotoProps): React.ReactElement => {
  const sizeMap = {
    "x-small": { container: "2.25rem", image: "1.92rem" },
    small: { container: "2.625rem", image: "2.25rem" },
    large: { container: "8.69rem", image: "8.06rem" },
    "x-large": { container: "12rem", image: "11.5rem" },
    "xx-large": { container: "20rem", image: "23rem" },
  };
  const { container: containerSize, image: imageSize } =
    sizeMap[size || "large"];

  const fallbackImage = fallbackImages[type];
  const bgColor =
    type === "invitedUser" ? "gray.300" : color && borderColor[color];
  return (
    <Flex
      p={showColorBorder ? "0.19rem" : "0rem"}
      boxSize={showColorBorder ? containerSize : imageSize}
      flexShrink={0}
      justify="center"
      align="center"
      borderRadius="full"
      backgroundColor={bgColor}
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
