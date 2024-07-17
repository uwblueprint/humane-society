import { Column, Model, Table } from "sequelize-typescript";

@Table({ timestamps: false, tableName: "pet_care_info" })
export default class PetCareInfo extends Model {
  @Column
  safety_info?: string;

  @Column
  medical_info?: string;

  @Column
  management_info?: string;
}
