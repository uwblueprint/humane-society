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
} from "@chakra-ui/react";
import FilterOpenIcon from "../../assets/icons/filter-open.svg";
import filterConstants from "../../constants/FilterConstants";

export type FilterType = "petListVolunteer" | "petListAdmin" | "userManagement";

type FilterProps = {
  type: FilterType;
  onChange: (selectedFilters: Record<string, string[]>) => void;
  selected?: Record<string, string[]>;
};

const Filter: React.FC<FilterProps> = ({ type, onChange, selected = {} }) => {
  const filters = filterConstants[type];
  const [selectedFilters, setSelectedFilters] = useState<
    Record<string, string[]>
  >(selected);
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
  }, [selectedFilters, type]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!containerRef.current) return;

    setIsDragging(true);
    setHasMoved(false);
    setStartX(e.pageX - containerRef.current.offsetLeft);
    setInitialScrollLeft(containerRef.current.scrollLeft);

    document.body.style.cursor = "grabbing";
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
    document.body.style.cursor = "default";
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    document.body.style.cursor = "default";
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
    <Box position="relative" minWidth="0">
      <Box
        ref={containerRef}
        overflowX="auto"
        css={{
          "&::-webkit-scrollbar": {
            display: "none",
          },
          scrollbarWidth: "none",
          msOverflowStyle: "none",
          cursor: isDragging ? "grabbing" : "grab",
        }}
        onMouseDown={handleMouseDown}
        onMouseLeave={handleMouseLeave}
        onMouseUp={handleMouseUp}
        onMouseMove={handleMouseMove}
        onScroll={handleScroll}
      >
        <Flex gap="1rem" flexShrink={0} userSelect="none">
          {filters.map((filter) => {
            const selectedValues = selectedFilters[filter.value] || [];
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
                <PopoverTrigger>
                  <Button
                    flexShrink="0"
                    bg={selectedValues.length > 0 ? "gray.100" : "transparent"}
                    textStyle={{ base: "body" }}
                    borderColor="gray.500"
                    borderWidth="1px"
                    borderStyle={selectedValues.length > 0 ? "solid" : "dashed"}
                    position="relative"
                    paddingLeft="2rem"
                    onClick={(e) => {
                      // logic to prevent popover toggling when dragging
                      if (isDragging || hasMoved) {
                        e.preventDefault();
                        setHasMoved(false);
                      }
                    }}
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
                              selectedValues.length > 0
                                ? "rotate(45deg)"
                                : "none",
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
                <PopoverContent bg="gray.50" border="none" boxShadow="sm">
                  <PopoverBody borderRadius="0.5rem">
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
                            key={option}
                          >
                            <Checkbox
                              m="0"
                              size="lg"
                              cursor="pointer"
                              borderRadius="1rem"
                              colorScheme="blue"
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
