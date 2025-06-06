import {
  Column,
  DataType,
  Model,
  Table,
  AllowNull,
} from "sequelize-typescript";
import { Role, UserStatus, AnimalTag } from "../types";

@Table({ tableName: "users" })
export default class User extends Model {
  @Column({ type: DataType.STRING, allowNull: false })
  first_name!: string;

  @Column({ type: DataType.STRING, allowNull: false })
  last_name!: string;

  @Column({ type: DataType.STRING, allowNull: false })
  auth_id!: string;

  @AllowNull(false)
  @Column({ type: DataType.ENUM(...Object.values(Role)), allowNull: false })
  role!: Role;

  @Column({ type: DataType.STRING, allowNull: false })
  email!: string;

  @Column({ type: DataType.INTEGER, allowNull: false })
  color_level!: number;

  @Column({
    type: DataType.ENUM("Bird", "Bunny", "Cat", "Dog", "Small Animal"),
    allowNull: false,
  })
  animal_tags!: [AnimalTag];

  @Column({ type: DataType.BOOLEAN })
  can_see_all_logs?: boolean | null;

  @Column({ type: DataType.BOOLEAN })
  can_assign_users_to_tasks?: boolean | null;

  @Column({ type: DataType.STRING })
  phone_number?: string | null;

  @Column({ type: DataType.STRING })
  profile_photo?: string | null;

  @Column({ type: DataType.ENUM("Active", "Inactive"), allowNull: false })
  status!: UserStatus;
}
