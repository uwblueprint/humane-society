import React, { useState } from "react";
import {
  Box,
  Button,
  Flex,
  Grid,
  GridItem,
  Text,
  VStack,
} from "@chakra-ui/react";
import Input from "../../../components/common/Input";
import SingleSelect from "../../../components/common/SingleSelect";
import ColourLevelSelect from "../../../components/common/ColourLevelSelect";
import AnimalTagSelect from "../../../components/common/AnimalTagSelect";
import { ColorLevel, AnimalTag } from "../../../types/TaskTypes";

export interface AddUserRequest {
  firstName: string;
  lastName: string;
  phoneNumber: string;
  email: string;
  role: "Administrator" | "Animal Behaviourist" | "Staff" | "Volunteer";
  colourLevel: ColorLevel | null;
  animalTags: AnimalTag[];
}

interface AddUserFormModalProps {
  onSubmit: (formData: AddUserRequest) => Promise<void>;
  onSuccess?: () => void;
}

type UserRole = "Administrator" | "Animal Behaviourist" | "Staff" | "Volunteer";

const AddUserFormModal = ({
  onSubmit,
  onSuccess,
}: AddUserFormModalProps): React.ReactElement => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<UserRole | null>(null);
  const [colourLevel, setColourLevel] = useState<ColorLevel | null>(null);
  const [animalTags, setAnimalTags] = useState<AnimalTag[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const userRoles: UserRole[] = [
    "Administrator",
    "Animal Behaviourist",
    "Staff",
    "Volunteer",
  ];

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!firstName.trim()) {
      newErrors.firstName = "First name is required";
    }

    if (!lastName.trim()) {
      newErrors.lastName = "Last name is required";
    }

    const phoneRegex = /^\d{3}-\d{3}-\d{4}$/;
    const phoneRegex2 = /^\d{10}$/;
    if (!phoneNumber.trim()) {
      newErrors.phoneNumber = "Phone number is required";
    } else if (
      !phoneRegex.test(phoneNumber) &&
      !phoneRegex2.test(phoneNumber)
    ) {
      newErrors.phoneNumber = "Phone number must be in xxx-xxx-xxxx format";
    }

    if (!email.trim()) {
      newErrors.email = "Email is required";
    } else if (!email.includes("@")) {
      newErrors.email = "Email must be in address@domain format";
    }

    if (!role) {
      newErrors.role = "Role is required";
    }

    if (!colourLevel) {
      newErrors.colourLevel = "Colour level is required";
    }

    if (animalTags.length === 0) {
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
    setError(null);

    try {
      await onSubmit({
        firstName,
        lastName,
        phoneNumber,
        email,
        role: role!,
        colourLevel,
        animalTags,
      });

      // Reset form
      setFirstName("");
      setLastName("");
      setPhoneNumber("");
      setEmail("");
      setRole(null);
      setColourLevel(null);
      setAnimalTags([]);
      setErrors({});

      // Call success callback if provided
      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      setError("An error occurred while sending the invite.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box width="100%">
      <form onSubmit={handleSubmit}>
        <VStack spacing="1.5rem" align="stretch">
          <Grid templateColumns="repeat(2, 1fr)" gap="1rem">
            <GridItem>
              <Input
                label="First Name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="John"
                error={errors.firstName}
                required
              />
            </GridItem>
            <GridItem>
              <Input
                label="Last Name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Doe"
                error={errors.lastName}
                required
              />
            </GridItem>
          </Grid>

          <Input
            label="Phone Number"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            placeholder="647-123-4566"
            error={errors.phoneNumber}
            required
          />

          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="user@humanesociety.org"
            error={errors.email}
            required
          />

          <SingleSelect<UserRole>
            label="Role"
            values={userRoles}
            selected={role}
            onSelect={setRole}
            placeholder="Click for options"
            error={!!errors.role}
            required
          />

          <ColourLevelSelect
            label="Colour Level"
            selected={colourLevel}
            onSelect={setColourLevel}
            placeholder="Click for options"
            error={!!errors.colourLevel}
            required
          />

          <AnimalTagSelect
            label="Animal Tag"
            selected={animalTags}
            onSelect={setAnimalTags}
            placeholder="Click for options"
            error={!!errors.animalTags}
            required
          />

          <Flex justify="center" pt="1rem">
            <Button
              type="submit"
              colorScheme="blue"
              size="lg"
              isLoading={loading}
              loadingText="Sending..."
              px="3rem"
            >
              Send Invite
            </Button>
          </Flex>

          {error && (
            <Text color="red.500" textAlign="center" fontSize="14px">
              {error}
            </Text>
          )}
        </VStack>
      </form>
    </Box>
  );
};

export default AddUserFormModal;
