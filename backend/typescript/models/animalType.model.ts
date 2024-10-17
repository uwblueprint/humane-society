import { Column, Model, Table, BelongsToMany } from "sequelize-typescript";
import type User from "./user.model";

@Table({ timestamps: false, tableName: "animal_types" })
export default class AnimalType extends Model {
  @Column({})
  animal_type_name!: string;

  @BelongsToMany(
    () => import("./user.model").then((mod) => mod.default),
    () => import("./userAnimalType.model").then((mod) => mod.default),
  )
  users!: User[];
}
