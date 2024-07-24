import { Router } from "express";
// import { isAuthorizedByRole } from "../middlewares/auth";
import { animalTypeRequestDtoValidator } from "../middlewares/validators/animalTypeValidators";
import AnimalTypeService from "../services/implementations/animalTypeService";
import {
  AnimalTypeResponseDTO,
  IAnimalTypeService,
} from "../services/interfaces/animalTypeService";
import {
  getErrorMessage,
  NotFoundError,
  INTERNAL_SERVER_ERROR_MESSAGE,
} from "../utilities/errorUtils";
import { sendResponseByMimeType } from "../utilities/responseUtil";

const animalTypeRouter: Router = Router();
// animalTypeRouter.use(isAuthorizedByRole(new Set(["User", "Admin"])));

const animalTypeService: IAnimalTypeService = new AnimalTypeService();

/* Create AnimalType */
animalTypeRouter.post("/", animalTypeRequestDtoValidator, async (req, res) => {
  try {
    const { body } = req;
    const newAnimalType = await animalTypeService.createAnimalType({
      animal_type_name: body.animal_type_name,
    });
    res.status(201).json(newAnimalType);
  } catch (e: unknown) {
    res.status(500).send(INTERNAL_SERVER_ERROR_MESSAGE);
  }
});

/* Get all AnimalTypes */
animalTypeRouter.get("/", async (req, res) => {
  const contentType = req.headers["content-type"];
  try {
    const animalTypes = await animalTypeService.getAnimalTypes();
    await sendResponseByMimeType<AnimalTypeResponseDTO>(
      res,
      200,
      contentType,
      animalTypes,
    );
  } catch (e: unknown) {
    await sendResponseByMimeType(res, 500, contentType, [
      {
        error: INTERNAL_SERVER_ERROR_MESSAGE,
      },
    ]);
  }
});

/* Get AnimalType by id */
animalTypeRouter.get("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const animalType = await animalTypeService.getAnimalType(id);
    res.status(200).json(animalType);
  } catch (e: unknown) {
    if (e instanceof NotFoundError) {
      res.status(404).send(getErrorMessage(e));
    } else {
      res.status(500).send(INTERNAL_SERVER_ERROR_MESSAGE);
    }
  }
});

/* Update AnimalType by id */
animalTypeRouter.put(
  "/:id",
  animalTypeRequestDtoValidator,
  async (req, res) => {
    const { id } = req.params;
    try {
      const { body } = req;
      const entity = await animalTypeService.updateAnimalType(id, {
        animal_type_name: body.animal_type_name,
      });
      res.status(200).json(entity);
    } catch (e: unknown) {
      if (e instanceof NotFoundError) {
        res.status(404).send(getErrorMessage(e));
      } else {
        res.status(500).send(INTERNAL_SERVER_ERROR_MESSAGE);
      }
    }
  },
);

/* Delete AnimalType by id */
animalTypeRouter.delete("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const deletedId = await animalTypeService.deleteAnimalType(id);
    res.status(200).json({ id: deletedId });
  } catch (e: unknown) {
    if (e instanceof NotFoundError) {
      res.status(404).send(getErrorMessage(e));
    } else {
      res.status(500).send(INTERNAL_SERVER_ERROR_MESSAGE);
    }
  }
});

export default animalTypeRouter;
