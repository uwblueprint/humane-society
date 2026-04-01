import { Router } from "express";
import fs from "fs";
import multer from "multer";
import {
  petRequestDtoValidators,
  /* // petFilterValidators, */
} from "../middlewares/validators/petValidators";
import PetService from "../services/implementations/petService";
import {
  PetResponseDTO,
  IPetService,
  PetRequestDTO,
} from "../services/interfaces/petService";
import {
  getErrorMessage,
  INTERNAL_SERVER_ERROR_MESSAGE,
  NotFoundError,
} from "../utilities/errorUtils";
import { sendResponseByMimeType } from "../utilities/responseUtil";
import logInteraction from "../middlewares/logInteraction";
import {
  ACCEPTED_TYPES,
  MAX_FILE_SIZE_BYTES,
  MAX_FILE_SIZE_MB,
} from "../constants";
import FileStorageService from "../services/implementations/fileStorageService";

const petRouter: Router = Router();
const petService: IPetService = new PetService();

/* Photo uploads */
const upload = multer({ dest: "uploads/" });
const fileStorageService: FileStorageService = new FileStorageService(
  process.env.SUPABASE_STORAGE_BUCKET || "",
);

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
      res.status(404).json({ error: getErrorMessage(e) });
    } else {
      res.status(500).json({ error: getErrorMessage(e) });
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

petRouter.post(
  "/:id/profile-photo/upload",
  upload.single("file"),
  async (req, res) => {
    const { file } = req;
    const { id } = req.params;
    const { oldStoragePath } = req.body;

    let storagePath: string | undefined;

    try {
      if (!file) {
        res.status(400).json({ error: "No file uploaded" });
        return;
      }

      if (!id) {
        res.status(400).json({ error: "Missing pet id" });
        return;
      }

      if (!ACCEPTED_TYPES.includes(file.mimetype)) {
        res.status(400).json({
          error: `Invalid file type, must be ${ACCEPTED_TYPES.join(", ")}`,
        });
        return;
      }

      if (file.size > MAX_FILE_SIZE_BYTES) {
        res.status(400).json({
          error: `File size exceeds limit of ${MAX_FILE_SIZE_MB}MB`,
        });
        return;
      }

      const ext = file.mimetype.split("/")[1];
      storagePath = `pets/${id}/profile-photo-${Date.now()}.${ext}`;

      await fileStorageService.createFile(
        storagePath,
        file.path,
        file.mimetype,
      );

      try {
        await petService.updatePet(id, {
          photo: storagePath,
        });
      } catch (error: unknown) {
        if (storagePath) {
          await fileStorageService.deleteFile(storagePath);
        }
        throw error;
      }
      if (oldStoragePath) {
        await fileStorageService.deleteFile(String(oldStoragePath));
      }

      res.status(200).json({
        storagePath,
      });
    } catch (error: unknown) {
      res.status(500).send(getErrorMessage(error));
    } finally {
      // whats this
      if (file?.path && fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }
    }
  },
);

petRouter.post("/:id/profile-photo/default", async (req, res) => {
  const { id } = req.params;

  if (!id) {
    res.status(400).json({ error: "Missing pet id" });
    return;
  }

  try {
    const pet = await petService.getPet(id);

    if (pet.photo) {
      await fileStorageService.deleteFile(pet.photo);
    }

    await petService.updatePet(id, {
      photo: null,
    });

    res.status(200).json();
  } catch (error: unknown) {
    res.status(500).send(getErrorMessage(error));
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

/* Get PetList by userId */
petRouter.get("/list/:userId", async (req, res) => {
  const { userId } = req.params;
  try {
    const petList = await petService.getPetList(parseInt(userId, 10));
    res.status(200).json(petList);
  } catch (e: unknown) {
    if (e instanceof NotFoundError) {
      res.status(404).send(getErrorMessage(e));
    } else {
      res.status(500).send(INTERNAL_SERVER_ERROR_MESSAGE);
    }
  }
});

petRouter.get("/:id/profile-photo", async (req, res) => {
  const { id } = req.params;
  if (!id) {
    res.status(400).json({ error: "Missing pet id" });
    return;
  }

  try {
    const pet = await petService.getPet(id);

    if (pet.photo) {
      const url = await fileStorageService.getFile(pet.photo);
      res.status(200).json({ url });
    } else {
      res.status(404).json({ error: "Profile photo not found" });
    }
  } catch (error: unknown) {
    res.status(500).send(getErrorMessage(error));
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
    } as Partial<PetRequestDTO>);
    await logInteraction(req);
    res.status(200).json(updated);
  } catch (e: unknown) {
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
    await logInteraction(req);
    res.status(200).json(updated);
  } catch (e: unknown) {
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
    } as Partial<PetRequestDTO>);

    await logInteraction(req);
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
    } as Partial<PetRequestDTO>);

    await logInteraction(req);
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
    } as Partial<PetRequestDTO>);

    await logInteraction(req);
    res.status(200).json(updated);
  } catch (e: unknown) {
    res.status(500).send(getErrorMessage(e));
  }
});

export default petRouter;
