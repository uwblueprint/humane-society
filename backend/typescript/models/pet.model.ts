import {
  Column,
  Model,
  Table,
  ForeignKey,
  BelongsTo,
  DataType,
  HasOne,
} from "sequelize-typescript";
import Animal_Type from "./animalType.model";
import PetCareInfo from "./petCareInfo.model";

import { Sex, PetStatus, ColorLevel } from "../types";

@Table({
  tableName: "pets",
  timestamps: true,
  createdAt: "created_at",
  updatedAt: "updated_at",
})
export default class Pet extends Model {
  @ForeignKey(() => Animal_Type)
  @Column({})
  animal_type_id!: number;

  @BelongsTo(() => Animal_Type)
  animal_type!: Animal_Type;

  @Column({})
  name!: string;

  @Column({
    type: DataType.ENUM(
      "Assigned",
      "Active",
      "Needs Care",
      "Does Not Need Care",
    ),
  })
  status!: PetStatus;

  @Column({})
  breed!: string;

  @Column({})
  age!: number;

  @Column({})
  adoption_status!: boolean;

  @HasOne(() => PetCareInfo, { foreignKey: "pet_id" })
  petCareInfo?: PetCareInfo;

  @Column({})
  weight!: number;

  @Column({ type: DataType.ENUM("Red", "Yellow", "Orange", "Green", "Blue")})
  color_level!: ColorLevel;

  @Column({})
  neutered!: boolean;

  @Column({ type: DataType.ENUM("M", "F") })
  sex!: Sex;

  @Column({})
  photo!: string;

  @Column({})
  created_at!: Date;

  @Column({})
  updated_at?: Date;
}
