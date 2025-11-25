import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  BelongsTo,
} from "sequelize-typescript";
import Task from "./task.model";

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
    type: DataType.ARRAY(
      DataType.ENUM("Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun")
    ),
    allowNull: true,
  })
  days?: string[];

  @Column({
    type: DataType.ENUM("Weekly", "Biweekly", "Monthly", "Annually"),
    allowNull: false,
  })
  cadence!: string;

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
