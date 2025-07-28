import { Column, DataType, Model, Table } from "sequelize-typescript";
import { InteractionTypeEnum } from "../types";

@Table({ tableName: "interaction_types" })
export default class InteractionType extends Model {
  @Column({
    type: DataType.ENUM(
      ...Object.values(InteractionTypeEnum)
    ),
    allowNull: false,
  })
  action_type!: InteractionTypeEnum;
}
