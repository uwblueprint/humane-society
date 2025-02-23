import { Column, Model, Table, DataType } from "sequelize-typescript";
import { Category } from "../types";

@Table({ timestamps: false, tableName: "activity_types" })
export default class ActivityType extends Model {
  @Column({ type: DataType.STRING, allowNull: false })
  activity_name!: string;

  @Column({
    type: DataType.ENUM(...Object.values(Category)),
    allowNull: false,
  })
  category!: Category;

  @Column({ type: DataType.TEXT, allowNull: true })
  instruction?: string;
}
