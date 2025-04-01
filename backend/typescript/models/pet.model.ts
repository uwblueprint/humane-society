import { Column, Model, Table, DataType, HasOne } from "sequelize-typescript";
import PetCareInfo from "./petCareInfo.model";

import { Sex, PetStatus, AnimalTag } from "../types";

@Table({
  tableName: "pets",
  timestamps: true,
  createdAt: "created_at",
  updatedAt: "updated_at",
})
export default class Pet extends Model {
  @Column({
    type: DataType.ENUM(...Object.values(AnimalTag)),
    defaultValue: AnimalTag.DOG,
  })
  animal_tag!: AnimalTag;

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
  breed?: string;

  @Column({})
  birthday?: Date;

  @HasOne(() => PetCareInfo, { foreignKey: "pet_id" })
  petCareInfo?: PetCareInfo;

  @Column({})
  weight?: number;

  @Column({})
  color_level!: number;

  @Column({})
  neutered?: boolean;

  @Column({ type: DataType.ENUM("M", "F") })
  sex?: Sex;

  @Column({})
  photo?: string;

  @Column({})
  created_at!: Date;

  @Column({})
  updated_at?: Date;
}
