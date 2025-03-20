export type FilterOption = {
  label: string;
  value: string;
};

export type FilterSection = {
  name: string;
  options: FilterOption[];
};

export const filterConfigs: Record<string, FilterSection[]> = {
  petList: [
    {
      name: "Animal Type",
      options: [
        { label: "Bird", value: "bird" },
        { label: "Bunny", value: "bunny" },
        { label: "Cat", value: "cat" },
        { label: "Dog", value: "dog" },
        { label: "Small Animal", value: "hamster" },
      ],
    },
    {
      name: "Task",
      options: [
        { label: "Games", value: "games" },
        { label: "Husbandry", value: "husbandry" },
        { label: "Pen Time", value: "pen-time" },
        { label: "Training", value: "training" },
        { label: "Walk", value: "walk" },
        { label: "Misc", value: "misc" },
      ],
    },
    {
      name: "Status",
      options: [
        { label: "Assigned to me", value: "assigned-to-me" },
        { label: "Needs Care", value: "needs-care-volunteer" },
        { label: "Does not need care", value: "does-not-need-care" },
        { label: "Needs Care", value: "needs-care-admin" },
      ],
    },
    {
      name: "Color Level",
      options: [
        { label: "Green", value: "green" },
        { label: "Yellow", value: "yellow" },
        { label: "Orange", value: "orange" },
        { label: "Red", value: "red" },
        { label: "Blue", value: "blue" },
      ],
    },
  ],
  userManagement: [],
};
