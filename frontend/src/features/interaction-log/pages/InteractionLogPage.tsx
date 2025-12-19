import React, { useState, useMemo } from "react";
import { Flex, Grid, Text } from "@chakra-ui/react";
import {
  TableWrapper,
  TableHeader,
  TableEmptyState,
  TableColumn,
} from "../../../components/common/table";

// this is fake data for boilerplate lol
interface InteractionLog {
  id: string;
  petName: string;
  volunteerName: string;
  taskCategory: string;
  date: string;
  notes: string;
}

const columns: TableColumn[] = [
  { label: "NAME" },
  { label: "ROLE" },
  { label: "INTERACTION" },
  { label: "DATE" },
  { label: "TIME" },
];

const gridTemplateColumns = "1fr 1fr 1fr 0.75fr 2fr";

const InteractionLogPage = (): React.ReactElement => {
  const [filters, setFilters] = useState<Record<string, string[]>>({});
  const [search, setSearch] = useState<string>("");

  const handleFilterChange = (selectedFilters: Record<string, string[]>) => {
    setFilters(selectedFilters);
  };

  const handleSearchChange = (value: string) => {
    setSearch(value);
  };

  const handleClearFilters = () => {
    setFilters({});
    setSearch("");
  };

  const filteredLogs = useMemo(() => {
    return []
  }, [filters, search]);

  const isEmpty = filteredLogs.length === 0;

  return (
    <TableWrapper
      filterBarProps={{
        filterType: "interactionLog",
        filters,
        onFilterChange: handleFilterChange,
        search,
        onSearchChange: handleSearchChange,
        searchPlaceholder: "Search interactions...",
      }}
    >
      <Flex direction="column" width="100%">
        <TableHeader
          columns={columns}
          gridTemplateColumns={gridTemplateColumns}
        />
        {isEmpty ? (
          <TableEmptyState
            message="No interactions currently match."
            onClearFilters={handleClearFilters}
          />
        ) : (
          <Flex direction="column" width="100%">
            
          </Flex>
        )}
      </Flex>
    </TableWrapper>
  );
};

export default InteractionLogPage;
