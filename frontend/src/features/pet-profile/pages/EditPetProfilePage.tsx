import React, { useState, useEffect } from "react";
import {
  Flex,
  Text,
  FormLabel,
  Spinner,
  Image,
  useToast,
  Spacer,
  useDisclosure,
  FormControl,
  FormErrorMessage,
} from "@chakra-ui/react";
import { useForm, Controller } from "react-hook-form";
import { ChevronLeftIcon } from "@chakra-ui/icons";
import { useHistory, useParams } from "react-router-dom";
import { ChevronRightIcon } from "lucide-react";
import Input from "../../../components/common/Input";
import Button from "../../../components/common/Button";
import NavBar from "../../../components/common/navbar/NavBar";
import ProfilePhoto from "../../../components/common/ProfilePhoto";
import PetAPIClient from "../../../APIClients/PetAPIClient";
import { AnimalTag, colorLevelMap } from "../../../types/TaskTypes";
import SingleSelect from "../../../components/common/SingleSelect";
import ColourStarIcon from "../../../components/common/ColourStarIcon";
import { SexEnum } from "../../../types/PetTypes";
import {
  getDaysInMonth,
  MONTH_NUMBER_TO_NAME,
} from "../../../utils/CommonUtils";
import PopupModal from "../../../components/common/PopupModal";
import TextArea from "../../../components/common/TextArea";
import { PencilIcon } from "../../../assets/icons";

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

const getSpayedNeuteredValue = (sex?: SexEnum, spayedNeutered?: boolean) => {
  if (spayedNeutered === undefined || spayedNeutered === null) {
    return "";
  }
  if (sex === undefined || sex === SexEnum.MALE) {
    return spayedNeutered ? "Neutered" : "Unneutered";
  }
  // Must be female
  return spayedNeutered ? "Spayed" : "Not spayed";
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
  const [page, setPage] = useState(1);
  const {
    isOpen: isDeleteConfirmModalOpen,
    onOpen: openDeleteConfirmModal,
    onClose: closeDeleteConfirmModal,
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

    if (isValid) {
      // TODO: Remove this and submit actual data to backend endpoint
      // eslint-disable-next-line no-console
      console.log({
        name: data.name,
        colourLevel: data.colourLevel,
        animalTag: data.animalTag,
        breed: data.breed,
        weight: data.weight,
        birthdayMonth: data.birthdayMonth,
        birthdayDate: data.birthdayDate,
        birthdayYear: data.birthdayYear,
        sex: data.sex,
        neutered: data.neutered,
        safetyInfo: data.safetyInfo,
        managementInfo: data.managementInfo,
        medicalInfo: data.medicalInfo,
        profilePhoto: localProfilePhoto,
      });

      toast({
        title: "Success",
        description: "Form data logged to console",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleDeletePet = () => {
    // TODO: Remove this and send request to delete to backend endpoint
    // eslint-disable-next-line no-console
    console.log("Delete pet functionality not implemented yet");
    toast({
      title: "Delete pet",
      description: "Delete functionality not implemented yet",
      status: "info",
      duration: 3000,
      isClosable: true,
    });
    closeDeleteConfirmModal();
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
            onClick={() => window.history.back()}
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
                              label="Birthday"
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
                    Delete User
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
                  <Button variant="green" size="medium" type="submit">
                    Save
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
    </>
  );
};

export default EditPetProfilePage;
