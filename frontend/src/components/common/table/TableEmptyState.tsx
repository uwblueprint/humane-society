import React from "react";
import { Flex, Text } from "@chakra-ui/react";

export interface TableEmptyStateProps {
  message: string;
  onClearFilters?: () => void;
}

const TableEmptyState = ({
  message,
  onClearFilters,
}: TableEmptyStateProps): React.ReactElement => {
  return (
    <Flex direction="column" alignItems="center" gap="1rem" my="5rem">
      <Text m={0} textStyle="subheading">
        {message}
      </Text>
      {onClearFilters && (
        <Text
          m={0}
          textStyle="h3"
          color="blue.500"
          cursor="pointer"
          textDecoration="underline"
          onClick={onClearFilters}
        >
          Clear all
        </Text>
      )}
    </Flex>
  );
};

export default TableEmptyState;

