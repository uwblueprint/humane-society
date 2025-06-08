import { Box, Flex } from "@chakra-ui/react";
import React from "react";

interface ResponsiveAuthContainerProps {
  children: React.ReactNode;
}

const ResponsiveAuthContainer = ({
  children,
}: ResponsiveAuthContainerProps): React.ReactElement => {
  return (
    <Flex
      padding={{
        base: "2.25rem",
        md: "2.5rem",
      }}
      background="var(--gray-100, gray.100)"
      borderRadius="0.375rem"
      justifyContent="center"
    >
      <Box
        display="inline-flex"
        flexDirection="column"
        gap={{ base: "1.12rem", md: "1rem" }}
        width={{ md: "16rem" }}
        justifyContent="center"
      >
        {children}
      </Box>
    </Flex>
  );
};

export default ResponsiveAuthContainer;
