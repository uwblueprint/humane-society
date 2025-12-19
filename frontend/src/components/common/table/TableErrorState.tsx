import React from "react";
import { Alert, AlertIcon, CloseButton, Flex } from "@chakra-ui/react";

export interface TableErrorStateProps {
  errorMessage: string;
  onDismiss?: () => void;
}

const TableErrorState = ({
  errorMessage,
  onDismiss,
}: TableErrorStateProps): React.ReactElement => {
  return (
    <Flex padding="0 2.5rem">
      <Alert status="error" borderRadius="0.5rem">
        <AlertIcon />
        {errorMessage}
        {onDismiss && (
          <CloseButton
            position="absolute"
            right="0.5rem"
            top="0.5rem"
            onClick={onDismiss}
          />
        )}
      </Alert>
    </Flex>
  );
};

export default TableErrorState;
