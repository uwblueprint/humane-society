import React from "react";
import {
  Input,
  InputGroup,
  InputRightElement,
  IconButton,
  Heading,
  Button,
  Center,
  Stack,
  Flex,
  Image,
  Box,
} from "@chakra-ui/react";
import { ViewIcon, ViewOffIcon } from "@chakra-ui/icons"; 

const CreatePasswordPage = (): React.ReactElement => {
  const [showCreatePassword, setShowCreatePassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);
  const handleCreatePasswordClick = () =>
    setShowCreatePassword(!showCreatePassword);
  const handleConfirmPasswordClick = () =>
    setShowConfirmPassword(!showConfirmPassword);

  return (
    <Box width="100vw" height="100vh" position="relative">
      <Center width="100%" height="100%" style = {{backgroundSize: "cover", backgroundImage: "url('/images/paw_prints_bg.png')"}} >
        <Flex direction="column" justify="center" align="center" gap="8.125rem">
          <Flex direction="column" justify="center" align="center" gap="2.1875rem">
            <Center w="27.29081rem" h="13.9375rem" bg="#2C5282" borderRadius="2.6875rem">
              <Image src = "/images/humane_society_logo_text.png" alt = "Humane Society Logo" width="23.20138rem" height="12.01794rem" objectFit="cover" />
            </Center>
            <Heading color= "#4A5568" fontFamily="Poppins">Welcome!</Heading>
            <Stack spacing="1.625rem" width="100%">
              <Input placeholder="admin@humanesociety.org" bg="#FFFFFF"/>
              <InputGroup size="md">
                <Input
                  pr="2rem"
                  type={showCreatePassword ? "text" : "password"}
                  placeholder="Enter password"
                  bg="#FFFFFF"
                />
                <InputRightElement width="2rem">
                  {showCreatePassword ? (
                    <IconButton
                      variant="unstyled"
                      isRound
                      bg="transparent"
                      onClick={handleCreatePasswordClick}
                      aria-label="view"
                      icon={<ViewIcon />}
                    />
                  ) : (
                    <IconButton
                      variant="unstyled"
                      isRound
                      bg="transparent"
                      onClick={handleCreatePasswordClick}
                      aria-label="hide"
                      icon={<ViewOffIcon />}
                    />
                  )}
                </InputRightElement>
              </InputGroup>
              <InputGroup size="md">
                <Input
                  pr="2rem"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm password"
                  bg="#FFFFFF"
                />
                <InputRightElement width="2rem">
                  {showConfirmPassword ? (
                    <IconButton
                      variant="unstyled"
                      isRound
                      bg="transparent"
                      onClick={handleConfirmPasswordClick}
                      aria-label="view"
                      icon={<ViewIcon />}
                    />
                  ) : (
                    <IconButton
                      variant="unstyled"
                      isRound
                      bg="transparent"
                      onClick={handleConfirmPasswordClick}
                      aria-label="hide"
                      icon={<ViewOffIcon />}
                    />
                  )}
                </InputRightElement>
              </InputGroup>
            </Stack>
          </Flex>
          <Button colorScheme='blue' w="27.25rem" h="3.0625rem" bg="var(--blue-700, #2C5282)">Create Account</Button>
        </Flex>
      </Center> 
    </Box>
  );
};

export default CreatePasswordPage;