import React from "react";
import { Flex, Image, Box } from "@chakra-ui/react";
import { SkillLevel } from "../../types/TaskTypes";

export interface ProfilePhotoProps {
  // name: string;
  color: SkillLevel;
  image?: string;
  size: "small" | "large";
}

const borderColor: Record<SkillLevel, string> = {
  [SkillLevel.GREEN]: "green.300",
  [SkillLevel.YELLOW]: "yellow.400",
  [SkillLevel.ORANGE]: "orange.400",
  [SkillLevel.BLUE]: "blue.500",
  [SkillLevel.RED]: "red.600",
};

const ProfilePhoto = ({  
  // name,
  color,
  image,
  size = "large",
}: ProfilePhotoProps): React.ReactElement => {
  const isSmall = size === "small";
  const containerSize = isSmall ? "2.625rem" : "8.69rem";
  const imageSize = isSmall ? "2.25rem" : "8.06rem";

  return (
    <Flex
      padding="0.19rem"
      boxSize={containerSize}
      justify="center"
      align="center"
      borderRadius="full"
      backgroundColor={borderColor[color]}
    >
      {image ? (
        <Image
          src={image}
          fit="cover"
          borderRadius="full"
          boxSize={imageSize}
        />
      ) : (
        <Box
          backgroundColor="gray.200"
          borderRadius="full"
          boxSize={imageSize}
        />
      )}
    </Flex>
  );
};

export default ProfilePhoto;
