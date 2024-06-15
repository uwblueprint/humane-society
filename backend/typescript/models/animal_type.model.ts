import { Column, Model, Table, DataType, HasMany, PrimaryKey, AutoIncrement } from "sequelize-typescript";
// import {Pet} from "./Pet"
@Table({ tableName: "animal_types" })
export default class Animal_Type extends Model {
  @PrimaryKey
  @AutoIncrement
  @Column({
    type: DataType.INTEGER,
  })
  animal_type_id!: number;

  @Column({
    type: DataType.STRING,
    allowNull:false
  })
  animal_type_name!: string;

  //@HasMany(() => Pet)
  //pets!: Pet[];
}
