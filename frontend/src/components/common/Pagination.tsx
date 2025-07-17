import React, { FC, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  Button,
  Flex,
  NumberInput,
  NumberInputField,
  Text,
} from "@chakra-ui/react";
import { floor } from "lodash";

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
  const [isLeftButtonDisabled, setisLeftButtonDisabled] = useState(true);
  const [isRightButtonDisabled, setisRightButtonDisabled] = useState(false);
  const MAX_NUM_OF_PAGES = floor(numberOfItems / itemsPerPage);

  const onButtonClick = (newPageNumber: number) => {
    if (newPageNumber > 1 && newPageNumber < MAX_NUM_OF_PAGES) {
      setisLeftButtonDisabled(false);
      setisRightButtonDisabled(false);
    }
  };

  const onPageChange = (newPageNumber: number) => {
    if (newPageNumber < 1) {
      setCurPageNumber(1);
      setisLeftButtonDisabled(true);
    } else if (newPageNumber >= MAX_NUM_OF_PAGES) {
      setCurPageNumber(MAX_NUM_OF_PAGES);
      setisRightButtonDisabled(true);
    } else {
      setCurPageNumber(newPageNumber);
      onButtonClick(newPageNumber);
    }
    onChange(curPageNumber);
  };

  const onPressPrevious = () => {
    const newPageNumber = curPageNumber - 1;
    onPageChange(newPageNumber);
  };

  const onPressNext = () => {
    const newPageNumber = curPageNumber + 1;
    onPageChange(newPageNumber);
  };

  const onInputChange = (newPageNumber: number) => {
    setCurPageNumber(newPageNumber);
    if (newPageNumber < 1) {
      setisLeftButtonDisabled(true);
    } else if (newPageNumber >= MAX_NUM_OF_PAGES) {
      setisRightButtonDisabled(true);
    } else {
      onButtonClick(newPageNumber);
    }
    onChange(curPageNumber);
  };

  return (
    <Flex
      alignItems="center"
      gap="1.5rem"
      justifyContent="space-between"
      width="25rem"
      alignSelf="center"
    >
      <Button
        size="lg"
        variant="unstyled"
        disabled={isLeftButtonDisabled}
        onClick={onPressPrevious}
      >
        <ChevronLeft
          size={30}
          color={isLeftButtonDisabled ? "gray.300" : "gray.700"}
        />
      </Button>
      <Text m={0} fontSize="18px" color="gray.700" fontWeight="400">
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
        focusBorderColor="gray.500"
        textColor="gray.700"
        fontWeight="400"
      >
        <NumberInputField
          height="2.5rem"
          padding="0.35rem"
          maxW="3rem"
          alignContent="center"
          borderColor="gray.500"
          borderRadius="0.35rem"
          textAlign="center"
        />
      </NumberInput>
      <Text m={0} fontSize="18px" color="gray.700" fontWeight="400">
        of {MAX_NUM_OF_PAGES}
      </Text>
      <Button
        size="lg"
        variant="unstyled"
        isDisabled={isRightButtonDisabled}
        onClick={onPressNext}
      >
        <ChevronRight
          size={30}
          color={isRightButtonDisabled ? "gray.300" : "gray.700"}
        />
      </Button>
    </Flex>
  );
};

export default Pagination;
