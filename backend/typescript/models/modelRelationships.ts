import User from "./user.model";
import AnimalType from "./animalType.model";
import UserAnimalType from "./userAnimalType.model";

export default function defineRelationships(): void {
  User.belongsToMany(AnimalType, { through: UserAnimalType });
}
