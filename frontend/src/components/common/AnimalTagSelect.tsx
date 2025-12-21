import React from "react";
import MultiSelect from "./MultiSelect";
import { AnimalTag } from "../../types/TaskTypes";

interface AnimalTagSelectProps {
  selected: AnimalTag[];
  onSelect: (values: AnimalTag[]) => void;
  label?: string;
  error?: boolean;
  required?: boolean;
  placeholder?: string;
}

// Map animal tags to their respective colors for the badges
const animalTagColors: Record<AnimalTag, string> = {
  [AnimalTag.BIRD]: "purple",
  [AnimalTag.BUNNY]: "pink",
  [AnimalTag.CAT]: "orange",
  [AnimalTag.DOG]: "blue",
  [AnimalTag.SMALL_ANIMAL]: "green",
};

const AnimalTagSelect = ({
  selected,
  onSelect,
  label = "Animal Tag",
  error = false,
  required = false,
  placeholder = "Click for options",
}: AnimalTagSelectProps): React.ReactElement => {
  const animalTags = Object.values(AnimalTag);

  // Create colors array matching the order of animal tags
  const colors = animalTags.map((tag) => animalTagColors[tag]);

  return (
    <MultiSelect<AnimalTag>
      values={animalTags}
      onSelect={onSelect}
      selected={selected}
      placeholder={placeholder}
      label={label}
      error={error}
      required={required}
      colours={colors}
      maxHeight="300px"
    />
  );
};

export default AnimalTagSelect;
