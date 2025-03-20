import React from "react";
import SearchFilterExample from "../components/common/SearchFilterExample";

const GetPage = (): React.ReactElement => {
  return (
    <div style={{ textAlign: "center", width: "100%", margin: "0px auto" }}>
      <h1>Pets</h1>
      <SearchFilterExample />
    </div>
  );
};

export default GetPage;
