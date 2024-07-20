import { Router } from "express";
import { petRequestDtoValidators } from "../middlewares/validators/petValidators";
import PetService from "../services/implementations/petService";
import {
  PetResponseDTO,
  IPetService,
} from "../services/interfaces/petService";
import { getErrorMessage, NotFoundError } from "../utilities/errorUtils";
import { sendResponseByMimeType } from "../utilities/responseUtil";

const petRouter: Router = Router();
const petService: IPetService = new PetService();

/* Create Behaviour */
petRouter.post("/", petRequestDtoValidators, async (req, res) => {
  try {
    const { body } = req;
    const newPet = await petService.createPet({
        animalTypeId: body.animalTypeId,
        name: body.name,
        status: body.status,
        breed: body.breed,
        age: body.age,
        adoptionStatus: body.adoptionStatus,
        weight: body.weight,
        neutered: body.neutered,
        sex: body.sex,
        photo: body.photo,
        careInfo: {
          safetyInfo: body.PetCareInfo.safety_info,
          medicalInfo: body.PetCareInfo.medical_info,
          managementInfo: body.PetCareInfo.management_info,
        },
    });
    res.status(201).json(newPet);
  } catch (e: unknown) {
    // replace with Jerry's server error
    res.status(500).send("Internal server error occured.");
  }
});

/* Get all Behaviours */
petRouter.get("/", async (req, res) => {
  const contentType = req.headers["content-type"];
  try {
    const pets = await petService.getPets();
    await sendResponseByMimeType<PetResponseDTO>(
      res,
      200,
      contentType,
      pets,
    );
  } catch (e: unknown) {
    await sendResponseByMimeType(res, 500, contentType, [
      {
        error: "Internal server error occured.",
      },
    ]);
  }
});

/* Get Behaviour by id */
petRouter.get("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const pet = await petService.getPet(id);
    res.status(200).json(pet);
  } catch (e: unknown) {
    if (e instanceof NotFoundError) {
      res.status(404).send(getErrorMessage(e));
    } else {
      // jerry internal server error
      res.status(500).send("Internal server error occured.");
    }
  }
});

/* Update Pet by id */
petRouter.put("/:id", petRequestDtoValidators, async (req, res) => {
  const { id } = req.params;
  try {
    const { body } = req;
    const pet = await petService.updatePet(id, {
      animalTypeId: body.animalTypeId,
      name: body.name,
      status: body.status,
      breed: body.breed,
      age: body.age,
      adoptionStatus: body.adoptionStatus,
      weight: body.weight,
      neutered: body.neutered,
      sex: body.sex,
      photo: body.photo,
      careInfo: { 
         safetyInfo: body.careInfo.safetyInfo,
         medicalInfo: body.careInfo.medicalInfo,
         managementInfo: body.careInfo.managementInfo, 
        }
    });
    res.status(200).json(pet);
  } catch (e: unknown) {
    if (e instanceof NotFoundError) {
      res.status(404).send(getErrorMessage(e));
    } else {
      res.status(500).send("Internal server error occured.");
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
      res.status(500).send("Internal server error occured.");
    }
  }
});

  

export default petRouter;
