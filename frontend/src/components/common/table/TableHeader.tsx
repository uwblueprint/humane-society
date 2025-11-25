import React from "react";
import { Flex, Grid, Text } from "@chakra-ui/react";

export interface TableColumn {
  label: string;
  width?: string;
}

export interface TableHeaderProps {
  columns: TableColumn[];
  gridTemplateColumns: string;
}

const TableHeader = ({
  columns,
  gridTemplateColumns,
}: TableHeaderProps): React.ReactElement => {
  return (
    <Flex
      direction="column"
      borderTop="1px solid"
      borderBottom="1px solid"
      borderColor="gray.200"
    >
      <Grid
        gridTemplateColumns={gridTemplateColumns}
        padding="1rem 2.5rem"
        alignItems="center"
      >
        {columns.map((column, index) => (
          <Text
            key={column.label}
            color="gray.800"
            textStyle="subheading"
            m={0}
            whiteSpace="nowrap"
            pl={index > 0 ? "0" : undefined}
          >
            {column.label}
          </Text>
        ))}
      </Grid>
    </Flex>
  );
};

export default TableHeader;

