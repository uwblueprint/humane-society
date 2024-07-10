import { Column, Model, Table } from "sequelize-typescript";

@Table({ tableName: "activities" })
export default class Activity extends Model {
  @Column
  activity_name!: string;
}
