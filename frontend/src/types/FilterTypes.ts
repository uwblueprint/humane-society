export type FilterOptionGroup = {
  label: string;
  options: string[];
};

export type FilterSection = {
  name: string;
  mobileLabel?: string;
  options: string[];
  value: string;
  kind?: "checkbox" | "date" | "grouped-checkbox";
  groups?: FilterOptionGroup[];
};
