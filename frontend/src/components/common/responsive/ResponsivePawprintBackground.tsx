// NOT CURRENTLY BEING USED IN PROD
// USED IN CASE YOU NEED TO ROTATE A BACKGROUND IMAGE
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
        sx={{
          backgroundImage: "url('/images/pawprint_background.png')",
          backgroundRepeat: "no-repeat",
          backgroundColor: "var(--blue-700, blue.700)",
          backgroundPosition: "center",
          zIndex: -1,

          "@media (orientation: portrait)": {
            transform: "translate(-50%, -50%) rotate(-15deg)",
            backgroundSize: "contain",
            width: "200vw",
            height: "200vh",
          },
          "@media (orientation: landscape)": {
            transform: "translate(-50%, -50%)",
            backgroundSize: "130%",
            width: "100%",
            height: "100%",
          },
        }}
      />
    </Flex>
  );
};

export default ResponsivePawprintBackground;
