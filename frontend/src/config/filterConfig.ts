import { ALL_ROLES, STATUS } from "../constants/AuthConstants";
import { FilterSection } from "../types/FilterTypes";
import { AnimalTag, TaskCategory, ColorLevel } from "../types/TaskTypes";

const filterConfig: Record<string, FilterSection[]> = {
  petListAdmin: [
    {
      name: "Animal Tag",
      value: "animalTag",
      options: Object.values(AnimalTag),
    },
    {
      name: "Task Category",
      value: "taskCategories",
      options: Object.values(TaskCategory),
    },
    {
      name: "Status",
      value: "status",
      // TODO: how to handle dynamically
      options: ["Needs Care", "Does Not Need Care"],
    },
    {
      name: "Colour Level",
      value: "skill",
      options: Object.values(ColorLevel),
    },
  ],
  petListVolunteer: [
    {
      name: "Animal Tag",
      value: "animalTag",
      options: Object.values(AnimalTag),
    },
    {
      name: "Task Category",
      value: "taskCategories",
      options: Object.values(TaskCategory),
    },
    {
      name: "Status",
      value: "status",
      // TODO: how to handle dynamically
      options: ["Needs Care", "Assigned to You"],
    },
    {
      name: "Colour Level",
      value: "skill",
      options: Object.values(ColorLevel),
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
};

export default filterConfig;
