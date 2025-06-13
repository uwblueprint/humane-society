import {
  Column,
  DataType,
  Model,
  ForeignKey,
  BelongsTo,
  Table,
} from "sequelize-typescript";
import User from "./user.model";
import Pets from "./pet.model";
import Interaction_Type from "./interactionType.model";
import { InteractionTypeEnum } from "../types";

@Table({
  tableName: "interaction_log",
  timestamps: true,
  createdAt: "created_at",
})
export default class Interaction extends Model {
  @ForeignKey(() => User)
  @Column({ allowNull: false })
  actor_id!: number;

  @BelongsTo(() => User, { foreignKey: "actor_id" })
  actor?: User;

  @Column({
    type: DataType.ENUM("users", "pets"),
    allowNull: false,
  })
  target_type!: "users" | "pets";

  @ForeignKey(() => Interaction_Type)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  interaction_type_id!: number;

  @BelongsTo(() => Interaction_Type)
  interaction_type?: Interaction_Type;

  @Column({ allowNull: false })
  target_id!: number;

  @Column({ type: DataType.JSON, allowNull: false })
  metadata!: object;

  // Cache for loaded polymorphic associations
  private _target_user?: User;
  private _target_pet?: Pets;

  // Getter for target_user
  get target_user(): User | undefined {
    return this._target_user;
  }

  // Getter for target_pet
  get target_pet(): Pets | undefined {
    return this._target_pet;
  }

  // Method to load the appropriate target
  async loadTarget(): Promise<User | Pets | null> {
    if (this.target_type === "users" && !this._target_user) {
      const user = await User.findByPk(this.target_id);
      this._target_user = user || undefined;
      return user;
    } else if (this.target_type === "pets" && !this._target_pet) {
      const pet = await Pets.findByPk(this.target_id);
      this._target_pet = pet || undefined;
      return pet;
    }

    return this._target_user || this._target_pet || null;
  }

  // Helper method to get target with type safety
  async getTarget(): Promise<User | Pets | null> {
    return await this.loadTarget();
  }

  // Method to include polymorphic associations in queries
  static includePolymorphicTarget() {
    return {
      include: [
        {
          model: User,
          as: "actor",
          required: false,
        },
        {
          model: Interaction_Type,
          as: "interaction_type",
          required: false,
        },
      ],
    };
  }
}
