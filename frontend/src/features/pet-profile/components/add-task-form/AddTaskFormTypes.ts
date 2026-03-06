import { Task } from "../../../../types/TaskTypes";

export interface AddTaskFormData {

  // page 1
  search: string;
  selectedTemplate: Task | null;


  // page 2
  taskName: string;
  taskCategory: string;
  instructions: string;

  startDateDay: string;
  startDateMonth: string;
  startDateYear: string;
  startTimeMinute: string;
  startTimeHour: string;
  endTimeMinute: string;
  endTimeHour: string;
  
  isRepeating: boolean;
  recurringDays: string[];
  recurringCadence: string;
  endDateDay: string;
  endDateMonth: string;
  endDateYear: string;

}
