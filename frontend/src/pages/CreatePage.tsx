import React from "react";
import CreateForm from "../components/crud/CreateForm";
import MainPageButton from "../components/common/MainPageButton";

const CreatePage = (): React.ReactElement => {
  return (
    <div style={{ textAlign: "center", width: "25%", margin: "0px auto" }}>
      <h1>Default Page</h1>
      <MainPageButton />
      <CreateForm />
    </div>
  );
};

export default CreatePage;
