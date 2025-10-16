import React, { useCallback, useEffect } from "react";
import { useLocation } from "react-router-dom";
import * as ROUTES from "../../constants/Routes";

const PageTitleUpdater: React.FC = () => {
  const location = useLocation();

  const getPageTitle = useCallback(() => {
    // Special routes that have id's
    if (location.pathname.startsWith(ROUTES.PROFILE_PAGE)) {
      return "Profile | Humane Society";
    }
    if (location.pathname.startsWith(ROUTES.PET_PROFILE_PAGE)) {
      return "Pet Profile | Humane Society";
    }
    if (location.pathname.startsWith(ROUTES.ADMIN_EDIT_USER_PROFILE_PAGE)) {
      return "Edit User Profile | Humane Society";
    }

    switch (location.pathname) {
      case ROUTES.HOME_PAGE:
        return "Pet List | Humane Society";
      case ROUTES.LOGIN_PAGE:
        return "Login | Humane Society";
      case ROUTES.INTERACTION_LOG_PAGE:
        return "Interaction Log | Humane Society";
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
  }, [location.pathname]);

  useEffect(() => {
    document.title = getPageTitle();
  }, [getPageTitle]);

  return null;
};

export default PageTitleUpdater;
