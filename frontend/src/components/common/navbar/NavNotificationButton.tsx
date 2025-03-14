import React from "react";
import { useHistory } from "react-router-dom";
import { Box, IconButton } from "@chakra-ui/react";
import { FaBell } from "react-icons/fa";
import { INTERACTION_LOG_PAGE } from "../../../constants/Routes";

const NavInteractionLogButton = (): React.ReactElement => {
  const history = useHistory();
  const goToInteractionLog = () => {
    history.push(INTERACTION_LOG_PAGE);
  };
  return (
    <Box
      mr={{ base: "0.75rem", md: "1.13rem" }}
      mb={{ base: "0.19rem", md: "0.87rem" }}
    >
      <IconButton
        aria-label="InteractionLogs"
        fontSize={{ base: "2rem", md: "2.6875rem" }}
        variant="unstyled"
        icon={<FaBell />}
        onClick={goToInteractionLog}
        display="flex" // the svg wasn't centered in the iconbutton
        justifyContent="center"
        alignItems="center"
      />
    </Box>
  );
};

export default NavInteractionLogButton;
