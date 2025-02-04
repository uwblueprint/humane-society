import React, { useContext, useState } from "react";
import { Redirect } from "react-router-dom";
import { isSignInWithEmailLink } from "firebase/auth";
import auth from "../../firebase/firebase";
import authAPIClient from "../../APIClients/AuthAPIClient";
import { HOME_PAGE } from "../../constants/Routes";
import AuthContext from "../../contexts/AuthContext";
import { AuthenticatedUser } from "../../types/AuthTypes";

let didInit = false;

const Login = (): React.ReactElement => {
  const { authenticatedUser, setAuthenticatedUser } = useContext(AuthContext);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const onLogInClick = async () => {
    const user: AuthenticatedUser = await authAPIClient.login(email, password);
    setAuthenticatedUser(user);
  };
  const checkIfSignInLink = async () => {
    if (!authenticatedUser) {
      const url = window.location.href;
      const urlSearchParams = new URLSearchParams(window.location.search);
      const signInEmail = urlSearchParams.get("email"); // passed in from actionCode
      const isSignInLink = isSignInWithEmailLink(auth, url);
      if (signInEmail && isSignInLink) {
        const user: AuthenticatedUser = await authAPIClient.loginWithSignInLink(
          url,
          signInEmail,
        );
        setAuthenticatedUser(user);
      }
    }
    // alert: user is already logged in, please log out before trying again
  };

  if (authenticatedUser) {
    return <Redirect to={HOME_PAGE} />;
  }

  if (!didInit) {
    didInit = true;
    checkIfSignInLink();
  }

  return (
    <div style={{ textAlign: "center" }}>
      <h1>Login</h1>
      <form>
        <div>
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="username@domain.com"
          />
        </div>
        <div>
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="password"
          />
        </div>
        <div>
          <button
            className="btn btn-primary"
            type="button"
            onClick={onLogInClick}
          >
            Log In
          </button>
        </div>
      </form>
    </div>
  );
};

export default Login;
