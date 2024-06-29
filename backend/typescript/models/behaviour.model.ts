import { Column, Model, Table } from "sequelize-typescript";

@Table({ timestamps: false, tableName: "behaviours" })
export default class Behaviour extends Model {
  @Column
  behaviour_name!: string;
}
