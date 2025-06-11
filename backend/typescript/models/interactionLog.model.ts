import {
  Column,
  Model,
  Table,
  DataType,
  ForeignKey,
} from "sequelize-typescript";
import User from "./user.model";
import Pet from "./pet.model";
import Activity from "./activity.model";
import InteractionType from "./interactionType.model";

@Table({
  tableName: "interaction_log",
  timestamps: true,
  createdAt: "created_at",
})
export default class InteractionLog extends Model {
  @ForeignKey(() => User)
  @Column({ type: DataType.INTEGER, allowNull: true })
  actor_id?: number;

  @ForeignKey(() => Pet)
  @Column({ type: DataType.INTEGER, allowNull: true })
  target_pet_id?: number;

  @ForeignKey(() => User)
  @Column({ type: DataType.INTEGER, allowNull: true })
  target_user_id?: number;

  @ForeignKey(() => Activity)
  @Column({ type: DataType.INTEGER, allowNull: true })
  target_activity_id?: number;

  @ForeignKey(() => InteractionType)
  @Column({ type: DataType.INTEGER, allowNull: false })
  interaction_type_id!: number;

  @Column({ type: DataType.JSONB, allowNull: true })
  metadata?: Record<string, any>;
}
