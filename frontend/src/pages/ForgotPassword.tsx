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
import StatusMessage from "../components/common/StatusMessage";
import background from "./login_background.png";
import backgroundMobile from "./login_background_phone.png";

type SentEmail = {
  email: string;
  timestamp: number;
};

const ForgotPassword = (): React.ReactElement => {
  const [validUser, setValidUser] = useState(true);
  const [sentEmail, setSentEmail] = useState(false);
  const [sentEmailToUser, setSentEmailToUser] = useState(false);
  const [userEmailId, setUserEmaild] = useState("");

  const handleUserAuth = (userEmail: string) => {
    const emailPattern = /^[^\s@]+@(humanesociety\.org|uwblueprint\.org)$/;
    // added uwblueprint for test
    const sentEmails: SentEmail[] = JSON.parse(
      localStorage.getItem("sentEmails") || "[]",
    );
    if (!emailPattern.test(userEmail)) {
      setValidUser(false);
    } else if (sentEmails.some((item) => item.email === userEmail)) {
      setValidUser(true);
      setSentEmail(false);
      setSentEmailToUser(true);
    } else {
      // make API call to check if user exists
      setValidUser(true);
      setSentEmail(true);
      // send email logic
      const newEmail: SentEmail = {
        email: userEmail,
        timestamp: new Date().getTime(),
      };
      sentEmails.push(newEmail);
      localStorage.setItem("sentEmails", JSON.stringify(sentEmails));
      setTimeout(() => {
        const updatedSentEmails: SentEmail[] = JSON.parse(
          localStorage.getItem("sentEmails") || "[]",
        );
        const filteredEmails = updatedSentEmails.filter(
          (item: SentEmail) => item.email !== userEmail,
        );
        localStorage.setItem("sentEmails", JSON.stringify(filteredEmails));
        setSentEmailToUser(false);
      }, 60000);
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
          Forgot Password?
        </Text>
        <Text py="36px" color="#4A5568" textStyle="body" textAlign="center">
          Please enter the email address associated with your account to reset
          your password.
        </Text>
        <Box>
          <Text color="#4A5568" textStyle="body">
            Email:
          </Text>
          <FormControl isInvalid={!validUser}>
            <Input
              placeholder="username@humanesociety.org"
              size="lg"
              borderRadius="md"
              borderColor="gray.400"
              onChange={handleInputChange}
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
        </Box>
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

export default ForgotPassword;
