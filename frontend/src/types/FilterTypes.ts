export type FilterSection = {
  name: string;
  options: string[];
  value: string;
  kind?: "checkbox" | "date";
};
