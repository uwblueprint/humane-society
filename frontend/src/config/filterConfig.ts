import { FilterSection } from "../constants/FilterConstants";

const filterConstants: Record<string, FilterSection[]> = {
  petList: [
    {
      name: "Species",
      options: [
        { value: "dog", label: "Dogs" },
        { value: "cat", label: "Cats" },
        { value: "bird", label: "Birds" },
        { value: "small_animal", label: "Small Animals" },
      ],
    },
    {
      name: "Age",
      options: [
        { value: "baby", label: "Baby" },
        { value: "young", label: "Young" },
        { value: "adult", label: "Adult" },
        { value: "senior", label: "Senior" },
      ],
    },
    {
      name: "Size",
      options: [
        { value: "small", label: "Small" },
        { value: "medium", label: "Medium" },
        { value: "large", label: "Large" },
        { value: "xlarge", label: "Extra Large" },
      ],
    },
    {
      name: "Gender",
      options: [
        { value: "male", label: "Male" },
        { value: "female", label: "Female" },
      ],
    },
    {
      name: "Status",
      options: [
        { value: "adoptable", label: "Adoptable" },
        { value: "adopted", label: "Adopted" },
        { value: "pending", label: "Pending Adoption" },
        { value: "foster", label: "In Foster" },
      ],
    },
  ],
  userManagement: [
    {
      name: "Role",
      options: [
        { value: "admin", label: "Admin" },
        { value: "staff", label: "Staff" },
        { value: "volunteer", label: "Volunteer" },
      ],
    },
    {
      name: "Status",
      options: [
        { value: "active", label: "Active" },
        { value: "inactive", label: "Inactive" },
        { value: "pending", label: "Pending Approval" },
      ],
    },
  ],
};

export default filterConstants;
