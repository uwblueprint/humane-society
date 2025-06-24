import React, { useState, useRef, useEffect } from "react";
import {
  Box,
  Flex,
  Text,
  FormLabel,
  Icon,
  Checkbox,
  Tag,
  TagLabel,
  TagCloseButton,
} from "@chakra-ui/react";
import { ReactComponent as ExpandIcon } from "../../assets/icons/expand.svg";

interface MultiSelectProps<T> {
  values: T[];
  onSelect: (values: T[]) => void;
  selected: T[];
  placeholder?: string;
  label?: string;
  error?: boolean;
  colours: string[];
  required?: boolean;
  maxHeight?: string;
}

const MultiSelect = <T extends string | number>({
  values,
  onSelect,
  selected,
  placeholder = "Click for options",
  label,
  error = false,
  colours,
  required = false,
  maxHeight = "200px",
}: MultiSelectProps<T>): React.ReactElement => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Validate colours length
  useEffect(() => {
    if (colours.length !== values.length) {
      throw new Error(
        `Colours array length (${colours.length}) must match values array length (${values.length})`
      );
    }
  }, [colours, values]);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  const handleSelect = (value: T) => {
    const isSelected = selected.includes(value);
    if (isSelected) {
      onSelect(selected.filter((item) => item !== value));
    } else {
      onSelect([...selected, value]);
    }
  };

  const handleRemoveTag = (value: T) => {
    onSelect(selected.filter((item) => item !== value));
  };

  const getColorForValue = (value: T): string => {
    const index = values.indexOf(value);
    return colours[index] || "gray";
  };

  // Map color names to Chakra UI color scheme
  const getColorScheme = (color: string): string => {
    const colorMap: Record<string, string> = {
      green: "green",
      yellow: "yellow",
      orange: "orange",
      red: "red",
      blue: "blue",
      purple: "purple",
      pink: "pink",
      teal: "teal",
    };
    return colorMap[color.toLowerCase()] || "gray";
  };

  return (
    <Box ref={containerRef} position="relative" width="100%">
      <Box
        as="button"
        type="button"
        width="100%"
        bg="white"
        border="1px solid"
        borderColor="gray.300"
        borderRadius="8px"
        padding="12px 16px"
        cursor="pointer"
        onClick={handleToggle}
        position="relative"
        _hover={{ 
          borderColor: "gray.400",
          boxShadow: "0 2px 4px rgba(0, 0, 0, 0.05)"
        }}
        _focus={{ 
          outline: "none", 
          borderColor: "blue.400",
          boxShadow: "0 0 0 3px rgba(59, 130, 246, 0.1)" 
        }}
        height="48px"
        transition="all 0.2s ease"
        boxShadow="0 1px 3px rgba(0, 0, 0, 0.1)"
      >
        <Flex justify="space-between" align="center" gap="0.75rem" wrap="nowrap">
          <Flex align="center" gap="0.5rem" flex="1" minWidth="0">
            {selected.length > 0 ? (
              <Flex gap="0.5rem" wrap="wrap" align="center" overflow="hidden">
                {selected.map((value) => {
                  const color = getColorForValue(value);
                  const colorScheme = getColorScheme(color);
                  
                  return (
                    <Tag
                      key={String(value)}
                      size="md"
                      colorScheme={colorScheme}
                      borderRadius="full"
                      variant="subtle"
                      fontSize="14px"
                      fontWeight="600"
                      px="12px"
                      py="6px"
                      boxShadow="0 1px 3px rgba(0, 0, 0, 0.12)"
                      onClick={(e) => {
                        e.stopPropagation();
                      }}
                    >
                      <TagLabel>{String(value)}</TagLabel>
                      <TagCloseButton
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveTag(value);
                        }}
                        ml="4px"
                        _hover={{
                          bg: "whiteAlpha.300"
                        }}
                      />
                    </Tag>
                  );
                })}
              </Flex>
            ) : (
              <Text
                m={0}
                fontSize="16px"
                color="gray.400"
                fontStyle="italic"
                overflow="hidden"
                textOverflow="ellipsis"
                whiteSpace="nowrap"
              >
                {placeholder}
              </Text>
            )}
          </Flex>
          <Icon
            as={ExpandIcon}
            boxSize="16px"
            color="gray.500"
            transform={`rotate(${isOpen ? 180 : 0}deg)`}
            transition="transform 0.2s ease"
            flexShrink={0}
          />
        </Flex>
      </Box>

      {isOpen && (
        <Box
          position="absolute"
          top="100%"
          left="0"
          right="0"
          zIndex="1000"
          bg="white"
          border="1px solid"
          borderColor="gray.200"
          borderRadius="12px"
          mt="8px"
          maxHeight={maxHeight}
          overflowY="auto"
          boxShadow="0 10px 25px rgba(0, 0, 0, 0.15)"
        >
          {values.map((value, index) => {
            const isSelected = selected.includes(value);
            const color = colours[index];
            const colorScheme = getColorScheme(color);
            
            return (
              <Flex
                key={String(value)}
                as="button"
                type="button"
                width="calc(100% - 8px)"
                padding="12px 16px"
                align="center"
                gap="12px"
                cursor="pointer"
                bg="transparent"
                _hover={{ 
                  bg: `${colorScheme}.50`,
                  transform: "translateY(-1px)"
                }}
                onClick={() => handleSelect(value)}
                transition="all 0.2s ease"
                borderRadius="8px"
                mx="4px"
                my="2px"
              >
                <Checkbox
                  m="0"
                  size="md"
                  cursor="pointer"
                  borderRadius="6px"
                  colorScheme={colorScheme}
                  borderColor="gray.400"
                  borderWidth="2px"
                  isChecked={isSelected}
                  onChange={() => {}} // Handled by parent click
                  onClick={(e) => e.stopPropagation()}
                  _checked={{
                    bg: `${colorScheme}.500`,
                    borderColor: `${colorScheme}.500`,
                    _hover: {
                      bg: `${colorScheme}.600`,
                      borderColor: `${colorScheme}.600`
                    }
                  }}
                />
                <Text
                  m={0}
                  fontSize="16px"
                  fontWeight="500"
                  color="gray.700"
                  textAlign="left"
                  flex="1"
                >
                  {String(value)}
                </Text>
              </Flex>
            );
          })}
        </Box>
      )}
    </Box>
  );
};

export default MultiSelect; 