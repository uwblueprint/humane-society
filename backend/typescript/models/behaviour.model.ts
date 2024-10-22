import {
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
} from "sequelize-typescript";

@Table({ timestamps: false, tableName: "behaviours" })
export default class Behaviour extends Model {
  @Column({ type: DataType.STRING, allowNull: false })
  behaviour_name!: string;

  @ForeignKey(() => Behaviour)
  @Column({ type: DataType.INTEGER })
  parent_behaviour_id?: number | null;
}
