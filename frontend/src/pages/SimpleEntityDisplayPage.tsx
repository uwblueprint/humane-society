import React from "react";
import SimpleEntityDisplayTableContainer from "../components/crud/SimpleEntityDisplayTableContainer";
import MainPageButton from "../components/common/MainPageButton";

const GetSimpleEntitiesPage = (): React.ReactElement => {
  return (
    <div style={{ textAlign: "center", width: "25%", margin: "0px auto" }}>
      <h1>Default Page</h1>
      <MainPageButton />
      <SimpleEntityDisplayTableContainer />
    </div>
  );
};

export default GetSimpleEntitiesPage;
