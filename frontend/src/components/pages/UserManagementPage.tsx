import React from "react";
import MainPageButton from "../common/MainPageButton";

const UserManagementPage = (): React.ReactElement => {
  return (
    <div style={{ textAlign: "center", width: "25%", margin: "0px auto" }}>
      <h1>User Management</h1>
      <MainPageButton />
    </div>
  );
};

export default UserManagementPage;
