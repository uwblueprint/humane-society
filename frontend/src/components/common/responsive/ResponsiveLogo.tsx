import React from "react";
import { Center, Image } from "@chakra-ui/react";

const ResponsiveLogo = (): React.ReactElement => {
  return (
    <Center
      height={{ base: "8rem", md: "10.85rem" }}
      aspectRatio="27.3/14"
      bg="#2C5282"
      borderRadius="2.6875rem"
      border="1px solid var(--gray-200, #E2E8F0)"
    >
      <Image
        src="/images/humane_society_logo_text.png"
        alt="Humane Societsy Logo"
        height={{ base: "6.5rem", md: "9rem" }}
        aspectRatio="27.3/14"
        objectFit="cover"
      />
    </Center>
  );
};

export default ResponsiveLogo;
