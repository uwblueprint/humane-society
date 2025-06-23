import React, { useState } from "react";
import {
  Text,
  Button,
  FormControl,
  FormErrorMessage,
  Flex,
  FormLabel,
} from "@chakra-ui/react";
import { getAuth, confirmPasswordReset } from "firebase/auth";
import { useHistory, useLocation } from "react-router-dom";

import Input from "../components/common/Input";
import { HOME_PAGE } from "../constants/Routes";
import ResponsivePopupModal from "../components/common/PopupModal";
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

    if (!oobCode) {
      setError(
        "Invalid or missing reset code. Please request a new password reset link.",
      );
      return;
    }

    try {
      await confirmPasswordReset(auth, oobCode, newPassword);
      setSuccess(true);
      setTimeout(() => history.push(HOME_PAGE), 5000);
    } catch (err) {
      const errorCode = (err as { code?: string })?.code || "";

      switch (errorCode) {
        case "auth/expired-action-code":
          setError(
            "This password reset link has expired. Please request a new one.",
          );
          break;
        case "auth/invalid-action-code":
          setError(
            "This password reset link is invalid. Please request a new one.",
          );
          break;
        case "auth/user-disabled":
          setError(
            "This account has been disabled. Please contact an administrator.",
          );
          break;
        case "auth/user-not-found":
          setError(
            "No account found with this reset link. Please contact an administrator.",
          );
          break;
        case "auth/weak-password":
          setError("Password is too weak. Please choose a stronger password.");
          break;
        default:
          // eslint-disable-next-line no-console
          console.error("Password reset error:", err);
          setError(
            "An error occurred during password reset. Please try again or contact an administrator.",
          );
          break;
      }
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
      <Flex
        maxWidth="29.6875rem"
        width="80vw"
        padding={["2.375rem", "2.375rem", "2.375rem", "3.875rem 4rem"]}
        borderRadius="6px"
        backgroundColor="gray.50"
        boxShadow="lg"
        gap="2.25rem"
        direction="column"
      >
        <Text m={0} color="gray.600" textStyle="h2" textAlign="center">
          Reset Password
        </Text>
        <Text m={0} color="gray.600" textStyle="body" textAlign="center">
          Please enter a new password, then re-enter to confirm.
        </Text>

        <form
          onSubmit={(e: React.FormEvent) => {
            e.preventDefault();
            handlePasswordReset();
          }}
        >
          <FormControl isInvalid={!!error}>
            <Flex direction="column" gap="1.5rem">
              <Flex direction="column" gap="0.375rem">
                <FormLabel textColor="gray.600" textStyle="bodyMobile" m={0}>
                  Password:
                </FormLabel>
                <Input
                  type="password"
                  placeholder="••••••••••"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </Flex>
              <Flex direction="column" gap="0.375rem">
                <FormLabel textColor="gray.600" textStyle="bodyMobile" m={0}>
                  Confirm New Password:
                </FormLabel>
                <Input
                  type="password"
                  placeholder="••••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handlePasswordReset();
                    }
                  }}
                />
              </Flex>
            </Flex>
            {error && <FormErrorMessage>{error}</FormErrorMessage>}
          </FormControl>

          <Button
            type="submit"
            textStyle="button"
            size="lg"
            width="100%"
            variant="solid"
            color="white"
            bg="blue.700"
            mt="2.25rem"
          >
            Reset
          </Button>
        </form>
      </Flex>
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
