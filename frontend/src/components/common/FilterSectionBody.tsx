import React from "react";
import { Flex, Checkbox, Text } from "@chakra-ui/react";
import { FilterSection } from "../../types/FilterTypes";
import DateFilterCalendar from "./DateFilterCalendar";

type FilterSectionBodyProps = {
  filter: FilterSection;
  selectedValues: string[];
  onOptionChange: (option: string) => void;
  onDateChange: (date: string | undefined) => void;
};

const FilterSectionBody: React.FC<FilterSectionBodyProps> = ({
  filter,
  selectedValues,
  onOptionChange,
  onDateChange,
}) => {
  if (filter.kind === "date") {
    return (
      <DateFilterCalendar
        selected={selectedValues[0]}
        onChange={onDateChange}
      />
    );
  }

  return (
    <Flex direction="column" gap="0.5rem">
      {filter.options.map((option) => (
        <Flex direction="row" gap="0.75rem" alignItems="center" key={option}>
          <Checkbox
            m="0"
            size="lg"
            borderRadius="sm"
            cursor="pointer"
            overflow="hidden"
            colorScheme="blue.700"
            _checked={{
              bg: "blue.700",
              borderColor: "blue.700",
            }}
            borderColor="gray.600"
            isChecked={selectedValues.includes(option)}
            onChange={() => onOptionChange(option)}
          />
          <Text m={0} textStyle={{ base: "body" }} color="gray.700">
            {option}
          </Text>
        </Flex>
      ))}
    </Flex>
  );
};

export default FilterSectionBody;
