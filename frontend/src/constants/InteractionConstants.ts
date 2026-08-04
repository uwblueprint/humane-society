export type InteractionTypeGroup = {
  label: string;
  options: string[];
};

export const INTERACTION_TYPE_GROUPS: InteractionTypeGroup[] = [
  {
    label: "Task Status Details",
    options: [
      "Assigned Task",
      "Self-Assigned Task",
      "Unassigned Task",
      "Completed Task",
      "Inactive Task",
      "Started Task",
      "Restarted Task",
      "Incomplete Task",
    ],
  },
  {
    label: "Task Details",
    options: [
      "Deleted Task",
      "Changed Task Assignee",
      "Changed Task Instructions",
      "Changed Task Start Date",
      "Changed Task End Date",
      "Deleted Recurring Task",
      "Changed Recurring Task Days",
      "Changed Recurring Task Cadence",
    ],
  },
  {
    label: "Personal Details",
    options: [
      "Changed User Name",
      "Changed User Color Level",
      "Changed User Role",
    ],
  },
  {
    label: "User Details",
    options: ["Deleted User", "Invited User"],
  },
  {
    label: "Pet Details",
    options: [
      "Deleted Pet",
      "Changed Pet Name",
      "Changed Pet Color Level",
      "Changed Pet Neuter Status",
      "Changed Pet Safety Info",
      "Changed Pet Medical Info",
      "Changed Pet Management Info",
    ],
  },
  {
    label: "Task Template Details",
    options: [
      "Deleted Task Template",
      "Changed Task Template Name",
      "Changed Task Template Instructions",
    ],
  },
];

const INTERACTION_TYPES = INTERACTION_TYPE_GROUPS.flatMap(
  (group) => group.options,
);

export default INTERACTION_TYPES;
