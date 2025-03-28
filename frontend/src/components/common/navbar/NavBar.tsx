import React from "react";
import { Flex, Text, Spacer } from "@chakra-ui/react";

import Logo from "./Logo";
import {
  INTERACTION_LOG_PAGE,
  PROFILE_PAGE,
  USER_MANAGEMENT_PAGE,
  TASK_MANAGEMENT_PAGE,
} from "../../../constants/Routes";
import NavLink from "./NavLink";
import getCurrentUserRole from "../../../utils/CommonUtils";
import {
  LogIcon,
  ProfileIcon,
  TaskIcon,
  UserManagementIcon,
} from "../../../assets/icons";

const NavBar = ({ pageName }: { pageName: string }): React.ReactElement => {
  const isAdmin = getCurrentUserRole() === "Administrator";

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
              icon={UserManagementIcon}
              ariaLabel="Users"
              route={USER_MANAGEMENT_PAGE}
            />
            <NavLink
              text="Tasks"
              icon={TaskIcon}
              ariaLabel="Tasks"
              route={TASK_MANAGEMENT_PAGE}
            />
            <NavLink
              text="Logs"
              icon={LogIcon}
              ariaLabel="InteractionLogs"
              route={INTERACTION_LOG_PAGE}
            />
          </>
        )}
        <NavLink
          text="Profile"
          icon={ProfileIcon}
          ariaLabel="Profile"
          route={PROFILE_PAGE}
        />
      </Flex>
    </Flex>
  );
};

export default NavBar;
