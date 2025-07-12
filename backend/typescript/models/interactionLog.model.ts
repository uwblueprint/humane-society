import {
  Column,
  DataType,
  Model,
  ForeignKey,
  BelongsTo,
  Table,
  Index,
} from "sequelize-typescript";
import User from "./user.model";
import InteractionType from "./interactionType.model";
import Pet from "./pet.model";
import Activity from "./activity.model";
import ActivityType from "./activityType.model";

export type TargetType = "users" | "pets";
export type TargetModel = User | Pet;

@Table({
  tableName: "interaction_log",
  timestamps: true,
  createdAt: "created_at",
})
export default class Interaction extends Model {
  @ForeignKey(() => User)
  @Column({ allowNull: false })
  actor_id!: number;

  @BelongsTo(() => User)
  actor?: User;

  @ForeignKey(() => Pet)
  @Column({
    type: DataType.INTEGER,
    allowNull: true,
  })
  target_pet_id!: number;

  @BelongsTo(() => Pet)
  pet?: Pet;

  @ForeignKey(() => Activity)
  @Column({
    type: DataType.INTEGER,
    allowNull: true,
  })
  target_task_id!: number;

  @BelongsTo(() => Activity)
  task?: Activity;

  @ForeignKey(() => ActivityType)
  @Column({
    type: DataType.INTEGER,
    allowNull: true,
  })
  target_activity_type_id!: number;

  @BelongsTo(() => ActivityType)
  activity_type?: ActivityType;

  @ForeignKey(() => InteractionType)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  interaction_type_id!: number;

  @BelongsTo(() => InteractionType)
  interaction_type?: InteractionType;

  // Used to store the different filters
  @Column({ type: DataType.ARRAY(DataType.STRING), allowNull: false })
  metadata!: Array<string>;

  @Column({ type: DataType.STRING, allowNull: false })
  short_description!: string;

  @Column({ type: DataType.STRING, allowNull: false })
  detailed_description!: string;

  @Index
  @Column({ allowNull: false })
  target_id!: number;
}
