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
    if (location.pathname.startsWith(ROUTES.ADMIN_EDIT_USER_PROFILE_PAGE)) {
      return "User Profile";
    }
    if (location.pathname.startsWith(ROUTES.EDIT_TASK_TEMPLATE_PAGE)) {
      return "Task Management";
    }

    switch (location.pathname) {
      case ROUTES.HOME_PAGE:
        return "Pet List";
      case ROUTES.LOGIN_PAGE:
        return "Login";
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

  const noPaddingPages = ["Page", "Profile", "Pet Profile", "User Profile"];

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
