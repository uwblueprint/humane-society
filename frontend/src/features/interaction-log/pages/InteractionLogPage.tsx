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

const mockInteractionLogs: InteractionLog[] = [
  {
    id: "1",
    petName: "Buddy",
    volunteerName: "Bam Bam",
    taskCategory: "Walk",
    date: "2024-01-15",
    notes: "Great walk, very energetic",
  },
  {
    id: "2",
    petName: "Kobe",
    volunteerName: "John Pork",
    taskCategory: "Training",
    date: "2024-01-14",
    notes: "Practiced sit and stay commands",
  },
  {
    id: "3",
    petName: "Luka",
    volunteerName: "LeBron James",
    taskCategory: "Husbandry",
    date: "2024-01-13",
    notes: "Brushed coat and checked nails",
  },
];

const columns: TableColumn[] = [
  { label: "PET NAME" },
  { label: "VOLUNTEER" },
  { label: "TASK" },
  { label: "DATE" },
  { label: "NOTES" },
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
    return mockInteractionLogs
      .filter((log) => {
        return Object.keys(filters).every((key) => {
          const filterVals = filters[key];
          if (!filterVals || filterVals.length === 0) return true;
          if (key === "taskCategory") {
            return filterVals.includes(log.taskCategory);
          }
          return true;
        });
      })
      .filter(
        (log) =>
          log.petName.toLowerCase().includes(search.toLowerCase()) ||
          log.volunteerName.toLowerCase().includes(search.toLowerCase()) ||
          log.notes.toLowerCase().includes(search.toLowerCase()),
      );
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
        <TableHeader columns={columns} gridTemplateColumns={gridTemplateColumns} />
        {isEmpty ? (
          <TableEmptyState
            message="No interactions currently match."
            onClearFilters={handleClearFilters}
          />
        ) : (
          <Flex direction="column" width="100%">
            {filteredLogs.map((log) => (
              <Grid
                key={log.id}
                gridTemplateColumns={gridTemplateColumns}
                padding="1rem 2.5rem"
                borderBottom="1px solid"
                borderColor="gray.200"
                alignItems="center"
                _hover={{ backgroundColor: "gray.50" }}
              >
                <Text m={0} textStyle="body" color="gray.700">
                  {log.petName}
                </Text>
                <Text m={0} textStyle="body" color="gray.700">
                  {log.volunteerName}
                </Text>
                <Text m={0} textStyle="body" color="gray.700">
                  {log.taskCategory}
                </Text>
                <Text m={0} textStyle="body" color="gray.700">
                  {log.date}
                </Text>
                <Text m={0} textStyle="body" color="gray.700" noOfLines={2}>
                  {log.notes}
                </Text>
              </Grid>
            ))}
          </Flex>
        )}
      </Flex>
    </TableWrapper>
  );
};

export default InteractionLogPage;
