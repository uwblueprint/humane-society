import React, { ReactNode } from "react";
import { Flex } from "@chakra-ui/react";
import Filter, { FilterType } from "../Filter";
import Search from "../Search";

export interface TableFilterBarProps {
  filterType: FilterType;
  filters: Record<string, string[]>;
  onFilterChange: (selectedFilters: Record<string, string[]>) => void;
  search: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;
  actionButton?: ReactNode;
}

const TableFilterBar = ({
  filterType,
  filters,
  onFilterChange,
  search,
  onSearchChange,
  searchPlaceholder = "Search...",
  actionButton,
}: TableFilterBarProps): React.ReactElement => {
  return (
    <Flex
      padding={{ base: "0 1rem", md: "0 2.5rem" }}
      maxWidth="100vw"
      justifyContent={{ base: "flex-start", md: "space-between" }}
      alignItems="center"
      gap={{ base: "0.5rem", md: "1rem" }}
    >
      <Flex
        flexShrink={{ base: 0, md: 1 }}
        maxWidth={{ base: "10rem", md: "none" }}
        minWidth={{ base: "0", md: "auto" }}
      >
        <Filter type={filterType} onChange={onFilterChange} selected={filters} />
      </Flex>
      <Flex
        gap={{ base: "0.5rem", md: "1rem" }}
        alignItems="center"
        justifyContent={{ base: "flex-end", md: "flex-start" }}
        flex={{ base: "1", md: "initial" }}
      >
        <Search
          placeholder={searchPlaceholder}
          onChange={onSearchChange}
          search={search}
        />
        {actionButton}
      </Flex>
    </Flex>
  );
};

export default TableFilterBar;
