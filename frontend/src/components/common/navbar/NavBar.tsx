import React from "react";
import { Box, Flex, Text, Spacer } from "@chakra-ui/react";
import NavNotificationButton from "./NavNotificationButton";
import NavProfileButton from "./NavProfileButton";
import Logo from "./Logo";

const NavBar = ({ pageName }: { pageName: string }): React.ReactElement => {
  return (
    <Flex
      pt={{ base: "0.625rem", md: "0.625rem" }}
      pr={{ base: "1.125rem", md: "1.125rem" }}
      pb={{ base: "0.9375rem", md: "1.125rem" }}
      pl={{ base: "1.125rem", md: "1.125rem" }}
      height={{ base: "6.375rem", md: "9.375rem" }}
      position="fixed"
      top="0"
      left="0"
      w="100%"
      zIndex="10"
      alignItems="flex-end"
    >
      <Logo />
      <Box mb={{ base: "0.19rem", md: "1.62rem" }}>
        <Text textStyle="h1">{pageName}</Text>
      </Box>
      <Spacer />
      <NavNotificationButton />
      <NavProfileButton />
    </Flex>
  );
};

export default NavBar;
