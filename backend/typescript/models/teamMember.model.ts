import {
    Column,
    DataType,
    Model,
    Table,
    AllowNull,
  } from "sequelize-typescript";
import { TeamRole, teamRoleValues } from "../types";

@Table({ tableName: "team_members" })
export default class TeamMember extends Model {
  @Column({ type: DataType.STRING, allowNull: false })
  first_name!: string;

  @Column({ type: DataType.STRING, allowNull: false })
  last_name!: string;

  @Column({ type: DataType.ENUM(...teamRoleValues), allowNull: false })
  team_role!: TeamRole;
}