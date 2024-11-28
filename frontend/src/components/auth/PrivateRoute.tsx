import React, { useContext } from "react";
import { Route, Redirect } from "react-router-dom";

import AuthContext from "../../contexts/AuthContext";
import { LOGIN_PAGE } from "../../constants/Routes";

type PrivateRouteProps = {
  component: React.FC;
  path: string;
  exact: boolean;
  allowedRoles: Set<string>;
};

const PrivateRoute: React.FC<PrivateRouteProps> = ({
  component,
  exact,
  path,
  allowedRoles,
}: PrivateRouteProps) => {
  const { authenticatedUser } = useContext(AuthContext);

  if (!authenticatedUser) {
    return <Redirect to={LOGIN_PAGE} />;
  }
  if (!allowedRoles.has(authenticatedUser.role)) {
    return <Redirect to="*" />;
  }

  return <Route path={path} exact={exact} component={component} />;
};

export default PrivateRoute;
