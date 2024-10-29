import React from "react";
import { Text } from "@chakra-ui/react";
import NavBar from "../common/navbar/NavBar";

const ProfilePage = (): React.ReactElement => {
  return (
    <div style={{ textAlign: "center" }}>
<<<<<<< HEAD
      <NavBar pageName="Profile Page" />
      <Text textStyle="h1" mt={{ base: "6.375rem", md: "9.375rem" }}>
=======
      <NavBar pageName="Profile" />
      <Text textStyle="h3" mt={{ base: "6.375rem", md: "9.375rem" }}>
>>>>>>> 1c1f7bdd5368529f08a8a8e40e0d83abacb091af
        Profile Page 🫨
      </Text>
    </div>
  );
};

export default ProfilePage;
