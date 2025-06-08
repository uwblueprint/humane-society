import React, { useContext, useState, useEffect } from "react";
import { Redirect } from "react-router-dom";
import {
  Button,
  Center,
  Stack,
  Flex,
  Box,
  Text,
  FormLabel,
  FormControl,
} from "@chakra-ui/react";
import { isSignInWithEmailLink } from "firebase/auth";
import ResponsiveLogo from "../components/common/responsive/ResponsiveLogo";
import ResponsiveEmailInput from "../components/common/responsive/ResponsiveEmailInput";
import ResponsivePasswordInput from "../components/common/responsive/ResponsivePasswordInput";
import ResponsiveAuthContainer from "../components/common/responsive/ResponsiveAuthContainer";
import background from "../assets/images/background.png";
import backgroundMobile from "../assets/images/background_mobile.png";
import auth from "../firebase/firebase";
import authAPIClient from "../APIClients/AuthAPIClient";
import {
  CREATE_PASSWORD_PAGE,
  FORGOT_PASSWORD_PAGE,
  HOME_PAGE,
} from "../constants/Routes";
import AuthContext from "../contexts/AuthContext";
import { AuthenticatedUser } from "../types/AuthTypes";
import ResponsiveModalWindow from "../components/common/responsive/ResponsiveModalWindow";

const LoginPage = (): React.ReactElement => {
  const { authenticatedUser, setAuthenticatedUser } = useContext(AuthContext);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = React.useState("");
  const [redirectTo, setRedirectTo] = useState<string | null>(null);
  const [status, setStatus] = useState<"loading" | "error" | "default">(
    "default"
  );

  const handleEmailChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(event.target.value);
  };
  const handlePasswordChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(event.target.value);
  };
  const handleForgotPassword = () => {
    setRedirectTo(FORGOT_PASSWORD_PAGE);
  };
  const handleLogin = async () => {
    setErrorMessage("");
    if (!email || !password) {
      setErrorMessage("Email and Password are required.");
      return;
    }
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      setErrorMessage("Please enter a valid email address.");
      return;
    }

    const user: AuthenticatedUser = await authAPIClient.login(email, password);
    setAuthenticatedUser(user);
    if (!authenticatedUser) {
      setErrorMessage("Invalid login credentials.");
    }
  };

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
          signInEmail
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
    } else if (redirectTo !== FORGOT_PASSWORD_PAGE) {
      checkIfSignInLink();
    }
  }, [authenticatedUser, setAuthenticatedUser]);

  if (redirectTo) {
    return <Redirect to={redirectTo} />;
  }

  if (authenticatedUser) {
    return <Redirect to="/" />;
  }

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
        <Flex
          maxWidth="100vw"
          height="100vh"
          position="relative"
          backgroundRepeat="no-repeat"
          backgroundPosition="center"
          backgroundSize="cover"
          backgroundImage={`url(${backgroundMobile})`}
          sx={{
            "@media (orientation: landscape)": {
              height: "auto",
              minHeight: "100vh",
              overflowY: "auto",
              backgroundImage: `url(${background})`,
            },
          }}
        >
          <Center flex="1">
            <Flex
              gap="2.2rem"
              direction="column"
              justify="center"
              alignItems="center"
              padding="1rem"
            >
              <ResponsiveLogo />
              <ResponsiveAuthContainer>
                <Text
                  color="#4A5568"
                  textStyle={{ base: "h2Mobile", md: "h2" }}
                  mb="0"
                  textAlign="center"
                >
                  Welcome Back!
                </Text>
                <Stack>
                  <Stack spacing={{ base: "1rem", md: "1.5rem" }} width="100%">
                    <Box>
                      <FormLabel
                        fontSize="14px"
                        textColor="var(--gray-600, #4A5568)"
                        lineHeight="8px"
                      >
                        Email:
                      </FormLabel>
                      <FormControl isInvalid={!!errorMessage}>
                        <ResponsiveEmailInput
                          value={email}
                          onChange={handleEmailChange}
                        />
                      </FormControl>
                    </Box>
                    <Box>
                      <FormLabel
                        textColor="var(--gray-600, #4A5568)"
                        fontSize="14px"
                        lineHeight="8px"
                      >
                        Password:
                      </FormLabel>
                      <FormControl isInvalid={!!errorMessage}>
                        <ResponsivePasswordInput
                          value={password}
                          onChange={handlePasswordChange}
                        />
                      </FormControl>
                    </Box>
                  </Stack>
                  <Text
                    cursor="pointer"
                    fontSize="14px"
                    onClick={handleForgotPassword}
                    color="gray.600"
                    textAlign="center"
                    _hover={{ textDecoration: "underline" }}
                    pt="0.5rem"
                  >
                    Forgot Password?
                  </Text>
                  <Box>
                    <Button
                      type="submit"
                      fontSize="14px"
                      onClick={handleLogin}
                      color="white"
                      h="2.4rem"
                      width="100%"
                      bg="var(--blue-700, #2C5282)"
                    >
                      Login
                    </Button>
                    {errorMessage && (
                      <Box textAlign="center">
                        <Text
                          color="red.500"
                          fontSize="14px"
                          lineHeight="1"
                          mb="0"
                          mt="1rem"
                        >
                          {errorMessage}
                        </Text>
                      </Box>
                    )}
                  </Box>
                </Stack>
              </ResponsiveAuthContainer>
            </Flex>
          </Center>
        </Flex>
      )}
    </>
  );
};

export default LoginPage;
