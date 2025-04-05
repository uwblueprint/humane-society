import React from "react";
import { useForm, Controller } from "react-hook-form";
import { useHistory } from "react-router-dom";
import {
  Box,
  Button,
  Flex,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Heading,
  Image,
  Input,
  Select,
  Text,
  VStack,
  HStack,
  IconButton,
} from "@chakra-ui/react";
import {
  LeftChevronIcon,
  RightChevronIcon,
  EditGrayBgIcon,
  DownChevronIcon,
} from "../assets/icons";
import { PET_LIST_PAGE } from "../constants/Routes";

type PetFormData = {
  name: string;
  colourLevel: string;
  animalTag: string;
  description?: string;
  specialNotes?: string;
};

const AddPetListPage = (): React.ReactElement => {
  const history = useHistory();
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<PetFormData>({
    defaultValues: {
      name: "",
      colourLevel: "",
      animalTag: "",
      description: "",
      specialNotes: "",
    },
  });

  const onSubmit = (data: PetFormData) => {
    console.log("Form data:", data);
    // Here you would typically send the data to your API
    // Then navigate back to the pet list page
    history.push(PET_LIST_PAGE);
  };

  const handleCancel = () => {
    history.push(PET_LIST_PAGE);
  };

  return (
    <Box p="2.5rem" maxWidth="800px" mx="auto">
      <Flex align="center" mb="2rem">
        <IconButton
          aria-label="Go back"
          icon={<Image src={LeftChevronIcon} alt="Back" />}
          variant="ghost"
          onClick={handleCancel}
          mr="1rem"
        />
        <Heading size="lg">Add Pet</Heading>
      </Flex>

      <form onSubmit={handleSubmit(onSubmit)}>
        <VStack spacing="2rem" align="stretch">
          {/* Pet Image */}
          <Flex justify="center" mb="1rem">
            <Box position="relative">
              <Box
                width="150px"
                height="150px"
                borderRadius="full"
                bg="gray.200"
                display="flex"
                justifyContent="center"
                alignItems="center"
                overflow="hidden"
              >
                <Image
                  src="/images/default_pet_profile.png"
                  alt="Default pet"
                  fallback={<Text textAlign="center">Pet Image</Text>}
                />
              </Box>
              <Box position="absolute" bottom="0" right="0">
                <Image src={EditGrayBgIcon} alt="Edit" width="32px" />
              </Box>
            </Box>
          </Flex>

          {/* Basic Info Section */}
          <Box>
            <Flex align="center" mb="1rem">
              <Heading size="md">Basic Information</Heading>
              <Image src={DownChevronIcon} alt="Expand" ml="0.5rem" />
            </Flex>

            {/* Name Field */}
            <FormControl isInvalid={!!errors.name} mb="1.5rem">
              <FormLabel>Name *</FormLabel>
              <Controller
                name="name"
                control={control}
                rules={{ required: "Name is required" }}
                render={({ field }) => (
                  <Input {...field} placeholder="Enter pet name" />
                )}
              />
              <FormErrorMessage>{errors.name?.message}</FormErrorMessage>
            </FormControl>

            {/* Colour Level Field */}
            <FormControl isInvalid={!!errors.colourLevel} mb="1.5rem">
              <FormLabel>Colour Level *</FormLabel>
              <Controller
                name="colourLevel"
                control={control}
                rules={{ required: "Colour level is required" }}
                render={({ field }) => (
                  <Select {...field} placeholder="Select colour level">
                    <option value="Green">Green</option>
                    <option value="Yellow">Yellow</option>
                    <option value="Orange">Orange</option>
                    <option value="Red">Red</option>
                  </Select>
                )}
              />
              <FormErrorMessage>{errors.colourLevel?.message}</FormErrorMessage>
            </FormControl>

            {/* Animal Tag Field */}
            <FormControl isInvalid={!!errors.animalTag} mb="1.5rem">
              <FormLabel>Animal Tag *</FormLabel>
              <Controller
                name="animalTag"
                control={control}
                rules={{ required: "Animal tag is required" }}
                render={({ field }) => (
                  <Select {...field} placeholder="Select animal tag">
                    <option value="Dog">Dog</option>
                    <option value="Cat">Cat</option>
                    <option value="Rabbit">Rabbit</option>
                    <option value="Bird">Bird</option>
                    <option value="Other">Other</option>
                  </Select>
                )}
              />
              <FormErrorMessage>{errors.animalTag?.message}</FormErrorMessage>
            </FormControl>
          </Box>

          {/* Additional Details Section */}
          <Box>
            <Flex align="center" mb="1rem">
              <Heading size="md">Additional Details</Heading>
              <Image src={DownChevronIcon} alt="Expand" ml="0.5rem" />
            </Flex>

            {/* Description Field */}
            <FormControl mb="1.5rem">
              <FormLabel>Description</FormLabel>
              <Input
                {...register("description")}
                placeholder="Enter pet description"
              />
            </FormControl>

            {/* Special Notes Field */}
            <FormControl mb="1.5rem">
              <FormLabel>Special Notes</FormLabel>
              <Input
                {...register("specialNotes")}
                placeholder="Enter any special notes"
              />
            </FormControl>
          </Box>

          {/* Action Buttons */}
          <HStack spacing="1rem" justify="flex-end">
            <Button variant="outline" colorScheme="blue" onClick={handleCancel}>
              Cancel
            </Button>
            <Button
              type="submit"
              colorScheme="blue"
              rightIcon={<Image src={RightChevronIcon} alt="Submit" />}
            >
              Create Pet
            </Button>
          </HStack>
        </VStack>
      </form>
    </Box>
  );
};

export default AddPetListPage;
