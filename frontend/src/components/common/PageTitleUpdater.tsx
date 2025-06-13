import React, { useEffect } from "react";
import { useLocation } from "react-router-dom";
import * as ROUTES from "../../constants/Routes";

const PageTitleUpdater: React.FC = () => {
  const location = useLocation();

  const getPageTitle = () => {
    switch (location.pathname) {
      case ROUTES.HOME_PAGE:
        return "Pet List | Humane Society";
      case ROUTES.LOGIN_PAGE:
        return "Login | Humane Society";
      case ROUTES.SIGNUP_PAGE:
        return "Sign Up | Humane Society";
      case ROUTES.EDIT_TEAM_PAGE:
        return "Edit Team | Humane Society";
      case ROUTES.DISPLAY_ENTITY_PAGE:
        return "Entity Details | Humane Society";
      case ROUTES.CREATE_ENTITY_PAGE:
        return "Create Entity | Humane Society";
      case ROUTES.UPDATE_ENTITY_PAGE:
        return "Update Entity | Humane Society";
      case ROUTES.DISPLAY_SIMPLE_ENTITY_PAGE:
        return "Simple Entity Details | Humane Society";
      case ROUTES.CREATE_SIMPLE_ENTITY_PAGE:
        return "Create Simple Entity | Humane Society";
      case ROUTES.UPDATE_SIMPLE_ENTITY_PAGE:
        return "Update Simple Entity | Humane Society";
      case ROUTES.HOOKS_PAGE:
        return "Hooks | Humane Society";
      case ROUTES.INTERACTION_LOG_PAGE:
        return "Interaction Log | Humane Society";
      case ROUTES.PROFILE_PAGE:
        return "Profile | Humane Society";
      case ROUTES.PET_PROFILE_PAGE:
        return "Pet Profile | Humane Society";
      case ROUTES.DEV_UTILITY_PAGE:
        return "Developer Utility | Humane Society";
      case ROUTES.USER_MANAGEMENT_PAGE:
        return "User Management | Humane Society";
      case ROUTES.TASK_MANAGEMENT_PAGE:
        return "Task Management | Humane Society";
      case ROUTES.ADMIN_PAGE:
        return "Admin Dashboard | Humane Society";
      default:
        return "Humane Society";
    }
  };

  useEffect(() => {
    document.title = getPageTitle();
  }, [location.pathname]);

  return null;
};

export default PageTitleUpdater; 