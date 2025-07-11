import React from "react";
import { Flex, Text } from "@chakra-ui/react";
import MainPageButton from "../components/common/MainPageButton";

const TaskManagementPage = (): React.ReactElement => {
  return (
    <Flex direction="column" align="center" margin="0 auto">
      <Text textStyle="h1" color="gray.700" m={0}>
        Task Management Page
      </Text>
      <MainPageButton />
    </Flex>
  );
};

export default TaskManagementPage;
