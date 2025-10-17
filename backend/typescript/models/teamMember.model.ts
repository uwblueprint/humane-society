import { Column, DataType, Model, Table } from "sequelize-typescript";
import { TeamRole, teamRoleValues } from "../types";

@Table({ tableName: "team_members", timestamps: false })
export default class TeamMember extends Model {
  @Column({ field: "first_name", type: DataType.STRING, allowNull: false })
  firstName!: string;

  @Column({ field: "last_name", type: DataType.STRING, allowNull: false })
  lastName!: string;

  @Column({
    field: "team_role",
    type: DataType.ENUM(...teamRoleValues),
    allowNull: false,
  })
  teamRole!: TeamRole;
}
