import {
  Column,
  DataType,
  Model,
  ForeignKey,
  BelongsTo,
  Table,
} from "sequelize-typescript";
import User from "./user.model";
import InteractionType from "./interactionType.model";
import Pet from "./pet.model";
import Task from "./task.model";
import TaskTemplate from "./taskTemplate.model";

@Table({
  tableName: "interactions",
  timestamps: true,
  createdAt: "created_at",
  updatedAt: false,
})
export default class Interaction extends Model {
  @ForeignKey(() => User)
  @Column({ type: DataType.INTEGER, allowNull: false })
  actor_id!: number;

  @BelongsTo(() => User, { foreignKey: "actor_id" })
  actor!: User;

  @ForeignKey(() => User)
  @Column({ type: DataType.INTEGER, allowNull: true })
  target_user_id?: number;

  @BelongsTo(() => User, { foreignKey: "target_user_id", onDelete: "SET NULL" })
  target_user?: User;

  @ForeignKey(() => Pet)
  @Column({ type: DataType.INTEGER, allowNull: true })
  target_pet_id?: number;

  @BelongsTo(() => Pet, { foreignKey: "target_pet_id", onDelete: "SET NULL" })
  target_pet?: Pet;

  @ForeignKey(() => Task)
  @Column({ type: DataType.INTEGER, allowNull: true })
  target_task_id?: number;

  @BelongsTo(() => Task, { foreignKey: "target_task_id", onDelete: "SET NULL" })
  target_task?: Task;

  @ForeignKey(() => TaskTemplate)
  @Column({ type: DataType.INTEGER, allowNull: true })
  target_task_template_id?: number;

  @BelongsTo(() => TaskTemplate, {
    foreignKey: "target_task_template_id",
    onDelete: "SET NULL",
  })
  target_task_template?: TaskTemplate;

  @ForeignKey(() => InteractionType)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  interaction_type_id!: number;

  @BelongsTo(() => InteractionType, { onDelete: "RESTRICT" })
  interaction_type?: InteractionType;

  // Used to store the different filters
  @Column({ type: DataType.ARRAY(DataType.STRING), allowNull: false })
  metadata!: string[];

  @Column({ type: DataType.STRING, allowNull: false })
  short_description!: string;

  @Column({ type: DataType.STRING, allowNull: false })
  long_description!: string;
}
