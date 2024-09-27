import {
  Column,
  DataType,
  Model,
  Table,
  AllowNull,
} from "sequelize-typescript";
import { TeamRole } from "../types";

@Table({ timestamps: false, tableName: "team_members" })
export default class User extends Model {
  @Column({ type: DataType.STRING, allowNull: false })
  firstName!: string;

  @Column({ type: DataType.STRING, allowNull: false })
  lastName!: string;

  @AllowNull(false)
  @Column({
    type: DataType.ENUM("PM", "DESIGNER", "PL", "DEVELOPER"),
    allowNull: false,
  })
  teamRole!: TeamRole;
}
