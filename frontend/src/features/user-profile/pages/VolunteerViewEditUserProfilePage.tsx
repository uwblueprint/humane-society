import React, { useContext, useEffect, useRef, useState } from "react";
import { Flex, Text, Spinner, useToast, useDisclosure } from "@chakra-ui/react";
import { useForm, Controller } from "react-hook-form";
import { ChevronLeftIcon } from "@chakra-ui/icons";
import { useHistory } from "react-router-dom";
import Input from "../../../components/common/Input";
import Button from "../../../components/common/Button";
import NavBar from "../../../components/common/navbar/NavBar";
import AuthContext from "../../../contexts/AuthContext";
import UserAPIClient from "../../../APIClients/UserAPIClient";
import { PROFILE_PAGE } from "../../../constants/Routes";
import QuitEditingModal from "../../pet-profile/pages/QuitEditingModal";
import ProfilePhotoEditor from "../components/ProfilePhotoEditor";
import ChangePasswordRow from "../components/ChangePasswordRow";
import { User } from "../../../types/UserTypes";

interface FormData {
  userId: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  email: string;
  profilePhoto: string;
}

const VolunteerViewEditUserProfilePage = (): React.ReactElement => {
  const { authenticatedUser } = useContext(AuthContext);
  const history = useHistory();
  const toast = useToast();
  const originalValues = useRef<{ firstName: string; lastName: string } | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [localProfilePhoto, setLocalProfilePhoto] = useState<
    string | undefined
  >(authenticatedUser?.profilePhoto || undefined);
  const [user, setUser] = useState<User | null>(null);
  const [profilePhotoFile, setProfilePhotoFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const {
    isOpen: isQuitEditingModalOpen,
    onOpen: openQuitEditingModal,
    onClose: closeQuitEditingModal,
  } = useDisclosure();

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
        setUser(userData);
        // Update local profile photo state
        if (userData.profilePhoto) {
          const profilePhotoUrl = await UserAPIClient.getProfilePhotoUrl(
            userData.id,
          );
          setLocalProfilePhoto(profilePhotoUrl);
        } else {
          setLocalProfilePhoto(undefined);
        }

        // Prepopulate form with fresh user data
        reset({
          userId: userData.id.toString(),
          firstName: userData.firstName,
          lastName: userData.lastName,
          phoneNumber: userData.phoneNumber || "",
          email: userData.email,
          profilePhoto: userData.profilePhoto || "",
        });
        originalValues.current = {
          firstName: userData.firstName,
          lastName: userData.lastName,
        };
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

  const onSubmit = async (data: FormData) => {
    const userId = Number(authenticatedUser?.id?.toString());
    const orig = originalValues.current;
    const formattedData = {
      firstName: data.firstName,
      lastName: data.lastName,
      phoneNumber: data.phoneNumber,
    };

    try {
      // Name change goes through the granular route so it writes an interaction
      // log; the general update below still persists phone (and name) without
      // double-logging since the PUT route doesn't log.
      if (
        orig &&
        (data.firstName !== orig.firstName || data.lastName !== orig.lastName)
      ) {
        await UserAPIClient.updateName(userId, {
          firstName: data.firstName,
          lastName: data.lastName,
          actorId: userId,
          targetId: userId,
          oldUserName: `${orig.firstName} ${orig.lastName}`,
          newUserName: `${data.firstName} ${data.lastName}`,
        });
      }
      const updatedUser = await UserAPIClient.update(userId, formattedData);
      reset({
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        phoneNumber: updatedUser.phoneNumber || "",
      });
      toast({
        title: "Success",
        description: "User profile updated",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (err) {
      toast({
        title: "Fail",
        description: "Failed to update user profile",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      // Profile save failed — don't attempt the photo upload or redirect.
      return;
    }

    try {
      setIsUploading(true);

      if (profilePhotoFile) {
        await UserAPIClient.uploadProfilePhoto(
          profilePhotoFile,
          userId,
          user?.profilePhoto,
        );
        toast({
          title: "Upload successful",
          description: "Your profile photo has been updated.",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      } else if (localProfilePhoto === undefined) {
        await UserAPIClient.setDefaultProfilePhoto(userId);
      }

      history.push(`/profile/${userId}`);
    } catch (error) {
      toast({
        title: "Update failed",
        description:
          error instanceof Error ? error.message : "An error occurred",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleProfilePhotoChange = (file: File | null) => {
    if (!file) {
      setLocalProfilePhoto(undefined);
      setProfilePhotoFile(null);
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      setLocalProfilePhoto(reader.result as string);
      setValue("profilePhoto", reader.result as string, {
        shouldValidate: true,
      });
    };
    setProfilePhotoFile(file);
    reader.readAsDataURL(file);
  };

  if (isUploading) {
    return (
      <Flex justify="center" align="center" height="100vh" width="100%">
        <Spinner />
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
            onClick={() => openQuitEditingModal()}
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

          <ProfilePhotoEditor
            photoUrl={localProfilePhoto}
            onChange={handleProfilePhotoChange}
          />

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
                rules={{
                  validate: (value) =>
                    !value ||
                    /^\d{3}-\d{3}-\d{4}$/.test(value) ||
                    /^\d{10}$/.test(value) ||
                    "Invalid number (must be in xxx-xxx-xxxx or xxxxxxxxxx format)",
                }}
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

              <ChangePasswordRow />

              <Flex justify="flex-end" mt="2rem">
                <Button variant="green" size="medium" type="submit">
                  Save
                </Button>
              </Flex>
            </Flex>
          </form>
        </Flex>
      </Flex>
      <QuitEditingModal
        isOpen={isQuitEditingModalOpen}
        handleSecondaryButtonClick={closeQuitEditingModal}
        navigateTo={`${PROFILE_PAGE}/${authenticatedUser?.id}`}
      />
    </>
  );
};

export default VolunteerViewEditUserProfilePage;
