import React from "react";
import { Box, Image } from "@chakra-ui/react";
import { useHistory } from "react-router-dom";
import { HOME_PAGE } from "../../../constants/Routes";

const NavLogo = (): React.ReactElement => {
  const history = useHistory();
  const goToHome = () => {
    history.push(HOME_PAGE);
  };
  return (
    <Box mr="1.63rem" ml={{ base: "0.03rem", md: "0.75rem" }}>
      <Image
        borderRadius="full"
        boxSize={{ base: "2.9rem", md: "5rem" }}
        src="/images/humane_society_logo.png"
        alt="Logo"
        onClick={goToHome}
        objectFit="cover"
      />
    </Box>
  );
};

export default NavLogo;
