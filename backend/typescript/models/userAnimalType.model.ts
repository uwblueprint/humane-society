import { 
    Column,
    DataType,
    Model,
    Table,
    ForeignKey,
    PrimaryKey
} from 'sequelize-typescript';
import User from './user.model'; 
import AnimalType from './animalType.model'; 

@Table({
  tableName: 'User_AnimalTypes',
  timestamps: true
})
export default class UserAnimalType extends Model<UserAnimalType> {
  @ForeignKey(() => User)
  @PrimaryKey
  @Column({ type: DataType.INTEGER, allowNull: false })
  user_id!: number;

  @ForeignKey(() => AnimalType)
  @PrimaryKey
  @Column({ type: DataType.INTEGER, allowNull: false })
  animal_type_id!: number;
}

