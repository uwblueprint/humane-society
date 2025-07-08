import React from "react";
import { Flex, Image } from "@chakra-ui/react";

// This logo
const Logo = (): React.ReactElement => {
  return (
    <Flex
      height={{ base: "8rem", md: "13.9375rem" }}
      aspectRatio="27.3/14"
      bg="blue.700"
      borderRadius="2.6875rem"
      border="1px solid"
      borderColor="gray.200"
      mx="0.75rem"
      justifyContent="center"
      alignItems="center"
    >
      <Image
        src="/images/humane_society_logo_text.png"
        alt="Humane Society Logo"
        height={{ base: "6.5rem", md: "9rem" }}
        aspectRatio="27.3/14"
        objectFit="cover"
      />
    </Flex>
  );
};

export default Logo;
