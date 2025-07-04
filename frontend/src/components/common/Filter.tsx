import React, { useState, useRef, useEffect } from "react";
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
  Image,
} from "@chakra-ui/react";
import filterConfig from "../../config/filterConfig";
import { CloseIcon, FilterOpenIcon } from "../../assets/icons";

export type FilterType =
  | "petListVolunteer"
  | "petListAdmin"
  | "userManagement"
  | "taskManagement";

type FilterProps = {
  type: FilterType;
  onChange: (selectedFilters: Record<string, string[]>) => void;
  selected: Record<string, string[]>;
};

const Filter: React.FC<FilterProps> = ({ type, onChange, selected }) => {
  const filters = filterConfig[type];
  const containerRef = useRef<HTMLDivElement>(null);
  const [showGradient, setShowGradient] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [initialScrollLeft, setInitialScrollLeft] = useState(0);
  const [hasMoved, setHasMoved] = useState(false);

  const checkScrollPosition = () => {
    if (containerRef.current) {
      const { scrollWidth, clientWidth, scrollLeft } = containerRef.current;
      const hasOverflow = scrollWidth > clientWidth;

      const atEnd = Math.ceil(scrollLeft + clientWidth) >= scrollWidth - 5;

      setShowGradient(hasOverflow && !atEnd);
    }
  };

  useEffect(() => {
    checkScrollPosition();
    window.addEventListener("resize", checkScrollPosition);
    return () => window.removeEventListener("resize", checkScrollPosition);
  }, [type]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!containerRef.current) return;

    setIsDragging(true);
    setHasMoved(false);
    setStartX(e.pageX - containerRef.current.offsetLeft);
    setInitialScrollLeft(containerRef.current.scrollLeft);
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !containerRef.current) return;

    e.preventDefault();
    const x = e.pageX - containerRef.current.offsetLeft;
    const walk = x - startX;

    if (Math.abs(walk) > 3) {
      setHasMoved(true);
    }

    containerRef.current.scrollLeft = initialScrollLeft - walk;

    checkScrollPosition();
  };

  const handleScroll = () => {
    checkScrollPosition();
  };

  const handleOptionChange = (filterName: string, optionValue: string) => {
    const current = selected[filterName] || [];
    const updated = current.includes(optionValue)
      ? current.filter((v) => v !== optionValue)
      : [...current, optionValue];
    const newFilters = { ...selected, [filterName]: updated };
    onChange(newFilters);
  };

  const handleClearFilter = (filterName: string, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (selected[filterName]?.length) {
      const newFilters = { ...selected, [filterName]: [] };
      onChange(newFilters);
    }
  };

  return (
    <Box position="relative" minWidth="0">
      <Box
        ref={containerRef}
        overflowX="auto"
        className="no-scrollbar"
        onMouseDown={handleMouseDown}
        onMouseLeave={handleMouseLeave}
        onMouseUp={handleMouseUp}
        onMouseMove={handleMouseMove}
        onScroll={handleScroll}
      >
        <Flex gap="1rem" flexShrink={0} userSelect="none">
          {filters.map((filter) => {
            const selectedValues = selected[filter.value] || [];
            const selectedLabels = filter.options
              .filter((option) => selectedValues.includes(option))
              .join(", ");
            return (
              <Popover
                key={filter.name}
                placement="bottom-start"
                closeOnBlur
                autoFocus={false}
              >
                {({ onClose }) => (
                  <>
                    <PopoverTrigger>
                      <Button
                        flexShrink="0"
                        bg={
                          selectedValues.length > 0 ? "gray.100" : "transparent"
                        }
                        textStyle={{ base: "body" }}
                        borderColor="gray.500"
                        borderWidth="1px"
                        borderStyle={
                          selectedValues.length > 0 ? "solid" : "dashed"
                        }
                        position="relative"
                        padding="0.62rem 0.75rem"
                        onClick={(e) => {
                          // logic to prevent popover toggling when dragging
                          if (isDragging || hasMoved) {
                            e.preventDefault();
                            setHasMoved(false);
                          }
                        }}
                      >
                        <Flex gap="0.75rem" align="center">
                          <Box
                            display="flex"
                            alignItems="center"
                            justifyContent="center"
                            cursor="pointer"
                            aria-label={
                              selectedValues.length > 0
                                ? "Clear filter"
                                : "Filter options"
                            }
                            onClick={(e) => {
                              if (selectedValues.length > 0) {
                                handleClearFilter(filter.value, e);
                              }
                            }}
                          >
                            <img
                              style={{
                                transform:
                                  selectedValues.length > 0
                                    ? "rotate(45deg)"
                                    : "none",
                                transition: "transform 0.2s",
                              }}
                              src={FilterOpenIcon}
                              alt=""
                            />
                          </Box>
                          <Flex gap="0.35rem" alignItems="center">
                            <Text margin="0" textStyle="body" as="span">
                              {filter.name}
                            </Text>
                            {selectedLabels && (
                              <>
                                <Text margin="0" textStyle="body" as="span">
                                  |
                                </Text>
                                <Text
                                  margin="0"
                                  textStyle="bodyBold"
                                  color="blue.500"
                                >
                                  {selectedLabels}
                                </Text>
                              </>
                            )}
                          </Flex>
                        </Flex>
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent bg="gray.50" border="none" boxShadow="sm">
                      <PopoverArrow
                        bg="gray.50"
                        border="1px solid"
                        borderColor="gray.50"
                      />
                      <PopoverBody borderRadius="0.5rem">
                        <Flex
                          alignItems="start"
                          padding="0.75rem 1rem"
                          direction="column"
                          gap="1rem"
                        >
                          <Flex
                            width="100%"
                            justifyContent="space-between"
                            alignItems="center"
                          >
                            <Text
                              margin="0"
                              textStyle="bodyBold"
                              color="gray.700"
                            >
                              Filter by {filter.name}
                            </Text>
                            <Box
                              onClick={onClose}
                              cursor="pointer"
                              padding="0.25rem"
                              borderRadius="0.25rem"
                              _hover={{
                                backgroundColor: "gray.200",
                                transform: "scale(1.1)",
                              }}
                              transition="all 0.2s"
                            >
                              <Image
                                src={CloseIcon}
                                alt="close"
                                boxSize="1rem"
                              />
                            </Box>
                          </Flex>
                          <Flex direction="column" gap="0.5rem">
                            {filter.options.map((option) => (
                              <Flex
                                direction="row"
                                gap="0.75rem"
                                alignItems="center"
                                key={option}
                              >
                                <Checkbox
                                  m="0"
                                  size="lg"
                                  cursor="pointer"
                                  borderRadius="lg"
                                  colorScheme="blue"
                                  borderColor="gray.600"
                                  isChecked={selectedValues.includes(option)}
                                  onChange={() =>
                                    handleOptionChange(filter.value, option)
                                  }
                                />
                                <Text
                                  m="0"
                                  textStyle={{ base: "body" }}
                                  color="gray.700"
                                >
                                  {option}
                                </Text>
                              </Flex>
                            ))}
                          </Flex>
                        </Flex>
                      </PopoverBody>
                    </PopoverContent>
                  </>
                )}
              </Popover>
            );
          })}
        </Flex>
      </Box>

      {showGradient && (
        <Box
          position="absolute"
          right={0}
          top={0}
          bottom={0}
          width="60px"
          height="100%"
          pointerEvents="none"
          zIndex={2}
          backgroundColor="transparent"
          backgroundImage="linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,1) 80%)"
        />
      )}
    </Box>
  );
};

export default Filter;
