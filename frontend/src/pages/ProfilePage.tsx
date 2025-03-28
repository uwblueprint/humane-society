import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Text } from "@chakra-ui/react";
import NavBar from "../components/common/navbar/NavBar";
import Logout from "../components/auth/Logout";
import { User } from "../types/UserTypes";
import UserAPIClient from "../APIClients/UserAPIClient";

const ProfilePage = (): React.ReactElement => {
  const params = useParams<{ id: string }>();
  const userId = Number(params.id);
  const [userData, setUserData] = useState<User | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      if (!userId) console.error(`Invalid userid ${params.id}`)
      else {
        try {
          const data = await UserAPIClient.get(Number(userId));
          setUserData(data);
        } catch (error) {
          console.error(`Failed to fetch user ${userId}:`, error)
        }
      }
    };
    fetchUser();
  }, [userId]);

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
