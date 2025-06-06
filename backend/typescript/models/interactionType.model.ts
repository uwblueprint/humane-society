import {
  Column,
  DataType,
  Model,
  ForeignKey,
  BelongsTo,
  Table,
  AllowNull,
} from "sequelize-typescript";
import { InteractionTypeEnum } from "../types";

@Table({ tableName: "interaction_type" })
export default class Interaction_Type extends Model {
  // TODO: check primary key added by default
  @Column({ type: InteractionTypeEnum, allowNull: false })
  action_type!: string;

  @Column({ type: DataType.STRING, allowNull: false })
  short_description!: string;

  @Column({ type: DataType.STRING, allowNull: false })
  detailed_description!: string;
}
