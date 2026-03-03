import { Task } from "../../../../types/TaskTypes";

export interface AddTaskFormData {
  search: string;
  selectedTemplate: Task | null;
}
