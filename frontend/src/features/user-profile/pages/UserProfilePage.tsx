import React, { useEffect, useState, useContext } from "react";
import { useParams, useHistory } from "react-router-dom";
import { Flex } from "@chakra-ui/react";
import NavBar from "../../../components/common/navbar/NavBar";
import { User } from "../../../types/UserTypes";
import UserAPIClient from "../../../APIClients/UserAPIClient";
import UserProfileSidebar from "../components/UserProfileSidebar";
import CalendarDateSelector from "../components/CalendarDateSelector";
import AuthContext from  "../../../contexts/AuthContext";
import UserRoles from "../../../constants/UserConstants";

const ProfilePage = (): React.ReactElement => {
  const params = useParams<{ id: string }>();
  const userId = Number(params.id);
  const [userData, setUserData] = useState<User | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const history = useHistory();
  const { authenticatedUser } = useContext(AuthContext);

  useEffect(() => {
    const fetchUser = async () => {
      if (!userId) {
        // console.error(`Invalid userid ${params.id}`);
        history.push("/not-found");
      } else {
        try {
          const data = await UserAPIClient.get(Number(userId));

          const isAdmin = authenticatedUser?.role === UserRoles.ADMIN;
          const isOwnPage = authenticatedUser?.id === userId;

          if (!isAdmin && !isOwnPage) {
            history.push("/not-found");
            return;
          }

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
          <Flex
            backgroundColor="gray.100"
            flex="1"
            paddingTop="8.5rem"
            paddingInline="2rem"
            direction="column"
          >
            <CalendarDateSelector
              selectedDate={selectedDate}
              onChange={setSelectedDate}
            />
          </Flex>
        </Flex>
      )}
    </>
  );
};

export default ProfilePage;
