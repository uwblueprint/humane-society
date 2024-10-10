import {
  Column,
  DataType,
  Model,
  Table,
  AllowNull,
} from "sequelize-typescript";
import { TeamRole, teamRoleEnum } from "../types";

@Table({ timestamps: false, tableName: "team_members" })
export default class TeamMember extends Model {
  @Column({ type: DataType.STRING, allowNull: false })
  first_name!: string;

  @Column({ type: DataType.STRING, allowNull: false })
  last_name!: string;

  @AllowNull(false)
  @Column({
    type: DataType.ENUM(...Object.values(teamRoleEnum)),
    allowNull: false,
  })
  team_role!: TeamRole;
}
