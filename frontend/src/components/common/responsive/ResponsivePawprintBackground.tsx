import React from "react";
import { Box, Flex } from "@chakra-ui/react";

const ResponsivePawprintBackground = (): React.ReactElement => {
  return (
    <Flex
      position="absolute"
      top="0"
      left="0"
      width="100vw"
      height="100%"
      overflow="hidden"
      pointerEvents="none"
    >
      <Box
        position="absolute"
        top="50%"
        left="50%"
        width={{ base: "200vw", md: "100%" }}
        height={{ base: "200vh", md: "100%" }}
        transform={{
          base: "translate(-50%, -50%) rotate(-15deg)",
          md: "translate(-50%, -50%)",
        }}
        sx={{
          backgroundImage: "url('/images/paw_prints_bg.svg')",
          backgroundSize: { base: "contain", md: "130%" },
          backgroundRepeat: "no-repeat",
          backgroundColor: "var(--blue-700, #2C5282)",
          backgroundPosition: "center",
          zIndex: -1,
        }}
      />
    </Flex>
  );
};

export default ResponsivePawprintBackground;
