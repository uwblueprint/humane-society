import React from "react";
import { Flex, Text } from "@chakra-ui/react";
import DisplayTableContainer from "../components/crud/DisplayTableContainer";
import MainPageButton from "../components/common/MainPageButton";

const GetPage = (): React.ReactElement => {
  return (
    <Flex direction="column" align="center" w="25%" margin="0 auto">
      <Text textStyle="h1" color="gray.700" m={0}>
        Default Page
      </Text>
      <MainPageButton />
      <DisplayTableContainer />
    </Flex>
  );
};

export default GetPage;
