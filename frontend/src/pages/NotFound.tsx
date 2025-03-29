import React from "react";
import { Text, VStack, Button } from "@chakra-ui/react";
import { useHistory } from "react-router-dom";
import ResponsiveLogo from "../components/common/responsive/ResponsiveLogo";
import { HOME_PAGE } from "../constants/Routes";

const NotFound = (): React.ReactElement => {
  const history = useHistory();

  const handleClick = () => {
    history.push(HOME_PAGE);
  };
  return (
    <VStack height="100%" gap="2.75rem" justifyContent="center">
      <ResponsiveLogo />
      <Text
        textStyle="h1"
        color="blue.700"
        m={0}
        width="27.5rem"
        textAlign="center"
      >
        Oops! It’s been a ruff day for this page.
      </Text>
      <Text
        textStyle="body"
        color="gray.600"
        m={0}
        width="27.5rem"
        textAlign="center"
      >
        This page has gone on an unexpected cat nap and can not be found.
      </Text>
      <Button
        onClick={handleClick}
        width="15.4375rem"
        height="2.5rem"
        padding="0rem 1.1875rem"
        bg="blue.700"
      >
        <Text textStyle="button" color="gray.100" m={0}>
          Back to Pet List
        </Text>
      </Button>
    </VStack>
  );
};

export default NotFound;
