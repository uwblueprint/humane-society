/* eslint-disable import/no-cycle */
import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  BelongsTo,
} from "sequelize-typescript";
import Task from "./task.model";
import { Cadence, Days } from "../types";

@Table({
  tableName: "recurrence_tasks",
  timestamps: true,
  createdAt: "created_at",
  updatedAt: "updated_at",
})
export default class RecurrenceTask extends Model {
  @ForeignKey(() => Task)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    primaryKey: true,
  })
  task_id!: number;

  @BelongsTo(() => Task)
  task!: Task;

  @Column({
    type: DataType.ARRAY(DataType.ENUM(...Object.values(Days))),
    allowNull: true,
  })
  days?: Days[];

  @Column({
    type: DataType.ENUM(...Object.values(Cadence)),
    allowNull: false,
  })
  cadence!: Cadence;

  @Column({
    type: DataType.DATE,
    allowNull: true,
  })
  end_date?: Date | null;

  @Column({
    type: DataType.ARRAY(DataType.DATE),
    allowNull: true,
  })
  exclusions?: Date[];
}
