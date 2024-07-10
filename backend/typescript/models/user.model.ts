import {
  Column,
  DataType,
  Model,
  Table,
  ForeignKey,
  BelongsTo,
} from "sequelize-typescript";
import Role from "./role.model";

@Table({ tableName: "users" })
export default class User extends Model {
  @Column({ type: DataType.STRING, allowNull: false })
  first_name!: string;

  @Column({ type: DataType.STRING, allowNull: false })
  last_name!: string;

  @Column({ type: DataType.STRING, allowNull: false })
  auth_id!: string;

  @ForeignKey(() => Role)
  @Column({ type: DataType.INTEGER })
  role_id!: number;

  @BelongsTo(() => Role)
  role!: Role;

  @Column({ type: DataType.STRING, allowNull: false })
  email!: string;

  @Column({ type: DataType.INTEGER })
  skill_level?: number | null;

  @Column({ type: DataType.BOOLEAN })
  can_see_all_logs?: boolean | null;

  @Column({ type: DataType.BOOLEAN })
  can_assign_users_to_tasks?: boolean | null;

  @Column({ type: DataType.STRING })
  phone_number?: string | null;
}
