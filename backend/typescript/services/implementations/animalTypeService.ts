import PgAnimalType from "../../models/animalType.model";
import {
  IAnimalTypeService,
  AnimalTypeRequestDTO,
  AnimalTypeResponseDTO,
} from "../interfaces/animalTypeService";
import { getErrorMessage, NotFoundError } from "../../utilities/errorUtils";
import logger from "../../utilities/logger";

const Logger = logger(__filename);

class AnimalTypeService implements IAnimalTypeService {
  /* eslint-disable class-methods-use-this */
  async getAnimalType(id: string): Promise<AnimalTypeResponseDTO> {
    let animalType: PgAnimalType | null;
    try {
      animalType = await PgAnimalType.findByPk(id, { raw: true });
      if (!animalType) {
        throw new NotFoundError(`Animal type id ${id} not found`); // return json instead (for standardization of responses)?
      }
    } catch (error: unknown) {
      Logger.error(`Failed to get entity. Reason = ${getErrorMessage(error)}`);
      throw error;
    }

    return {
      id: Number(animalType.id),
      animal_type_name: animalType.animal_type_name,
    };
  }

  async getAnimalTypes(): Promise<AnimalTypeResponseDTO[]> {
    try {
      const animalTypes: Array<PgAnimalType> = await PgAnimalType.findAll({
        raw: true,
      });
      return animalTypes.map((animalType) => ({
        id: Number(animalType.id),
        animal_type_name: animalType.animal_type_name,
      }));
    } catch (error: unknown) {
      Logger.error(
        `Failed to get animal types. Reason = ${getErrorMessage(error)}`,
      );
      throw error;
    }
  }

  async createAnimalType(
    animalType: AnimalTypeRequestDTO,
  ): Promise<AnimalTypeResponseDTO> {
    let newAnimalType: PgAnimalType | null;
    try {
      newAnimalType = await PgAnimalType.create({
        animal_type_name: animalType.animal_type_name,
      });
    } catch (error: unknown) {
      Logger.error(
        `Failed to create animal type. Reason = ${getErrorMessage(error)}`,
      );
      throw error;
    }
    return {
      id: Number(newAnimalType.id),
      animal_type_name: newAnimalType.animal_type_name,
    };
  }

  async updateAnimalType(
    id: string,
    animalType: AnimalTypeRequestDTO,
  ): Promise<AnimalTypeResponseDTO | null> {
    let resultingAnimalType: PgAnimalType | null;
    let updateResult: [number, PgAnimalType[]] | null;
    try {
      updateResult = await PgAnimalType.update(
        {
          animal_type_name: animalType.animal_type_name,
        },
        { where: { id }, returning: true },
      );

      if (!updateResult[0]) {
        throw new NotFoundError(`Animal type id ${id} not found`);
      }
      [, [resultingAnimalType]] = updateResult;
    } catch (error: unknown) {
      Logger.error(
        `Failed to update animal type. Reason = ${getErrorMessage(error)}`,
      );
      throw error;
    }
    return {
      id: Number(resultingAnimalType.id),
      animal_type_name: resultingAnimalType.animal_type_name,
    };
  }

  async deleteAnimalType(id: string): Promise<string> {
    // **
    try {
      const deleteResult: number | null = await PgAnimalType.destroy({
        where: { id },
      });
      if (!deleteResult) {
        throw new NotFoundError(`Animal type id ${id} not found`);
      }
      return id;
    } catch (error: unknown) {
      Logger.error(
        `Failed to delete animal type. Reason = ${getErrorMessage(error)}`,
      );
      throw error;
    }
  }
}

export default AnimalTypeService;
