import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  Button,
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
import { ChevronLeftIcon, ChevronRightIcon } from "@chakra-ui/icons";
import filterConfig from "../../config/filterConfig";
import { CloseIcon, FilterOpenIcon } from "../../assets/icons";
import { FilterSection } from "../../types/FilterTypes";
import FilterSectionBody from "./FilterSectionBody";
import MobileFilterPanel from "./MobileFilterPanel";

export type FilterType =
  | "petListVolunteer"
  | "petListAdmin"
  | "userManagement"
  | "taskManagement"
  | "interactionLog";

type FilterProps = {
  type: FilterType;
  onChange: (selectedFilters: Record<string, string[]>) => void;
  selected: Record<string, string[]>;
};

const MOBILE_COMBINED_PANEL_TYPES: FilterType[] = ["interactionLog"];

const formatDateLabel = (iso: string): string => {
  const date = new Date(`${iso}T00:00:00`);
  return date.toLocaleDateString("en-US", {
    month: "2-digit",
    day: "2-digit",
    year: "numeric",
  });
};

const getSelectedLabels = (
  filter: FilterSection,
  selectedValues: string[],
): string => {
  if (filter.kind === "date") {
    return selectedValues[0] ? formatDateLabel(selectedValues[0]) : "";
  }

  if (filter.kind === "grouped-checkbox" && filter.groups) {
    const groupLabels: string[] = [];
    const singleOptions: string[] = [];

    filter.groups.forEach((group) => {
      const isFullySelected = group.options.every((option) =>
        selectedValues.includes(option),
      );
      if (isFullySelected) {
        groupLabels.push(group.label);
      } else {
        group.options.forEach((option) => {
          if (selectedValues.includes(option)) {
            singleOptions.push(option);
          }
        });
      }
    });

    const items = [...groupLabels, ...singleOptions];
    if (items.length === 0) return "";
    if (items.length === 1) return items[0];
    return `${items[0]}, +${items.length - 1}`;
  }

  return filter.options
    .filter((option) => selectedValues.includes(option))
    .join(", ");
};

