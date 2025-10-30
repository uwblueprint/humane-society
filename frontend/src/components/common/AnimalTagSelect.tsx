import React, { useState, useRef, useEffect } from "react";
import {
  Box,
  Flex,
  Text,
  FormLabel,
  Icon,
  Tag,
  TagLabel,
  TagCloseButton,
} from "@chakra-ui/react";
import { ReactComponent as ExpandIcon } from "../../assets/icons/expand.svg";
import { AnimalTag } from "../../types/TaskTypes";
import { ReactComponent as BirdTag } from "../../assets/icons/animal-tag/bird.svg";
import { ReactComponent as BunnyTag } from "../../assets/icons/animal-tag/bunny.svg";
import { ReactComponent as CatTag } from "../../assets/icons/animal-tag/cat.svg";
import { ReactComponent as DogTag } from "../../assets/icons/animal-tag/dog.svg";
import { ReactComponent as SmallAnimalTag } from "../../assets/icons/animal-tag/small-animal.svg";

interface AnimalTagSelectProps {
  selected: AnimalTag[];
  onSelect: (tags: AnimalTag[]) => void;
  label?: string;
  error?: boolean;
  required?: boolean;
  placeholder?: string;
}

const animalTagIcons: Record<AnimalTag, React.ElementType> = {
  [AnimalTag.BIRD]: BirdTag,
  [AnimalTag.BUNNY]: BunnyTag,
  [AnimalTag.CAT]: CatTag,
  [AnimalTag.DOG]: DogTag,
  [AnimalTag.SMALL_ANIMAL]: SmallAnimalTag,
};

const animalTagColors: Record<AnimalTag, string> = {
  [AnimalTag.BIRD]: "purple",
  [AnimalTag.BUNNY]: "pink",
  [AnimalTag.CAT]: "orange",
  [AnimalTag.DOG]: "teal",
  [AnimalTag.SMALL_ANIMAL]: "blue",
};

const AnimalTagSelect = ({
  selected,
  onSelect,
  label,
  error = false,
  required = false,
  placeholder = "Click for options",
}: AnimalTagSelectProps): React.ReactElement => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const allTags = [
    AnimalTag.BIRD,
    AnimalTag.BUNNY,
    AnimalTag.CAT,
    AnimalTag.DOG,
    AnimalTag.SMALL_ANIMAL,
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

  const handleSelect = (tag: AnimalTag) => {
    const isSelected = selected.includes(tag);
    if (isSelected) {
      onSelect(selected.filter((item) => item !== tag));
    } else {
      onSelect([...selected, tag]);
    }
  };

  const handleRemoveTag = (tag: AnimalTag) => {
    onSelect(selected.filter((item) => item !== tag));
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
        }}
        _focus={{
          outline: "none",
          borderColor: error ? "red.500" : "blue.400",
        }}
        minHeight="3rem"
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
                pb="0.125rem"
                py="0.5rem"
                flexWrap="wrap"
              >
                {selected.map((tag) => {
                  const color = animalTagColors[tag];
                  const AnimalIcon = animalTagIcons[tag];

                  return (
                    <Tag
                      key={tag}
                      colorScheme={color}
                      borderRadius="full"
                      flexShrink={0}
                      px="1rem"
                      py="0.25rem"
                      display="flex"
                      gap="0.25rem"
                    >
                      <Icon as={AnimalIcon} boxSize="1rem" />
                      <TagLabel textStyle="button" m={0} fontSize="1rem">
                        {tag}
                      </TagLabel>
                      <TagCloseButton
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveTag(tag);
                        }}
                        _hover={{
                          bg: "whiteAlpha.300",
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
            minHeight="3rem"
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
          px="0.5rem"
          py="0.5rem"
        >
          {allTags.map((tag, index) => {
            const isSelected = selected.includes(tag);
            const isLastItem = index === allTags.length - 1;
            const AnimalIcon = animalTagIcons[tag];

            return (
              <Box key={tag}>
                <Flex
                  padding="0.75rem 1rem"
                  align="center"
                  gap="0.75rem"
                  cursor="pointer"
                  bg={isSelected ? "gray.50" : "transparent"}
                  _hover={{
                    bg: "gray.100",
                  }}
                  transition="all 0.2s ease"
                  borderRadius="0.375rem"
                  onClick={() => handleSelect(tag)}
                >
                  <Icon as={AnimalIcon} boxSize="1.5rem" />
                  <Text
                    m={0}
                    textStyle="body"
                    color="gray.700"
                    textAlign="left"
                    flex="1"
                  >
                    {tag}
                  </Text>
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

export default AnimalTagSelect;
