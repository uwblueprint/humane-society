import React, { useState } from "react";
import { Text, Button, FormControl, Flex, FormLabel, BoxProps } from "@chakra-ui/react";

import Input from "../components/common/Input";
import background from "../assets/images/background.png";
import backgroundMobile from "../assets/images/login_background_phone.png";
import AuthAPIClient from "../APIClients/AuthAPIClient";
import AuthContainer from "../components/auth/AuthContainer";

type SentEmail = {
  email: string;
  timestamp: number;
};

const ForgotPasswordPage = (): React.ReactElement => {
  const [validUser, setValidUser] = useState(true);
  const [sentEmail, setSentEmail] = useState(false);
  const [sentEmailToUser, setSentEmailToUser] = useState(false);
  const [userEmailId, setUserEmaild] = useState("");

  const handleUserAuth = async (userEmail: string) => {
    const emailPattern = /^[^\s@]+@(humanesociety\.org|uwblueprint\.org)$/;
    const expiryTime = 60 * 1000; // 60 seconds
    const now = new Date().getTime();

    // Load and filter sent emails to keep only unexpired entries
    let sentEmails: SentEmail[] = JSON.parse(
      localStorage.getItem("sentEmails") || "[]",
    );
    sentEmails = sentEmails.filter((item) => now - item.timestamp < expiryTime);
    localStorage.setItem("sentEmails", JSON.stringify(sentEmails)); // Save cleaned list

    if (!emailPattern.test(userEmail)) {
      setValidUser(false);
    } else if (
      sentEmails.some((item) => item.email === userEmail) ||
      sentEmail
    ) {
      // already sent to this user in the last 60s
      setValidUser(true);
      setSentEmail(false);
      setSentEmailToUser(true);
    } else {
      // Proceed to send email
      setValidUser(true);

      try {
        const success = await AuthAPIClient.sendPasswordResetEmail(userEmail);
        if (success) {
          setSentEmail(true);

          // Add new email to localStorage with timestamp
          const newEmail: SentEmail = {
            email: userEmail,
            timestamp: now,
          };
          sentEmails.push(newEmail);
          localStorage.setItem("sentEmails", JSON.stringify(sentEmails));

          // Optionally, reset the "already sent" message after timeout
          setTimeout(() => {
            let updatedSentEmails: SentEmail[] = JSON.parse(
              localStorage.getItem("sentEmails") || "[]",
            );
            updatedSentEmails = updatedSentEmails.filter(
              (item: SentEmail) =>
                item.email !== userEmail || now - item.timestamp < expiryTime,
            );
            localStorage.setItem(
              "sentEmails",
              JSON.stringify(updatedSentEmails),
            );
            setSentEmailToUser(false);
          }, expiryTime);
        } else {
          setValidUser(false);
        }
      } catch (error) {
        setValidUser(false);
      }
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValidUser(true);
    setSentEmail(false);
    setSentEmailToUser(false);
    setUserEmaild(e.target.value);
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
      <AuthContainer>
        <Text
          color="gray.600"
          textStyle="h2"
          textAlign="center"
          m={0}
        >
          Forgot Password?
        </Text>
        <Text m={0} color="gray.600" textStyle="body">
          Please enter the email address associated with your account to reset
          your password.
        </Text>
        <Flex direction="column" gap="0.375rem">
          <FormControl isInvalid={!validUser}>
            <FormLabel textColor="gray.600" textStyle="bodyMobile" m={0}>
              Email:
            </FormLabel>
            <Input
              placeholder="username@humanesociety.org"
              value={userEmailId}
              onChange={handleInputChange}
            />
          {/* TODO: Deprecate incorrect error message */}
          {!validUser && (
            <Text textStyle="bodyMobile" color="red.500" m={0} mt="0.25rem">
              Must be a valid humanesociety.org email
            </Text>
          )}
          </FormControl>
        </Flex>
        <Button
          textStyle="button"
          size="lg"
          width="100%"
          variant="solid"
          color="white"
          bg="blue.700"
          marginTop="1.875rem"
          onClick={() => handleUserAuth(userEmailId)}
          m={0}
        >
          Send
        </Button>
        
        {/* TODO: proper error handling + success message */}
        {sentEmail && (
          <Text textStyle="caption" color="blue.700" textAlign="center">
            A password reset link has been sent to your email!
          </Text>
        )}
        {sentEmailToUser && (
          <Text textStyle="caption" color="blue.700" textAlign="center">
            You have already sent an email to this user.{" "}
          </Text>
        )}
      </AuthContainer>
    </Flex>
  );
};

export default ForgotPasswordPage;
