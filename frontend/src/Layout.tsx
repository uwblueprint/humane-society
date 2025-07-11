import React, { ReactNode } from "react";
import { useLocation } from "react-router-dom";
import { Flex } from "@chakra-ui/react";
import NavBar from "./components/common/navbar/NavBar";
import * as ROUTES from "./constants/Routes";

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();

  const getPageName = () => {
    // Special routes that have id's
    if (location.pathname.startsWith(ROUTES.PROFILE_PAGE)) {
      return "Profile";
    }
    if (location.pathname.startsWith(ROUTES.PET_PROFILE_PAGE)) {
      return "Pet Profile";
    }

    switch (location.pathname) {
      case ROUTES.HOME_PAGE:
        return "Pet List";
      case ROUTES.LOGIN_PAGE:
        return "Login";
      case ROUTES.SIGNUP_PAGE:
        return "Sign Up";
      case ROUTES.EDIT_TEAM_PAGE:
        return "Edit Team";
      case ROUTES.DISPLAY_ENTITY_PAGE:
        return "Entity Details";
      case ROUTES.CREATE_ENTITY_PAGE:
        return "Create Entity";
      case ROUTES.UPDATE_ENTITY_PAGE:
        return "Update Entity";
      case ROUTES.DISPLAY_SIMPLE_ENTITY_PAGE:
        return "Simple Entity Details";
      case ROUTES.CREATE_SIMPLE_ENTITY_PAGE:
        return "Create Simple Entity";
      case ROUTES.UPDATE_SIMPLE_ENTITY_PAGE:
        return "Update Simple Entity";
      case ROUTES.HOOKS_PAGE:
        return "Hooks";
      case ROUTES.INTERACTION_LOG_PAGE:
        return "Interaction Log";
      case ROUTES.DEV_UTILITY_PAGE:
        return "Developer Utility";
      case ROUTES.USER_MANAGEMENT_PAGE:
        return "User Management";
      case ROUTES.TASK_MANAGEMENT_PAGE:
        return "Task Management";
      case ROUTES.ADD_TASK_TEMPLATE_PAGE:
        return "Task Management";
      case ROUTES.ADMIN_PAGE:
        return "Admin Dashboard";
      default:
        return "Page";
    }
  };

  const noPaddingPages = ["Page", "Profile", "Pet Profile"];

  return (
    <Flex direction="column" minHeight="100vh">
      {getPageName() === "Page" ? null : <NavBar pageName={getPageName()} />}

      <Flex
        minHeight="100dvh"
        pt={
          noPaddingPages.includes(getPageName())
            ? "0"
            : { base: "6rem", md: "7rem" }
        }
      >
        {children}
      </Flex>
    </Flex>
  );
};

export default Layout;
