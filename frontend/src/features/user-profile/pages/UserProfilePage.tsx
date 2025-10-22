import React, { useEffect, useState } from "react";
import { useParams, useHistory } from "react-router-dom";
import { Flex } from "@chakra-ui/react";
import NavBar from "../../../components/common/navbar/NavBar";
import { User } from "../../../types/UserTypes";
import UserAPIClient from "../../../APIClients/UserAPIClient";
import UserProfileSidebar from "../components/UserProfileSidebar";

const ProfilePage = (): React.ReactElement => {
  const params = useParams<{ id: string }>();
  const userId = Number(params.id);
  const [userData, setUserData] = useState<User | null>(null);
  const history = useHistory();

  useEffect(() => {
    const fetchUser = async () => {
      if (!userId) {
        // console.error(`Invalid userid ${params.id}`);
        history.push("/not-found");
      } else {
        try {
          const data = await UserAPIClient.get(Number(userId));
          setUserData(data);
        } catch (error) {
          // console.error(`Failed to fetch user ${userId}:`, error);
          history.push("/not-found");
        }
      }
    };
    fetchUser();
  }, [userId, history, params]);

  return (
    <>
      <NavBar pageName="User Profile" />
      {/* Only load the page once the data is loaded */}
      {userData && (
        <Flex flex="1">
          <UserProfileSidebar
            id={userData.id}
            firstName={userData.firstName}
            lastName={userData.lastName}
            profilePhoto={userData.profilePhoto}
            email={userData.email}
            phoneNumber={userData.phoneNumber}
            role={userData.role}
            status={userData.status}
            colorLevel={userData.colorLevel}
            animalTags={userData.animalTags}
          />
          <Flex backgroundColor="gray.100" flex="1" paddingTop="8.5rem" />
        </Flex>
      )}
    </>
  );
};

export default ProfilePage;
