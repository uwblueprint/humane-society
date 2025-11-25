import React, { useState } from "react";
import { useHistory } from "react-router-dom";
import { Flex, Text } from "@chakra-ui/react";
import { ChevronLeftIcon } from "@chakra-ui/icons";
import Input from "../../../components/common/Input";
import SingleSelect from "../../../components/common/SingleSelect";
import MultiSelect from "../../../components/common/MultiSelect";
import ColourLevelBadge from "../../../components/common/ColourLevelBadge";
import Button from "../../../components/common/Button";
import UserRoles from "../../../constants/UserConstants";
import { ColorLevel, AnimalTag, colorLevelMap } from "../../../types/TaskTypes";
import UserAPIClient from "../../../APIClients/UserAPIClient";
import * as Routes from "../../../constants/Routes";
import { ReactComponent as BirdTag } from "../../../assets/icons/animal-tag/bird.svg";
import { ReactComponent as BunnyTag } from "../../../assets/icons/animal-tag/bunny.svg";
import { ReactComponent as CatTag } from "../../../assets/icons/animal-tag/cat.svg";
import { ReactComponent as DogTag } from "../../../assets/icons/animal-tag/dog.svg";
import { ReactComponent as SmallAnimalTag } from "../../../assets/icons/animal-tag/small-animal.svg";

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

  const handleBack = () => {
    history.push(Routes.USER_MANAGEMENT_PAGE); // Should this be history.back() ?
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
      });

      // Step 2: Update the user with colorLevel and animalTags
      await UserAPIClient.update(newUser.id, {
        colorLevel: colorLevelNumber,
        animalTags: formData.animalTags,
      });

      // Step 3: Send the invite email
      await UserAPIClient.invite(formData.email);

      // Navigate back to user management page
      handleBack();
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

  const colorLevelElements = colorLevels.map((level) => (
    <ColourLevelBadge key={level} colourLevel={level} size="small" />
  ));

  const animalTags = [
    AnimalTag.BIRD,
    AnimalTag.BUNNY,
    AnimalTag.CAT,
    AnimalTag.DOG,
    AnimalTag.SMALL_ANIMAL,
  ];

  const animalTagIcons = [BirdTag, BunnyTag, CatTag, DogTag, SmallAnimalTag];

  const animalTagColors = ["purple", "pink", "orange", "teal", "blue"];

  return (
    <Flex direction="column" width="100%" minHeight="100vh" bg="gray.50">
      {/* Header */}
      <Flex
        bg="white.default"
        borderBottom="1px solid"
        borderColor="gray.200"
        px="2.5rem"
        py="1.5rem"
        alignItems="center"
      >
        <Flex
          alignItems="center"
          gap="0.5rem"
          cursor="pointer"
          onClick={handleBack}
          _hover={{ opacity: 0.7 }}
        >
          <ChevronLeftIcon boxSize="1.5rem" color="blue.500" />
          <Text m={0} textStyle="body" color="blue.500">
            Back to User Management
          </Text>
        </Flex>
      </Flex>

      {/* Main Content */}
      <Flex direction="column" px="2.5rem" py="2rem" maxWidth="50rem">
        <Text m={0} mb="2rem" textStyle="h2" color="gray.700">
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
                    setFormData({ ...formData, firstName: e.target.value })
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
                    setFormData({ ...formData, lastName: e.target.value })
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
                setFormData({ ...formData, phoneNumber: e.target.value })
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
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              error={errors.email}
              required
              placeholder="user@humanesociety.org"
              type="email"
            />

            {/* Role */}
            <SingleSelect
              values={roleValues}
              selected={formData.role}
              onSelect={(value) => setFormData({ ...formData, role: value })}
              label="Role"
              placeholder="Click for options"
              required
              error={!!errors.role}
            />

            {/* Colour Level */}
            <SingleSelect
              values={colorLevels}
              selected={formData.colorLevel}
              onSelect={(level) =>
                setFormData({ ...formData, colorLevel: level })
              }
              iconElements={colorLevelElements}
              label="Colour Level"
              placeholder="Click for options"
              required
              error={!!errors.colorLevel}
            />

            {/* Animal Tag */}
            <MultiSelect
              values={animalTags}
              selected={formData.animalTags}
              onSelect={(tags) =>
                setFormData({ ...formData, animalTags: tags })
              }
              icons={animalTagIcons}
              colours={animalTagColors}
              label="Animal Tag"
              placeholder="Click for options"
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
  );
};

export default InviteUserPage;
