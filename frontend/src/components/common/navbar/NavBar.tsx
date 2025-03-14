import React from "react";
import { Flex, Text, Spacer } from "@chakra-ui/react";
import { FaRegFileAlt, FaUserCircle, FaUserCog, FaTasks } from "react-icons/fa";
import Logo from "./Logo";
import {
  INTERACTION_LOG_PAGE,
  PROFILE_PAGE,
  USER_MANAGEMENT_PAGE,
  ADMIN_PAGE,
} from "../../../constants/Routes";
import NavLink from "./NavLink";
import { getLocalStorageObj } from "../../../utils/LocalStorageUtils";
import { AuthenticatedUser } from "../../../types/AuthTypes";
import AUTHENTICATED_USER_KEY from "../../../constants/AuthConstants";

const NavBar = ({ pageName }: { pageName: string }): React.ReactElement => {
  const currentUser: AuthenticatedUser = getLocalStorageObj<AuthenticatedUser>(
    AUTHENTICATED_USER_KEY
  );

  const isAdmin = currentUser?.role === "Administrator";

  return (
    <Flex
      p={{ base: "1.5rem" }}
      position="fixed"
      top="0"
      left="0"
      w="100%"
      zIndex="10"
      alignItems="center"
      backgroundColor="#ffffff"
    >
      <Logo />
      <Text margin="0" textStyle={{ base: "h3", md: "h2" }}>
        {pageName}
      </Text>
      <Spacer />
      <Flex gap="1.25rem">
        {isAdmin && (
          <>
            <NavLink
              text="Users"
              icon={<FaUserCog />}
              ariaLabel="Users"
              route={USER_MANAGEMENT_PAGE}
            />
            <NavLink
              text="Tasks"
              icon={<FaTasks />}
              ariaLabel="Tasks"
              route={ADMIN_PAGE} // Update with the appropriate route for Tasks
            />
            <NavLink
              text="Logs"
              icon={<FaRegFileAlt />}
              ariaLabel="InteractionLogs"
              route={INTERACTION_LOG_PAGE}
            />
          </>
        )}
        <NavLink
          text="Profile"
          icon={<FaUserCircle />}
          ariaLabel="Profile"
          route={PROFILE_PAGE}
        />
      </Flex>
    </Flex>
  );
};

export default NavBar;
