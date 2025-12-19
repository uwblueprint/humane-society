import React, { ReactNode } from "react";
import { Flex } from "@chakra-ui/react";
import TableFilterBar, { TableFilterBarProps } from "./TableFilterBar";
import TableErrorState from "./TableErrorState";

export interface TableWrapperProps {
  filterBarProps: TableFilterBarProps;
  errorMessage?: string | null;
  onDismissError?: () => void;
  children: ReactNode;
  bottomContent?: ReactNode;
}

const TableWrapper = ({
  filterBarProps,
  errorMessage,
  onDismissError,
  children,
  bottomContent,
}: TableWrapperProps): React.ReactElement => {
  return (
    <Flex direction="column" gap="2rem" width="100%" pt="2rem">
      {errorMessage && (
        <TableErrorState
          errorMessage={errorMessage}
          onDismiss={onDismissError}
        />
      )}
      <TableFilterBar
        filterType={filterBarProps.filterType}
        filters={filterBarProps.filters}
        onFilterChange={filterBarProps.onFilterChange}
        search={filterBarProps.search}
        onSearchChange={filterBarProps.onSearchChange}
        searchPlaceholder={filterBarProps.searchPlaceholder}
        actionButton={filterBarProps.actionButton}
      />
      {children}
      {bottomContent}
    </Flex>
  );
};

export default TableWrapper;
