import React from "react";
import SimpleEntityUpdateForm from "../components/crud/SimpleEntityUpdateForm";
import MainPageButton from "../components/common/MainPageButton";

const SimpleEntityUpdatePage = (): React.ReactElement => {
  return (
    <div style={{ textAlign: "center", width: "25%", margin: "0px auto" }}>
      <h1>Default Page</h1>
      <MainPageButton />
      <SimpleEntityUpdateForm />
    </div>
  );
};

export default SimpleEntityUpdatePage;
