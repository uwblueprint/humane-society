import {
  Column,
  Model,
  Table,
  ForeignKey,
  BelongsTo,
  DataType,
} from "sequelize-typescript";
import Behaviour from "./behaviour.model";
import Pet from "./pet.model";

@Table({ timestamps: false, tableName: "pet_behaviours" })
export default class PetBehaviour extends Model {
  @ForeignKey(() => Pet)
  @Column({ type: DataType.INTEGER, allowNull: false })
  pet_id!: number;

  @BelongsTo(() => Pet)
  pet!: Pet;

  @ForeignKey(() => Behaviour)
  @Column({ type: DataType.INTEGER, allowNull: false })
  behaviour_id!: number;

  @BelongsTo(() => Behaviour)
  behaviour!: Behaviour;

  @Column({ type: DataType.INTEGER, allowNull: false })
  skill_level!: number;

  @Column({ type: DataType.INTEGER, allowNull: false })
  level!: number;

  @Column({ type: DataType.BOOLEAN, allowNull: false })
  is_highlighted!: boolean;
}
