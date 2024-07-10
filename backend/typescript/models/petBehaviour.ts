import { Column, Model, Table, DataType, ForeignKey, BelongsTo } from "sequelize-typescript";
import Behaviour from "./behaviour.model";
import Pet from "./pet.model";

@Table({ timestamps:false, tableName: "pet_behaviours" })
export default class PetBehaviour extends Model {
  @ForeignKey (()=> Pet)
  @Column({})
  pet_id!: number;

  @BelongsTo (()=>Pet)
  pet!: Pet;

  @ForeignKey (()=> Behaviour)
  @Column({})
  behaviour_id!: number;
  
  @BelongsTo (()=>Behaviour)
  behaviour!: Behaviour;

  @Column({})
  skill_level!: number;
}
