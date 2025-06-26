import React, { useState, useRef, useEffect } from "react";
import { Box, Flex, Text, FormLabel, Icon } from "@chakra-ui/react";
import { ReactComponent as ExpandIcon } from "../../assets/icons/expand.svg";

interface SingleSelectProps<T> {
  values: T[];
  onSelect: (value: T) => void;
  selected: T | null;
  placeholder?: string;
  icons?: React.FC<React.SVGProps<SVGSVGElement>>[];
  label?: string;
  error?: boolean;
  required?: boolean;
  maxHeight?: string;
}

const SingleSelect = <T extends string | number>({
  values,
  onSelect,
  selected,
  placeholder = "Click for options",
  icons,
  label,
  error = false,
  required = false,
  maxHeight = "200px",
}: SingleSelectProps<T>): React.ReactElement => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Validate icons length if provided
  useEffect(() => {
    if (icons && icons.length !== values.length) {
      throw new Error(
        `Icons array length (${icons.length}) must match values array length (${values.length})`,
      );
    }
  }, [icons, values]);

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
    onSelect(value);
    setIsOpen(false);
  };

  const displayValue = selected !== null ? String(selected) : placeholder;

  // Get color for icon based on value
  const getIconColor = (value: T): string => {
    const colorMap: Record<string, string> = {
      Green: "green.500",
      Yellow: "yellow.500",
      Orange: "orange.500",
      Red: "red.500",
      Blue: "blue.500",
      Bird: "blue.400",
      Bunny: "orange.400",
      Cat: "yellow.400",
      Dog: "green.400",
      "Small Animal": "purple.400",
    };
    return colorMap[String(value)] || "orange.400";
  };

  // Get hover background color based on value
  const getHoverColor = (value: T): string => {
    const colorMap: Record<string, string> = {
      Green: "green.50",
      Yellow: "yellow.50",
      Orange: "orange.50",
      Red: "red.50",
      Blue: "blue.50",
      Bird: "blue.50",
      Bunny: "orange.50",
      Cat: "yellow.50",
      Dog: "green.50",
      "Small Animal": "purple.50",
    };
    return colorMap[String(value)] || "orange.50";
  };

  return (
    <Box ref={containerRef} position="relative" width="100%">
      {label && (
        <FormLabel
          mb="8px"
          fontSize="14px"
          fontWeight="500"
          color={error ? "red.500" : "gray.700"}
        >
          {label}
          {required && (
            <Text as="span" color="red.500" ml="4px">
              *
            </Text>
          )}
        </FormLabel>
      )}
      <Box
        as="button"
        type="button"
        width="100%"
        bg="white"
        border="1px solid"
        borderColor={error ? "red.300" : "gray.300"}
        borderRadius="8px"
        padding="12px 16px"
        cursor="pointer"
        onClick={handleToggle}
        position="relative"
        _hover={{
          borderColor: "gray.400",
          boxShadow: "0 2px 4px rgba(0, 0, 0, 0.05)",
        }}
        _focus={{
          outline: "none",
          borderColor: "blue.400",
          boxShadow: "0 0 0 3px rgba(59, 130, 246, 0.1)",
        }}
        height="48px"
        transition="all 0.2s ease"
        boxShadow="0 1px 3px rgba(0, 0, 0, 0.1)"
      >
        <Flex justify="space-between" align="center" gap="0.75rem">
          <Flex align="center" gap="8px" flex="1" minWidth="0">
            {selected ? (
              <Flex align="center" gap="8px">
                {icons && (
                  <Icon
                    as={icons[values.indexOf(selected)]}
                    boxSize="16px"
                    color={getIconColor(selected)}
                  />
                )}
                <Text
                  m={0}
                  fontSize="16px"
                  fontWeight="600"
                  color="blue.600"
                  overflow="hidden"
                  textOverflow="ellipsis"
                  whiteSpace="nowrap"
                >
                  {displayValue}
                </Text>
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
          <Box
            bg="gray.50"
            borderLeft="1px solid"
            borderColor="gray.200"
            px="16px"
            display="flex"
            alignItems="center"
            justifyContent="center"
            flexShrink={0}
            ml="12px"
            mr="-16px"
            height="calc(100% + 24px)"
            my="-12px"
            borderRadius="0 6px 6px 0"
          >
            <Icon
              as={ExpandIcon}
              boxSize="16px"
              color="gray.400"
              transform={`rotate(${isOpen ? 180 : 0}deg)`}
              transition="transform 0.2s ease"
            />
          </Box>
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
            const IconComponent = icons?.[index];
            const isSelected = selected === value;

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
                  bg: getHoverColor(value),
                  transform: "translateY(-1px)",
                }}
                onClick={() => handleSelect(value)}
                transition="all 0.2s ease"
                borderRadius="8px"
                mx="4px"
                my="2px"
              >
                {IconComponent && (
                  <Icon
                    as={IconComponent}
                    boxSize="18px"
                    color={getIconColor(value)}
                  />
                )}
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

export default SingleSelect;
