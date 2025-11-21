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
  selected?: T[];
  placeholder?: string;
  label?: string;
  error?: boolean;
  colours: string[];
  icons?: React.FC<React.SVGProps<SVGSVGElement>>[];
  required?: boolean;
  maxHeight?: string;
}

const MultiSelect = <T extends string | number>({
  values,
  onSelect,
  selected = [],
  placeholder = "Click for options",
  label,
  error = false,
  colours,
  icons,
  required = false,
  maxHeight = "200px",
}: MultiSelectProps<T>): React.ReactElement => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Validate colours length
  useEffect(() => {
    if (colours.length !== values.length) {
      throw new Error(
        `Colours array length (${colours.length}) must match values array length (${values.length})`,
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
          borderColor: "gray.400",
        }}
        _focus={{
          outline: "none",
          borderColor: "blue.400",
        }}
        height="48px"
        transition="all 0.2s ease"
      >
        <Flex
          justify="space-between"
          align="center"
          wrap="nowrap"
          height="100%"
        >
          <Flex
            align="center"
            gap="0rem"
            flex="1"
            minWidth="0"
            overflow="hidden"
            pl="1rem"
          >
            {selected.length > 0 ? (
              <Flex
                gap="0.5rem"
                align="center"
                flex="1"
                overflowX="auto"
                overflowY="hidden"
                css={{
                  "&::-webkit-scrollbar": {
                    display: "none",
                  },
                  "-ms-overflow-style": "none",
                  "scrollbar-width": "none",
                }}
                pb="2px"
              >
                {selected.map((value) => {
                  const color = getColorForValue(value);
                  const IconComponent = icons?.[values.indexOf(value)];

                  return (
                    <Tag
                      key={String(value)}
                      colorScheme={color}
                      borderRadius="full"
                      flexShrink={0}
                      px="1.5rem"
                      py="0.25rem"
                      display="flex"
                      gap="0.25rem"
                    >
                      {IconComponent && (
                        <Icon as={IconComponent} boxSize="1rem" />
                      )}
                      <TagLabel textStyle="button" m={0}>
                        {String(value)}
                      </TagLabel>
                      <TagCloseButton
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveTag(value);
                        }}
                        _hover={{
                          bg: "whiteAlpha.300",
                        }}
                        sx={{
                          color: { color },
                          "& svg": {
                            color: { color },
                          },
                        }}
                      />
                    </Tag>
                  );
                })}
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
          borderRadius="0.75rem"
          mt="0.5rem"
          maxHeight={maxHeight}
          overflowY="auto"
          boxShadow="0 10px 25px rgba(0, 0, 0, 0.15)"
          px="0.5rem"
          py="0.5rem"
        >
          {values.map((value, index) => {
            const isSelected = selected.includes(value);
            const isLastItem = index === values.length - 1;
            const IconComponent = icons?.[index];

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
                  transition="all 0.2s ease"
                  borderRadius="md"
                >
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
                    isChecked={isSelected}
                    onChange={() => handleSelect(value)}
                  />
                  {IconComponent && (
                    <Icon as={IconComponent} boxSize="1.5rem" />
                  )}
                  <Text
                    m={0}
                    textStyle="body"
                    color="gray.700"
                    textAlign="left"
                    flex="1"
                    onClick={() => handleSelect(value)}
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

export default MultiSelect;
