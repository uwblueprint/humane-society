import React from "react";
import { Box, Image } from "@chakra-ui/react";
import { useHistory } from "react-router-dom";
import { HOME_PAGE } from "../../../constants/Routes";

const Logo = (): React.ReactElement => {
  const history = useHistory();

  const handleClick = () => {
    history.push(HOME_PAGE);
  };

  return (
    <Box mr="1rem" onClick={handleClick} cursor="pointer">
      <Image
        borderRadius="full"
        boxSize={{ base: "2rem", md: "3rem" }}
        src="/images/humane_society_logo.png"
        alt="Logo"
        objectFit="cover"
      />
    </Box>
  );
};

export default Logo;
