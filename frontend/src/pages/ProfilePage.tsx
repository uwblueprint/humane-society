import React, { useEffect, useState } from "react";
import { useParams, useHistory } from "react-router-dom";
import { Text } from "@chakra-ui/react";
import NavBar from "../components/common/navbar/NavBar";
import Logout from "../components/auth/Logout";
import { User } from "../types/UserTypes";
import UserAPIClient from "../APIClients/UserAPIClient";

const ProfilePage = (): React.ReactElement => {
  const params = useParams<{ id: string }>();
  const userId = Number(params.id);
  const [userData, setUserData] = useState<User | null>(null);
  const history = useHistory();

  useEffect(() => {
    const fetchUser = async () => {
      if (!userId) {
        console.error(`Invalid userid ${params.id}`);
        history.push("/not-found");
      } else {
        try {
          const data = await UserAPIClient.get(Number(userId));
          setUserData(data);
        } catch (error) {
          console.error(`Failed to fetch user ${userId}:`, error);
          history.push("/not-found");
        }
      }
    };
    fetchUser();
  }, [userId, history, params]);

  return (
    <div style={{ textAlign: "center" }}>
      <NavBar pageName="Profile" />
      <Text textStyle="h3" mt={{ base: "6.375rem", md: "9.375rem" }}>
        Profile Page 🫨
      </Text>
      <Text>
        userData:
        {JSON.stringify(userData)}
      </Text>
      <Logout />
    </div>
  );
};

export default ProfilePage;
