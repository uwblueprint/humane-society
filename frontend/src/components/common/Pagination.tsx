import React, { FC } from "react";
import { Flex, Text, Input, IconButton, Box } from "@chakra-ui/react";
import { ChevronLeftIcon, ChevronRightIcon } from "@chakra-ui/icons";

interface PaginationProps {
  value: number; // current page (1-based index)
  onChange: (page: number) => void; // callback when page changes
  numberOfItems: number; // total number of items
  itemsPerPage: number; // number of items per page
  className?: string; // optional styling
}

const Pagination: FC<PaginationProps> = ({
  value,
  onChange,
  numberOfItems,
  itemsPerPage,
  className = "",
}) => {
  const totalPages = Math.ceil(numberOfItems / itemsPerPage);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = parseInt(event.target.value, 10);
    if (Number.isNaN(inputValue)) return;

    let newPage = inputValue;
    if (newPage < 1) {
      newPage = 1;
    } else if (newPage > totalPages) {
      newPage = totalPages;
    }
    onChange(newPage);
  };

  const handlePrevious = () => {
    if (value > 1) {
      onChange(value - 1);
    }
  };

  const handleNext = () => {
    if (value < totalPages) {
      onChange(value + 1);
    }
  };

  if (totalPages <= 1) {
    return null; // Don't show pagination if there's only one page or no items
  }

  return (
    <Flex
      alignItems="center"
      gap="1rem"
      className={className}
      justifyContent="center"
    >
      <IconButton
        aria-label="Previous page"
        icon={<ChevronLeftIcon />}
        onClick={handlePrevious}
        isDisabled={value <= 1}
        variant="outline"
        size="sm"
      />

      <Flex alignItems="center" gap="0.5rem">
        <Text textStyle="body" color="gray.600">
          Page
        </Text>
        <Input
          value={value}
          onChange={handleInputChange}
          width="4rem"
          textAlign="center"
          size="sm"
          type="number"
          min={1}
          max={totalPages}
        />
        <Text textStyle="body" color="gray.600">
          of {totalPages}
        </Text>
      </Flex>

      <IconButton
        aria-label="Next page"
        icon={<ChevronRightIcon />}
        onClick={handleNext}
        isDisabled={value >= totalPages}
        variant="outline"
        size="sm"
      />

      <Box ml="1rem">
        <Text textStyle="bodyMobile" color="gray.500">
          {numberOfItems} total items
        </Text>
      </Box>
    </Flex>
  );
};

export default Pagination;
