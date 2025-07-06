import { Column, Model, Table, DataType, HasOne } from "sequelize-typescript";
import PetCareInfo from "./petCareInfo.model";

import { Sex, PetStatus, AnimalTag, petStatusEnum } from "../types";

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
    type: DataType.ENUM(...petStatusEnum),
  })
  status!: PetStatus;

  @Column({})
  breed?: string;

  @Column({ type: DataType.DATEONLY })
  birthday?: string;

  @HasOne(() => PetCareInfo, { foreignKey: "pet_id" })
  petCareInfo?: PetCareInfo;

  @Column({})
  weight?: number;

  @Column({ type: DataType.INTEGER })
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
