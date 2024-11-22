import {
  Column,
  Model,
  Table,
  DataType,
  ForeignKey,
  BelongsTo,
} from "sequelize-typescript";
import User from "./user.model";
import Pet from "./pet.model";
import ActivityType from "./activityType.model";

@Table({ timestamps: false, tableName: "activities" })
export default class Activity extends Model {
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

  @ForeignKey(() => ActivityType)
  @Column({})
  activity_type_id!: number;

  @BelongsTo(() => ActivityType)
  activity_type!: ActivityType;

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
