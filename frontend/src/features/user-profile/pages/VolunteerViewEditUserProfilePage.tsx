import React, { useContext, useState, useEffect } from "react";
import {
  Flex,
  Text,
  FormLabel,
  Spinner,
  Image,
  useToast,
} from "@chakra-ui/react";
import { useForm, Controller } from "react-hook-form";
import { ChevronLeftIcon } from "@chakra-ui/icons";
import { useHistory } from "react-router-dom";
import Input from "../../../components/common/Input";
import PasswordInput from "../../../components/common/PasswordInput";
import Button from "../../../components/common/Button";
import NavBar from "../../../components/common/navbar/NavBar";
import ProfilePhoto from "../../../components/common/ProfilePhoto";
import AuthContext from "../../../contexts/AuthContext";
import UserAPIClient from "../../../APIClients/UserAPIClient";
import PencilIcon from "../../../assets/icons/pencil.svg";

interface FormData {
  userId: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  email: string;
  password: string;
  profilePhoto: string;
}

const VolunteerViewEditUserProfilePage = (): React.ReactElement => {
  const { authenticatedUser } = useContext(AuthContext);
  const history = useHistory();
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [localProfilePhoto, setLocalProfilePhoto] = useState<
    string | undefined
  >(authenticatedUser?.profilePhoto || undefined);
  const [isUploading, setIsUploading] = useState(false);

  const {
    control,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      userId: authenticatedUser?.id?.toString() || "",
      firstName: authenticatedUser?.firstName || "",
      lastName: authenticatedUser?.lastName || "",
      phoneNumber: authenticatedUser?.phoneNumber || "",
      email: authenticatedUser?.email || "",
      password: "",
      profilePhoto: authenticatedUser?.profilePhoto || "",
    },
  });

  useEffect(() => {
    const fetchUser = async () => {
      if (!authenticatedUser?.id) {
        setLoading(false);
        return;
      }

      try {
        const userData = await UserAPIClient.get(authenticatedUser.id);

        // Update local profile photo state
        setLocalProfilePhoto(userData.profilePhoto || undefined);

        // Prepopulate form with fresh user data
        reset({
          userId: userData.id.toString(),
          firstName: userData.firstName,
          lastName: userData.lastName,
          phoneNumber: userData.phoneNumber || "",
          email: userData.email,
          password: "",
          profilePhoto: userData.profilePhoto || "",
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
  }, [authenticatedUser?.id, reset, toast]);

  if (!authenticatedUser || loading) {
    return (
      <Flex justify="center" align="center" height="100vh">
        <Spinner />
      </Flex>
    );
  }

  const onSubmit = (data: FormData) => {
    // TODO: deprecate console use in frontend
    /* eslint-disable-next-line no-console */
    console.log({
      userId: data.userId,
      firstName: data.firstName,
      lastName: data.lastName,
      phoneNumber: data.phoneNumber,
      email: data.email,
      profilePhoto: localProfilePhoto,
    });
  };

  const handleChangePassword = () => {
    history.push("/forgot-password");
  };

  const handleProfilePhotoChange = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const file = files[0];
    const reader = new FileReader();
    setIsUploading(true);
    reader.onloadend = () => {
      setLocalProfilePhoto(reader.result as string);
      setValue("profilePhoto", reader.result as string, {
        shouldValidate: true,
      });
      setIsUploading(false);
    };
    reader.readAsDataURL(file);
  };

  return (
    <>
      <NavBar pageName="User Profile" />
      <Flex
        width="100%"
        paddingTop="7.5rem"
        backgroundColor="gray.50"
        justifyContent="center"
        minHeight="100vh"
      >
        <Flex
          flexDirection="column"
          width="100%"
          maxWidth="85rem"
          mx="auto"
          p="1.5rem"
        >
          <Flex
            width="fit-content"
            display="flex"
            alignItems="center"
            gap="0.5rem"
            mb="1.5rem"
            cursor="pointer"
            onClick={() => window.history.back()}
            _hover={{ opacity: 0.7 }}
          >
            <ChevronLeftIcon color="gray.600" boxSize="1.25rem" />
            <Text m={0} textStyle="body" color="gray.600">
              Back to Profile
            </Text>
          </Flex>

          <Text textStyle="h2" mb="2rem" m={0}>
            Edit Profile
          </Text>

          <Flex
            direction="column"
            align="center"
            mb="2.5rem"
            gap="0.5rem"
            position="relative"
          >
            <FormLabel m={0} textStyle="body" color="gray.700">
              Profile Picture:
            </FormLabel>
            <Flex position="relative" align="center" justifyContent="center">
              <ProfilePhoto
                size="large"
                type="user"
                image={localProfilePhoto}
              />
              <Flex
                as="label"
                htmlFor="profile-photo-upload"
                position="absolute"
                right="0"
                top="0"
                width="2.5rem"
                height="2.5rem"
                borderRadius="50%"
                backgroundColor="gray.200"
                alignItems="center"
                justifyContent="center"
                cursor="pointer"
                border="none"
                zIndex={2}
              >
                <Image
                  src={PencilIcon}
                  alt="edit"
                  style={{ stroke: "black" }}
                />
              </Flex>
              <input
                type="file"
                accept="image/*"
                style={{ display: "none" }}
                id="profile-photo-upload"
                onChange={(e) => handleProfilePhotoChange(e.target.files)}
                disabled={isUploading}
              />
            </Flex>
          </Flex>

          <form onSubmit={handleSubmit(onSubmit)}>
            <Flex direction="column" gap="1.5rem">
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
                  />
                )}
              />

              <Flex width="100%" gap="1.5rem" alignItems="end">
                <Flex flex={1}>
                  <Controller
                    name="password"
                    control={control}
                    render={({ field }) => (
                      <PasswordInput
                        label="Password"
                        value={field.value}
                        onChange={field.onChange}
                        disabled
                        showToggle={false}
                      />
                    )}
                  />
                </Flex>
                <Flex flex={1} align="center">
                  <Button
                    variant="dark-blue"
                    size="large"
                    width="100%"
                    type="button"
                    onClick={handleChangePassword}
                  >
                    Change Password
                  </Button>
                </Flex>
              </Flex>

              <Flex justify="flex-end" mt="2rem">
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

export default VolunteerViewEditUserProfilePage;
