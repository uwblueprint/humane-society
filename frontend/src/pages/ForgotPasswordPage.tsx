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
import StatusMessage from "../components/common/StatusMessage";
import background from "../assets/images/background.png";
import backgroundMobile from "../assets/images/login_background_phone.png";
import AuthAPIClient from "../APIClients/AuthAPIClient";

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
        const success = await AuthAPIClient.forgotPassword(userEmail);
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
      <Box
        width="100vw"
        maxWidth="500px"
        padding={["36px", "36px", "36px", "60px 64px"]}
        borderRadius="6px"
        backgroundColor="gray.50"
        boxShadow="lg"
        gap="36px"
        display="flex"
        flexDirection="column"
        marginTop="20px"
        marginBottom="20px"
      >
        <Text
          color="gray.600"
          textStyle="h2"
          textAlign="center"
          lineHeight="120%"
          m="0"
        >
          Forgot Password?
        </Text>
        <Text m="0" color="gray.600" textStyle="body">
          Please enter the email address associated with your account to reset
          your password.
        </Text>
        <Flex direction="column" gap="8px">
          <FormLabel textColor="gray.600" fontSize="16px" lineHeight="8px">
            Email:
          </FormLabel>
          <FormControl isInvalid={!validUser}>
            <Input
              placeholder="username@humanesociety.org"
              size="lg"
              borderRadius="md"
              _placeholder={{ color: "gray.400" }}
              borderColor="gray.400"
              onChange={handleInputChange}
              fontSize="16px"
              height="2.4rem"
              py="14.5px"
              px="16px"
              bg="#FFFFFF"
            />
            {!validUser && (
              <FormErrorMessage fontSize="16px">
                Must be a valid humanesociety.org email
              </FormErrorMessage>
            )}
          </FormControl>
          <Button
            textStyle="button"
            size="lg"
            width="100%"
            variant="solid"
            color="white"
            bg="blue.700"
            marginTop="30px"
            onClick={() => handleUserAuth(userEmailId)}
          >
            Send
          </Button>
        </Flex>
        {sentEmail && (
          <StatusMessage message="A password reset link has been sent to your email!" />
        )}
        {sentEmailToUser && (
          <StatusMessage message="You have already sent an email to this user." />
        )}
      </Box>
    </Flex>
  );
};

export default ForgotPasswordPage;
