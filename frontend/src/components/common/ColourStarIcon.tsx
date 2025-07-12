import React from "react";
import { chakra } from "@chakra-ui/react";
import { ReactComponent as StarSVG } from "../../assets/icons/star.svg";

const StarIcon = chakra(StarSVG);

export interface StarIconProps {
  colour: string;
}

const ColourStarIcon = ({ colour }: StarIconProps): React.ReactElement => (
  <StarIcon fill={colour} color={colour} />
);

export default ColourStarIcon;
