import { CloseIcon, SearchIcon } from "@chakra-ui/icons";
import {
  Flex,
  Input,
  InputGroup,
  InputRightElement,
  Text,
} from "@chakra-ui/react";
import React, { KeyboardEvent } from "react";

export interface SearchTagSelectProps {
  search: string;
  onSearchChange: (value: string) => void;
  placeholder?: string;
  isItemSelected: boolean;
  selectedText?: string;
  selectedIcon?: React.ReactNode;
  onClearSelection: () => void;
}

const SearchTagSelect = ({
  search,
  onSearchChange,
  placeholder = "Search...",
  isItemSelected,
  selectedText,
  selectedIcon,
  onClearSelection,
}: SearchTagSelectProps): React.ReactElement => {
  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Backspace" || e.key === "Delete") {
      onClearSelection();
    }
  };

  if (isItemSelected) {
    return (
      <Flex
        width="100%"
        height="3rem"
        alignItems="center"
        justifyContent="space-between"
        backgroundColor="white"
        border="1px solid"
        borderColor="gray.200"
        borderRadius="md"
        paddingX="0.5rem"
        tabIndex={0}
        onKeyDown={handleKeyDown}
        _focus={{
          borderColor: "blue.500",
          boxShadow: "0 0 0 1px #3182ce",
          outline: "none",
        }}
      >
        <Flex
          alignItems="center"
          backgroundColor="blue.50"
          borderRadius="0.375rem"
          padding="0.25rem 0.75rem"
          gap="0.5rem"
        >
          {selectedIcon}
          {selectedText && (
            <Text textStyle="body" margin="0">
              {selectedText}
            </Text>
          )}
          <CloseIcon
            boxSize="0.6rem"
            color="gray.500"
            cursor="pointer"
            _hover={{ color: "gray.700" }}
            onClick={(e) => {
              e.stopPropagation();
              onClearSelection();
            }}
          />
        </Flex>
        <SearchIcon color="gray.400" boxSize="1.125rem" marginRight="0.4rem" />
      </Flex>
    );
  }

  return (
    <InputGroup size="lg" width="100%">
      <Input
        type="text"
        placeholder={placeholder}
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        focusBorderColor="blue.500"
        textStyle="body"
        _placeholder={{ fontStyle: "italic" }}
        backgroundColor="white"
      />
      <InputRightElement>
        <SearchIcon color="gray.400" />
      </InputRightElement>
    </InputGroup>
  );
};

export default SearchTagSelect;
