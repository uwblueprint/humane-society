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
import ResponsiveLogo from "../common/responsive/ResponsiveLogo";
import ResponsivePasswordInput from "../common/responsive/ResponsivePasswordInput";
import ResponsiveAuthContainer from "../common/responsive/ResponsiveAuthContainer";
import ResponsiveModalWindow from "../common/responsive/ResponsiveModalWindow";
import background from "../assets/background.png";
import backgroundMobile from "../assets/background_mobile.png";

const CreatePasswordPage = (): React.ReactElement => {
  const [showModal, setShowModal] = React.useState(false);
  const [password, setPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [errorMessage, setErrorMessage] = React.useState("");

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
      return true;
    }
    if (confirmPassword.length < 8) {
      setErrorMessage("Password must be at least 8 characters.");
      return true;
    }
    if (confirmPassword && password !== confirmPassword) {
      setErrorMessage(
        "Your new password cannot be your previous password. Please try again.",
      );
      return true;
    }
    return false;
  };

  const handleCreateAccount = () => {
    if (validatePasswords()) {
      return;
    }
    setShowModal(true);

    // RESET PASSWORD LOGIC HERE
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
              color="#4A5568"
              textStyle={{ base: "h2Mobile", md: "h2" }}
              mb="0"
              textAlign="center"
            >
              Welcome Back!
            </Text>
            <Stack spacing="2.25rem">
              <Stack spacing={{ base: "1rem", md: "1.5rem" }} width="100%">
                <Box>
                  <FormLabel
                    fontSize="14px"
                    textColor="var(--gray-600, #4A5568)"
                    lineHeight="8px"
                  >
                    Email Address:
                  </FormLabel>
                  <Input
                    textColor="var(--gray-400, #A0AEC0)"
                    fontSize="14px"
                    height="2.4rem"
                    placeholder="admin@humanesociety.org"
                    isDisabled
                    bg="var(--gray-200, #E2E8F0)"
                  />
                </Box>
                <Box fontSize="12px">
                  <FormLabel
                    textColor="var(--gray-600, #4A5568)"
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
                    textColor="var(--gray-600, #4A5568)"
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
                  onClick={handleCreateAccount}
                  color="white"
                  h="2.4rem"
                  width="100%"
                  bg="var(--blue-700, #2C5282)"
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
            color="#2C5282"
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
            color="var(--gray-100, #EDF2F7)"
            bg="var(--blue-700, #2C5282)"
            height="3rem"
            padding="0rem 1.875rem"
            textStyle="button"
          >
            Get Started
          </Button>
        </ResponsiveModalWindow>
      )}
    </Flex>
  );
};

export default CreatePasswordPage;
