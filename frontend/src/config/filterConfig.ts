import { ALL_ROLES, STATUS } from "../constants/AuthConstants";
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
      value: "category",
      options: Object.values(TaskCategory),
    },
  ],
  interactionLog: [
    {
      name: "Animal Tag",
      value: "animalTag",
      options: Object.values(AnimalTag),
    },
    {
      name: "Task Category",
      value: "taskCategory",
      options: Object.values(TaskCategory),
    },
  ],
};

export default filterConfig;
