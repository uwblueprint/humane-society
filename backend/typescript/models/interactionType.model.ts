import { Column, DataType, Model, Table } from "sequelize-typescript";
import { InteractionTypeEnum } from "../types";

@Table({ tableName: "interaction_types" })
export default class InteractionType extends Model {
  @Column({
    type: DataType.ENUM(
      // Task Status
      "Assigned Task",
      "Self-Assigned Task",
      "Unassigned Task",
      "Started Task",
      "Restarted Task",
      "Completed Task",
      "Incomplete Task",
      "Inactive Task",

      // Task Details
      "Deleted Task",
      "Changed Task Assignee",
      "Changed Task Instructions",
      "Changed Task Start Date",
      "Changed Task End Date",
      "Deleted Recurring Task",
      "Changed Recurring Task Name",
      "Changed Recurring Task Days",
      "Changed Recurring Task Cadence",

      // Personal Details
      "Changed User Name",
      "Changed User Color Level",
      "Changed User Role",

      // User Details
      "Invited User",
      "Deleted User",

      // Pet Details
      "Deleted Pet",
      "Changed Pet Name",
      "Changed Pet Color Level",
      "Changed Pet Neuter Status",
      "Changed Pet Safety Info",
      "Changed Pet Medical Info",
      "Changed Pet Management Info",

      // Task Template Details
      "Deleted Task Template",
      "Changed Task Template Name",
      "Changed Task Template Instructions",
    ),
    allowNull: false,
  })
  action_type!: InteractionTypeEnum;
}
