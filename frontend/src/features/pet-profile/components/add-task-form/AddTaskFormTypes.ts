import { Task } from "../../../../types/TaskTypes";

export interface AddTaskFormData {

  // page 1
  search: string;
  selectedTemplate: Task | null;


  // page 2
  taskName: string;
  taskCategory: string;
  instructions: string;

  startDay: string;
  startMonth: string;
  startYear: string;
  startMinute: string;
  startHour: string;
  endMinute: string;
  endHour: string;
  
  isRepeating: boolean;
  recurringDays: string[];
  recurringFrequency: string;
  endDay: string;
  endMonth: string;
  endYear: string;

}
