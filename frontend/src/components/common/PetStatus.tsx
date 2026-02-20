import { Box, Flex, Text } from "@chakra-ui/react";
import React from "react";
import { PetStatus as PetStatusEnum } from "../../types/PetTypes";

const statusColor: Record<PetStatusEnum, string> = {
  [PetStatusEnum.NEEDS_CARE]: "red.400",
  [PetStatusEnum.DOES_NOT_NEED_CARE]: "gray.500",
  [PetStatusEnum.OCCUPIED]: "blue.500",
};

export interface PetStatusProps {
  status: PetStatusEnum;
}

const PetStatus = ({ status }: PetStatusProps): React.ReactElement => (
  <Flex align="center" gap="0.5rem">
    <Box boxSize="1rem" bg={statusColor[status]} borderRadius="full" />
    <Text textStyle="body" m={0}>
      {status}
    </Text>
  </Flex>
);

export default PetStatus;
