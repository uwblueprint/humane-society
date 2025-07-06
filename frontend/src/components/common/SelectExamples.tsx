import React, { useState } from "react";
import { Box, VStack } from "@chakra-ui/react";
import SingleSelect from "./SingleSelect";
import MultiSelect from "./MultiSelect";
import { ReactComponent as StarIcon } from "../../assets/icons/star.svg";

const SelectExamples: React.FC = () => {
  const [selectedLevel, setSelectedLevel] = useState<string | null>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const colorLevels = ["Green", "Yellow", "Orange", "Red", "Blue"];
  const animalTags = ["Cat", "Dog", "Bird"];
  const levelIcons = [StarIcon, StarIcon, StarIcon, StarIcon, StarIcon];
  const tagColors = ["yellow", "green", "blue"];

  return (
    <Box p="2rem">
      <VStack spacing="2rem" align="stretch" maxWidth="400px">
        <SingleSelect
          values={colorLevels}
          onSelect={setSelectedLevel}
          selected={selectedLevel}
          placeholder="Select a level"
          icons={levelIcons}
          label="Color Level"
          required
          error={false}
        />

        <MultiSelect
          values={animalTags}
          onSelect={setSelectedTags}
          selected={selectedTags}
          placeholder="Select animals"
          colours={tagColors}
          label="Animal Tags"
          required={false}
          error={false}
        />

        {/* Error state examples */}
        <SingleSelect
          values={colorLevels}
          onSelect={setSelectedLevel}
          selected={selectedLevel}
          placeholder="This has an error"
          icons={levelIcons}
          label="Error Example"
          required
          error
        />
      </VStack>
    </Box>
  );
};

export default SelectExamples;
