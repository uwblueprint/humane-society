import { Column, Model, Table, ForeignKey, BelongsTo } from "sequelize-typescript";
import Pet from "./pet.model"

@Table({ tableName: "pet_care_info" })
export default class PetCareInfo extends Model {
  
  @ForeignKey(() => Pet)
  @Column
  pet_id!: number;

  @BelongsTo(() => Pet)
  pet!: Pet;

  @Column
  safety_info?: string;

  @Column
  medical_info?: string;

  @Column
  management_info?: string;

}
