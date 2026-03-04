import { CloseIcon, SearchIcon } from "@chakra-ui/icons";
import {
  Flex,
  Icon,
  Input,
  InputGroup,
  InputRightElement,
  Text,
} from "@chakra-ui/react";
import React, { KeyboardEvent } from "react";
import { ReactComponent as GamesIcon } from "../../../../assets/icons/games.svg";
import { ReactComponent as HusbandryIcon } from "../../../../assets/icons/husbandry.svg";
import { ReactComponent as MiscIcon } from "../../../../assets/icons/misc.svg";
import { ReactComponent as PenTimeIcon } from "../../../../assets/icons/pen_time.svg";
import { ReactComponent as TrainingIcon } from "../../../../assets/icons/training.svg";
import { ReactComponent as WalkIcon } from "../../../../assets/icons/walk.svg";
import { Task, TaskCategory } from "../../../../types/TaskTypes";

const taskCategoryIcons: Record<TaskCategory, React.ElementType> = {
  [TaskCategory.WALK]: WalkIcon,
  [TaskCategory.GAMES]: GamesIcon,
  [TaskCategory.PEN_TIME]: PenTimeIcon,
  [TaskCategory.HUSBANDRY]: HusbandryIcon,
  [TaskCategory.TRAINING]: TrainingIcon,
  [TaskCategory.MISC]: MiscIcon,
};

interface TemplateSearchProps {
  search: string;
  onSearchChange: (value: string) => void;
  selectedTemplate: Task | null;
  onClearSelection: () => void;
}

const TemplateSearch = ({
  search,
  onSearchChange,
  selectedTemplate,
  onClearSelection,
}: TemplateSearchProps): React.ReactElement => {
  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Backspace" || e.key === "Delete") {
      onClearSelection();
    }
  };

  if (selectedTemplate) {
    return (
      <Flex
        width="100%"
        height="3rem" // Match search input height
        alignItems="center"
        justifyContent="space-between"
        backgroundColor="white"
        border="1px solid"
        borderColor="gray.200"
        borderRadius="md"
        paddingX="0.5rem"
        tabIndex={0}
        onKeyDown={handleKeyDown}
        _focus={{
          borderColor: "blue.500",
          boxShadow: "0 0 0 1px #3182ce",
          outline: "none",
        }}
      >
        <Flex
          alignItems="center"
          backgroundColor="blue.50"
          borderRadius="0.375rem"
          padding="0.25rem 0.75rem"
          gap="0.5rem"
        >
          <Icon
            as={taskCategoryIcons[selectedTemplate.category]}
            boxSize="1.5rem"
          />
          <Text textStyle="body" margin="0">
            {selectedTemplate.name}
          </Text>
          <CloseIcon
            boxSize="0.6rem"
            color="gray.500"
            cursor="pointer"
            _hover={{ color: "gray.700" }}
            onClick={(e) => {
              e.stopPropagation();
              onClearSelection();
            }}
          />
        </Flex>
        <SearchIcon color="gray.400" boxSize="1.125rem" marginRight="0.4rem" />
      </Flex>
    );
  }

  return (
    <InputGroup size="lg" width="100%">
      <Input
        type="text"
        placeholder="Search for a template..."
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        focusBorderColor="blue.500"
        textStyle="body"
        _placeholder={{ fontStyle: "italic" }}
        backgroundColor="white"
      />
      <InputRightElement>
        <SearchIcon color="gray.400" />
      </InputRightElement>
    </InputGroup>
  );
};

export default TemplateSearch;
