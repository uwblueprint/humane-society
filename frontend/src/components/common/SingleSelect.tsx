import React, { useState, useRef, useEffect } from "react";
import { Box, Flex, Text, FormLabel, Icon } from "@chakra-ui/react";
import { ReactComponent as ExpandIcon } from "../../assets/icons/expand.svg";

interface BaseSingleSelectProps<T> {
  values: T[];
  onSelect: (value: T) => void;
  selected: T | null;
  placeholder?: string;
  label?: string;
  error?: boolean;
  required?: boolean;
  maxHeight?: string;
}

// Can possibly have no icons
interface WithIcons<T> extends BaseSingleSelectProps<T> {
  icons?: React.FC<React.SVGProps<SVGSVGElement>>[];
  iconElements?: never;
}

interface WithIconElements<T> extends BaseSingleSelectProps<T> {
  iconElements: React.ReactElement[];
  icons?: never;
}

type SingleSelectProps<T> = WithIcons<T> | WithIconElements<T>;

const SingleSelect = <T extends string | number>({
  values,
  onSelect,
  selected,
  placeholder = "Click for options",
  icons,
  iconElements,
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

  return (
    <Box ref={containerRef} position="relative" width="100%">
      {label && (
        <FormLabel
          mb="8px"
          fontSize="14px"
          fontWeight="500"
          color={error ? "red.500" : "gray.600"}
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
        borderColor={error ? "red.500" : "gray.400"}
        borderRadius="8px"
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
        height="48px"
        transition="all 0.2s ease"
      >
        <Flex
          justify="space-between"
          align="center"
          gap="0.75rem"
          height="100%"
        >
          <Flex align="center" gap="8px" flex="1" minWidth="0" px="16px">
            {selected ? (
              <Flex align="center" gap="8px">
                {icons ? (
                  <Icon as={icons[values.indexOf(selected)]} boxSize="16px" />
                ) : (
                  iconElements && iconElements[values.indexOf(selected)]
                )}
                <Text
                  m={0}
                  textStyle="body"
                  color="gray.600"
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
            borderRadius="0 6px 6px 0"
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
          borderRadius="12px"
          mt="8px"
          maxHeight={maxHeight}
          overflowY="auto"
          boxShadow="0 10px 25px rgba(0, 0, 0, 0.15)"
          py="0.5rem"
          px="0.5rem"
        >
          {values.map((value, index) => {
            const IconProp = icons?.[index];
            const IconComponent = iconElements?.[index];
            const isLastItem = index === values.length - 1;

            return (
              <Box key={String(value)}>
                <Flex
                  padding="0.75rem 1rem"
                  align="center"
                  gap="0.75rem"
                  cursor="pointer"
                  bg="transparent"
                  _hover={{
                    bg: "gray.100",
                  }}
                  onClick={() => handleSelect(value)}
                  transition="all 0.2s ease"
                  borderRadius="md"
                >
                  {IconProp ? (
                    <Icon as={IconProp} boxSize="18px" />
                  ) : (
                    IconComponent && IconComponent
                  )}
                  <Text
                    m={0}
                    textStyle="body"
                    color="gray.700"
                    textAlign="left"
                    flex="1"
                  >
                    {String(value)}
                  </Text>
                </Flex>
                {!isLastItem && (
                  <Box height="1px" bg="gray.50" mx="16px" my="4px" />
                )}
              </Box>
            );
          })}
        </Box>
      )}
    </Box>
  );
};

export default SingleSelect;
