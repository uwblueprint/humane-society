import { Column, Model, Table, DataType } from "sequelize-typescript";
import { TaskCategory } from "../types";

@Table({ timestamps: false, tableName: "task_templates" })
export default class TaskTemplate extends Model {
  @Column({ type: DataType.STRING, allowNull: false })
  task_name!: string;

  @Column({
    type: DataType.ENUM(...Object.values(TaskCategory)),
    allowNull: false,
  })
  category!: TaskCategory;

  @Column({ type: DataType.TEXT, allowNull: true })
  instruction?: string;
}
