import React from "react";
import { useHistory } from "react-router-dom";
import { Box, IconButton } from "@chakra-ui/react";
import { FaUserCircle } from "react-icons/fa";
import { PROFILE_PAGE } from "../../../constants/Routes";

const NavProfileButton = (): React.ReactElement => {
  const history = useHistory();
  const goToProfile = () => {
    history.push(PROFILE_PAGE);
  };
  return (
    <Box
      mr={{ base: "0.03rem", md: "0.75rem" }}
      mb={{ base: "0.19rem", md: "0.87rem" }}
    >
      <IconButton
        aria-label="Profile"
        fontSize={{ base: "2rem", md: "2.6875rem" }}
        variant="unstyled"
        icon={<FaUserCircle />}
        onClick={goToProfile}
      />
    </Box>
  );
};

export default NavProfileButton;
