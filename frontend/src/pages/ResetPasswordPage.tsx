import React, { useState } from "react";
import {
  Box,
  Input,
  Text,
  Button,
  FormControl,
  FormErrorMessage,
  Flex,
  FormLabel,
} from "@chakra-ui/react";
import { getAuth, confirmPasswordReset } from "firebase/auth";
import { useHistory, useLocation } from "react-router-dom";
import { HOME_PAGE } from "../constants/Routes";
import ResponsivePopupModal from "../components/common/responsive/ResponsivePopupModal";
import background from "../assets/images/background.png";
import backgroundMobile from "../assets/images/login_background_phone.png";

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

const ResetPasswordPage = (): React.ReactElement => {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const history = useHistory();
  const query = useQuery();

  const oobCode = query.get("oobCode");

  const handlePasswordReset = async () => {
    setError("");

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    const auth = getAuth();

    if (oobCode) {
      // forgot password flow
      try {
        await confirmPasswordReset(auth, oobCode, newPassword);
        setSuccess(true);
        setTimeout(() => history.push("/"), 2000);
      } catch (err: unknown) {
        const message = (err instanceof Error && err.message) || "";

        if (
          message.includes("auth/weak-password") ||
          message.includes("auth/requires-recent-login") ||
          message.includes("Password should be at least")
        ) {
          // Ignore weak password errors and just assume it’s due to reuse
          setError("Your new password cannot be your previous password.");
        } else {
          setError("An error occurred. If your link is expired, ask an administrator for assistance.");
        }
      }
    } else {
      // tbd
    }
  };

  const handleGetStarted = () => {
    history.push(HOME_PAGE);
  };

  return (
    <Flex
      height="100vh"
      width="100vw"
      backgroundImage={`url(${backgroundMobile})`}
      sx={{
        "@media (orientation: landscape)": {
          height: "auto",
          minHeight: "100vh",
          overflowY: "auto",
          backgroundImage: `url(${background})`,
        },
      }}
      backgroundPosition="center"
      backgroundRepeat="no-repeat"
      backgroundSize="cover"
      backgroundColor="blue.700"
      justify="center"
      align="center"
      overflow="auto"
    >
      <Box
        maxWidth="100vw"
        width={["90vw", "47vw", "47vw", "37vw", "27vw"]}
        padding={["38px", "38px", "38px", "62px 64px"]}
        borderRadius="6px"
        backgroundColor="var(--gray-50, #F7FAFC)"
        boxShadow="lg"
        display="flex"
        flexDirection="column"
        marginTop="20px"
        marginBottom="20px"
      >
        <Text
          color="#4A5568"
          textStyle="h2"
          textAlign="center"
          lineHeight="120%"
        >
          Reset Password
        </Text>
        <Text py="24px" color="#4A5568" textStyle="body" textAlign="center">
          Please enter a new password, then re-enter to confirm.
        </Text>

        <FormLabel textColor="gray.600" fontSize="16px" lineHeight="8px">
          Password:
        </FormLabel>
        <FormControl isInvalid={!!error}>
          <Input
            type="password"
            placeholder="••••••••••"
            size="lg"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            marginBottom="1rem"
          />
          <FormLabel textColor="gray.600" fontSize="16px" lineHeight="8px">
            Confirm New Password:
          </FormLabel>
          <Input
            type="password"
            placeholder="••••••••••"
            size="lg"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
          {error && <FormErrorMessage>{error}</FormErrorMessage>}
        </FormControl>

        <Button
          mt="30px"
          size="lg"
          width="100%"
          variant="solid"
          color="white"
          bg="blue.700"
          onClick={handlePasswordReset}
        >
          Reset
        </Button>
      </Box>
      {success && (
        <ResponsivePopupModal
          open={success}
          title="Success!"
          message="Welcome to the Oakville & Milton Humane Society"
          primaryButtonText="Get Started"
          onPrimaryClick={handleGetStarted}
        />
      )}
    </Flex>
  );
};

export default ResetPasswordPage;
