// model is how backend code represents a database table
import {
  Table,
  Column,
  Model,
  DataType,
  AllowNull,
} from "sequelize-typescript";
import { TeamRole, teamRoleValues } from "../types";

@Table({ timestamps: false, tableName: "team_members"}) // lets sequelize know to not auto create a created_at and updated_at field
export default class TeamMember extends Model {
    @Column({ type: DataType.STRING, allowNull: false})
    first_name!: string; //! to ensure the property is not nullable

    @Column({type: DataType.STRING, allowNull: false})
    last_name! : string;

    @AllowNull(false)
    @Column({ type: DataType.ENUM, values: teamRoleValues, allowNull: false})
    team_role!: TeamRole;
}

