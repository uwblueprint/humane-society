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

import { Sex, PetStatus } from "../types";

@Table({ timestamps: false, tableName: "pets" })
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
