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

@Table({
  tableName: "interaction_log",
  timestamps: true,
  createdAt: "created_at",
})
export default class Interaction extends Model {
  @ForeignKey(() => User)
  @Column({ allowNull: false })
  actor_id!: number;

  @BelongsTo(() => User, { foreignKey: "actor_id", onDelete: "SET NULL" })
  actor!: User;

  @ForeignKey(() => User)
  @Column({ type: DataType.INTEGER, allowNull: true })
  target_user_id!: number;

  @BelongsTo(() => User, { foreignKey: "target_user_id", onDelete: "SET NULL" })
  target_user?: User;

  @ForeignKey(() => Pet)
  @Column({ type: DataType.INTEGER, allowNull: true })
  target_pet_id!: number;

  @BelongsTo(() => Pet, { foreignKey: "target_pet_id", onDelete: "SET NULL" })
  target_pet?: Pet;

  @ForeignKey(() => Activity)
  @Column({ type: DataType.INTEGER, allowNull: true })
  target_task_id!: number;

  @BelongsTo(() => Activity, { foreignKey: "target_task_id", onDelete: "SET NULL" })
  target_task?: Activity;

  @ForeignKey(() => ActivityType)
  @Column({ type: DataType.INTEGER, allowNull: true })
  target_task_template_id!: number;

  @BelongsTo(() => ActivityType, {
    foreignKey: "target_task_template_id",
    onDelete: "SET NULL",
  })
  target_task_template?: ActivityType;
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

  @Column({ type: DataType.STRING(256), allowNull: false })
  short_description!: string;

  @Column({ type: DataType.TEXT, allowNull: false })
  detailed_description!: string;
}
