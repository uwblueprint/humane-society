import React from "react";
import { Box } from "@chakra-ui/react";

const ResponsivePawprintBackground = (): React.ReactElement => {
  return (
    <Box
      position="absolute"
      top="50%"
      left="50%"
      width={{ base: "200vw", md: "100vw" }}
      height={{ base: "200vh", md: "100vh" }}
      transform={{ base: "translate(-50%, -50%) rotate(-15deg)", md: "translate(-50%, -50%)" }}
      sx={{
        backgroundImage: "url('/images/paw_prints_bg.svg')",
        backgroundSize: { base: "contain", md: "130%" },
        backgroundRepeat: "no-repeat",
        backgroundColor: "var(--blue-700, #2C5282)",
        backgroundPosition: "center",
        transformOrigin: "center",
        zIndex: -1,
      }}
    />
  );
};

export default ResponsivePawprintBackground;
