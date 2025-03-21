import { FilterSection } from "../types/FilterTypes";
import { AnimalTag, TaskCategory, SkillLevel } from "../types/TaskTypes";
const filterConstants: Record<string, FilterSection[]> = {
  petListAdmin: [
    {
      name: "Animal Tag",
      value: "petTag",
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
      options: Object.values(SkillLevel),
    },
  ],
  petListVolunteer: [
    {
      name: "Animal Tag",
      value: "petTag",
      options: Object.values(AnimalTag),
    },
    {
      name: "Task Category",
      value: "taskCategories",
      options: Object.values(TaskCategory)
    },
    {
      name: "Status",
      value: "status",
      // TODO: how to handle dynamically
      options: [
        "Needs Care",
        "Assigned to You",
      ],
    },
    {
      name: "Colour Level",
      value: "skill",
      options: Object.values(SkillLevel),
    },
  ],
  userManagement: [
    {
      name: "Role",
      value: "role",
      // TODO: create enums for these
      options: [
        "Admin",
        "Staff",
        "Volunteer",
      ],
    },
    {
      name: "Status",
      value: "status",
      // TODO: create enums for these
      options: [
        "Active",
        "Inactive",
        "Pending Approval",
      ],
    },
  ],
};

export default filterConstants;