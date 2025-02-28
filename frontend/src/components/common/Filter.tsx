import React, { useState } from "react";
import {
  Button,
  Checkbox,
  Flex,
  Popover,
  PopoverBody,
  PopoverContent,
  PopoverTrigger,
  Text,
  Box,
  PopoverArrow,
} from "@chakra-ui/react";
import FilterOpenIcon from "../assets/filter-open.svg";
import { filterConfigs } from "../../constants/filterConfig";

export type FilterType = "petList" | "userManagement";

type FilterProps = {
  type: FilterType;
  onChange: (selectedFilters: Record<string, string[]>) => void;
  selected?: Record<string, string[]>;
};

const Filter: React.FC<FilterProps> = ({ type, onChange, selected }) => {
  const filters = filterConfigs[type];
  const [selectedFilters, setSelectedFilters] = useState<
    Record<string, string[]>
  >(selected || {});

  const handleOptionChange = (filterName: string, optionValue: string) => {
    setSelectedFilters((prev) => {
      const current = prev[filterName] || [];
      const updated = current.includes(optionValue)
        ? current.filter((v) => v !== optionValue)
        : [...current, optionValue];
      const newFilters = { ...prev, [filterName]: updated };
      onChange(newFilters);
      return newFilters;
    });
  };

  const handleClearFilter = (filterName: string, e: React.MouseEvent) => {
    if (selectedFilters[filterName]?.length) {
      e.stopPropagation();
      setSelectedFilters((prev) => {
        const newFilters = { ...prev, [filterName]: [] };
        onChange(newFilters);
        return newFilters;
      });
    }
  };

  return (
    <div style={{ display: "flex", flexShrink: "0", width:'fit-content', gap: "1rem" }}>
      {filters.map((filter) => {
        const selectedValues = selectedFilters[filter.name] || [];
        const selectedLabels = filter.options
          .filter((option) => selectedValues.includes(option.value))
          .map((option) => option.label)
          .join(", ");
        return (
          <Popover
            key={filter.name}
            placement="bottom-start"
            closeOnBlur
            autoFocus={false}
          >
            <PopoverTrigger>
              <Button
                bg={selectedValues.length > 0 ? "gray.100" : "transparent"}
                textStyle={{ base: "body" }}
                borderColor="gray.500"
                borderWidth="1px"
                borderStyle={selectedValues.length > 0 ? "solid" : "dashed"}
                position="relative"
                paddingLeft="2rem"
              >
                <Flex gap="0.75rem" align="center">
                  <Button
                    position="absolute"
                    left="0.5rem"
                    top="50%"
                    transform="translateY(-50%)"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    minW="auto"
                    height="auto"
                    padding="0"
                    aria-label={
                      selectedValues.length > 0
                        ? "Clear filter"
                        : "Filter options"
                    }
                    onClick={(e) => handleClearFilter(filter.name, e)}
                  >
                    <Box
                      as="span"
                      display="flex"
                      style={{
                        transform:
                          selectedValues.length > 0 ? "rotate(45deg)" : "none",
                        transition: "transform 0.2s",
                      }}
                    >
                      <img src={FilterOpenIcon} alt="" />
                    </Box>
                  </Button>
                  <Text as="span">{filter.name}</Text>
                  {selectedLabels && (
                    <>
                      {" "}
                      |{" "}
                      <Text margin="auto" color="blue.500">
                        {selectedLabels}
                      </Text>
                    </>
                  )}
                </Flex>
              </Button>
            </PopoverTrigger>
            <PopoverArrow />
            <PopoverContent bg="gray.50" border="none">
              <PopoverBody
                borderRadius="0.5rem"
                boxShadow="0px 4px 4px rgba(0, 0, 0, 0.25)"
              >
                <Flex
                  alignItems="start"
                  padding="0.75rem 1rem"
                  direction="column"
                >
                  <Text color="gray.700" textStyle={{ base: "bodyBold" }}>
                    Filter by: {filter.name}
                  </Text>
                  <Flex direction="column" gap="0.5rem">
                    {filter.options.map((option) => (
                      <Flex
                        direction="row"
                        gap="0.75rem"
                        alignItems="center"
                        key={option.value}
                      >
                        <Checkbox
                          m="0"
                          size="lg"
                          cursor="pointer"
                          borderRadius="1rem"
                          colorScheme="blue"
                          isChecked={selectedValues.includes(option.value)}
                          onChange={() =>
                            handleOptionChange(filter.name, option.value)
                          }
                        />
                        <Text
                          m="0"
                          textStyle={{ base: "body" }}
                          color="gray.700"
                        >
                          {option.label}
                        </Text>
                      </Flex>
                    ))}
                  </Flex>
                </Flex>
              </PopoverBody>
            </PopoverContent>
          </Popover>
        );
      })}
    </div>
  );
};

export default Filter;
