import { Icon } from "@chakra-ui/react";
import React from "react";
import SearchTagSelect from "../../../../components/common/SearchTagSelect";
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
  return (
    <SearchTagSelect
      search={search}
      onSearchChange={onSearchChange}
      placeholder="Search for a template..."
      isItemSelected={!!selectedTemplate}
      selectedText={selectedTemplate?.name}
      selectedIcon={
        selectedTemplate && (
          <Icon
            as={taskCategoryIcons[selectedTemplate.category]}
            boxSize="1.5rem"
          />
        )
      }
      onClearSelection={onClearSelection}
    />
  );
};

export default TemplateSearch;
