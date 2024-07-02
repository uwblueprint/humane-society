import { Column, DataType, Model, Table } from "sequelize-typescript";

@Table({ tableName: "roles" })
export default class Role extends Model {
  @Column({ type: DataType.STRING })
  role_name!: string;
}
