import React, { useState } from "react";
import {
  Box,
  Input,
  Text,
  Button,
  FormControl,
  FormErrorMessage,
  Flex,
} from "@chakra-ui/react";
import { useHistory, useLocation } from "react-router-dom";
import { getAuth, confirmPasswordReset } from "firebase/auth";
import background from "../assets/images/background.png";
import backgroundMobile from "../assets/images/login_background_phone.png";
import StatusMessage from "../components/common/StatusMessage";

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

    if (!oobCode) {
      setError("Missing reset code. Please use the link from your email.");
      return;
    }

    try {
      const auth = getAuth();
      await confirmPasswordReset(auth, oobCode, newPassword);
      setSuccess(true);
      setTimeout(() => history.push("/"), 2000);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError(
          "Failed to reset password. The link may be expired or already used.",
        );
      }
    }
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
        width={["90vw", "50vw", "50vw", "40vw", "30vw"]}
        padding={["36px", "36px", "36px", "60px 64px"]}
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
          Reset Your Password
        </Text>
        <Text py="24px" color="#4A5568" textStyle="body" textAlign="center">
          Enter a new password to complete the reset process.
        </Text>

        <FormControl isInvalid={!!error}>
          <Input
            type="password"
            placeholder="New Password"
            size="lg"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            marginBottom="1rem"
          />
          <Input
            type="password"
            placeholder="Confirm New Password"
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
          Reset Password
        </Button>

        {success && (
          <StatusMessage message="Password updated successfully! Redirecting..." />
        )}
      </Box>
    </Flex>
  );
};

export default ResetPasswordPage;
