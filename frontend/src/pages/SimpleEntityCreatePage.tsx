import React from "react";
import SimpleEntityCreateForm from "../components/crud/SimpleEntityCreateForm";
import MainPageButton from "../components/common/MainPageButton";

const SimpleEntityCreatePage = (): React.ReactElement => {
  return (
    <div style={{ textAlign: "center", width: "25%", margin: "0px auto" }}>
      <h1>Default Page</h1>
      <MainPageButton />
      <SimpleEntityCreateForm />
    </div>
  );
};

export default SimpleEntityCreatePage;
