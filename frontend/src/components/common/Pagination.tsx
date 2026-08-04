import React, { FC } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  Flex,
  NumberInput,
  NumberInputField,
  Text,
  useTheme,
} from "@chakra-ui/react";
import { ceil } from "lodash";

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
  const MAX_NUM_OF_PAGES = ceil(numberOfItems / itemsPerPage);
  const theme = useTheme();

  const handlePrevClick = () => {
    if (value > 1) {
      onChange(value - 1);
    } else {
      onChange(1);
    }
  };

  const handleNextClick = () => {
    if (value < MAX_NUM_OF_PAGES) {
      onChange(value + 1);
    } else {
      onChange(MAX_NUM_OF_PAGES);
    }
  };

  const handleInputChange = (val: string) => {
    const newPageNumber = Number(val);
    onChange(newPageNumber);
  };

  return (
    <Flex
      width="100%"
      maxWidth="25rem"
      alignItems="center"
      justifyContent="space-between"
      alignSelf="center"
      className={className}
    >
      <ChevronLeft
        size={30}
        color={value <= 1 ? theme.colors.gray[300] : theme.colors.gray[700]}
        onClick={handlePrevClick}
      />
      <Flex gap="1.25rem" alignItems="center">
        <Text
          m={0}
          fontSize="18px"
          color={theme.colors.gray[700]}
          fontWeight="400"
        >
          Page
        </Text>
        <NumberInput
          onChange={handleInputChange}
          inputMode="numeric"
          value={value}
          max={MAX_NUM_OF_PAGES}
          min={1}
          clampValueOnBlur
          defaultValue={1}
          size="sm"
          focusBorderColor={theme.colors.gray[500]}
          textColor="gray.700"
          fontWeight="400"
        >
          <NumberInputField
            height="2.5rem"
            padding="0.35rem"
            maxW="3rem"
            alignContent="center"
            borderColor={theme.colors.gray[500]}
            borderRadius="0.35rem"
            textAlign="center"
          />
        </NumberInput>
        <Text
          m={0}
          fontSize="18px"
          color={theme.colors.gray[700]}
          fontWeight="400"
        >
          of {MAX_NUM_OF_PAGES}
        </Text>
      </Flex>
      <ChevronRight
        size={30}
        onClick={handleNextClick}
        color={
          value >= MAX_NUM_OF_PAGES
            ? theme.colors.gray[300]
            : theme.colors.gray[700]
        }
      />
    </Flex>
  );
};

export default Pagination;
