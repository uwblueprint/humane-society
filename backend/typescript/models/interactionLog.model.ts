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
import Pets from "./pet.model";
import InteractionType from "./interactionType.model";

export type TargetType = "users" | "pets";
export type TargetModel = User | Pets;

interface PolymorphicTarget {
  target_type: TargetType;
  target_id: number;
}

@Table({
  tableName: "interaction_log",
  timestamps: true,
  createdAt: "created_at",
})
export default class Interaction extends Model {
  @ForeignKey(() => User)
  @Column({ allowNull: false })
  actor_id!: number;

  @BelongsTo(() => User, { foreignKey: "actor_id" })
  actor?: User;

  @Column({
    type: DataType.ENUM("users", "pets"),
    allowNull: false,
  })
  target_type!: "users" | "pets";

  @ForeignKey(() => InteractionType)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  interaction_type_id!: number;

  @BelongsTo(() => InteractionType)
  interaction_type?: InteractionType;

  @Column({ type: DataType.JSON, allowNull: false })
  metadata!: JSON;

  @Index
  @Column({ allowNull: false })
  target_id!: number;

  @BelongsTo(() => User, {
    foreignKey: "target_id",
    constraints: false,
    as: "target_user",
  })
  target_user?: User;

  @BelongsTo(() => Pets, {
    foreignKey: "target_id",
    constraints: false,
    as: "target_pet",
  })
  target_pet?: Pets;

  get target(): User | Pets | null {
    if (this.target_type === "users") {
      return this.target_user || null;
    }
    if (this.target_type === "pets") {
      return this.target_pet || null;
    }
    return null;
  }
}
