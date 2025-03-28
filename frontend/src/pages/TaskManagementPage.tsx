import React from "react";
import MainPageButton from "../components/common/MainPageButton";

const TaskManagementPage = (): React.ReactElement => {
  return (
    <div style={{ textAlign: "center", width: "25%", margin: "0px auto" }}>
      <h1>Task Management Page</h1>
      <MainPageButton />
    </div>
  );
};

export default TaskManagementPage;
