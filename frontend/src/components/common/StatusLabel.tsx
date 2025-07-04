import React from "react";

import { Box } from "@chakra-ui/react";

interface StatusLabelProps {
  status:
    | "Assign"
    | "Assigned"
    | "Completed"
    | "Incomplete"
    | "Start"
    | "Occupied"
    | "In-Progress";
  isMobile?: boolean;
}

const STATUS_STYLES: Record<
  StatusLabelProps["status"],
  { bg: string; color: string }
> = {
  Assign: { bg: "blue.700", color: "white" },
  Assigned: { bg: "gray.100", color: "gray.400" },
  Completed: { bg: "gray.100", color: "gray.400" },
  Incomplete: { bg: "red.200", color: "white.default" },
  Start: { bg: "blue.700", color: "white" },
  Occupied: { bg: "gray.50", color: "gray.800" },
  "In-Progress": { bg: "green.200", color: "green.800" },
};

const StatusLabel = ({ status, isMobile = false }: StatusLabelProps) => {
  const { bg, color } = STATUS_STYLES[status];
  const width = isMobile ? "100%" : "11.25rem";

  return (
    <Box
      textStyle="button"
      fontFamily="Poppins"
      fontWeight={500}
      fontSize="1.125rem"
      padding="0.5rem 1rem"
      paddingX="1rem"
      width={width}
      borderRadius="0.375rem"
      bg={bg}
      color={color}
      textAlign="center"
    >
      {status.replace("-", " ")}
    </Box>
  );
};

export default StatusLabel;
