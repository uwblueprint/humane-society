/* eslint  react/jsx-props-no-spreading: 0 */ // --> OFF
import { Flex, Spinner } from "@chakra-ui/react";
import React, { useContext, useEffect, useState } from "react";
import {
  Route,
  Switch,
  useHistory,
  useParams,
  useRouteMatch,
} from "react-router-dom";
import NavBar from "../../../components/common/navbar/NavBar";
import PetAPIClient from "../../../APIClients/PetAPIClient";
import { Pet } from "../../../types/PetTypes";
import { colorLevelMap } from "../../../types/TaskTypes";
import UserRoles from "../../../constants/UserConstants";
import * as AuthConstants from "../../../constants/AuthConstants";
import AuthContext from "../../../contexts/AuthContext";
import PrivateRoute from "../../../components/auth/PrivateRoute";
import PetProfileSidebar from "../components/PetProfileSidebar";
import AddTaskForm from "./AddTaskForm";
import Button from "../../../components/common/Button";

const PetProfilePage = (): React.ReactElement => {
  const params = useParams<{ id: string }>();
  const petId = Number(params.id);
  const { path, url } = useRouteMatch();
  const history = useHistory();
  const { authenticatedUser } = useContext(AuthContext);
  const isDefaultTaskView = useRouteMatch({ path, exact: true });

  const canAddTask =
    authenticatedUser?.role === UserRoles.ADMIN ||
    authenticatedUser?.role === UserRoles.BEHAVIOURIST;

  const [petData, setPetData] = useState<Pet | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPet = async () => {
      if (!petId) {
        history.push("/not-found");
        return;
      }
      try {
        const data = await PetAPIClient.getPet(petId);
        setPetData(data);
      } catch (error) {
        history.push("/not-found");
      } finally {
        setLoading(false);
      }
    };
    fetchPet();
  }, [petId, history]);

  if (loading || !petData) {
    return (
      <Flex
        width="100%"
        height="100vh"
        alignItems="center"
        justifyContent="center"
      >
        <Spinner size="xl" />
      </Flex>
    );
  }

  // Map numeric colorLevel to ColorLevel enum for sidebar props
  const sidebarProps = {
    ...petData,
    colorLevel: colorLevelMap[petData.colorLevel],
  };

  return (
    <>
      <NavBar pageName="Pet Profile" />
      <Flex flex="1">
        <PetProfileSidebar {...sidebarProps} />
        <Flex
          backgroundColor={isDefaultTaskView ? "gray.100" : "gray.50"}
          flex="1"
          paddingTop="8.5rem"
          paddingX="2rem"
          flexDirection="column"
        >
          <Switch>
            <Route exact path={path}>
              <Flex flexDirection="column">
                {canAddTask && (
                  <Button
                    variant="dark-blue"
                    onClick={() => history.push(`${url}/add-task`)}
                  >
                    Add Task
                  </Button>
                )}
              </Flex>
            </Route>
            <PrivateRoute
              path={`${path}/add-task`}
              component={() => (
                <AddTaskForm petId={petData.id} petName={petData.name} />
              )}
              allowedRoles={AuthConstants.ADMIN_AND_BEHAVIOURISTS}
              exact
            />
          </Switch>
        </Flex>
      </Flex>
    </>
  );
};

export default PetProfilePage;
