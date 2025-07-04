import React from "react";
import { Text, HStack, chakra } from "@chakra-ui/react";
import { ColorLevel } from "../../../types/TaskTypes";
import { ReactComponent as StarSVG } from "../../../assets/icons/star.svg";

const StarIcon = chakra(StarSVG);

const borderColour: Record<ColorLevel, string> = {
  [ColorLevel.GREEN]: "green.800",
  [ColorLevel.YELLOW]: "yellow.800",
  [ColorLevel.ORANGE]: "orange.500",
  [ColorLevel.BLUE]: "blue.700",
  [ColorLevel.RED]: "red.800",
};

const fillColour: Record<ColorLevel, string> = {
  [ColorLevel.GREEN]: "green.50",
  [ColorLevel.YELLOW]: "yellow.50",
  [ColorLevel.ORANGE]: "orange.200",
  [ColorLevel.BLUE]: "blue.50",
  [ColorLevel.RED]: "red.200",
};

export interface ColourLevelProps {
  colourLevel: ColorLevel;
  size: "small" | "large";
}

const ColourLevelBadge = ({
  colourLevel,
  size,
}: ColourLevelProps): React.ReactElement => (
  <HStack
    paddingInline={size === "large" ? "1.8rem" : "0.9rem"}
    paddingBlock={size === "large" ? "0.6rem" : "0.2rem"}
    backgroundColor={fillColour[colourLevel]}
    borderColor={borderColour[colourLevel]}
    borderRadius="full"
    borderWidth="1px"
    display="flex"
    gap="0.5rem"
  >
    <StarIcon
      fill={borderColour[colourLevel]}
      color={borderColour[colourLevel]}
    />
    <Text
      margin="0"
      color={borderColour[colourLevel]}
      textStyle="button"
      fontSize={size === "large" ? "18px" : "16px"}
    >
      {colourLevel}
    </Text>
  </HStack>
);

export default ColourLevelBadge;
