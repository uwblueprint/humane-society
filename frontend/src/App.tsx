import "bootstrap/dist/css/bootstrap.min.css";
import React, { useState, useReducer } from "react";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";

import Default from "./components/pages/Default";
import Login from "./components/auth/Login";
import Signup from "./components/auth/Signup";
import ForgotPasswordPage from "./components/pages/ForgotPassword";
import PrivateRoute from "./components/auth/PrivateRoute";
import CreatePage from "./components/pages/CreatePage";
import PetListPage from "./components/pages/PetListPage";
import DisplayPage from "./components/pages/DisplayPage";
import SimpleEntityCreatePage from "./components/pages/SimpleEntityCreatePage";
import SimpleEntityDisplayPage from "./components/pages/SimpleEntityDisplayPage";
import NotFound from "./components/pages/NotFound";
import UpdatePage from "./components/pages/UpdatePage";
import SimpleEntityUpdatePage from "./components/pages/SimpleEntityUpdatePage";
import * as AppRoutes from "./constants/Routes";
import * as AuthConstants from "./constants/AuthConstants";
import AUTHENTICATED_USER_KEY from "./constants/AuthConstants";
import AuthContext from "./contexts/AuthContext";
import { getLocalStorageObj } from "./utils/LocalStorageUtils";
import SampleContext, {
  DEFAULT_SAMPLE_CONTEXT,
} from "./contexts/SampleContext";
import sampleContextReducer from "./reducers/SampleContextReducer";
import SampleContextDispatcherContext from "./contexts/SampleContextDispatcherContext";
import EditTeamInfoPage from "./components/pages/EditTeamPage";
import HooksDemo from "./components/pages/HooksDemo";
import NotificationsPage from "./components/pages/NotificationsPage";
import ProfilePage from "./components/pages/ProfilePage";
import UserManagementPage from "./components/pages/UserManagementPage";
import AdminPage from "./components/pages/AdminPage";
import Layout from "./Layout";

import { AuthenticatedUser } from "./types/AuthTypes";

const App = (): React.ReactElement => {
  const currentUser: AuthenticatedUser = getLocalStorageObj<AuthenticatedUser>(
    AUTHENTICATED_USER_KEY,
  );

  const [authenticatedUser, setAuthenticatedUser] =
    useState<AuthenticatedUser>(currentUser);

  // Some sort of global state. Context API replaces redux.
  // Split related states into different contexts as necessary.
  // Split dispatcher and state into separate contexts as necessary.
  const [sampleContext, dispatchSampleContextUpdate] = useReducer(
    sampleContextReducer,
    DEFAULT_SAMPLE_CONTEXT,
  );

  return (
    <SampleContext.Provider value={sampleContext}>
      <SampleContextDispatcherContext.Provider
        value={dispatchSampleContextUpdate}
      >
        <AuthContext.Provider
          value={{ authenticatedUser, setAuthenticatedUser }}
        >
          <Router>
            <Switch>
              {/* Public Routes */}
              <Route exact path={AppRoutes.LOGIN_PAGE} component={Login} />
              <Route exact path={AppRoutes.SIGNUP_PAGE} component={Signup} />
              <Route
                exact
                path={AppRoutes.FORGOT_PASSWORD_PAGE}
                component={ForgotPasswordPage}
              />

              {/* Protected Routes Wrapped in Layout */}
              <Layout>
                <PrivateRoute
                  exact
                  path={AppRoutes.HOME_PAGE}
                  component={PetListPage}
                  allowedRoles={AuthConstants.ALL_ROLES}
                />
                <PrivateRoute
                  exact
                  path={AppRoutes.CREATE_ENTITY_PAGE}
                  component={CreatePage}
                  allowedRoles={AuthConstants.ADMIN_AND_BEHAVIOURISTS}
                />
                <PrivateRoute
                  exact
                  path={AppRoutes.UPDATE_ENTITY_PAGE}
                  component={UpdatePage}
                  allowedRoles={AuthConstants.ADMIN_AND_BEHAVIOURISTS}
                />
                <PrivateRoute
                  exact
                  path={AppRoutes.DISPLAY_ENTITY_PAGE}
                  component={DisplayPage}
                  allowedRoles={AuthConstants.ALL_ROLES}
                />
                <PrivateRoute
                  exact
                  path={AppRoutes.CREATE_SIMPLE_ENTITY_PAGE}
                  component={SimpleEntityCreatePage}
                  allowedRoles={AuthConstants.ADMIN_AND_BEHAVIOURISTS}
                />
                <PrivateRoute
                  exact
                  path={AppRoutes.UPDATE_SIMPLE_ENTITY_PAGE}
                  component={SimpleEntityUpdatePage}
                  allowedRoles={AuthConstants.ADMIN_AND_BEHAVIOURISTS}
                />
                <PrivateRoute
                  exact
                  path={AppRoutes.DISPLAY_SIMPLE_ENTITY_PAGE}
                  component={SimpleEntityDisplayPage}
                  allowedRoles={AuthConstants.ALL_ROLES}
                />
                <PrivateRoute
                  exact
                  path={AppRoutes.EDIT_TEAM_PAGE}
                  component={EditTeamInfoPage}
                  allowedRoles={AuthConstants.ADMIN_AND_BEHAVIOURISTS}
                />
                <PrivateRoute
                  exact
                  path={AppRoutes.HOOKS_PAGE}
                  component={HooksDemo}
                  allowedRoles={AuthConstants.ALL_ROLES}
                />
                <PrivateRoute
                  exact
                  path={AppRoutes.DEV_UTILITY_PAGE}
                  component={Default}
                  allowedRoles={AuthConstants.ALL_ROLES}
                />
                <PrivateRoute
                  exact
                  path={AppRoutes.NOTIFICATIONS_PAGE}
                  component={NotificationsPage}
                  allowedRoles={AuthConstants.ALL_ROLES}
                />
                <PrivateRoute
                  exact
                  path={AppRoutes.PROFILE_PAGE}
                  component={ProfilePage}
                  allowedRoles={AuthConstants.ALL_ROLES}
                />
                <PrivateRoute
                  exact
                  path={AppRoutes.ADMIN_PAGE}
                  component={AdminPage}
                  allowedRoles={AuthConstants.ADMIN_AND_BEHAVIOURISTS}
                />
                <PrivateRoute
                  exact
                  path={AppRoutes.USER_MANAGEMENT_PAGE}
                  component={UserManagementPage}
                  allowedRoles={AuthConstants.ADMIN_AND_BEHAVIOURISTS}
                />
              </Layout>

              {/* Fallback Route */}
              <Route path="*" component={NotFound} />
            </Switch>
          </Router>
        </AuthContext.Provider>
      </SampleContextDispatcherContext.Provider>
    </SampleContext.Provider>
  );
};

export default App;
