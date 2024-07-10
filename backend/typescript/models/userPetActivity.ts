// not started
import { Column, Model, Table, DataType, ForeignKey, BelongsTo } from "sequelize-typescript";
import User from "./user.model";
import Pet from "./pet.model";
import Activity from "./activity.model";

@Table({ timestamps:false, tableName: "user_pet_activities" })
export default class UserPetActivity extends Model {
  @Column({})
  user_pet_activity_id!: number;

  @ForeignKey (()=> User) // in case of null, task has not been assigned
  @Column({})
  user_id?: number;

  @BelongsTo (()=>User)
  user?: User;

  @ForeignKey (()=> Pet)
  @Column({})
  pet_id!: number;

  @BelongsTo (()=>Pet)
  pet!: Pet;

  @ForeignKey (()=> Activity)
  @Column({})
  activity_id!: number;
  
  @BelongsTo (()=> Activity)
  activity!: Activity;

  @Column({})
  scheduled_start_time?: Date;

  @Column({})
  start_time?: Date;

  @Column({})
  end_time?: Date;

  @Column({type: DataType.TEXT})
  notes?: string;

  @Column({})
  created_at!: Date;

  @Column({})
  updated_at?: Date;
}
