import React from "react";
import { Flex, Text } from "@chakra-ui/react";
import CreateForm from "../components/crud/CreateForm";
import MainPageButton from "../components/common/MainPageButton";

const CreatePage = (): React.ReactElement => {
  return (
    <Flex direction="column" align="center" w="25%" margin="0 auto">
      <Text textStyle="h1" color="gray.700" m={0}>
        Default Page
      </Text>
      <MainPageButton />
      <CreateForm />
    </Flex>
  );
};

export default CreatePage;
