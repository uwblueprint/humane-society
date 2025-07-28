import { Request, Response, NextFunction } from "express";
import {
  getApiValidationError,
  validatePrimitive,
  validateEnum,
  validateDate,
  validateNumberConstraint,
  getConstraintError,
} from "./util";
import { petStatusEnum, sexEnum, AnimalTag } from "../../types";

/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable-next-line import/prefer-default-export */
export const petRequestDtoValidators = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { body } = req;

  if (body.animalTag && !validateEnum(body.animalTag, AnimalTag)) {
    return res
      .status(400)
      .send(getApiValidationError("animalTag", "AnimalTag"));
  }

  if (!validatePrimitive(body.name, "string")) {
    return res.status(400).send(getApiValidationError("name", "string"));
  }

  if (!validatePrimitive(body.colorLevel, "integer")) {
    return res.status(400).send(getApiValidationError("colorLevel", "integer"));
  }

  if (!validateNumberConstraint(body.colorLevel, 1, 5)) {
    return res.status(400).send(getConstraintError("colorLevel", 1, 5));
  }

  if (!validateEnum(body.status, petStatusEnum)) {
    return res.status(400).send(getApiValidationError("status", "PetStatus"));
  }

  if (body.breed && !validatePrimitive(body.breed, "string")) {
    return res.status(400).send(getApiValidationError("breed", "string"));
  }

  if (body.birthday && !validateDate(body.birthday)) {
    return res.status(400).send(getApiValidationError("birthday", "Date"));
  }

  if (body.weight && !validatePrimitive(body.weight, "decimal")) {
    return res.status(400).send(getApiValidationError("weight", "decimal"));
  }

  if (body.neutered && !validatePrimitive(body.neutered, "boolean")) {
    return res.status(400).send(getApiValidationError("neutered", "boolean"));
  }

  if (body.sex && !validateEnum(body.sex, sexEnum)) {
    return res.status(400).send(getApiValidationError("sex", "Sex"));
  }

  if (body.photo && !validatePrimitive(body.photo, "string")) {
    return res.status(400).send(getApiValidationError("photo", "string"));
  }

  if (body.careInfo) {
    const { safetyInfo, medicalInfo, managementInfo } = body.careInfo;
    if (safetyInfo && !validatePrimitive(safetyInfo, "string")) {
      return res
        .status(400)
        .send(getApiValidationError("careInfo.safetyInfo", "string"));
    }

    if (medicalInfo && !validatePrimitive(medicalInfo, "string")) {
      return res
        .status(400)
        .send(getApiValidationError("careInfo.medicalInfo", "string"));
    }

    if (managementInfo && !validatePrimitive(managementInfo, "string")) {
      return res
        .status(400)
        .send(getApiValidationError("careInfo.managementInfo", "string"));
    }
  }

  return next();
};

// FILTER IS DONE ON FRONT END
// export const petFilterValidators = (
//   req: Request,
//   res: Response,
//   next: NextFunction,
// ) => {
//   const { query } = req;

//   if (query.animalTypeId) {
//     const animalTypeId = Number(query.animalTypeId);
//     if (!validatePrimitive(animalTypeId, "integer")) {
//       return res
//         .status(400)
//         .send(getApiValidationError("animalTypeId", "integer"));
//     }
//   }

//   if (query.name) {
//     if (!validatePrimitive(query.name, "string")) {
//       return res.status(400).send(getApiValidationError("name", "string"));
//     }
//   }

//   if (query.status) {
//     if (!validateEnum(query.status, petStatusEnum)) {
//       return res.status(400).send(getApiValidationError("status", "PetStatus"));
//     }
//   }

//   if (query.breed) {
//     if (!validatePrimitive(query.breed, "string")) {
//       return res.status(400).send(getApiValidationError("breed", "string"));
//     }
//   }

//   if (query.age) {
//     const age = Number(query.age);
//     if (!validatePrimitive(age, "integer")) {
//       return res.status(400).send(getApiValidationError("age", "integer"));
//     }
//   }

//   if (query.adoptionStatus) {
//     let adoptionStatus;
//     if (query.adoptionStatus === "true") {
//       adoptionStatus = true;
//     } else if (query.adoptionStatus === "false") {
//       adoptionStatus = false;
//     }
//     if (!validatePrimitive(adoptionStatus, "boolean")) {
//       return res
//         .status(400)
//         .send(getApiValidationError("adoptionStatus", "boolean"));
//     }
//   }

//   if (query.weight) {
//     const weight = Number(query.weight);
//     if (!validatePrimitive(weight, "decimal")) {
//       return res.status(400).send(getApiValidationError("weight", "decimal"));
//     }
//   }

//   if (query.neutered) {
//     let neutered;
//     if (query.neutered === "true") {
//       neutered = true;
//     } else if (query.neutered === "false") {
//       neutered = false;
//     }
//     if (!validatePrimitive(neutered, "boolean")) {
//       return res.status(400).send(getApiValidationError("neutered", "boolean"));
//     }
//   }

//   if (query.sex) {
//     if (!validateEnum(query.sex, sexEnum)) {
//       return res.status(400).send(getApiValidationError("sex", "Sex"));
//     }
//   }

//   return next();
// };

export const matchPetsValidator = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { userId } = req.params;

  if (!userId) {
    return res.status(400).json({ error: "userId parameter is required." });
  }

  if (typeof userId !== "string") {
    return res.status(400).json({ error: "userId parameter must be a string." });
  }

  if (Number.isNaN(Number(userId))) {
    return res.status(400).json({ error: "Invalid user ID" });
  }

  return next();
};
