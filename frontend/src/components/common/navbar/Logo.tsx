import React from "react";
import { Box, Image } from "@chakra-ui/react";

const Logo = (): React.ReactElement => {
  return (
    <Box mr="1.63rem" ml={{ base: "0.03rem", md: "0.75rem" }}>
      <Image
        borderRadius="full"
        boxSize={{ base: "2.9rem", md: "5rem" }}
        src="images/humane_society_logo.png"
        alt="Logo"
      />
    </Box>
  );
};

export default Logo;
