import {
  Column,
  DataType,
  Model,
  ForeignKey,
  BelongsTo,
  Table,
  AllowNull,
} from "sequelize-typescript";
import { InteractionTypeEnum } from "../types";

@Table({ tableName: "interaction_type" })
export default class Interaction_Type extends Model {

  @Column({ type: DataType.ENUM(
    "Task Assigned",
    "Task Self-Assigned",
    "Task Unassigned",
    "Task Started",
    "Task Restarted",
    "Task Completed",
    "Task Incomplete",
    "Task Inactive",
    "Task Deleted",
    "Task Assignee Changed",
    "Task Instructions Changed",
    "Task Start Date Changed",
    "Task End Date Changed",
    "Recurring Task Deleted",
    "Recurring Task Name Changed",
    "Recurring Task Days Changed",
    "Recurring Task Cadence Changed",
    "User Name Changed",
    "User Color Level Changed",
    "User Role Changed",
    "User Invited",
    "User Deleted",
    "Pet Deleted",
    "Pet Name Changed",
    "Pet Color Level Changed",
    "Pet Neuter Status Changed",
    "Pet Safety Info Changed",
    "Pet Medical Info Changed",
    "Pet Management Info Changed",
    "Task Template Deleted",
    "Task Template Name Changed",
    "Task Template Instructions Changed",
  ), allowNull: false })
  action_type!: InteractionTypeEnum;

  @Column({ type: DataType.STRING, allowNull: false })
  short_description!: string;

  @Column({ type: DataType.STRING, allowNull: false })
  detailed_description!: string;
}
