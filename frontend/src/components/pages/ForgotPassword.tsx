import React, { useState } from "react";
import {
  Box,
  Heading,
  Input,
  Text,
  Button,
  FormControl,
  FormErrorMessage,
} from "@chakra-ui/react";
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
    const emailPattern = /^[^\s@]+@humanesociety\.org$/;
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
    <Box
      // height="100vh"
      backgroundImage={[
        `url(${backgroundMobile})`,
        `url(${backgroundMobile})`,
        `url(${background})`,
        `url(${background})`,
      ]}
      backgroundPosition="center"
      backgroundRepeat="no-repeat"
      backgroundSize="cover"
      backgroundColor="blue.700"
      display="flex"
      justifyContent="center"
      alignItems="center"
      overflowX="hidden"
    >
      <Box
        maxWidth="100vw"
        width={["90vw", "90vw", "90vw", "40vw", "30vw"]}
        height={["20vw", "40px", "20vw", "28vw"]}
        padding={["36px", "36px", "36px", "60px 64px"]}
        borderRadius="6px"
        backgroundColor="var(--gray-50, #F7FAFC)"
        boxShadow="lg"
        display="flex"
        flexDirection="column"
        minHeight="fit-content"
      >
        <Heading
          color="#4A5568"
          textAlign="center"
          fontFamily="Poppins"
          fontSize="28px"
          fontStyle="normal"
          fontWeight="900"
          lineHeight="120%"
        >
          Forgot Password?
        </Heading>
        <Text
          py="36px"
          color="#4A5568"
          textAlign="center"
          fontFamily="Roboto"
          fontSize="18px"
          fontWeight="400"
          lineHeight="150%"
        >
          Please enter the email address associated with your account to reset
          your password.
        </Text>
        <Box>
          <Text
            color="#4A5568"
            fontFamily="Roboto"
            fontSize="18px"
            fontWeight="400"
            lineHeight="150%"
          >
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
              <FormErrorMessage fontSize="18px">
                Please enter a valid email.
              </FormErrorMessage>
            )}
          </FormControl>
        </Box>
        <Button
          size="lg"
          variant="solid"
          color="white"
          bg="blue.700"
          marginTop="30px"
          onClick={() => handleUserAuth(userEmailId)}
        >
          Send
        </Button>
        {sentEmail && (
          <Text
            color="blue.700"
            textAlign="center"
            fontFamily="Roboto"
            fontSize="16px"
            fontWeight="400"
            fontStyle="normal"
            lineHeight="120%"
            marginTop="16px"
          >
            A password reset link has been sent to your email!
          </Text>
        )}
        {sentEmailToUser && (
          <Text
            color="blue.700"
            textAlign="center"
            fontFamily="Roboto"
            fontSize="16px"
            fontWeight="400"
            fontStyle="normal"
            lineHeight="120%"
            marginTop="16px"
          >
            You have already sent an email to this user.
          </Text>
        )}
      </Box>
    </Box>
  );
};

export default ForgotPassword;
