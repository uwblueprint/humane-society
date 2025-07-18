import { Router } from "express";
import {
  petRequestDtoValidators,
  /* // petFilterValidators, */
} from "../middlewares/validators/petValidators";
import PetService from "../services/implementations/petService";
import { PetResponseDTO, IPetService } from "../services/interfaces/petService";
import {
  getErrorMessage,
  INTERNAL_SERVER_ERROR_MESSAGE,
  NotFoundError,
} from "../utilities/errorUtils";
import { sendResponseByMimeType } from "../utilities/responseUtil";
import IUserService from "../services/interfaces/userService";
import UserService from "../services/implementations/userService";
import { UserDTO } from "../types";

const petRouter: Router = Router();
const petService: IPetService = new PetService();
const userService: IUserService = new UserService();

/* Update Pet by id */
petRouter.put("/:id", petRequestDtoValidators, async (req, res) => {
  const { id } = req.params;
  try {
    const { body } = req;
    const pet = await petService.updatePet(id, {
      animalTag: body.animalTag,
      name: body.name,
      colorLevel: body.colorLevel,
      status: body.status,
      breed: body.breed,
      birthday: body.birthday,
      weight: body.weight,
      neutered: body.neutered,
      sex: body.sex,
      photo: body.photo,
      careInfo: body.careInfo
        ? {
            safetyInfo: body.careInfo.safetyInfo,
            medicalInfo: body.careInfo.medicalInfo,
            managementInfo: body.careInfo.managementInfo,
          }
        : undefined,
    });
    res.status(200).json(pet);
  } catch (e: unknown) {
    if (e instanceof NotFoundError) {
      res.status(404).send(getErrorMessage(e));
    } else {
      res.status(500).send(INTERNAL_SERVER_ERROR_MESSAGE);
    }
  }
});

/* Delete Pet by id */
petRouter.delete("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const deletedId = await petService.deletePet(id);
    res.status(200).json({ id: deletedId });
  } catch (e: unknown) {
    if (e instanceof NotFoundError) {
      res.status(404).send(getErrorMessage(e));
    } else {
      res.status(500).send(INTERNAL_SERVER_ERROR_MESSAGE);
    }
  }
});

// FILTERING IS NOW DONE ON FRONT END
/* Get Pets by filter criteria */
// petRouter.get("/filter", petFilterValidators, async (req, res) => {
//   const { query } = req;
//   const contentType = req.headers["content-type"];
//   try {
//     const pets = await petService.filterPets(query);
//     await sendResponseByMimeType<PetResponseDTO>(res, 200, contentType, pets);
//   } catch (e: unknown) {
//     await sendResponseByMimeType(res, 500, contentType, [
//       {
//         error: INTERNAL_SERVER_ERROR_MESSAGE,
//       },
//     ]);
//   }
// });
/* Create Pet */
petRouter.post("/", petRequestDtoValidators, async (req, res) => {
  try {
    const { body } = req;
    const pet = await petService.createPet({
      animalTag: body.animalTag,
      name: body.name,
      colorLevel: body.colorLevel,
      status: body.status,
      breed: body.breed,
      birthday: body.birthday,
      neutered: body.neutered,
      weight: body.weight,
      sex: body.sex,
      photo: body.photo,
      careInfo: body.careInfo
        ? {
            safetyInfo: body.careInfo.safetyInfo,
            medicalInfo: body.careInfo.medicalInfo,
            managementInfo: body.careInfo.managementInfo,
          }
        : undefined,
    });
    res.status(200).json(pet);
  } catch (e: unknown) {
    res.status(500).send(INTERNAL_SERVER_ERROR_MESSAGE);
  }
});
/* Get all Pets */
petRouter.get("/", async (req, res) => {
  const contentType = req.headers["content-type"];
  try {
    const pets = await petService.getPets();
    await sendResponseByMimeType<PetResponseDTO>(res, 200, contentType, pets);
  } catch (e: unknown) {
    await sendResponseByMimeType(res, 500, contentType, [
      {
        error: INTERNAL_SERVER_ERROR_MESSAGE,
      },
    ]);
  }
});

/* Get Pet by id */
petRouter.get("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const pet = await petService.getPet(id);
    res.status(200).json(pet);
  } catch (e: unknown) {
    if (e instanceof NotFoundError) {
      res.status(404).send(getErrorMessage(e));
    } else {
      res.status(500).send(INTERNAL_SERVER_ERROR_MESSAGE);
    }
  }
});

petRouter.get("/match/pets/:userId", async (req, res) => {
  const { userId } = req.params;

  if (userId) {
    if (typeof userId !== "string") {
      res
        .status(400)
        .json({ error: "userId query parameter must be a string." });
    } else if (Number.isNaN(Number(userId))) {
      res.status(400).json({ error: "Invalid user ID" });
    } else {
      try {
        const user: UserDTO = await userService.getUserById(userId);
        await petService.getMatchingPetsForUser(user.colorLevel);
      } catch (error: unknown) {
        if (error instanceof NotFoundError) {
          res.status(400).json({ error: getErrorMessage(error) });
        } else {
          res.status(500).json({ error: getErrorMessage(error) });
        }
      }
    }
  }
});

export default petRouter;
