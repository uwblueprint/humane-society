import { Column, Model, Table } from "sequelize-typescript";

@Table({ timestamps: false, tableName: "animal_types" })
export default class AnimalType extends Model {
  @Column({})
  animal_type_name!: string;
}
