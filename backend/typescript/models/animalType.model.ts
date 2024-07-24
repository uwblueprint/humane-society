import { Column, Model, Table, BelongsToMany } from "sequelize-typescript";
import User from "./user.model";
import UserAnimalTypes from "./userAnimalTypes.model";

@Table({ timestamps: false, tableName: "animal_types" })
export default class AnimalType extends Model {
  @Column({})
  animal_type_name!: string;

  @BelongsToMany(() => User, { through: () => UserAnimalTypes })
  users?: User[];
}
