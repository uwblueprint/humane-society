import React from "react";
import {
  Input,
  InputGroup,
  InputRightElement,
  IconButton,
  Heading,
  Button,
  Center,
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
    <Center style = {{width: "100%", height: "100vh", backgroundSize: "cover", backgroundImage: "url('/images/paw_prints_bg.png')"}} >
      <div style={{ textAlign: "center", width: "25%", margin: "0px auto"}} > 
        <Heading>Welcome!</Heading> 
        <Input placeholder="Basic usage" />
        <InputGroup size="md">
          <Input
            pr="2rem"
            type={showCreatePassword ? "text" : "password"}
            placeholder="Enter password"
          />
          <InputRightElement width="2rem">
            {showCreatePassword ? (
              <IconButton 
                isRound
                bg="transparent"
                onClick={handleCreatePasswordClick}
                aria-label="view"
                icon={<ViewIcon />}
              />
            ) : (
              <IconButton 
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
            placeholder="Enter password"
          />
          <InputRightElement width="2rem">
            {showConfirmPassword ? (
              <IconButton
                isRound
                bg = "transparent"
                onClick={handleConfirmPasswordClick}
                aria-label="view"
                icon={<ViewIcon />}
              />
            ) : (
              <IconButton
                isRound
                bg = "transparent"
                onClick={handleConfirmPasswordClick}
                aria-label="hide"
                icon={<ViewOffIcon />}
              />
            )}
          </InputRightElement>
        </InputGroup>
        <Button colorScheme='blue'>Create Account</Button>
      </div>
    </Center>
  );
};

export default CreatePasswordPage;
