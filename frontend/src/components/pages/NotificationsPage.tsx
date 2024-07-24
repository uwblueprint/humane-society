import React from "react";
import { Text } from "@chakra-ui/react";
import NavBar from "../common/navbar/NavBar";

const NotificationsPage = (): React.ReactElement => {
  return (
    <div style={{ textAlign: "center" }}>
      <NavBar pageName="Profile Page" />
      <Text textStyle="h1" mt={{ base: "6.375rem", md: "9.375rem" }}>
        Notifications Page 🫨
      </Text>
    </div>
  );
};

export default NotificationsPage;
