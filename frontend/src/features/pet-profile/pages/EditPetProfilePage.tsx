import { ChevronLeftIcon } from "@chakra-ui/icons";
import {
  Flex,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Image,
  Spacer,
  Spinner,
  Text,
  useDisclosure,
  useToast,
} from "@chakra-ui/react";
import axios from "axios";
import { ChevronRightIcon } from "lucide-react";
import React, { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { useHistory, useParams } from "react-router-dom";
import PetAPIClient from "../../../APIClients/PetAPIClient";
import { PencilIcon } from "../../../assets/icons";
import Button from "../../../components/common/Button";
import ColourStarIcon from "../../../components/common/ColourStarIcon";
import Input from "../../../components/common/Input";
import NavBar from "../../../components/common/navbar/NavBar";
import PopupModal from "../../../components/common/PopupModal";
import ProfilePhoto from "../../../components/common/ProfilePhoto";
import SingleSelect from "../../../components/common/SingleSelect";
import TextArea from "../../../components/common/TextArea";
import { PetRequestDTO, PetStatus, SexEnum } from "../../../types/PetTypes";
import { AnimalTag, colorLevelMap } from "../../../types/TaskTypes";
import {
  getDaysInMonth,
  MONTH_NAME_TO_NUMBER,
  MONTH_NUMBER_TO_NAME,
} from "../../../utils/CommonUtils";
import QuitEditingModal from "./QuitEditingModal";
import { PET_PROFILE_PAGE } from "../../../constants/Routes";

interface FormData {
  name: string;
  colourLevel: string;
  animalTag: string;
  breed: string;
  weight: string;
  birthdayMonth: string;
  birthdayDate: string;
  birthdayYear: string;
  sex: string;
  neutered: string;
  safetyInfo: string;
  managementInfo: string;
  medicalInfo: string;
  profilePhoto: string;
}

const colorLevelToNumber: Record<string, number> = Object.fromEntries(
  Object.entries(colorLevelMap).map(([num, name]) => [name, Number(num)]),
);

const getSpayedNeuteredValue = (sex?: SexEnum, spayedNeutered?: boolean) => {
  if (spayedNeutered === undefined || spayedNeutered === null) {
    return "";
  }
  if (sex === undefined || sex === SexEnum.MALE) {
    return spayedNeutered ? "Neutered" : "Unneutered";
  }
  // Must be female
  return spayedNeutered ? "Spayed" : "Unspayed";
};

// By default we give 31 days if no month is
// selected. If a month is selected and no year
// then we assume we don't have a leap year.
const getBirthdayDateOptions = (month: string, year: string) => {
  const yearNum =
    year === undefined || year === "" || year === "--"
      ? undefined
      : Number(year);
  const daysInMonth =
    month && month !== "--" ? getDaysInMonth(month, yearNum) : 31;
  return [
    "--",
    ...Array.from({ length: daysInMonth }, (_, i) => (i + 1).toString()),
  ];
};

const validateDate = (month: string, date: string, year: string) => {
  const allUnset = [month, date, year].every(
    (value) => value === "--" || value === "" || value === undefined,
  );

  if (allUnset) {
    return true;
  }

  const allSet = [month, date, year].every(
    (value) => value !== "--" && value !== "" && value !== undefined,
  );
  if (!allSet) {
    return "Please complete all birthday fields or leave them all blank";
  }

  const daysInMonth = getDaysInMonth(month, Number(year));
  if (Number(date) > daysInMonth) {
    return "Invalid date";
  }
  return true;
};

const EditPetProfilePage = (): React.ReactElement => {
  const params = useParams<{ id: string }>();
  const petId = Number(params.id);
  const history = useHistory();
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [localProfilePhoto, setLocalProfilePhoto] = useState<
    string | undefined
  >(undefined);
  const [isUploading, setIsUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [page, setPage] = useState(1);
  const {
    isOpen: isDeleteConfirmModalOpen,
    onOpen: openDeleteConfirmModal,
    onClose: closeDeleteConfirmModal,
  } = useDisclosure();
  const {
    isOpen: isQuitEditingModalOpen,
    onOpen: openQuitEditingModal,
    onClose: closeQuitEditingModal,
  } = useDisclosure();

  // Birthday date options can vary depending on the month
  const [birthdayDateOptions, setBirthdayDateOptions] = useState(
    getBirthdayDateOptions("", ""),
  );

  const {
    control,
    watch,
    trigger,
    handleSubmit,
    setValue,
    getValues,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      name: "",
      colourLevel: "",
      animalTag: "",
      breed: "",
      weight: "",
      birthdayMonth: "",
      birthdayDate: "",
      birthdayYear: "",
      sex: "",
      neutered: "",
      safetyInfo: "",
      managementInfo: "",
      medicalInfo: "",
      profilePhoto: "",
    },
    mode: "onChange", // Errors are updated on every change
    reValidateMode: "onChange",
  });

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const petData = await PetAPIClient.getPet(petId);

        // Update local profile photo state
        setLocalProfilePhoto(petData.photo);

        let birthdayYear: string | undefined;
        let birthdayMonth: string | undefined;
        let birthdayDate: string | undefined;
        if (petData.birthday) {
          // We make an assumption that dates are returned in "YYYY-MM-DD" which should be true from sequelize
          const [year, month, day] = petData.birthday.split("-");

          birthdayYear = year;
          birthdayMonth = MONTH_NUMBER_TO_NAME[Number(month)];
          birthdayDate = day;

          // Update valid dates depending on the month / year
          setBirthdayDateOptions(
            getBirthdayDateOptions(birthdayMonth, birthdayYear),
          );
        }

        // Prepopulate form with pet data
        reset({
          name: petData.name,
          colourLevel: colorLevelMap[petData.colorLevel],
          animalTag: petData.animalTag,
          breed: petData.breed || "",
          weight: petData.weight?.toString() || "",
          birthdayYear,
          birthdayMonth,
          birthdayDate,
          sex: petData.sex === SexEnum.MALE ? "Male" : "Female",
          neutered: getSpayedNeuteredValue(petData.sex, petData.neutered),
          safetyInfo: petData.careInfo?.safetyInfo || "",
          managementInfo: petData.careInfo?.managementInfo || "",
          medicalInfo: petData.careInfo?.medicalInfo || "",
          profilePhoto: petData.photo || "",
        });
      } catch (error) {
        history.push("/not-found");
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [history, petId, reset, toast]);

  // Dynamically update days when month/year changes
  const selectedBirthdayMonth = watch("birthdayMonth");
  const selectedBirthdayYear = watch("birthdayYear");
  useEffect(() => {
    setBirthdayDateOptions(
      getBirthdayDateOptions(selectedBirthdayMonth, selectedBirthdayYear),
    );
  }, [selectedBirthdayMonth, selectedBirthdayYear]);

  const onSubmit = async (data: FormData) => {
    // Only allow a user to progress if they have resolved all errors
    const isValid = await trigger([
      "name",
      "colourLevel",
      "animalTag",
      "breed",
      "weight",
      "birthdayMonth",
      "birthdayDate",
      "birthdayYear",
      "sex",
      "neutered",
      "safetyInfo",
      "managementInfo",
      "medicalInfo",
    ]);

    if (!isValid) return;

    // Build birthday string (YYYY-MM-DD) or undefined
    let birthday: string | undefined;
    if (
      data.birthdayMonth &&
      data.birthdayMonth !== "--" &&
      data.birthdayDate &&
      data.birthdayDate !== "--" &&
      data.birthdayYear &&
      data.birthdayYear !== "--"
    ) {
      const month = MONTH_NAME_TO_NUMBER[data.birthdayMonth]
        .toString()
        .padStart(2, "0");
      const day = data.birthdayDate.padStart(2, "0");
      birthday = `${data.birthdayYear}-${month}-${day}`;
    }

    // Convert neutered string to boolean or undefined
    let neutered: boolean | undefined;
    if (data.neutered === "Neutered" || data.neutered === "Spayed") {
      neutered = true;
    } else if (
      data.neutered === "Unneutered" ||
      data.neutered === "Unspayed"
    ) {
      neutered = false;
    }

    // Convert sex string to SexEnum or undefined
    let sex: SexEnum | undefined;
    if (data.sex === "Male") sex = SexEnum.MALE;
    else if (data.sex === "Female") sex = SexEnum.FEMALE;

    // Build careInfo only if at least one field has content
    const careInfo =
      data.safetyInfo || data.managementInfo || data.medicalInfo
        ? {
            safetyInfo: data.safetyInfo || undefined,
            medicalInfo: data.medicalInfo || undefined,
            managementInfo: data.managementInfo || undefined,
          }
        : undefined;

    setSubmitting(true);
    try {
      // Fetch current pet to preserve its status
      const currentPet = await PetAPIClient.getPet(petId);

      const formattedData: PetRequestDTO = {
        name: data.name,
        colorLevel: colorLevelToNumber[data.colourLevel],
        animalTag: data.animalTag as AnimalTag,
        status: currentPet.status as PetStatus,
        breed: data.breed || undefined,
        weight: data.weight ? parseFloat(data.weight) : undefined,
        birthday,
        sex,
        neutered,
        photo:
          localProfilePhoto && !localProfilePhoto.startsWith("data:")
            ? localProfilePhoto
            : currentPet.photo || undefined,
        careInfo,
      };
      await PetAPIClient.update(petId, formattedData);

      // Refetch updated pet and reset form
      const updatedPet = await PetAPIClient.getPet(petId);
      setLocalProfilePhoto(updatedPet.photo);

      let updatedBirthdayYear: string | undefined;
      let updatedBirthdayMonth: string | undefined;
      let updatedBirthdayDate: string | undefined;
      if (updatedPet.birthday) {
        const [year, month, day] = updatedPet.birthday.split("-");
        updatedBirthdayYear = year;
        updatedBirthdayMonth = MONTH_NUMBER_TO_NAME[Number(month)];
        updatedBirthdayDate = day;
        setBirthdayDateOptions(
          getBirthdayDateOptions(updatedBirthdayMonth, updatedBirthdayYear),
        );
      }

      reset({
        name: updatedPet.name,
        colourLevel: colorLevelMap[updatedPet.colorLevel],
        animalTag: updatedPet.animalTag,
        breed: updatedPet.breed || "",
        weight: updatedPet.weight?.toString() || "",
        birthdayYear: updatedBirthdayYear,
        birthdayMonth: updatedBirthdayMonth,
        birthdayDate: updatedBirthdayDate,
        sex: updatedPet.sex === SexEnum.MALE ? "Male" : updatedPet.sex === SexEnum.FEMALE ? "Female" : "",
        neutered: getSpayedNeuteredValue(updatedPet.sex, updatedPet.neutered),
        safetyInfo: updatedPet.careInfo?.safetyInfo || "",
        managementInfo: updatedPet.careInfo?.managementInfo || "",
        medicalInfo: updatedPet.careInfo?.medicalInfo || "",
        profilePhoto: updatedPet.photo || "",
      });

      toast({
        title: "Success",
        description: "Pet profile updated successfully",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const status = error.response?.status;
        if (status === 404) {
          history.push("/not-found");
          return;
        }
        if (status === 403) {
          toast({
            title: "Unauthorized",
            description: "You do not have permission to update this pet",
            status: "error",
            duration: 3000,
            isClosable: true,
          });
        } else if (status === 400) {
          toast({
            title: "Validation Error",
            description:
              error.response?.data || "Please check your input and try again",
            status: "error",
            duration: 3000,
            isClosable: true,
          });
        } else {
          toast({
            title: "Error",
            description: "Failed to update pet profile",
            status: "error",
            duration: 3000,
            isClosable: true,
          });
        }
      } else {
        toast({
          title: "Error",
          description: "Failed to update pet profile",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeletePet = async () => {
    try {
      await PetAPIClient.deletePet(petId);
      toast({
        title: "Success",
        description: "Pet deleted successfully.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      closeDeleteConfirmModal();
      history.push("/");
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : "";
      const description = errorMessage
        .toLowerCase()
        .includes("foreign key constraint")
        ? "All tasks for this pet must be unassigned before deletion."
        : "Unable to delete pet, please try again later.";
      toast({
        title: "Delete Pet",
        description,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleNextPage = async () => {
    // Only allow a user to progress if they have resolved all errors
    const isValid = await trigger([
      "name",
      "colourLevel",
      "animalTag",
      "breed",
      "weight",
    ]);

    if (isValid) {
      setPage(2);
    }
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

  const colourLevelOptions = ["Green", "Yellow", "Orange", "Red", "Blue"]; // Assuming 1-5 levels
  const colorLevelIcons = [
    <ColourStarIcon key="green" colour="green.300" />,
    <ColourStarIcon key="yellow" colour="yellow.800" />,
    <ColourStarIcon key="orange" colour="orange.400" />,
    <ColourStarIcon key="red" colour="red.600" />,
    <ColourStarIcon key="blue" colour="blue.400" />,
  ];
  const animalTagOptions = Object.values(AnimalTag);
  const birthdayMonthOptions = [
    "--",
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  // Birthday year options range from the current year to 1900
  const currentYear = new Date().getFullYear();
  const birthdayYearOptions = [
    "--",
    ...Array.from({ length: currentYear - 1899 }, (_, i) =>
      (currentYear - i).toString(),
    ),
  ];
  const sexOptions = ["--", "Male", "Female"];
  const spayedNeuteredOptions = [
    "--",
    "Neutered",
    "Spayed",
    "Unneutered",
    "Unspayed",
  ];

  if (loading) {
    return (
      <Flex justify="center" align="center" height="100vh">
        <Spinner />
      </Flex>
    );
  }

  return (
    <>
      <NavBar pageName="Pet Profile" />
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
            Edit Pet Profile
          </Text>

          <form onSubmit={handleSubmit(onSubmit)}>
            {page === 1 ? (
              // First page
              <>
                {/* Profile Photo */}
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
                  <Flex
                    position="relative"
                    align="center"
                    justifyContent="center"
                  >
                    <ProfilePhoto
                      size="large"
                      type="pet"
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

                <Flex direction="column" gap="1.5rem">
                  {/* Name - Full width */}
                  <Controller
                    name="name"
                    control={control}
                    rules={{ required: "Name is required" }}
                    render={({ field }) => (
                      <Input
                        label="Name"
                        placeholder="Enter name"
                        value={field.value}
                        onChange={field.onChange}
                        error={errors.name?.message}
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
                      <SingleSelect
                        label="Animal Tag"
                        values={animalTagOptions}
                        selected={field.value}
                        onSelect={field.onChange}
                        placeholder="Select animal tag"
                        error={!!errors.animalTag}
                        required
                      />
                    )}
                  />

                  {/* Breed, Weight - Side by side */}
                  <Flex width="100%" gap="1.5rem">
                    <Controller
                      name="breed"
                      control={control}
                      render={({ field }) => (
                        <Input
                          label="Breed"
                          placeholder="Enter breed"
                          value={field.value}
                          onChange={field.onChange}
                          error={errors.breed?.message}
                        />
                      )}
                    />
                    <Controller
                      name="weight"
                      control={control}
                      rules={{
                        validate: (value) => {
                          if (value === "" || value == null) return true;
                          return (
                            /^\d*\.?\d+$/.test(value) ||
                            "Weight has to be a number greater than 0"
                          );
                        },
                      }}
                      render={({ field }) => (
                        <Input
                          label="Weight"
                          placeholder="Enter weight"
                          value={field.value}
                          onChange={field.onChange}
                          error={errors.weight?.message}
                        />
                      )}
                    />
                  </Flex>
                </Flex>
              </>
            ) : (
              // Second page
              <>
                <Flex direction="column" gap="1.5rem" marginTop="1.5rem">
                  {/* Birthday Month (50%), Date (25%), Year (25%) */}
                  <FormControl isInvalid={!!errors.birthdayMonth}>
                    <Flex width="100%" gap="1.5rem" alignItems="end">
                      <Flex width="50%">
                        <Controller
                          name="birthdayMonth"
                          control={control}
                          rules={{
                            validate: (birthdayMonth) => {
                              const birthdayDate = getValues("birthdayDate");
                              const birthdayYear = getValues("birthdayYear");
                              return validateDate(
                                birthdayMonth,
                                birthdayDate,
                                birthdayYear,
                              );
                            },
                          }}
                          render={({ field }) => (
                            <SingleSelect
                              label="Birthdate"
                              values={birthdayMonthOptions}
                              selected={field.value}
                              onSelect={(value) => {
                                if (value === "--") {
                                  setValue("birthdayDate", "--");
                                  setValue("birthdayYear", "--");
                                }
                                field.onChange(value);
                              }}
                              placeholder="Select month"
                              error={!!errors.birthdayMonth}
                            />
                          )}
                        />
                      </Flex>
                      <Flex width="50%" gap="1.5rem">
                        <Controller
                          name="birthdayDate"
                          control={control}
                          render={({ field }) => (
                            <SingleSelect
                              label=""
                              values={birthdayDateOptions}
                              selected={field.value}
                              onSelect={(value) => {
                                field.onChange(value);
                                // Re-evaulate month on date change
                                trigger("birthdayMonth");
                              }}
                              placeholder="Select date"
                              error={!!errors.birthdayMonth}
                            />
                          )}
                        />
                        <Controller
                          name="birthdayYear"
                          control={control}
                          render={({ field }) => (
                            <SingleSelect
                              values={birthdayYearOptions}
                              selected={field.value}
                              onSelect={(value) => {
                                field.onChange(value);
                                // Re-evaulate month on date change
                                trigger("birthdayMonth");
                              }}
                              placeholder="Select year"
                              error={!!errors.birthdayMonth}
                            />
                          )}
                        />
                      </Flex>
                    </Flex>
                    {errors.birthdayMonth && (
                      <FormErrorMessage fontSize="12px">
                        {errors.birthdayMonth?.message}
                      </FormErrorMessage>
                    )}
                  </FormControl>

                  {/* Sex, Neutered - Side by side */}
                  <Flex width="100%" gap="1.5rem">
                    <Controller
                      name="sex"
                      control={control}
                      render={({ field }) => (
                        <SingleSelect
                          label="Sex"
                          values={sexOptions}
                          selected={field.value}
                          onSelect={field.onChange}
                          placeholder="Select sex"
                          error={!!errors.sex}
                        />
                      )}
                    />
                    <Controller
                      name="neutered"
                      control={control}
                      render={({ field }) => (
                        <SingleSelect
                          label="Neutered/Spayed"
                          values={spayedNeuteredOptions}
                          selected={field.value}
                          onSelect={field.onChange}
                          placeholder="Select neutered / spayed"
                          error={!!errors.neutered}
                        />
                      )}
                    />
                  </Flex>

                  {/* Safety info - Full width */}
                  <Controller
                    name="safetyInfo"
                    control={control}
                    rules={{
                      validate: {
                        maxWords: (value: string) => {
                          const wordCount = value.trim().split(/\s+/).length;
                          return (
                            wordCount <= 10000 ||
                            "Information must not exceed 10,000 words."
                          );
                        },
                      },
                    }}
                    render={({ field }) => (
                      <TextArea
                        label="Safety Information"
                        placeholder="Write safety information here"
                        value={field.value}
                        onChange={field.onChange}
                        error={errors.safetyInfo?.message}
                      />
                    )}
                  />

                  {/* Management info - Full width */}
                  <Controller
                    name="managementInfo"
                    control={control}
                    rules={{
                      validate: {
                        maxWords: (value: string) => {
                          const wordCount = value.trim().split(/\s+/).length;
                          return (
                            wordCount <= 10000 ||
                            "Information must not exceed 10,000 words."
                          );
                        },
                      },
                    }}
                    render={({ field }) => (
                      <TextArea
                        label="Management Information"
                        placeholder="Write management information here"
                        value={field.value}
                        onChange={field.onChange}
                        error={errors.managementInfo?.message}
                      />
                    )}
                  />

                  {/* Medical info - Full width */}
                  <Controller
                    name="medicalInfo"
                    control={control}
                    rules={{
                      validate: {
                        maxWords: (value: string) => {
                          const wordCount = value.trim().split(/\s+/).length;
                          return (
                            wordCount <= 10000 ||
                            "Information must not exceed 10,000 words."
                          );
                        },
                      },
                    }}
                    render={({ field }) => (
                      <TextArea
                        label="Medical Information"
                        placeholder="Write medical information here"
                        value={field.value}
                        onChange={field.onChange}
                        error={errors.medicalInfo?.message}
                      />
                    )}
                  />
                </Flex>
              </>
            )}

            <Flex align="stretch" mt="2rem" gap="1rem">
              <Text margin="0" alignSelf="center">
                {page}/2
              </Text>
              <Spacer />
              {page === 1 && (
                <>
                  <Button
                    variant="red"
                    size="medium"
                    onClick={openDeleteConfirmModal}
                    type="button"
                  >
                    Delete Pet
                  </Button>
                  <Button
                    as="button"
                    variant="gray"
                    size="medium"
                    rightIcon={<ChevronRightIcon />}
                    onClick={handleNextPage}
                    type="button"
                  >
                    Next
                  </Button>
                </>
              )}
              {page === 2 && (
                <>
                  <Button
                    variant="gray"
                    size="medium"
                    leftIcon={<ChevronLeftIcon />}
                    onClick={() => {
                      setPage(1);
                    }}
                    type="button"
                  >
                    Previous
                  </Button>
                  <Button
                    variant="green"
                    size="medium"
                    type="submit"
                    disabled={submitting}
                  >
                    {submitting ? "Saving..." : "Save"}
                  </Button>
                </>
              )}
            </Flex>

            <Flex justify="flex-end" mt="2rem" />
          </form>
        </Flex>
      </Flex>
      <PopupModal
        open={isDeleteConfirmModalOpen}
        title="Delete Pet?"
        message="Are you sure you want to delete this pet? This process cannot be undone."
        primaryButtonText="Delete"
        primaryButtonColor="red"
        onPrimaryClick={handleDeletePet}
        secondaryButtonText="Cancel"
        onSecondaryClick={closeDeleteConfirmModal}
      />
      <QuitEditingModal
        isOpen={isQuitEditingModalOpen}
        handleSecondaryButtonClick={closeQuitEditingModal}
        navigateTo={`${PET_PROFILE_PAGE}/${params.id}`}
      />
    </>
  );
};

export default EditPetProfilePage;
