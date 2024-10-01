import React from "react";
import { Center, Flex } from "@chakra-ui/react";

interface ResponsiveModalWindowProps {
  children: React.ReactNode; // Define children prop type
}

const ResponsiveModalWindow = ({
  children,
}: ResponsiveModalWindowProps): React.ReactElement => {
  return (
    <Center
      top="0"
      left="0"
      position="absolute"
      height="100%"
      width="100%"
      bg="rgba(26, 32, 44, 0.60)"
    >
      <Flex
        bg="var(--gray-50, #F7FAFC)"
        align-items="center"
        width={{ base: "90%", sm: "21.375rem", md: "33.625rem" }}
        direction="column"
        gap={{ base: "1rem", md: "2.8125rem" }}
        padding={{ base: "1.38rem 3.38rem", md: "3.6875rem 10.5rem" }}
      >
        {children}
      </Flex>
    </Center>
  );
};

export default ResponsiveModalWindow;
