import { Router } from "express";
import { behaviourRequestDtoValidators } from "../middlewares/validators/behaviourValidators";
import BehaviourService from "../services/implementations/behaviourService";
import {
  BehaviourResponseDTO,
  IBehaviourService,
} from "../services/interfaces/behaviourService";
import { getErrorMessage, NotFoundError } from "../utilities/errorUtils";
import { sendResponseByMimeType } from "../utilities/responseUtil";

const behaviourRouter: Router = Router();
const behaviourService: IBehaviourService = new BehaviourService();

/* Create Behaviour */
behaviourRouter.post("/", behaviourRequestDtoValidators, async (req, res) => {
  try {
    const { body } = req;
    const newBehaviour = await behaviourService.createBehaviour({
      behaviourName: body.behaviourName,
    });
    res.status(201).json(newBehaviour);
  } catch (e: unknown) {
    res.status(500).send(getErrorMessage(e));
  }
});

/* Get all Behaviours */
behaviourRouter.get("/", async (req, res) => {
  const contentType = req.headers["content-type"];
  try {
    const behaviours = await behaviourService.getBehaviours();
    await sendResponseByMimeType<BehaviourResponseDTO>(
      res,
      200,
      contentType,
      behaviours,
    );
  } catch (e: unknown) {
    await sendResponseByMimeType(res, 500, contentType, [
      {
        error: getErrorMessage(e),
      },
    ]);
  }
});

/* Get Behaviour by id */
behaviourRouter.get("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const behaviour = await behaviourService.getBehaviour(id);
    res.status(200).json(behaviour);
  } catch (e: unknown) {
    if (e instanceof NotFoundError) {
      res.status(404).send(getErrorMessage(e));
    } else {
      res.status(500).send(getErrorMessage(e));
    }
  }
});

/* Update Behaviour by id */
behaviourRouter.put("/:id", behaviourRequestDtoValidators, async (req, res) => {
  const { id } = req.params;
  try {
    const { body } = req;
    const behaviour = await behaviourService.updateBehaviour(id, {
      behaviourName: body.behaviourName,
    });
    res.status(200).json(behaviour);
  } catch (e: unknown) {
    if (e instanceof NotFoundError) {
      res.status(404).send(getErrorMessage(e));
    } else {
      res.status(500).send(getErrorMessage(e));
    }
  }
});

/* Delete Behaviour by id */
behaviourRouter.delete("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const deletedId = await behaviourService.deleteBehaviour(id);
    res.status(200).json({ id: deletedId });
  } catch (e: unknown) {
    if (e instanceof NotFoundError) {
      res.status(404).send(getErrorMessage(e));
    } else {
      res.status(500).send(getErrorMessage(e));
    }
  }
});

export default behaviourRouter;
