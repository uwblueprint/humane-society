import {
  Column,
  DataType,
  Model,
  ForeignKey,
  BelongsTo,
  Table,
  AllowNull,
} from "sequelize-typescript";
import User from "./user.model";
import Pets from "./pet.model";
import Interaction_Type from "./interactionType.model";

@Table({
  tableName: "interaction_log",
  timestamps: true,
  createdAt: "created_at",
})
export default class Interaction extends Model {
  // TODO: check primary key added by default

  @ForeignKey(() => User)
  @Column({ allowNull: false })
  actor_id!: number;

  @BelongsTo(() => User)
  user?: User;

  @Column({ type: DataType.ENUM("users", "pets"), allowNull: false })
  target_type!: string;
 
  
  @ForeignKey(() => Interaction_Type)
  @Column({ type: Interaction_Type, allowNull: false })
  interaction_type_id!: string;
  @BelongsTo(() => Interaction_Type)
  action_type?: string;

  @ForeignKey(() => User)
  @ForeignKey(() => Pets)
  @Column({ allowNull: false })
  target_id!: number;

  @BelongsTo(() => User, { foreignKey: "target_id", constraints: false })
  id?: number;

  @BelongsTo(() => Pets, { foreignKey: "target_id", constraints: false })
  pet_id?: number;

  @Column({ type: DataType.JSON, allowNull: false })
  metadata!: object;
}
