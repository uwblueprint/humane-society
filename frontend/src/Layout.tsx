import React, { ReactNode } from "react";
import { useLocation } from "react-router-dom";
import NavBar from "./components/common/navbar/NavBar";
import * as ROUTES from "./constants/Routes";
import "./Layout.css";

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();

  const getPageName = () => {
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
      case ROUTES.PROFILE_PAGE:
        return "Profile";
      case ROUTES.DEV_UTILITY_PAGE:
        return "Developer Utility";
      case ROUTES.USER_MANAGEMENT_PAGE:
        return "User Management";
      case ROUTES.ADMIN_PAGE:
        return "Admin Dashboard";
      default:
        return "Page";
    }
  };

  return (
    <div className="layout-container">
      <NavBar pageName={getPageName()} />
      <main className="content-container">{children}</main>
    </div>
  );
};

export default Layout;
