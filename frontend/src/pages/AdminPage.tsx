import React from "react";
import { Flex, Text } from "@chakra-ui/react";
import MainPageButton from "../components/common/MainPageButton";

const AdminPage = (): React.ReactElement => {
  return (
    <Flex direction="column" align="center" width="100%" margin="0 auto" py={8}>
      <Text textStyle="h1" color="gray.700" mb={6}>
        Admin Page
      </Text>
      <MainPageButton />
    </Flex>
  );
};

export default AdminPage;
