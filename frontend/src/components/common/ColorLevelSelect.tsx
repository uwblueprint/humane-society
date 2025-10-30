import React, { useState, useRef, useEffect } from "react";
import { Box, Flex, Text, FormLabel, Icon } from "@chakra-ui/react";
import { ReactComponent as ExpandIcon } from "../../assets/icons/expand.svg";
import { ColorLevel } from "../../types/TaskTypes";
import ColourLevelBadge from "./ColourLevelBadge";

interface ColorLevelSelectProps {
  selected: ColorLevel | null;
  onSelect: (level: ColorLevel) => void;
  label?: string;
  error?: boolean;
  required?: boolean;
  placeholder?: string;
}

const ColorLevelSelect = ({
  selected,
  onSelect,
  label,
  error = false,
  required = false,
  placeholder = "Click for options",
}: ColorLevelSelectProps): React.ReactElement => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const colorLevels = [
    ColorLevel.GREEN,
    ColorLevel.YELLOW,
    ColorLevel.ORANGE,
    ColorLevel.RED,
    ColorLevel.BLUE,
  ];

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

  const handleSelect = (level: ColorLevel) => {
    onSelect(level);
    setIsOpen(false);
  };

  return (
    <Box ref={containerRef} position="relative" width="100%">
      {label && (
        <FormLabel
          m={0}
          mb="0.5rem"
          fontSize="0.875rem"
          fontWeight="500"
          color={error ? "red.500" : "gray.600"}
        >
          {label}
          {required && (
            <Text as="span" color="red.500" ml="0.25rem">
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
        borderColor={error ? "red.500" : "gray.400"}
        borderRadius="0.5rem"
        cursor="pointer"
        onClick={handleToggle}
        position="relative"
        _hover={{
          borderColor: error ? "red.500" : "gray.400",
          boxShadow: "0 2px 4px rgba(0, 0, 0, 0.05)",
        }}
        _focus={{
          outline: "none",
          borderColor: error ? "red.500" : "blue.400",
          boxShadow: error
            ? "0 0 0 1px red"
            : "0 0 0 3px rgba(59, 130, 246, 0.1)",
        }}
        height="3rem"
        transition="all 0.2s ease"
      >
        <Flex
          justify="space-between"
          align="center"
          gap="0.75rem"
          height="100%"
        >
          <Flex align="center" gap="0.5rem" flex="1" minWidth="0" px="1rem">
            {selected ? (
              <ColourLevelBadge colourLevel={selected} size="small" />
            ) : (
              <Text
                m={0}
                textStyle="body"
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
            bg="gray.100"
            borderLeft="1px solid"
            borderColor="gray.200"
            display="flex"
            alignItems="center"
            justifyContent="center"
            flexShrink={0}
            height="100%"
            borderRadius="0 0.375rem 0.375rem 0"
            px="0.5rem"
          >
            <Icon
              as={ExpandIcon}
              boxSize="1.75rem"
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
          borderRadius="0.75rem"
          mt="0.5rem"
          maxHeight="12.5rem"
          overflowY="auto"
          boxShadow="0 10px 25px rgba(0, 0, 0, 0.15)"
          py="0.5rem"
          px="0.5rem"
        >
          {colorLevels.map((level, index) => {
            const isLastItem = index === colorLevels.length - 1;

            return (
              <Box key={level}>
                <Flex
                  padding="0.75rem 1rem"
                  align="center"
                  gap="0.75rem"
                  cursor="pointer"
                  bg="transparent"
                  _hover={{
                    bg: "gray.100",
                  }}
                  onClick={() => handleSelect(level)}
                  transition="all 0.2s ease"
                  borderRadius="0.375rem"
                >
                  <ColourLevelBadge colourLevel={level} size="small" />
                </Flex>
                {!isLastItem && (
                  <Box height="1px" bg="gray.50" mx="1rem" my="0.25rem" />
                )}
              </Box>
            );
          })}
        </Box>
      )}
    </Box>
  );
};

export default ColorLevelSelect;

