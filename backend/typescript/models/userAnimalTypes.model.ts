import {
    Column,
    DataType,
    Model,
    Table,
    ForeignKey,
    BelongsTo,
  } from "sequelize-typescript";
  import Animal_Type from "./animalType.model";
  import User from "./user.model";
  
  @Table({ tableName: "user_animal_types" })
  export default class UserAnimalTypes extends Model {

    @ForeignKey(() => User)
    @Column({ type: DataType.INTEGER })
    user_id!: number;
  
    @BelongsTo(() => User)
    user!: User;

    @ForeignKey(() => Animal_Type)
    @Column({})
    animal_type_id!: number;
  
    @BelongsTo(() => Animal_Type)
    animal_type!: Animal_Type;
  }
  