import React from "react";
import { Text } from "@chakra-ui/react";

interface StatusMessageProps {
  message: string;
  color?: string;
}

const StatusMessage = ({
  message,
  color = "blue.700",
}: StatusMessageProps): React.ReactElement => {
  return (
    <Text color={color} textAlign="center" lineHeight="120%" m="0">
      {message}
    </Text>
  );
};

export default StatusMessage;
