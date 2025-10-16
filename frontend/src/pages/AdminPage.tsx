import React from "react";
import { Flex, Text } from "@chakra-ui/react";
import MainPageButton from "../components/common/MainPageButton";

const AdminPage = (): React.ReactElement => {
  return (
    <Flex direction="column" align="center" w="25%" margin="0 auto">
      <Text textStyle="h1" color="gray.700" m={0}>
        Admin Page
      </Text>
      <MainPageButton />
    </Flex>
  );
};

export default AdminPage;
