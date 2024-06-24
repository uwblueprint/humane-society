import PgBehaviour from "../../models/behaviour.model";
import {
  IBehaviourService,
  BehaviourRequestDTO,
  BehaviourResponseDTO,
} from "../interfaces/behaviourService";
import { getErrorMessage } from "../../utilities/errorUtils";
import logger from "../../utilities/logger";

const Logger = logger(__filename);

class BehaviourService implements IBehaviourService {
  /* eslint-disable class-methods-use-this */
  async getBehaviour(id: string): Promise<BehaviourResponseDTO> {
    let behaviour: PgBehaviour | null;
    try {
      behaviour = await PgBehaviour.findByPk(id, { raw: true });
      if (!behaviour) {
        throw new Error(`Behaviour id ${id} not found`);
      }
    } catch (error: unknown) {
      Logger.error(
        `Failed to get behaviour. Reason = ${getErrorMessage(error)}`,
      );
      throw error;
    }

    return {
      id: behaviour.id,
      behaviourName: behaviour.behaviour_name,
    };
  }

  async getBehaviours(): Promise<BehaviourResponseDTO[]> {
    try {
      const behaviours: Array<PgBehaviour> = await PgBehaviour.findAll({
        raw: true,
      });
      return behaviours.map((behaviour) => ({
        id: behaviour.id,
        behaviourName: behaviour.behaviour_name,
      }));
    } catch (error: unknown) {
      Logger.error(
        `Failed to get behaviours. Reason = ${getErrorMessage(error)}`,
      );
      throw error;
    }
  }

  async createBehaviour(
    behaviour: BehaviourRequestDTO,
  ): Promise<BehaviourResponseDTO> {
    let newBehaviour: PgBehaviour | null;
    try {
      newBehaviour = await PgBehaviour.create({
        behaviour_name: behaviour.behaviourName,
      });
    } catch (error: unknown) {
      Logger.error(
        `Failed to create behaviour. Reason = ${getErrorMessage(error)}`,
      );
      throw error;
    }
    return {
      id: newBehaviour?.id,
      behaviourName: newBehaviour?.behaviour_name,
    };
  }

  async updateBehaviour(
    id: string,
    behaviour: BehaviourRequestDTO,
  ): Promise<BehaviourResponseDTO | null> {
    let resultingBehaviour: PgBehaviour | null;
    let updateResult: [number, PgBehaviour[]] | null;
    try {
      updateResult = await PgBehaviour.update(
        {
          behaviour_name: behaviour.behaviourName,
        },
        { where: { id }, returning: true },
      );

      if (!updateResult[0]) {
        throw new Error(`Behaviour id ${id} not found`);
      }
      [, [resultingBehaviour]] = updateResult;
    } catch (error: unknown) {
      Logger.error(
        `Failed to update behaviour. Reason = ${getErrorMessage(error)}`,
      );
      throw error;
    }
    return {
      id: resultingBehaviour?.id,
      behaviourName: resultingBehaviour?.behaviour_name,
    };
  }

  async deleteBehaviour(id: string): Promise<string> {
    try {
      const deleteResult: number | null = await PgBehaviour.destroy({
        where: { id },
      });
      if (!deleteResult) {
        throw new Error(`Behaviour id ${id} not found`);
      }
      return id;
    } catch (error: unknown) {
      Logger.error(
        `Failed to delete behaviour. Reason = ${getErrorMessage(error)}`,
      );
      throw error;
    }
  }
}

export default BehaviourService;
