import { Column, Model, Table } from "sequelize-typescript";

@Table({ timestamps: false, tableName: "activity_types" })
export default class ActivityType extends Model {
  @Column
  activity_name!: string;
}
