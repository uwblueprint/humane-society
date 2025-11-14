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
import { PetRequestDTO } from "../services/interfaces/petService";
import { Role } from "../types";
import { logInteraction } from "../middlewares/logInteraction";

const petRouter: Router = Router();
const petService: IPetService = new PetService();

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


/* Change pet color-level by id */
petRouter.patch("/:id/color-level", async (req, res) => {
  const { id } = req.params;

  try {
    const updated = await petService.updatePet(id, {
      colorLevel: req.body.colorLevel,
    } as Partial<PetRequestDTO>
  );
    await logInteraction(req, res);
    res.status(200).json(updated);
  } catch (e: unknown){
    res.status(500).send(getErrorMessage(e));
  }
});

/* Change pet neuter status by id */
petRouter.patch("/:id/neuter-status", async (req, res) => {
  const { id } = req.params;

  try {
    const updated = await petService.updatePet(id, {
      neutered: req.body.neutered, 
    } as Partial<PetRequestDTO>);
    await logInteraction(req, res);
    res.status(200).json(updated);
  } catch (e: unknown){
    res.status(500).send(getErrorMessage(e));
  }
});


/* Change pet safety-info by id */
petRouter.patch("/:id/safety-info", async (req, res) => {
  const { id } = req.params;

  try {
    const updated = await petService.updatePet(id, {
      careInfo: {
        safetyInfo: req.body.safetyInfo,
      },
    } as Partial<PetRequestDTO>
  );

    await logInteraction(req, res);
    res.status(200).json(updated);
  } catch (e: unknown) {
    res.status(500).send(getErrorMessage(e));
  }
});


/* Change pet medical-info by id */
petRouter.patch("/:id/medical-info", async (req, res) => {
  const { id } = req.params;

  try {
    const updated = await petService.updatePet(id, {
      careInfo: {
        medicalInfo: req.body.medicalInfo,
      },
    } as Partial<PetRequestDTO>
  ) ;

    await logInteraction(req, res);
    res.status(200).json(updated);
  } catch (e: unknown) {
    res.status(500).send(getErrorMessage(e));
  }
});

/* Change pet management-info by id */
petRouter.patch("/:id/management-info", async (req, res) => {
  const { id } = req.params;

  try {
    const updated = await petService.updatePet(id, {
      careInfo: {
        managementInfo: req.body.managementInfo,
      },
    } as Partial<PetRequestDTO>
  );

    await logInteraction(req, res);
    res.status(200).json(updated);
  } catch (e: unknown) {
    res.status(500).send(getErrorMessage(e));
  }
});


export default petRouter;
