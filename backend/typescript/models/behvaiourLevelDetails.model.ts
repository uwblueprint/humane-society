import {
  Column,
  Model,
  Table,
  ForeignKey,
  DataType,
} from "sequelize-typescript";
import Behaviour from "./behaviour.model";
import { BehaviourLevel } from "../types";

@Table({ timestamps: false, tableName: "behvaiour_level_details" })
export default class BehaviourLevelDetails extends Model {
  @Column({ type: DataType.INTEGER, allowNull: false })
  id!: number;

  @ForeignKey(() => Behaviour)
  @Column({ type: DataType.INTEGER, allowNull: false })
  behaviour_id!: number;

  @Column({ type: DataType.ENUM, allowNull: false })
  level!: BehaviourLevel;

  @Column({ type: DataType.STRING, allowNull: false })
  description!: string;

  @Column({ type: DataType.STRING, allowNull: false })
  training_instructions!: string;
}
