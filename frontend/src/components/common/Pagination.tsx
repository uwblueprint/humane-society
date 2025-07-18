import React, { FC, useState } from "react";
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
  const [curPageNumber, setCurPageNumber] = useState(value);
  const MAX_NUM_OF_PAGES = ceil(numberOfItems / itemsPerPage);
  const theme = useTheme();

  const onPageChange = (newPageNumber: number) => {
    if (newPageNumber < 1) {
      setCurPageNumber(1);
    } else if (newPageNumber > MAX_NUM_OF_PAGES) {
      setCurPageNumber(MAX_NUM_OF_PAGES);
    } else {
      setCurPageNumber(newPageNumber);
      onChange(newPageNumber);
    }
  };

  const onInputChange = (newPageNumber: number) => {
    setCurPageNumber(newPageNumber);
    onChange(newPageNumber);
  };

  return (
    <Flex
      alignItems="center"
      gap="1.5rem"
      justifyContent="space-between"
      width="25rem"
      alignSelf="center"
      className={className}
    >
      <ChevronLeft
        size={30}
        color={
          curPageNumber <= 1 ? theme.colors.gray[300] : theme.colors.gray[700]
        }
        onClick={() => onPageChange(curPageNumber - 1)}
      />
      <Text
        m={0}
        fontSize="18px"
        color={theme.colors.gray[700]}
        fontWeight="400"
      >
        Page
      </Text>
      <NumberInput
        onChange={(val) => onInputChange(Number(val))}
        inputMode="numeric"
        value={curPageNumber}
        max={MAX_NUM_OF_PAGES}
        min={1}
        clampValueOnBlur={true}
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
      <ChevronRight
        size={30}
        onClick={() => onPageChange(curPageNumber + 1)}
        color={
          curPageNumber >= MAX_NUM_OF_PAGES
            ? theme.colors.gray[300]
            : theme.colors.gray[700]
        }
      />
    </Flex>
  );
};

export default Pagination;
