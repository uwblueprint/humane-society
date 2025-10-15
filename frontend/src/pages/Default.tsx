import React, { useContext } from "react";
import { useHistory } from "react-router-dom";
import * as Routes from "../constants/Routes";
import SampleContext from "../contexts/SampleContext";

import Logout from "../components/auth/Logout";
import RefreshCredentials from "../components/auth/RefreshCredentials";
import DefaultResetPassword from "../components/auth/DefaultResetPassword";

type ButtonProps = { text: string; path: string };

const Button = ({ text, path }: ButtonProps) => {
  const history = useHistory();
  const navigateTo = () => history.push(path);
  return (
    <button className="btn btn-primary" onClick={navigateTo} type="button">
      {text}
    </button>
  );
};

const TeamInfoDisplay = () => {
  const { teamName, numTerms, members, isActive } = useContext(SampleContext);
  return (
    <div>
      <h2>Team Info</h2>
      <div>Name: {teamName}</div>
      <div># terms: {numTerms}</div>
      <div>
        Members:{" "}
        {members.map(
          (name, i) => ` ${name}${i === members.length - 1 ? "" : ","}`,
        )}
      </div>
      <div>Active: {isActive ? "Yes" : "No"}</div>
    </div>
  );
};

const Default = (): React.ReactElement => {
  return (
    <div style={{ textAlign: "center", paddingTop: "1.25rem" }}>
      <h1>Default Page</h1>
      <div className="btn-group" style={{ paddingRight: "0.625rem" }}>
        <Logout />
        <RefreshCredentials />
        <DefaultResetPassword />
        <Button text="Create Entity" path={Routes.CREATE_ENTITY_PAGE} />
        <Button text="Update Entity" path={Routes.UPDATE_ENTITY_PAGE} />
        <Button text="Display Entities" path={Routes.DISPLAY_ENTITY_PAGE} />
        <Button
          text="Create Simple Entity"
          path={Routes.CREATE_SIMPLE_ENTITY_PAGE}
        />
        <Button
          text="Update Simple Entity"
          path={Routes.UPDATE_SIMPLE_ENTITY_PAGE}
        />
        <Button
          text="Display Simple Entities"
          path={Routes.DISPLAY_SIMPLE_ENTITY_PAGE}
        />
        <Button text="Edit Team" path={Routes.EDIT_TEAM_PAGE} />
        <Button text="Hooks Demo" path={Routes.HOOKS_PAGE} />
        <Button
          text="Dev File Storage Upload"
          path={Routes.DEV_FILE_STORAGE_UPLOAD_PAGE}
        />
      </div>

      <div style={{ height: "2rem" }} />

      <TeamInfoDisplay />
    </div>
  );
};

export default Default;
