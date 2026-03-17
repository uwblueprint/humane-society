import React, { useState } from "react";
import { useHistory } from "react-router-dom";
import { Flex, Text } from "@chakra-ui/react";
import { ChevronLeftIcon } from "@chakra-ui/icons";
import Input from "../../../components/common/Input";
import SingleSelect from "../../../components/common/SingleSelect";
import MultiSelect from "../../../components/common/MultiSelect";
import ColourStarIcon from "../../../components/common/ColourStarIcon";
import Button from "../../../components/common/Button";
import UserRoles from "../../../constants/UserConstants";
import { ColorLevel, AnimalTag, colorLevelMap } from "../../../types/TaskTypes";
import UserAPIClient from "../../../APIClients/UserAPIClient";
import * as Routes from "../../../constants/Routes";
import NavBar from "../../../components/common/navbar/NavBar";
import PopupModal from "../../../components/common/PopupModal";

export interface InviteUserFormData {
  firstName: string;
  lastName: string;
  phoneNumber: string;
  email: string;
  role: UserRoles | null;
  colorLevel: ColorLevel | null;
  animalTags: AnimalTag[];
}

const InviteUserPage = (): React.ReactElement => {
  const history = useHistory();
  const [formData, setFormData] = useState<InviteUserFormData>({
    firstName: "",
    lastName: "",
    phoneNumber: "",
    email: "",
    role: null,
    colorLevel: null,
    animalTags: [],
  });

  const [errors, setErrors] = useState<
    Partial<Record<keyof InviteUserFormData, string>>
  >({});
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const [isQuitModalOpen, setIsQuitModalOpen] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);

  const handleBack = () => {
    if (hasUnsavedChanges) {
      setIsQuitModalOpen(true);
    } else {
      history.push(Routes.USER_MANAGEMENT_PAGE); // Should this be history.back() ?
    }
  };

  const handleConfirmQuit = () => {
    history.push(Routes.USER_MANAGEMENT_PAGE);
  };

  const handleCancelQuit = () => {
    setIsQuitModalOpen(false);
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof InviteUserFormData, string>> = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = "First name is required";
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = "Last name is required";
    }

    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = "Phone number is required";
    } else {
      const phoneRegex = /^\d{3}-\d{3}-\d{4}$/;
      const phoneRegex2 = /^\d{10}$/;
      if (
        !phoneRegex.test(formData.phoneNumber) &&
        !phoneRegex2.test(formData.phoneNumber)
      ) {
        newErrors.phoneNumber = "Phone number must be in xxx-xxx-xxxx format";
      }
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!formData.email.includes("@")) {
      newErrors.email = "Email must be in address@domain format";
    }

    if (!formData.role) {
      newErrors.role = "Role is required";
    }

    if (!formData.colorLevel) {
      newErrors.colorLevel = "Colour level is required";
    }

    if (formData.animalTags.length === 0) {
      newErrors.animalTags = "At least one animal tag is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsConfirmModalOpen(true);
  };

  const handleConfirmInvite = async () => {
    setIsConfirmModalOpen(false);
    setLoading(true);
    setSubmitError(null);

    try {
      // Map ColorLevel enum to number (1-5)
      const colorLevelNumber = formData.colorLevel
        ? parseInt(
            Object.entries(colorLevelMap).find(
              ([, value]) => value === formData.colorLevel,
            )?.[0] || "1",
            10,
          )
        : 1;

      // Step 1: Create the user
      const newUser = await UserAPIClient.create({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        role: formData.role as UserRoles,
        phoneNumber: formData.phoneNumber,
        canSeeAllLogs: false,
        canAssignUsersToTasks: false,
        animalTags: formData.animalTags,
        colorLevel: colorLevelNumber,
      });

      // Step 2: Update the user with colorLevel and animalTags
      await UserAPIClient.update(newUser.id, {
        colorLevel: colorLevelNumber,
        animalTags: formData.animalTags,
      });

      // Step 3: Send the invite email
      await UserAPIClient.invite(formData.email);

      // Navigate back to user management page
      setIsSuccessModalOpen(true);
    } catch (err) {
      setSubmitError(
        err instanceof Error
          ? err.message
          : "An error occurred while sending the invite",
      );
    } finally {
      setLoading(false);
    }
  };

  const updateFormData = (updates: Partial<InviteUserFormData>) => {
    setFormData((prev) => ({ ...prev, ...updates }));
    setHasUnsavedChanges(true);
  };

  const roleValues = [
    UserRoles.ADMIN,
    UserRoles.BEHAVIOURIST,
    UserRoles.STAFF,
    UserRoles.VOLUNTEER,
  ];

  const colorLevels = [
    ColorLevel.GREEN,
    ColorLevel.YELLOW,
    ColorLevel.ORANGE,
    ColorLevel.RED,
    ColorLevel.BLUE,
  ];

  const colorLevelElements = [
    <ColourStarIcon key="green" colour="green.300" />,
    <ColourStarIcon key="yellow" colour="yellow.800" />,
    <ColourStarIcon key="orange" colour="orange.400" />,
    <ColourStarIcon key="red" colour="red.600" />,
    <ColourStarIcon key="blue" colour="blue.400" />,
  ];

  const animalTags = [
    AnimalTag.BIRD,
    AnimalTag.BUNNY,
    AnimalTag.CAT,
    AnimalTag.DOG,
    AnimalTag.SMALL_ANIMAL,
  ];

  const animalTagColors = ["purple", "pink", "orange", "teal", "blue"];

  return (
    <>
      {/* Header */}
      <NavBar pageName="User Management" />

      {/* Main Content */}
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
            alignItems="center"
            gap="0.5rem"
            mb="1.5rem"
            cursor="pointer"
            onClick={handleBack}
            _hover={{ opacity: 0.7 }}
          >
            <ChevronLeftIcon color="gray.600" boxSize="1.25rem" />
            <Text m={0} textStyle="body" color="gray.600">
              Back to User Management
            </Text>
          </Flex>

          {/* Title */}
          <Text m={0} mb="1.5rem" textStyle="h2">
            Invite User
          </Text>

          <form onSubmit={handleSubmit}>
            <Flex direction="column" gap="1.25rem">
              {/* First Name and Last Name Row */}
              <Flex gap="1rem">
                <Flex flex="1">
                  <Input
                    label="First Name"
                    value={formData.firstName}
                    onChange={(e) =>
                      updateFormData({ firstName: e.target.value })
                    }
                    error={errors.firstName}
                    required
                    placeholder="John"
                  />
                </Flex>
                <Flex flex="1">
                  <Input
                    label="Last Name"
                    value={formData.lastName}
                    onChange={(e) =>
                      updateFormData({ lastName: e.target.value })
                    }
                    error={errors.lastName}
                    required
                    placeholder="Doe"
                  />
                </Flex>
              </Flex>

              {/* Phone Number */}
              <Input
                label="Phone Number"
                value={formData.phoneNumber}
                onChange={(e) =>
                  updateFormData({ phoneNumber: e.target.value })
                }
                error={errors.phoneNumber}
                required
                placeholder="647-123-4566"
                type="tel"
              />

              {/* Email */}
              <Input
                label="Email"
                value={formData.email}
                onChange={(e) => updateFormData({ email: e.target.value })}
                error={errors.email}
                required
                placeholder="user@humanesociety.org"
                type="email"
              />

              {/* Role */}
              <SingleSelect
                values={roleValues}
                selected={formData.role}
                onSelect={(value) => updateFormData({ role: value })}
                label="Role"
                placeholder="Click for options"
                maxHeight="none"
                required
                error={!!errors.role}
              />

              {/* Colour Level */}
              <SingleSelect
                values={colorLevels}
                selected={formData.colorLevel}
                onSelect={(level) => updateFormData({ colorLevel: level })}
                iconElements={colorLevelElements}
                label="Colour Level"
                placeholder="Click for options"
                maxHeight="none"
                required
                error={!!errors.colorLevel}
              />

              {/* Animal Tag */}
              <MultiSelect
                values={animalTags}
                selected={formData.animalTags}
                onSelect={(tags) => updateFormData({ animalTags: tags })}
                colours={animalTagColors}
                label="Animal Tag"
                placeholder="Click for options"
                maxHeight="none"
                required
                error={!!errors.animalTags}
              />

              {/* Error Message */}
              {submitError && (
                <Flex
                  bg="red.50"
                  border="1px solid"
                  borderColor="red.400"
                  borderRadius="0.375rem"
                  p="0.75rem"
                >
                  <Text m={0} color="red.800" fontSize="0.875rem">
                    {submitError}
                  </Text>
                </Flex>
              )}

              {/* Submit Button */}
              <Flex justify="flex-end" mt="1rem">
                <Button
                  type="submit"
                  variant="dark-blue"
                  size="large"
                  disabled={loading}
                  isLoading={loading}
                >
                  {loading ? "Sending..." : "Send Invite"}
                </Button>
              </Flex>
            </Flex>
          </form>
        </Flex>
      </Flex>

      <PopupModal
        open={isQuitModalOpen}
        title="Quit Editing?"
        message="Changes you made so far will not be saved."
        primaryButtonText="Leave"
        primaryButtonColor="red"
        onPrimaryClick={handleConfirmQuit}
        secondaryButtonText="Keep Editing"
        onSecondaryClick={handleCancelQuit}
      />
      <PopupModal
        open={isConfirmModalOpen}
        title="Invite User?"
        message="Are you sure you want to invite this user? A verification link will be sent to them."
        primaryButtonText="Invite"
        onPrimaryClick={handleConfirmInvite}
        secondaryButtonText="Cancel"
        onSecondaryClick={() => setIsConfirmModalOpen(false)}
      />
      <PopupModal
        open={isSuccessModalOpen}
        title="Invite Sent!"
        message="A verification link has successfully been sent to the user's email."
        primaryButtonText="Back to User Management"
        onPrimaryClick={() => history.push(Routes.USER_MANAGEMENT_PAGE)}
      />
    </>
  );
};

export default InviteUserPage;
