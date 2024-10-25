import {
  Column,
  Model,
  Table,
  ForeignKey,
  DataType,
} from "sequelize-typescript";
import Behaviour from "./behaviour.model";

@Table({ timestamps: false, tableName: "behaviour_level_details" })
export default class BehaviourLevelDetails extends Model {
  @ForeignKey(() => Behaviour)
  @Column({ type: DataType.INTEGER, allowNull: false })
  behaviour_id!: number;

  @Column({ type: DataType.INTEGER, allowNull: false })
  level!: number;

  @Column({ type: DataType.STRING, allowNull: true })
  description?: string;

  @Column({ type: DataType.STRING, allowNull: true })
  training_instructions?: string;
}
