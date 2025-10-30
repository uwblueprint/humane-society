import React, { useState } from "react";
import {
  Flex,
  Text,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
} from "@chakra-ui/react";
import Input from "../../../components/common/Input";
import SingleSelect from "../../../components/common/SingleSelect";
import ColorLevelSelect from "../../../components/common/ColorLevelSelect";
import AnimalTagSelect from "../../../components/common/AnimalTagSelect";
import Button from "../../../components/common/Button";
import UserRoles from "../../../constants/UserConstants";
import { ColorLevel, AnimalTag } from "../../../types/TaskTypes";

export interface AddUserFormData {
  firstName: string;
  lastName: string;
  phoneNumber: string;
  email: string;
  role: UserRoles | null;
  colorLevel: ColorLevel | null;
  animalTags: AnimalTag[];
}

interface AddUserFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: AddUserFormData) => Promise<void>;
}

const AddUserFormModal = ({
  isOpen,
  onClose,
  onSubmit,
}: AddUserFormModalProps): React.ReactElement => {
  const [formData, setFormData] = useState<AddUserFormData>({
    firstName: "",
    lastName: "",
    phoneNumber: "",
    email: "",
    role: null,
    colorLevel: null,
    animalTags: [],
  });

  const [errors, setErrors] = useState<
    Partial<Record<keyof AddUserFormData, string>>
  >({});
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof AddUserFormData, string>> = {};

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
      await onSubmit(formData);
      // Reset form on success
      setFormData({
        firstName: "",
        lastName: "",
        phoneNumber: "",
        email: "",
        role: null,
        colorLevel: null,
        animalTags: [],
      });
      setErrors({});
      onClose();
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

  const handleClose = () => {
    if (!loading) {
      setFormData({
        firstName: "",
        lastName: "",
        phoneNumber: "",
        email: "",
        role: null,
        colorLevel: null,
        animalTags: [],
      });
      setErrors({});
      setSubmitError(null);
      onClose();
    }
  };

  const roleValues = [
    UserRoles.ADMIN,
    UserRoles.BEHAVIOURIST,
    UserRoles.STAFF,
    UserRoles.VOLUNTEER,
  ];

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="xl" isCentered>
      <ModalOverlay />
      <ModalContent maxWidth="37.5rem" borderRadius="0.75rem">
        <ModalHeader>
          <Text m={0} textStyle="h2" color="gray.700">
            Invite User
          </Text>
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody pb="2rem">
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
              <ColorLevelSelect
                selected={formData.colorLevel}
                onSelect={(level) =>
                  setFormData({ ...formData, colorLevel: level })
                }
                label="Colour Level"
                placeholder="Click for options"
                required
                error={!!errors.colorLevel}
              />

              {/* Animal Tag */}
              <AnimalTagSelect
                selected={formData.animalTags}
                onSelect={(tags) =>
                  setFormData({ ...formData, animalTags: tags })
                }
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
              <Flex justify="center" mt="1rem">
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
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default AddUserFormModal;
