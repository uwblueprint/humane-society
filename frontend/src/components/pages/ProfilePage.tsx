import React from "react";
import { Text } from "@chakra-ui/react";
import { useHistory } from "react-router-dom";
import NavBar from "../common/navbar/NavBar";
import { ACCOUNT_PAGE } from "../../constants/Routes";

const ProfilePage = (): React.ReactElement => {
  const history = useHistory();
  const navigateTo = () => history.push(ACCOUNT_PAGE);
  return (
    <div style={{ textAlign: "center" }}>
      <NavBar pageName="Profile" />
      <Text textStyle="h3" mt={{ base: "6.375rem", md: "9.375rem" }}>
        Profile Page 🫨
      </Text>
      <button
        onClick={navigateTo}
        className="btn btn-primary"
        type="button"
        style={{ textAlign: "center" }}
      >
        My Account
      </button>
    </div>
  );
};

export default ProfilePage;
