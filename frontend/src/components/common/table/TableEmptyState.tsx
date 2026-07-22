import React from "react";
import { Flex, Text } from "@chakra-ui/react";

export interface TableEmptyStateProps {
  message: string;
  linkLabel?: string;
  onLinkClick?: () => void;
  /**
   * @deprecated Backward-compatible alias for a "Clear all" link.
   * Prefer `linkLabel` + `onLinkClick`.
   */
  onClearFilters?: () => void;
}

const TableEmptyState = ({
  message,
  linkLabel,
  onLinkClick,
  onClearFilters,
}: TableEmptyStateProps): React.ReactElement => {
  const label = linkLabel ?? (onClearFilters ? "Clear all" : undefined);
  const handleClick = onLinkClick ?? onClearFilters;

  return (
    <Flex direction="column" alignItems="center" gap="1rem" my="5rem">
      <Text m={0} textStyle="subheading">
        {message}
      </Text>
      {label && handleClick && (
        <Text
          m={0}
          textStyle="h3"
          color="blue.500"
          cursor="pointer"
          textDecoration="underline"
          onClick={handleClick}
        >
          {label}
        </Text>
      )}
    </Flex>
  );
};

export default TableEmptyState;
