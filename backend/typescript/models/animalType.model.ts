import { Column, Model, Table, BelongsToMany } from "sequelize-typescript";
import UserAnimalType from "./userAnimalType.model";
import User from "./user.model";

@Table({ timestamps: false, tableName: "animal_types" })
export default class AnimalType extends Model {
  @Column({})
  animal_type_name!: string;

  @BelongsToMany(() => User, () => UserAnimalType)
  users!: User[];
}
