import React from "react";
import { Flex, Text } from "@chakra-ui/react";

export interface TableEmptyStateProps {
  message: string;
  linkLabel?: string;
  onLinkClick?: () => void;
}

const TableEmptyState = ({
  message,
  linkLabel,
  onLinkClick,
}: TableEmptyStateProps): React.ReactElement => {
  return (
    <Flex direction="column" alignItems="center" gap="1rem" my="5rem">
      <Text m={0} textStyle="subheading">
        {message}
      </Text>
      {linkLabel && onLinkClick && (
        <Text
          m={0}
          textStyle="h3"
          color="blue.500"
          cursor="pointer"
          textDecoration="underline"
          onClick={onLinkClick}
        >
          {linkLabel}
        </Text>
      )}
    </Flex>
  );
};

export default TableEmptyState;
