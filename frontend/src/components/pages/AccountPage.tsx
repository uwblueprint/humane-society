import React from "react";
import { Text } from "@chakra-ui/react";
import { useHistory } from "react-router-dom";
import NavBar from "../common/navbar/NavBar";
import { PROFILE_PAGE } from "../../constants/Routes";

const AccountPage = (): React.ReactElement => {
  const history = useHistory();
  const navigateTo = () => history.push(PROFILE_PAGE);
  return (
    <div style={{ textAlign: "center" }}>
      <NavBar pageName="Profile" />
      <Text textStyle="h3" mt={{ base: "6.375rem", md: "9.375rem" }}>
        Account Page ⚙️
      </Text>
      <button
        onClick={navigateTo}
        className="btn btn-primary"
        type="button"
        style={{ textAlign: "center" }}
      >
        My profile
      </button>
    </div>
  );
};

export default AccountPage;
