import { Column, DataType, Model, Table } from "sequelize-typescript";
import { Role, CreateUserDTO } from "../types";

@Table({ tableName: "users" })
export default class User extends Model {
  @Column({ type: DataType.INTEGER  })
  user_id!: number;

  @Column({ type: DataType.STRING })
  auth_id!: string;

  @Column({ type: DataType.STRING })
  first_name!: string;

  @Column({ type: DataType.STRING })
  last_name!: string;

  @Column({ type: DataType.STRING })
  email!: string;

  @Column({ type: DataType.INTEGER  })
  skill_level!: number;

  @Column({ type: DataType.BOOLEAN  })
  can_see_all_logs!: boolean;

  @Column({ type: DataType.BOOLEAN  })
  can_assign_users_to_tasks!: boolean;

  @Column({ type: DataType.ENUM("User", "Admin") })
  role!: Role;
}
