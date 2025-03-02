import React from "react";
import UpdateForm from "../components/crud/UpdateForm";
import MainPageButton from "../components/common/MainPageButton";

const UpdatePage = (): React.ReactElement => {
  return (
    <div style={{ textAlign: "center", width: "25%", margin: "0px auto" }}>
      <h1>Default Page</h1>
      <MainPageButton />
      <UpdateForm />
    </div>
  );
};

export default UpdatePage;
