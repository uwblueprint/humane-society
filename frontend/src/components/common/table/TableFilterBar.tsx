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
      padding="0 2.5rem"
      maxWidth="100vw"
      justifyContent="space-between"
      alignItems="center"
      gap="1rem"
    >
      <Filter type={filterType} onChange={onFilterChange} selected={filters} />
      <Flex gap="1rem" alignItems="center">
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
