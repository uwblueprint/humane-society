import React, { useContext, useState, useEffect } from "react";
import { Text, Flex } from "@chakra-ui/react";
import { Redirect } from "react-router-dom";
import { isSignInWithEmailLink } from "firebase/auth";
import auth from "../../firebase/firebase";
import authAPIClient from "../../APIClients/AuthAPIClient";
import { CREATE_PASSWORD_PAGE, HOME_PAGE } from "../../constants/Routes";
import AuthContext from "../../contexts/AuthContext";
import { AuthenticatedUser } from "../../types/AuthTypes";
import ResponsiveModalWindow from "../common/responsive/ResponsiveModalWindow";

const Login = (): React.ReactElement => {
  const { authenticatedUser, setAuthenticatedUser } = useContext(AuthContext);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [redirectTo, setRedirectTo] = useState<string | null>(null);
  const [status, setStatus] = useState<"loading" | "error" | "default">(
    "default",
  );

  useEffect(() => {
    setStatus("loading");
    const checkIfSignInLink = async () => {
      const url = window.location.href;
      const urlSearchParams = new URLSearchParams(window.location.search);
      const signInEmail = urlSearchParams.get("email"); // passed in from actionCode
      const isSignInLink = isSignInWithEmailLink(auth, url);

      if (signInEmail && isSignInLink) {
        const user: AuthenticatedUser = await authAPIClient.loginWithSignInLink(
          url,
          signInEmail,
        );
        if (user) {
          setAuthenticatedUser(user);
          setRedirectTo(CREATE_PASSWORD_PAGE);
        } else {
          setStatus("error");
        }
      } else {
        setStatus("default");
      }
    };

    if (authenticatedUser) {
      setRedirectTo(HOME_PAGE);
    } else {
      checkIfSignInLink();
    }
  }, [authenticatedUser, setAuthenticatedUser]);

  if (redirectTo) {
    return <Redirect to={redirectTo} />;
  }

  const onLogInClick = async () => {
    const user: AuthenticatedUser = await authAPIClient.login(email, password);
    setAuthenticatedUser(user);
  };

  return (
    <>
      {status === "loading" && (
        <Flex
          maxWidth="100vw"
          height="100vh"
          position="relative"
          backgroundRepeat="no-repeat"
          backgroundPosition="center"
          backgroundSize="cover"
          sx={{
            "@media (orientation: landscape)": {
              height: "auto",
              minHeight: "100vh",
              overflowY: "auto",
            },
          }}
        >
          <ResponsiveModalWindow>
            <Text color="#2C5282" textAlign="center">
              Loading, please wait...
            </Text>
          </ResponsiveModalWindow>
        </Flex>
      )}

      {status === "error" && (
        <Flex
          maxWidth="100vw"
          height="100vh"
          position="relative"
          backgroundRepeat="no-repeat"
          backgroundPosition="center"
          backgroundSize="cover"
          sx={{
            "@media (orientation: landscape)": {
              height: "auto",
              minHeight: "100vh",
              overflowY: "auto",
            },
          }}
        >
          <ResponsiveModalWindow>
            <Text color="red.500" textAlign="center">
              An error occurred. If your link is expired, ask an adminstrator
              for assistance.
            </Text>
          </ResponsiveModalWindow>
        </Flex>
      )}

      {status === "default" && !redirectTo && (
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
      )}
    </>
  );
};

export default Login;
