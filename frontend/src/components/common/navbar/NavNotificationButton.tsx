import React from "react";
import { useHistory } from "react-router-dom";
import { Box, IconButton } from "@chakra-ui/react";
import { FaBell } from "react-icons/fa";
import { NOTIFICATIONS_PAGE } from "../../../constants/Routes";

const NavNotificationButton = (): React.ReactElement => {
  const history = useHistory();
  const goToNotifications = () => {
    history.push(NOTIFICATIONS_PAGE);
  };
  return (
    <Box
      mr={{ base: "0.75rem", md: "1.13rem" }}
      mb={{ base: "0.19rem", md: "0.87rem" }}
    >
      <IconButton
        aria-label="Notifications"
        fontSize={{ base: "2rem", md: "2.6875rem" }}
        variant="unstyled"
        icon={<FaBell />}
        onClick={goToNotifications}
      />
    </Box>
  );
};

export default NavNotificationButton;
