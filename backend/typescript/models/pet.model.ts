import {
  Column,
  Model,
  Table,
  ForeignKey,
  BelongsTo,
  DataType,
} from "sequelize-typescript";
import Animal_Type from "./animalType.model";
// import { PetCareInfo } from "./PetCareInfo"

import { Sex, PetStatus } from "../types";

@Table({ timestamps: false, tableName: "pet" })
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

  //   @ForeignKey(() => PetCareInfo)
  //   @Column ({ type: DataType.INTEGER })
  //   pet_care_info_id?: number;

  //   @BelongsTo(() => PetCareInfo)
  //   petCareInfo?: PetCareInfo;

  @Column({})
  weight!: number;

  @Column({})
  spayed!: boolean;

  @Column({ type: DataType.ENUM("M", "F") })
  sex!: Sex;

  @Column({})
  photo!: string;

  @Column({})
  created_at!: Date;

  @Column({})
  updated_at?: Date;
}
