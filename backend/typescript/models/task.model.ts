import {
  Column,
  Model,
  Table,
  DataType,
  ForeignKey,
  BelongsTo,
  HasOne,
} from "sequelize-typescript";
import User from "./user.model";
import Pet from "./pet.model";
import TaskTemplate from "./taskTemplate.model";
import RecurrenceTask from "./recurrence_task.model";

@Table({
  tableName: "tasks",
  timestamps: true,
  createdAt: "created_at",
  updatedAt: "updated_at",
})
export default class Task extends Model {
  @ForeignKey(() => User) // in case of null, task has not been assigned
  @Column({})
  user_id?: number;

  @BelongsTo(() => User)
  user?: User;

  @ForeignKey(() => Pet)
  @Column({})
  pet_id!: number;

  @BelongsTo(() => Pet)
  pet!: Pet;

  @ForeignKey(() => TaskTemplate)
  @Column({})
  task_template_id!: number;

  @BelongsTo(() => TaskTemplate)
  task_template!: TaskTemplate;

  @HasOne(() => RecurrenceTask)
  recurrence?: RecurrenceTask;

  @Column({})
  scheduled_start_time?: Date;

  @Column({})
  start_time?: Date;

  @Column({})
  end_time?: Date;

  @Column({ type: DataType.TEXT })
  notes?: string;

  @Column({})
  created_at!: Date;

  @Column({})
  updated_at?: Date;
}
