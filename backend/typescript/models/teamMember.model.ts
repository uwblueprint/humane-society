import {
    Column,
    DataType,
    Model,
    Table,
    AllowNull,
  } from "sequelize-typescript";
  import { TeamRole } from "../types";
  
  @Table({ tableName: "team_members" })
  export default class User extends Model {
    @Column({ type: DataType.STRING, allowNull: false })
    first_name!: string;
  
    @Column({ type: DataType.STRING, allowNull: false })
    last_name!: string;
  
    @AllowNull(false)
    @Column({ type: DataType.ENUM("PM", "DESIGNER", "PL", "DEVELOPER"), allowNull: false })
    team_role!: TeamRole;
  }
  