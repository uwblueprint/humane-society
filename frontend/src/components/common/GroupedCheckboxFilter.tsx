import React from "react";
import {
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Checkbox,
  Flex,
  Text,
} from "@chakra-ui/react";
import { FilterOptionGroup } from "../../types/FilterTypes";

type GroupedCheckboxFilterProps = {
  groups: FilterOptionGroup[];
  selectedValues: string[];
  onOptionChange: (option: string) => void;
  onBulkOptionChange: (options: string[], select: boolean) => void;
};

const GroupedCheckboxFilter: React.FC<GroupedCheckboxFilterProps> = ({
  groups,
  selectedValues,
  onOptionChange,
  onBulkOptionChange,
}) => {
  return (
    <Accordion allowMultiple width="100%">
      {groups.map((group) => {
        const allSelected = group.options.every((option) =>
          selectedValues.includes(option),
        );
        const noneSelected = group.options.every(
          (option) => !selectedValues.includes(option),
        );

        return (
          <AccordionItem key={group.label} border="none">
            <AccordionButton paddingX="0" paddingY="0.5rem">
              <Flex flex="1" alignItems="center" gap="0.75rem">
                <Checkbox
                  m="0"
                  size="lg"
                  borderRadius="sm"
                  cursor="pointer"
                  overflow="hidden"
                  colorScheme="blue.700"
                  _checked={{ bg: "blue.700", borderColor: "blue.700" }}
                  borderColor="gray.600"
                  isChecked={allSelected}
                  isIndeterminate={!allSelected && !noneSelected}
                  onClick={(e) => e.stopPropagation()}
                  onChange={() =>
                    onBulkOptionChange(group.options, !allSelected)
                  }
                />
                <Text
                  m={0}
                  textStyle="body"
                  color="gray.700"
                  whiteSpace="nowrap"
                >
                  {group.label}
                </Text>
              </Flex>
              <AccordionIcon />
            </AccordionButton>
            <AccordionPanel
              paddingX="0"
              paddingLeft="2.5rem"
              paddingBottom="0.5rem"
            >
              <Flex direction="column" gap="0.5rem">
                {group.options.map((option) => (
                  <Flex
                    direction="row"
                    gap="0.75rem"
                    alignItems="center"
                    key={option}
                  >
                    <Checkbox
                      m="0"
                      size="lg"
                      borderRadius="sm"
                      cursor="pointer"
                      overflow="hidden"
                      colorScheme="blue.700"
                      _checked={{ bg: "blue.700", borderColor: "blue.700" }}
                      borderColor="gray.600"
                      isChecked={selectedValues.includes(option)}
                      onChange={() => onOptionChange(option)}
                    />
                    <Text
                      m={0}
                      textStyle="body"
                      color="gray.700"
                      whiteSpace="nowrap"
                    >
                      {option}
                    </Text>
                  </Flex>
                ))}
              </Flex>
            </AccordionPanel>
          </AccordionItem>
        );
      })}
    </Accordion>
  );
};

export default GroupedCheckboxFilter;
