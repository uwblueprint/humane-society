import React, { useContext, useState, useEffect } from "react";
import { Redirect } from "react-router-dom";
import {
  Button,
  Flex,
  Text,
  FormLabel,
  FormControl,
  Input,
} from "@chakra-ui/react";
import { isSignInWithEmailLink } from "firebase/auth";
import Logo from "../components/common/Logo";
import ResponsivePasswordInput from "../components/common/PasswordInput";
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
import ResponsivePopupModal from "../components/common/PopupModal";

const LoginPage = (): React.ReactElement => {
  const { authenticatedUser, setAuthenticatedUser } = useContext(AuthContext);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
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
    setEmailError("");
    setPasswordError("");
    setErrorMessage("");

    let hasError = false;

    if (!email) {
      setEmailError("Email is required.");
      hasError = true;
    } else if (!/^\S+@\S+\.\S+$/.test(email)) {
      setEmailError("Please enter a valid email address.");
      hasError = true;
    }

    if (!password) {
      setPasswordError("Password is required.");
      hasError = true;
    }

    if (hasError) return;

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
  }, [authenticatedUser, setAuthenticatedUser, redirectTo]);

  if (redirectTo) {
    return <Redirect to={redirectTo} />;
  }

  if (authenticatedUser) {
    return <Redirect to="/" />;
  }

  return (
    <>
      <ResponsivePopupModal
        open={status === "loading"}
        title="Loading"
        message="Loading, please wait..."
      />

      <ResponsivePopupModal
        open={status === "error"}
        title="Error"
        message="An error occurred. If your link is expired, ask an administrator for assistance."
        primaryButtonText="Close"
        onPrimaryClick={() => setStatus("default")}
        primaryButtonColor="red"
      />

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
          <Flex margin="auto" gap="2.25rem" direction="column" padding="1rem">
            <Logo />
            <Flex
              padding="3.75rem"
              direction="column"
              gap={{ base: "1.12rem", md: "1rem" }}
              width={{ md: "28.875rem" }}
              justifyContent="center"
              background="gray.100"
              borderRadius="0.375rem"
            >
              <Text color="gray.700" textStyle="h1" m={0} textAlign="center">
                Welcome Back!
              </Text>
              <form
                onSubmit={(e: React.FormEvent) => {
                  e.preventDefault();
                  handleLogin();
                }}
              >
                <Flex direction="column" gap="2rem">
                  <Flex direction="column" gap="1rem">
                    <Flex direction="column" gap="0.375rem">
                      <FormLabel
                        m={0}
                        textColor="gray.600"
                        textStyle="bodyMobile"
                      >
                        Email:
                      </FormLabel>
                      <FormControl isInvalid={!!emailError || !!errorMessage}>
                        <Input
                          size="lg"
                          borderRadius="md"
                          borderColor="gray.400"
                          bg="white.default"
                          _placeholder={{ color: "gray.400" }}
                          placeholder="user@humanesociety.org"
                          value={email}
                          onChange={handleEmailChange}
                        />
                        {emailError && (
                          <Text fontSize="12px" color="red.500" mt="0.25rem">
                            {emailError}
                          </Text>
                        )}
                      </FormControl>
                    </Flex>
                    <Flex direction="column" gap="0.375rem">
                      <FormLabel
                        m={0}
                        textColor="gray.600"
                        textStyle="bodyMobile"
                      >
                        Password:
                      </FormLabel>
                      <FormControl
                        isInvalid={!!passwordError || !!errorMessage}
                      >
                        <ResponsivePasswordInput
                          value={password}
                          onChange={handlePasswordChange}
                        />
                        {passwordError && (
                          <Text fontSize="12px" color="red.500" mt="0.25rem">
                            {passwordError}
                          </Text>
                        )}
                      </FormControl>
                    </Flex>
                    {errorMessage && (
                      <Text
                        color="red.500"
                        textStyle="bodyMobile"
                        lineHeight="1"
                        m={0}
                      >
                        {errorMessage}
                      </Text>
                    )}
                    <Text
                      m={0}
                      textStyle="bodyMobile"
                      cursor="pointer"
                      onClick={handleForgotPassword}
                      color="gray.600"
                      textAlign="center"
                      _hover={{ textDecoration: "underline" }}
                    >
                      Forgot Password?
                    </Text>
                  </Flex>

                  <Button
                    type="submit"
                    textStyle="button"
                    size="lg"
                    width="100%"
                    variant="solid"
                    color="white"
                    bg="blue.700"
                  >
                    Login
                  </Button>
                </Flex>
              </form>
            </Flex>
          </Flex>
        </Flex>
      )}
    </>
  );
};

export default LoginPage;