const Filter: React.FC<FilterProps> = ({ type, onChange, selected }) => {
  const filters = filterConfig[type];
  const useMobileCombinedPanel = MOBILE_COMBINED_PANEL_TYPES.includes(type);
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [initialScrollLeft, setInitialScrollLeft] = useState(0);
  const [hasMoved, setHasMoved] = useState(false);
  const [isMobilePanelOpen, setIsMobilePanelOpen] = useState(false);

  const checkScrollPosition = useCallback(() => {
    if (containerRef.current) {
      const { scrollWidth, clientWidth, scrollLeft } = containerRef.current;
      const hasOverflow = scrollWidth > clientWidth;

      const atStart = scrollLeft <= 5;
      const atEnd = Math.ceil(scrollLeft + clientWidth) >= scrollWidth - 5;

      setCanScrollLeft(hasOverflow && !atStart);
      setCanScrollRight(hasOverflow && !atEnd);
    }
  }, []);

  const scrollByAmount = (amount: number) => {
    if (containerRef.current) {
      containerRef.current.scrollBy({ left: amount, behavior: "smooth" });
    }
  };

  // Here we cHeck scroll position on mount, resize, and type change
  useEffect(() => {
    checkScrollPosition();
    window.addEventListener("resize", checkScrollPosition);
    return () => window.removeEventListener("resize", checkScrollPosition);
  }, [type, checkScrollPosition]);

  // we use ResizeObserver to detect content size changes (e.g., when filters are selected/cleared)
  useEffect(() => {
    const currentContent = contentRef.current;
    if (!currentContent) return undefined;

    const resizeObserver = new ResizeObserver(() => {
      checkScrollPosition();
    });

    resizeObserver.observe(currentContent);

    return () => {
      resizeObserver.disconnect();
    };
  }, [checkScrollPosition]);

  // Also now check when selected filters change (with slight delay for DOM update)
  useEffect(() => {
    const timeoutId = setTimeout(checkScrollPosition, 50);
    return () => clearTimeout(timeoutId);
  }, [selected, checkScrollPosition]);

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

  const handleDateChange = (filterName: string, date: string | undefined) => {
    const newFilters = { ...selected, [filterName]: date ? [date] : [] };
    onChange(newFilters);
  };

  const handleBulkChange = (
    filterName: string,
    options: string[],
    select: boolean,
  ) => {
    const current = selected[filterName] || [];
    const updated = select
      ? Array.from(new Set([...current, ...options]))
      : current.filter((v) => !options.includes(v));
    onChange({ ...selected, [filterName]: updated });
  };

  const handleClearFilter = (filterName: string, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (selected[filterName]?.length) {
      const newFilters = { ...selected, [filterName]: [] };
      onChange(newFilters);
    }
  };

  const hasAnySelected = Object.values(selected).some((v) => v && v.length > 0);

  return (
    <>
      {useMobileCombinedPanel && (
        <Button
          display={{ base: "flex", md: "none" }}
          bg={hasAnySelected ? "gray.100" : "transparent"}
          textStyle={{ base: "body" }}
          borderColor="gray.500"
          borderWidth="1px"
          borderStyle={hasAnySelected ? "solid" : "dashed"}
          padding="0.62rem 0.75rem"
          onClick={() => setIsMobilePanelOpen(true)}
        >
          <Flex gap="0.75rem" align="center">
            <Image src={FilterOpenIcon} alt="" />
            <Text m={0} textStyle="body" color="gray.700">
              Filter
            </Text>
          </Flex>
        </Button>
      )}
      {useMobileCombinedPanel && (
        <MobileFilterPanel
          isOpen={isMobilePanelOpen}
          onClose={() => setIsMobilePanelOpen(false)}
          filters={filters}
          selected={selected}
          onOptionChange={handleOptionChange}
          onDateChange={handleDateChange}
          onBulkOptionChange={handleBulkChange}
        />
      )}
      <Flex
        display={useMobileCombinedPanel ? { base: "none", md: "flex" } : "flex"}
        position="relative"
        minWidth="0"
        alignItems="center"
        gap="0.5rem"
      >
        {canScrollLeft && (
          <Flex
            as="button"
            alignItems="center"
            justifyContent="center"
            width="1.5rem"
            height="1.5rem"
            borderRadius="50%"
            backgroundColor="gray.100"
            border="1px solid"
            borderColor="gray.300"
            cursor="pointer"
            flexShrink={0}
            onClick={() => scrollByAmount(-200)}
            _hover={{ backgroundColor: "gray.200" }}
            transition="background-color 0.2s"
            aria-label="Scroll filters left"
          >
            <ChevronLeftIcon color="gray.600" boxSize="1rem" />
          </Flex>
        )}

        <Flex position="relative" minWidth="0" flex="1">
          <Flex
            ref={containerRef}
            overflowX="auto"
            className="no-scrollbar"
            onMouseDown={handleMouseDown}
            onMouseLeave={handleMouseLeave}
            onMouseUp={handleMouseUp}
            onMouseMove={handleMouseMove}
            onScroll={handleScroll}
          >
            <Flex ref={contentRef} gap="1rem" flexShrink={0} userSelect="none">
              {filters.map((filter) => {
                const selectedValues = selected[filter.value] || [];
                const selectedLabels = getSelectedLabels(
                  filter,
                  selectedValues,
                );
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
                              selectedValues.length > 0
                                ? "gray.100"
                                : "transparent"
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
                                <Text
                                  m={0}
                                  textStyle="body"
                                  as="span"
                                  color="gray.700"
                                  display={{ base: "none", md: "inline" }}
                                >
                                  {filter.name}
                                </Text>
                                <Text
                                  m={0}
                                  textStyle="body"
                                  as="span"
                                  color="gray.700"
                                  display={{ base: "inline", md: "none" }}
                                >
                                  {filter.mobileLabel ?? filter.name}
                                </Text>
                                {selectedLabels && (
                                  <>
                                    <Text
                                      m={0}
                                      textStyle="body"
                                      as="span"
                                      color="gray.700"
                                    >
                                      |
                                    </Text>
                                    <Text
                                      m={0}
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
                        <PopoverContent
                          bg="gray.50"
                          border="none"
                          boxShadow="sm"
                          minWidth={
                            filter.kind === "grouped-checkbox"
                              ? "29rem"
                              : undefined
                          }
                        >
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
                                  m={0}
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
                              <FilterSectionBody
                                filter={filter}
                                selectedValues={selectedValues}
                                onOptionChange={(option) =>
                                  handleOptionChange(filter.value, option)
                                }
                                onDateChange={(date) =>
                                  handleDateChange(filter.value, date)
                                }
                                onBulkOptionChange={(options, select) =>
                                  handleBulkChange(
                                    filter.value,
                                    options,
                                    select,
                                  )
                                }
                              />
                            </Flex>
                          </PopoverBody>
                        </PopoverContent>
                      </>
                    )}
                  </Popover>
                );
              })}
            </Flex>
          </Flex>

          {/* Left gradient fade */}
          {canScrollLeft && (
            <Box
              position="absolute"
              left={0}
              top={0}
              bottom={0}
              width="2.5rem"
              height="100%"
              pointerEvents="none"
              zIndex={2}
              backgroundColor="transparent"
              backgroundImage="linear-gradient(270deg, rgba(255,255,255,0) 0%, rgba(255,255,255,1) 80%)"
            />
          )}

          {/* Right gradient fade */}
          {canScrollRight && (
            <Box
              position="absolute"
              right={0}
              top={0}
              bottom={0}
              width="2.5rem"
              height="100%"
              pointerEvents="none"
              zIndex={2}
              backgroundColor="transparent"
              backgroundImage="linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,1) 80%)"
            />
          )}
        </Flex>

        {/* Right Chevron */}
        {canScrollRight && (
          <Flex
            as="button"
            alignItems="center"
            justifyContent="center"
            width="1.5rem"
            height="1.5rem"
            borderRadius="50%"
            backgroundColor="gray.100"
            border="1px solid"
            borderColor="gray.300"
            cursor="pointer"
            flexShrink={0}
            onClick={() => scrollByAmount(200)}
            _hover={{ backgroundColor: "gray.200" }}
            transition="background-color 0.2s"
            aria-label="Scroll filters right"
          >
            <ChevronRightIcon color="gray.600" boxSize="1rem" />
          </Flex>
        )}
      </Flex>
    </>
  );
};

export default Filter;
