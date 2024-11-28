import {
  Column,
  Model,
  Table,
  ForeignKey,
  BelongsTo,
  DataType,
} from "sequelize-typescript";
import Behaviour from "./behaviour.model";
import User from "./user.model";

@Table({ timestamps: false, tableName: "user_behaviours" })
export default class UserBehaviour extends Model {
  @ForeignKey(() => User)
  @Column({ type: DataType.INTEGER, allowNull: false })
  user_id!: number;

  @BelongsTo(() => User)
  user!: User;

  @ForeignKey(() => Behaviour)
  @Column({ type: DataType.INTEGER, allowNull: false })
  behaviour_id!: number;

  @BelongsTo(() => Behaviour)
  behaviour!: Behaviour;

  @Column({ type: DataType.INTEGER, allowNull: false })
  max_level!: number;
}
