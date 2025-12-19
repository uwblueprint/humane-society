import React from "react";
import { Box } from "@chakra-ui/react";
import SingleSelect from "./SingleSelect";
import ColourLevelBadge from "./ColourLevelBadge";
import { ColorLevel } from "../../types/TaskTypes";

interface ColourLevelSelectProps {
  selected: ColorLevel | null;
  onSelect: (value: ColorLevel) => void;
  label?: string;
  error?: boolean;
  required?: boolean;
  placeholder?: string;
}

const ColourLevelSelect = ({
  selected,
  onSelect,
  label = "Colour Level",
  error = false,
  required = false,
  placeholder = "Click for options",
}: ColourLevelSelectProps): React.ReactElement => {
  const colorLevels = Object.values(ColorLevel);

  // Create icon elements for each color level
  const iconElements = colorLevels.map((level) => (
    <Box key={level} display="flex" alignItems="center">
      <ColourLevelBadge colourLevel={level} size="small" />
    </Box>
  ));

  return (
    <SingleSelect<ColorLevel>
      values={colorLevels}
      onSelect={onSelect}
      selected={selected}
      placeholder={placeholder}
      label={label}
      error={error}
      required={required}
      iconElements={iconElements}
      maxHeight="300px"
    />
  );
};

export default ColourLevelSelect;
