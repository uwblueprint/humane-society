import React, { useState } from "react";
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Select,
  VStack,
  Text,
  useToast,
} from "@chakra-ui/react";
import UserAPIClient from "../../APIClients/UserAPIClient";
import { AnimalTag } from "../../types/TaskTypes";
import UserRoles from "../../constants/UserConstants";

const CreateUserTestForm = (): React.ReactElement => {
  const toast = useToast();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<string>(UserRoles.VOLUNTEER);
  const [colorLevel, setColorLevel] = useState<number>(1);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const newUser = await UserAPIClient.create({
        firstName,
        lastName,
        name: `${firstName} ${lastName}`,
        email,
        role: role as UserRoles,
        colorLevel,
        animalTags: selectedTags as AnimalTag[],
        canSeeAllLogs: false,
        canAssignUsersToTasks: false,
        phoneNumber: null,
      });

      toast({
        title: "User created!",
        description: `Created user: ${newUser.firstName} ${newUser.lastName}`,
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      // Reset form
      setFirstName("");
      setLastName("");
      setEmail("");
      setRole(UserRoles.VOLUNTEER);
      setColorLevel(1);
      setSelectedTags([]);
    } catch (error) {
      toast({
        title: "Error creating user",
        description: error instanceof Error ? error.message : String(error),
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  return (
    <Box p={6} borderWidth="1px" borderRadius="lg" maxW="500px" w="100%">
      <Text fontSize="xl" fontWeight="bold" mb={4}>
        Create User - Test Form
      </Text>
      <form onSubmit={handleSubmit}>
        <VStack spacing={3} align="stretch">
          <FormControl isRequired>
            <FormLabel>First Name</FormLabel>
            <Input
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
            />
          </FormControl>

          <FormControl isRequired>
            <FormLabel>Last Name</FormLabel>
            <Input
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
            />
          </FormControl>

          <FormControl isRequired>
            <FormLabel>Email</FormLabel>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </FormControl>

          <FormControl isRequired>
            <FormLabel>Role</FormLabel>
            <Select value={role} onChange={(e) => setRole(e.target.value)}>
              {Object.values(UserRoles).map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </Select>
          </FormControl>

          <FormControl isRequired>
            <FormLabel>Color Level (1-5)</FormLabel>
            <Select
              value={colorLevel}
              onChange={(e) => setColorLevel(Number(e.target.value))}
            >
              <option value={1}>1 - Green</option>
              <option value={2}>2 - Yellow</option>
              <option value={3}>3 - Orange</option>
              <option value={4}>4 - Red</option>
              <option value={5}>5 - Blue</option>
            </Select>
          </FormControl>

          <FormControl isRequired>
            <FormLabel>Animal Tags (select at least one)</FormLabel>
            <VStack align="stretch" spacing={2}>
              {Object.values(AnimalTag).map((tag) => (
                <Box
                  key={tag}
                  p={2}
                  borderWidth="1px"
                  borderRadius="md"
                  cursor="pointer"
                  bg={selectedTags.includes(tag) ? "blue.100" : "white"}
                  onClick={() => toggleTag(tag)}
                  _hover={{
                    bg: selectedTags.includes(tag) ? "blue.200" : "gray.50",
                  }}
                >
                  <Text>
                    {selectedTags.includes(tag) ? "✓ " : "○ "}
                    {tag}
                  </Text>
                </Box>
              ))}
            </VStack>
          </FormControl>

          <Button
            type="submit"
            colorScheme="blue"
            isDisabled={selectedTags.length === 0}
          >
            Create User
          </Button>
        </VStack>
      </form>
    </Box>
  );
};

export default CreateUserTestForm;
