import React from "react";
import { Button, Flex, Text, FormLabel, FormControl, BoxProps } from "@chakra-ui/react";
import { useHistory } from "react-router-dom";

import Input from "../components/common/Input";
import Logo from "../components/common/Logo";
import PasswordInput from "../components/common/PasswordInput";
import PopupModal from "../components/common/PopupModal";
import background from "../assets/images/background.png";
import backgroundMobile from "../assets/images/background_mobile.png";
import AuthAPIClient from "../APIClients/AuthAPIClient";
import { HOME_PAGE } from "../constants/Routes";
import AuthContainer from "../components/auth/AuthContainer";

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
    /* Set Login page background */
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
      {/* Logo + Login container */}
      <Flex flex="1" justifyContent="center" alignItems="center" gap="3.375rem" direction="column" padding="1rem">
        <Logo />
        <AuthContainer>
          {/* Input + header + button wrapper */}
          <Flex direction="column" gap="2.25rem">
            {/* Login header */}
            <Text
              color="gray.600"
              textStyle={{ base: "h2", md: "h1" }}
              m={0}
              textAlign="center"
            >
              Welcome!
            </Text>
            {/* Input wrapper */}
            <Flex
              direction="column"
              gap={{ base: "1rem", md: "1rem" }}
              width="100%"
            >
              {/* Email input */}
              <Flex direction="column" gap="0.375rem">
                <FormLabel
                  textStyle="bodyMobile"
                  textColor="gray.600"
                  m={0}
                >
                  Email Address:
                </FormLabel>
                <Input value={email} placeholder={email} disabled />
              </Flex>
              {/* Password input */}
              <Flex direction="column" gap="0.375rem">
                <FormLabel
                  textColor="gray.600"
                  textStyle="bodyMobile"
                  m={0}
                >
                  Create Password:
                </FormLabel>
                <FormControl isInvalid={!!errorMessage}>
                  <PasswordInput value={password} onChange={handlePasswordChange} />
                </FormControl>
              </Flex>
              {/* Password confirmation input */}
              <Flex direction="column" gap="0.375rem">
                <FormLabel
                  textColor="gray.600"
                  textStyle="bodyMobile"
                  m={0}
                >
                  Confirm Password:
                </FormLabel>
                <FormControl isInvalid={!!errorMessage}>
                  <PasswordInput value={confirmPassword} onChange={handleConfirmPasswordChange} />
                </FormControl>
              </Flex>
            </Flex>
            {/* Button */}
            <Flex direction="column" gap="0.5rem">
              {/* Create Account button */}
              <Button
                type="submit"
                textStyle="button"
                onClick={handleSubmitForm}
                color="white"
                h="3rem"
                width="100%"
                bg="blue.700"
                m={0}
              >
                Create Account
              </Button>
              {/* General error message */}
              {/* TODO: deprecate, error messages are displayed under individual inputs */}
              {errorMessage && (
                <Text
                  color="red.500"
                  textStyle="bodyMobile"
                  lineHeight="1"
                  m={0}
                  textAlign="center"
                >
                  {errorMessage}
                </Text>
              )}
            </Flex>
          </Flex>
        </AuthContainer>
      </Flex>
    {showModal && (
      <PopupModal
        open={showModal}
        title="Success!"
        message="Welcome to the Oakville & Milton Humane Society"
        primaryButtonText="Get Started"
        onPrimaryClick={handleGetStarted}
      />
    )}
    </Flex>
  );
};

export default CreatePasswordPage;
