export type InteractionDTO = {
  id: number;
  shortDescription: string;
  longDescription: string;
  createdAt: string;
  interactionType: string;
  actor: {
    id: number;
    firstName: string;
    lastName: string;
    role: string;
    profilePhoto: string | null;
  };
};

// Mirror of backend InteractionTypeEnum (backend/typescript/types.ts).
// String values MUST stay exactly in sync — logInteraction matches on them.
export enum InteractionType {
  ASSIGNED_TASK = "Assigned Task",
  SELF_ASSIGNED_TASK = "Self-Assigned Task",
  UNASSIGNED_TASK = "Unassigned Task",
  STARTED_TASK = "Started Task",
  RESTARTED_TASK = "Restarted Task",
  COMPLETED_TASK = "Completed Task",
  MARKED_TASK_INCOMPLETE = "Incomplete Task",
  MARKED_TASK_INACTIVE = "Inactive Task",
  DELETED_TASK = "Deleted Task",
  CHANGED_TASK_ASSIGNEE = "Changed Task Assignee",
  CHANGED_TASK_INSTRUCTIONS = "Changed Task Instructions",
  CHANGED_TASK_START_DATE = "Changed Task Start Date",
  CHANGED_TASK_END_DATE = "Changed Task End Date",
  DELETED_RECURRING_TASK = "Deleted Recurring Task",
  CHANGED_RECURRING_TASK_NAME = "Changed Recurring Task Name",
  CHANGED_RECURRING_TASK_DAYS = "Changed Recurring Task Days",
  CHANGED_RECURRING_TASK_CADENCE = "Changed Recurring Task Cadence",
  CHANGED_USER_NAME = "Changed User Name",
  CHANGED_USER_COLOR_LEVEL = "Changed User Color Level",
  CHANGED_USER_ROLE = "Changed User Role",
  INVITED_USER = "Invited User",
  DELETED_USER = "Deleted User",
  DELETED_PET = "Deleted Pet",
  CHANGED_PET_NAME = "Changed Pet Name",
  CHANGED_PET_COLOR_LEVEL = "Changed Pet Color Level",
  CHANGED_PET_NEUTER_STATUS = "Changed Pet Neuter Status",
  CHANGED_PET_SAFETY_INFO = "Changed Pet Safety Info",
  CHANGED_PET_MEDICAL_INFO = "Changed Pet Medical Info",
  CHANGED_PET_MANAGEMENT_INFO = "Changed Pet Management Info",
  DELETED_TASK_TEMPLATE = "Deleted Task Template",
  CHANGED_TASK_TEMPLATE_NAME = "Changed Task Template Name",
  CHANGED_TASK_TEMPLATE_INSTRUCTIONS = "Changed Task Template Instructions",
}
