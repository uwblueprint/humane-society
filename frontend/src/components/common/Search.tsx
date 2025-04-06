import { Input, InputGroup, InputRightElement, Box } from "@chakra-ui/react";
import { SearchIcon } from "@chakra-ui/icons";
import React, { FC } from "react";

type SearchProps = {
  search: string;
  onChange: (query: string) => void;
  placeholder?: string;
};

const Search: FC<SearchProps> = ({ search, onChange, placeholder }) => {
  return (
    <Box width="100%" maxWidth="250px" flexShrink="0">
      <InputGroup>
        <Input
          type="text"
          placeholder={placeholder || "Search"}
          value={search}
          onChange={(e) => onChange(e.target.value)}
          focusBorderColor="blue.500"
          textStyle="body"
          _placeholder={{
            fontStyle: "italic",
          }}
        />
        <InputRightElement>
          <SearchIcon color="gray.400" />
        </InputRightElement>
      </InputGroup>
    </Box>
  );
};

export default Search;
