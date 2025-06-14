import { Column, Model, Table, DataType } from "sequelize-typescript";

@Table({
  tableName: "interaction_log_type",
  timestamps: true,
  createdAt: "created_at",
})
export default class InteractionType extends Model {
  @Column({ type: DataType.STRING, allowNull: false })
  action_name!: string;

  @Column({ type: DataType.TEXT, allowNull: true })
  description?: string;
}
