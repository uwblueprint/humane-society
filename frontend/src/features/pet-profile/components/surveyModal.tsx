import {
  Button,
  Flex,
  Link,
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Text,
} from "@chakra-ui/react";
import React, { useState } from "react";
import { AnimalTag } from "../../../types/TaskTypes";

const SURVEY_LINKS: Partial<Record<AnimalTag, string>> = {
  [AnimalTag.DOG]: "https://form.jotform.com/242224597581058",
  [AnimalTag.CAT]: "https://form.jotform.com/251424705456254",
  [AnimalTag.BIRD]: "https://form.jotform.com/251425487339262",
  [AnimalTag.SMALL_ANIMAL]: "https://form.jotform.com/251425486821257",
  [AnimalTag.BUNNY]: "https://form.jotform.com/251425486821257",
};

interface SurveyModalProps {
  isOpen: boolean;
  onClose: () => void;
  animalTag: AnimalTag;
}

const SurveyModal = ({
  isOpen,
  onClose,
  animalTag,
}: SurveyModalProps): React.ReactElement => {
  const surveyLink = SURVEY_LINKS[animalTag];
  const [linkClicked, setLinkClicked] = useState(false);

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent bg="gray.50" maxHeight="min(831px, calc(100vh - 8rem))">
        <ModalHeader paddingBlock="2rem" paddingInline="2.5rem">
          Thank you!
        </ModalHeader>
        <Flex direction="column" height="100%" overflowY="auto">
          <ModalBody
            flex="1"
            display="flex"
            flexDirection="column"
            gap="2rem"
            paddingTop="0"
            paddingBottom="2.5rem"
            paddingInline="2.5rem"
            overflowY="auto"
          >
            <Text textStyle="h3" fontWeight="600" m={0}>
              Task Completion Feedback
            </Text>
            <Text color="gray.700" marginBottom="0" textStyle="body">
              Thanks for completing a task. Please fill out the form below to
              provide feedback about the pet and task.
            </Text>
            {surveyLink && (
              <Link
                href={surveyLink}
                isExternal
                color="blue.600"
                onClick={() => setLinkClicked(true)}
              >
                Jotform link here
              </Link>
            )}
            <Button onClick={onClose} isDisabled={!linkClicked}>
              I have completed the form
            </Button>
          </ModalBody>
        </Flex>
      </ModalContent>
    </Modal>
  );
};

export default SurveyModal;
