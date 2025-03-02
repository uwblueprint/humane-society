import React from "react";
import {
  Input,
  Button,
  Center,
  Stack,
  Flex,
  Box,
  Text,
  FormLabel,
  FormControl,
} from "@chakra-ui/react";
import { useHistory } from "react-router-dom";
import ResponsiveLogo from "../components/common/responsive/ResponsiveLogo";
import ResponsivePasswordInput from "../components/common/responsive/ResponsivePasswordInput";
import ResponsiveAuthContainer from "../components/common/responsive/ResponsiveAuthContainer";
import ResponsiveModalWindow from "../components/common/responsive/ResponsiveModalWindow";
import background from "../assets/images/background.png";
import backgroundMobile from "../assets/images/background_mobile.png";
import AuthAPIClient from "../APIClients/AuthAPIClient";
import { HOME_PAGE } from "../constants/Routes";

const CreatePasswordPage = (): React.ReactElement => {
  const [showModal, setShowModal] = React.useState(false);
  const [password, setPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [errorMessage, setErrorMessage] = React.useState("");
  const [email, setEmail] = React.useState("Email not found.");

  const history = useHistory();

  React.useEffect(() => {
    const getEmail = async () => {
      const userEmail = await AuthAPIClient.getEmailOfCurrentUser();
      setEmail(userEmail);
    };
    getEmail();
  });

  const handlePasswordChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(event.target.value);
  };
  const handleConfirmPasswordChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setConfirmPassword(event.target.value);
  };

  const validatePasswords = () => {
    setErrorMessage("");
    if (password.length < 8) {
      setErrorMessage("Password must be at least 8 characters.");
      return false;
    }
    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match.");
      return false;
    }
    return true;
  };

  const handleSubmitForm = async () => {
    if (!validatePasswords()) {
      return;
    }
    try {
      const setPasswordResponse = await AuthAPIClient.setPassword(password);
      const loginResponse = await AuthAPIClient.login(email, password);
      if (setPasswordResponse.success && loginResponse != null) {
        setShowModal(true);
      } else if (setPasswordResponse.errorMessage) {
        setErrorMessage(setPasswordResponse.errorMessage);
      }
    } catch (error) {
      setErrorMessage("An unknown error occurred. Please try again later.");
    }
  };

  const handleGetStarted = () => {
    history.push(HOME_PAGE);
  };

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
              color="gray.600"
              textStyle={{ base: "h2Mobile", md: "h2" }}
              mb="0"
              textAlign="center"
            >
              Welcome!
            </Text>
            <Stack spacing="2.25rem">
              <Stack spacing={{ base: "1rem", md: "1.5rem" }} width="100%">
                <Box>
                  <FormLabel
                    fontSize="14px"
                    textColor="gray.600"
                    lineHeight="8px"
                  >
                    Email Address:
                  </FormLabel>
                  <Input
                    textColor="gray.400"
                    fontSize="14px"
                    height="2.4rem"
                    placeholder={email}
                    isDisabled
                    bg="gray.200"
                  />
                </Box>
                <Box fontSize="12px">
                  <FormLabel
                    textColor="gray.600"
                    fontSize="14px"
                    lineHeight="8px"
                  >
                    Create Password:
                  </FormLabel>
                  <FormControl isInvalid={!!errorMessage}>
                    <ResponsivePasswordInput
                      value={password}
                      onChange={handlePasswordChange}
                    />
                  </FormControl>
                </Box>
                <Box fontSize="12px">
                  <FormLabel
                    textColor="gray.600"
                    fontSize="14px"
                    lineHeight="8px"
                  >
                    Confirm Password:
                  </FormLabel>
                  <FormControl isInvalid={!!errorMessage}>
                    <ResponsivePasswordInput
                      value={confirmPassword}
                      onChange={handleConfirmPasswordChange}
                    />
                  </FormControl>
                </Box>
              </Stack>
              <Box>
                <Button
                  type="submit"
                  fontSize="14px"
                  onClick={handleSubmitForm}
                  color="white"
                  h="2.4rem"
                  width="100%"
                  bg="blue.700"
                >
                  Create Account
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
      {showModal && (
        <ResponsiveModalWindow>
          <Text
            color="blue.700"
            textAlign="center"
            textStyle={{ base: "h2", md: "h1" }}
          >
            Success!
          </Text>
          <Text
            textStyle={{ base: "bodyMobile", md: "body" }}
            textAlign="center"
          >
            Welcome to the Oakville & Milton Humane Society
          </Text>
          <Button
            color="gray.100"
            bg="blue.700"
            height="3rem"
            padding="0rem 1.875rem"
            textStyle="button"
            onClick={handleGetStarted}
          >
            Get Started
          </Button>
        </ResponsiveModalWindow>
      )}
    </Flex>
  );
};

export default CreatePasswordPage;
