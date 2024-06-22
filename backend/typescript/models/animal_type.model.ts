import { Column, Model, Table, DataType, HasMany, PrimaryKey, AutoIncrement } from "sequelize-typescript";
import Pet from "./pet.model"
@Table({ tableName: "animal_types" })
export default class Animal_Type extends Model {
  @PrimaryKey
  @AutoIncrement
  @Column({
    type: DataType.INTEGER,
  })
  id!: number;

  @Column({
    type: DataType.STRING,
    allowNull:false
  })
  animal_type_name!: string;
  @HasMany(() => Pet)
  pets!: Pet[];
}
