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
import CreatePasswordPage from "./components/pages/CreatePasswordPage";
import * as Routes from "./constants/Routes";
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
              <Route exact path={Routes.LOGIN_PAGE} component={Login} />
              <Route exact path={Routes.SIGNUP_PAGE} component={Signup} />
              <PrivateRoute
                exact
                path={Routes.CREATE_PASSWORD_PAGE}
                component={CreatePasswordPage}
                allowedRoles={AuthConstants.ALL_ROLES}
              />
              <Route
                exact
                path={Routes.FORGOT_PASSWORD_PAGE}
                component={ForgotPasswordPage}
              />
              <PrivateRoute
                exact
                path={Routes.HOME_PAGE}
                component={PetListPage}
                allowedRoles={AuthConstants.ALL_ROLES}
              />
              <PrivateRoute
                exact
                path={Routes.CREATE_ENTITY_PAGE}
                component={CreatePage}
                allowedRoles={AuthConstants.ADMIN_AND_BEHAVIOURISTS}
              />
              <PrivateRoute
                exact
                path={Routes.UPDATE_ENTITY_PAGE}
                component={UpdatePage}
                allowedRoles={AuthConstants.ADMIN_AND_BEHAVIOURISTS}
              />
              <PrivateRoute
                exact
                path={Routes.DISPLAY_ENTITY_PAGE}
                component={DisplayPage}
                allowedRoles={AuthConstants.ALL_ROLES}
              />
              <PrivateRoute
                exact
                path={Routes.CREATE_SIMPLE_ENTITY_PAGE}
                component={SimpleEntityCreatePage}
                allowedRoles={AuthConstants.ADMIN_AND_BEHAVIOURISTS}
              />
              <PrivateRoute
                exact
                path={Routes.UPDATE_SIMPLE_ENTITY_PAGE}
                component={SimpleEntityUpdatePage}
                allowedRoles={AuthConstants.ADMIN_AND_BEHAVIOURISTS}
              />
              <PrivateRoute
                exact
                path={Routes.DISPLAY_SIMPLE_ENTITY_PAGE}
                component={SimpleEntityDisplayPage}
                allowedRoles={AuthConstants.ALL_ROLES}
              />
              <PrivateRoute
                exact
                path={Routes.EDIT_TEAM_PAGE}
                component={EditTeamInfoPage}
                allowedRoles={AuthConstants.ADMIN_AND_BEHAVIOURISTS}
              />
              <PrivateRoute
                exact
                path={Routes.HOOKS_PAGE}
                component={HooksDemo}
                allowedRoles={AuthConstants.ALL_ROLES}
              />
              <PrivateRoute
                exact
                path={Routes.DEV_UTILITY_PAGE}
                component={Default}
                allowedRoles={AuthConstants.ALL_ROLES}
              />
              <PrivateRoute
                exact
                path={Routes.NOTIFICATIONS_PAGE}
                component={NotificationsPage}
                allowedRoles={AuthConstants.ALL_ROLES}
              />
              <PrivateRoute
                exact
                path={Routes.PROFILE_PAGE}
                component={ProfilePage}
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
                allowedRoles={AuthConstants.ADMIN_AND_BEHAVIOURISTS}
              />
              <Route exact path="*" component={NotFound} />
            </Switch>
          </Router>
        </AuthContext.Provider>
      </SampleContextDispatcherContext.Provider>
    </SampleContext.Provider>
  );
};

export default App;
