import "bootstrap/dist/css/bootstrap.min.css";
import React, { useState } from "react";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import TeamMembersPage from "./components/pages/TeamMembersPage";

import Default from "./pages/Default";
import LoginPage from "./pages/LoginPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import PrivateRoute from "./components/auth/PrivateRoute";
import PetListPage from "./pages/PetListPage";
import TaskManagementPage from "./pages/TaskManagementPage";
import AddTaskTemplatePage from "./pages/AddTaskTemplatePage";
import NotFoundPage from "./pages/NotFoundPage";
import CreatePasswordPage from "./pages/CreatePasswordPage";
import * as Routes from "./constants/Routes";
import * as AuthConstants from "./constants/AuthConstants";
import AUTHENTICATED_USER_KEY from "./constants/AuthConstants";
import AuthContext from "./contexts/AuthContext";
import { getLocalStorageObj } from "./utils/LocalStorageUtils";
import InteractionLogPage from "./pages/InteractionLogPage";
import ProfilePage from "./pages/ProfilePage";
import PetProfilePage from "./pages/PetProfilePage";
import UserManagementPage from "./pages/UserManagementPage";
import AdminViewEditUserProfilePage from "./pages/AdminViewEditUserProfilePage";
import AdminPage from "./pages/AdminPage";
import Layout from "./Layout";
import PageTitleUpdater from "./components/common/PageTitleUpdater";

import { AuthenticatedUser } from "./types/AuthTypes";

import VolunteerViewEditUserProfilePage from "./pages/VolunteerViewEditUserProfilePage";

const App = (): React.ReactElement => {
  const currentUser: AuthenticatedUser = getLocalStorageObj<AuthenticatedUser>(
    AUTHENTICATED_USER_KEY,
  );

  const [authenticatedUser, setAuthenticatedUser] =
    useState<AuthenticatedUser>(currentUser);

  return (
    <AuthContext.Provider value={{ authenticatedUser, setAuthenticatedUser }}>
      <Router>
        <PageTitleUpdater />
        <Switch>
          <Route exact path={Routes.LOGIN_PAGE} component={LoginPage} />
          <Route
            exact
            path={Routes.FORGOT_PASSWORD_PAGE}
            component={ForgotPasswordPage}
          />
          <Route
            exact
            path={Routes.RESET_PASSWORD_PAGE}
            component={ResetPasswordPage}
          />
          <PrivateRoute
            exact
            path={Routes.CREATE_PASSWORD_PAGE}
            component={CreatePasswordPage}
            allowedRoles={AuthConstants.ALL_ROLES}
          />
          {/* Protected Routes Wrapped in Layout */}
          <Layout>
            <Switch>
              <PrivateRoute
                exact
                path={Routes.HOME_PAGE}
                component={PetListPage}
                allowedRoles={AuthConstants.ALL_ROLES}
              />
              {/* Starter Code Route */}
              <PrivateRoute
                exact
                path={Routes.DEV_UTILITY_PAGE}
                component={Default}
                allowedRoles={AuthConstants.ALL_ROLES}
              />
              <PrivateRoute
                exact
                path={Routes.INTERACTION_LOG_PAGE}
                component={InteractionLogPage}
                allowedRoles={AuthConstants.STAFF_BEHAVIOURISTS_ADMIN}
              />
              <PrivateRoute
                exact
                path={`${Routes.PROFILE_PAGE}/:id`}
                component={ProfilePage}
                allowedRoles={AuthConstants.ALL_ROLES}
              />
              <PrivateRoute
                exact
                path={`${Routes.PET_PROFILE_PAGE}/:id`}
                component={PetProfilePage}
                allowedRoles={AuthConstants.ALL_ROLES}
              />
              <PrivateRoute
                exact
                path={Routes.ADMIN_PAGE}
                component={AdminPage}
                allowedRoles={AuthConstants.ADMIN_AND_BEHAVIOURISTS}
              />
              <PrivateRoute
                exact
                path={Routes.USER_MANAGEMENT_PAGE}
                component={UserManagementPage}
                allowedRoles={AuthConstants.STAFF_BEHAVIOURISTS_ADMIN}
              />
              <PrivateRoute
                exact
                path={`${Routes.ADMIN_EDIT_USER_PROFILE_PAGE}/:userId`}
                component={AdminViewEditUserProfilePage}
                allowedRoles={AuthConstants.STAFF_BEHAVIOURISTS_ADMIN}
              />
              <PrivateRoute
                exact
                path={Routes.TASK_MANAGEMENT_PAGE}
                component={TaskManagementPage}
                allowedRoles={AuthConstants.STAFF_BEHAVIOURISTS_ADMIN}
              />
              <PrivateRoute
                exact
                path={Routes.ADD_TASK_TEMPLATE_PAGE}
                component={AddTaskTemplatePage}
                allowedRoles={AuthConstants.ADMIN_AND_BEHAVIOURISTS}
              />
              <PrivateRoute
                exact
                path={`${Routes.VOLUNTEER_EDIT_USER_PROFILE_PAGE}/:userId`}
                component={VolunteerViewEditUserProfilePage}
                allowedRoles={AuthConstants.ALL_ROLES}
              />
              <PrivateRoute
                exact
                path={Routes.TEAM_MEMBERS}
                component={TeamMembersPage}
                allowedRoles={AuthConstants.ALL_ROLES}
              />
              {/* Fallback Route */}
              <Route path="*" component={NotFoundPage} />
            </Switch>
          </Layout>
        </Switch>
      </Router>
    </AuthContext.Provider>
  );
};

export default App;
