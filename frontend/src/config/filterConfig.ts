import { ALL_ROLES, STATUS } from "../constants/AuthConstants";
import INTERACTION_TYPES, {
  INTERACTION_TYPE_GROUPS,
} from "../constants/InteractionConstants";
import { FilterSection } from "../types/FilterTypes";
import { PetStatus } from "../types/PetTypes";
import { AnimalTag, ColorLevel, TaskCategory } from "../types/TaskTypes";

const filterConfig: Record<string, FilterSection[]> = {
  petListAdmin: [
    {
      name: "Animal Tag",
      value: "animalTag",
      options: Object.values(AnimalTag),
    },
    {
      name: "Colour Level",
      value: "color",
      options: Object.values(ColorLevel),
    },
    {
      name: "Status",
      value: "status",
      options: Object.values(PetStatus),
    },
    {
      name: "Task Category",
      value: "taskCategories",
      options: Object.values(TaskCategory),
    },
  ],
  petListVolunteer: [
    {
      name: "Animal Tag",
      value: "animalTag",
      options: Object.values(AnimalTag),
    },
    {
      name: "Colour Level",
      value: "color",
      options: Object.values(ColorLevel),
    },
    {
      name: "Status",
      value: "status",
      // TODO: how to handle dynamically
      options: ["Needs Care", "Assigned to You"],
    },
    {
      name: "Task Category",
      value: "taskCategories",
      options: Object.values(TaskCategory),
    },
  ],
  userManagement: [
    {
      name: "Animal Tag",
      value: "animalTags",
      options: Object.values(AnimalTag),
    },
    {
      name: "Colour Level",
      value: "colorLevel",
      options: Object.values(ColorLevel),
    },
    {
      name: "Role",
      value: "role",
      options: Array.from(ALL_ROLES),
    },
    {
      name: "Status",
      value: "status",
      options: Array.from(STATUS),
    },
  ],
  taskManagement: [
    {
      name: "Task Category",
      mobileLabel: "Filter",
      value: "category",
      options: Object.values(TaskCategory),
    },
  ],
  interactionLog: [
    {
      name: "Interaction",
      value: "interactionType",
      kind: "grouped-checkbox",
      options: INTERACTION_TYPES,
      groups: INTERACTION_TYPE_GROUPS,
    },
    {
      name: "Animal Tag",
      value: "animalTag",
      options: Object.values(AnimalTag),
    },
    {
      name: "Role",
      value: "role",
      options: Array.from(ALL_ROLES),
    },
    {
      name: "Date",
      value: "date",
      kind: "date",
      options: [],
    },
  ],
};

export default filterConfig;
