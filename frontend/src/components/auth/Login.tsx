import React, { useContext, useState } from "react";
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
import ResponsiveLogo from "../common/responsive/ResponsiveLogo";
import ResponsiveEmailInput from "../common/responsive/ResponsiveEmailInput";
import ResponsivePasswordInput from "../common/responsive/ResponsivePasswordInput";
import ResponsiveAuthContainer from "../common/responsive/ResponsiveAuthContainer";
import background from "../assets/background.png";
import backgroundMobile from "../assets/background_mobile.png";
import authAPIClient from "../../APIClients/AuthAPIClient";
import AuthContext from "../../contexts/AuthContext";
import { AuthenticatedUser } from "../../types/AuthTypes";

const Login = (): React.ReactElement => {
  const { authenticatedUser, setAuthenticatedUser } = useContext(AuthContext);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = React.useState("");

  const handleEmailChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(event.target.value);
  };
  const handlePasswordChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(event.target.value);
  };
  const handleForgotPassword = () => {
    // Forgot password doesn’t have to route to anything yet
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

  if (authenticatedUser) {
    return <Redirect to="/pets" />;
  }

  return (
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
                <Text
                  cursor="pointer"
                  fontSize="14px"
                  onClick={handleForgotPassword}
                  color="#494B42"
                  textAlign="center"
                  _hover={{ textDecoration: "underline" }}
                >
                  Forgot Password?
                </Text>
              </Stack>

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
  );
};

export default Login;
