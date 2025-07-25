import React from "react";
import { useHistory } from "react-router-dom";
import { IconButton } from "@chakra-ui/react";
import { FaBell } from "react-icons/fa";
import { INTERACTION_LOG_PAGE } from "../../../constants/Routes";

const NavNotificationButton = (): React.ReactElement => {
  const history = useHistory();
  const goToNotifications = () => {
    history.push(INTERACTION_LOG_PAGE);
  };
  return (
    <IconButton
      aria-label="Notifications"
      fontSize={{ base: "2rem", md: "2.6875rem" }}
      variant="unstyled"
      icon={<FaBell />}
      onClick={goToNotifications}
      display="flex" // the svg wasn't centered in the iconbutton
      justifyContent="center"
      alignItems="center"
      mr={{ base: "0.75rem", md: "1.13rem" }}
      mb={{ base: "0.19rem", md: "0.87rem" }}
    />
  );
};

export default NavNotificationButton;
