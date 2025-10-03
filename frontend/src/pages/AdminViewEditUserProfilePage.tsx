import React, { useEffect, useMemo, useState } from "react";
import { Flex, Text, useToast } from "@chakra-ui/react";
import { useForm, Controller } from "react-hook-form";
import { ChevronLeftIcon } from "@chakra-ui/icons";
import { useParams, useHistory } from "react-router-dom";
import Input from "../components/common/Input";
import SingleSelect from "../components/common/SingleSelect";
import MultiSelect from "../components/common/MultiSelect";
import Button from "../components/common/Button";
import UserAPIClient from "../APIClients/UserAPIClient";
import UserRoles from "../constants/UserConstants";
import { AnimalTag } from "../types/TaskTypes";
import ColourStarIcon from "../components/common/ColourStarIcon";
import NavBar from "../components/common/navbar/NavBar";

interface FormData {
  firstName: string;
  lastName: string;
  phoneNumber: string;
  email: string;
  role: UserRoles;
  colourLevel: string;
  animalTag: AnimalTag[];
}

const AdminViewEditUserProfilePage = (): React.ReactElement => {
  const { userId } = useParams<{ userId: string }>();
  const history = useHistory();
  const toast = useToast();
  const [loading, setLoading] = useState(true);

  const colourLevelMap = useMemo<Record<number, string>>(
    () => ({
      1: "Green",
      2: "Yellow",
      3: "Orange",
      4: "Red",
      5: "Blue",
    }),
    [],
  );

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>();

  useEffect(() => {
    const fetchUser = async () => {
      if (!userId) return;

      try {
        const userData = await UserAPIClient.get(parseInt(userId, 10));

        // Prepopulate form with user data
        reset({
          firstName: userData.firstName,
          lastName: userData.lastName,
          phoneNumber: userData.phoneNumber || "",
          email: userData.email,
          role: userData.role,
          colourLevel: colourLevelMap[userData.colorLevel],
          animalTag: userData.animalTags,
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to fetch user data",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [userId, reset, toast, colourLevelMap]);

  const onSubmit = (data: FormData) => {
    const formattedData = {
      firstName: data.firstName,
      lastName: data.lastName,
      phoneNumber: data.phoneNumber,
      email: data.email,
      role: data.role,
      colourLevel: data.colourLevel,
      animalTag: data.animalTag,
    };

    // eslint-disable-next-line no-console
    console.log(formattedData);

    toast({
      title: "Success",
      description: "Form data logged to console",
      status: "success",
      duration: 3000,
      isClosable: true,
    });
  };

  const handleDeleteUser = () => {
    // eslint-disable-next-line no-console
    console.log("Delete user functionality not implemented yet");
    toast({
      title: "Delete User",
      description: "Delete functionality not implemented yet",
      status: "info",
      duration: 3000,
      isClosable: true,
    });
  };

  const handleBackToProfile = () => {
    history.goBack(); // Go back to previous page
  };

  const roleOptions = Object.values(UserRoles);
  const colourLevelOptions = ["Green", "Yellow", "Orange", "Red", "Blue"]; // Assuming 1-5 levels
  const colorLevelIcons = [
    <ColourStarIcon key="green" colour="green.300" />,
    <ColourStarIcon key="yellow" colour="yellow.800" />,
    <ColourStarIcon key="orange" colour="orange.400" />,
    <ColourStarIcon key="red" colour="red.600" />,
    <ColourStarIcon key="blue" colour="blue.400" />,
  ];
  const animalTagOptions = Object.values(AnimalTag);
  const animalTagColors = ["orange", "pink", "blue", "green", "purple"]; // Colors for animal tags

  if (loading) {
    return (
      <Flex justify="center" align="center" height="100vh">
        <Text>Loading...</Text>
      </Flex>
    );
  }

  return (
    <>
      <NavBar pageName="User Profile" />
      <Flex
        width="100%"
        paddingTop="7.5rem"
        backgroundColor="gray.50"
        justifyContent="center"
      >
        <Flex
          flexDirection="column"
          width="100%"
          maxWidth="85rem"
          mx="auto"
          p="1.5rem"
        >
          {/* Back Button */}
          <Flex
            width="fit-content"
            display="flex"
            alignItems="center"
            gap="0.5rem"
            mb="1.5rem"
            cursor="pointer"
            onClick={handleBackToProfile}
            _hover={{ opacity: 0.7 }}
          >
            <ChevronLeftIcon color="gray.600" boxSize="1.25rem" />
            <Text m={0} textStyle="body" color="gray.600">
              Back to Profile
            </Text>
          </Flex>

          {/* Title */}
          <Text textStyle="h2" mb="1.5rem">
            Edit Profile
          </Text>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)}>
            <Flex direction="column" gap="1.5rem">
              {/* First Name and Last Name - Side by side */}
              <Flex width="100%" gap="1.5rem">
                <Controller
                  name="firstName"
                  control={control}
                  rules={{ required: "First name is required" }}
                  render={({ field }) => (
                    <Input
                      label="First Name"
                      placeholder="Enter first name"
                      value={field.value}
                      onChange={field.onChange}
                      error={errors.firstName?.message}
                      required
                    />
                  )}
                />
                <Controller
                  name="lastName"
                  control={control}
                  rules={{ required: "Last name is required" }}
                  render={({ field }) => (
                    <Input
                      label="Last Name"
                      placeholder="Enter last name"
                      value={field.value}
                      onChange={field.onChange}
                      error={errors.lastName?.message}
                      required
                    />
                  )}
                />
              </Flex>

              {/* Phone Number - Full width */}
              <Controller
                name="phoneNumber"
                control={control}
                render={({ field }) => (
                  <Input
                    label="Phone Number"
                    placeholder="Enter phone number"
                    value={field.value}
                    onChange={field.onChange}
                    error={errors.phoneNumber?.message}
                  />
                )}
              />

              {/* Email - Full width, disabled */}
              <Controller
                name="email"
                control={control}
                render={({ field }) => (
                  <Input
                    label="Email"
                    placeholder="Enter email"
                    value={field.value}
                    onChange={field.onChange}
                    error={errors.email?.message}
                    disabled
                    required
                  />
                )}
              />

              {/* Role - Full width */}
              <Controller
                name="role"
                control={control}
                rules={{ required: "Role is required" }}
                render={({ field }) => (
                  <SingleSelect
                    label="Role"
                    values={roleOptions}
                    selected={field.value}
                    onSelect={field.onChange}
                    placeholder="Select a role"
                    error={!!errors.role}
                    required
                  />
                )}
              />

              {/* Colour Level - Full width */}
              <Controller
                name="colourLevel"
                control={control}
                rules={{ required: "Colour level is required" }}
                render={({ field }) => (
                  <SingleSelect
                    label="Colour Level"
                    iconElements={colorLevelIcons}
                    values={colourLevelOptions}
                    selected={field.value}
                    onSelect={field.onChange}
                    placeholder="Select colour level"
                    error={!!errors.colourLevel}
                    required
                  />
                )}
              />

              {/* Animal Tag - Full width */}
              <Controller
                name="animalTag"
                control={control}
                rules={{ required: "Animal tag is required" }}
                render={({ field }) => (
                  <MultiSelect
                    label="Animal Tag"
                    values={animalTagOptions}
                    selected={field.value}
                    onSelect={field.onChange}
                    placeholder="Select animal tags"
                    colours={animalTagColors}
                    error={!!errors.animalTag}
                    required
                  />
                )}
              />

              {/* Buttons - Right aligned, side by side */}
              <Flex justify="flex-end" gap="1.5rem" mt="1.5rem">
                <Button
                  variant="red"
                  size="medium"
                  onClick={handleDeleteUser}
                  type="button"
                >
                  Delete User
                </Button>
                <Button variant="green" size="medium" type="submit">
                  Save
                </Button>
              </Flex>
            </Flex>
          </form>
        </Flex>
      </Flex>
    </>
  );
};

export default AdminViewEditUserProfilePage;
