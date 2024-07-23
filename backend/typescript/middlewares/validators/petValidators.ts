import { Request, Response, NextFunction } from "express";
import { getApiValidationError, validatePrimitive, validateEnum } from "./util";
import { PetStatus, Sex } from "../../types";

const petStatusEnum: PetStatus[] = [
  "Assigned",
  "Active",
  "Needs Care",
  "Does Not Need Care",
];

const petSexEnum: Sex[] = ["M", "F"];
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable-next-line import/prefer-default-export */
export const petRequestDtoValidators = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { body } = req;

  if (!validatePrimitive(body.animalTypeId, "integer")) {
    return res
      .status(400)
      .send(getApiValidationError("animalTypeId", "integer"));
  }

  if (!validatePrimitive(body.name, "string")) {
    return res.status(400).send(getApiValidationError("name", "string"));
  }

  if (!validateEnum(body.status, petStatusEnum)) {
    return res.status(400).send(getApiValidationError("status", "string"));
  }

  if (!validatePrimitive(body.breed, "string")) {
    return res.status(400).send(getApiValidationError("breed", "string"));
  }

  if (!validatePrimitive(body.age, "integer")) {
    return res.status(400).send(getApiValidationError("age", "integer"));
  }

  if (!validatePrimitive(body.adoptionStatus, "boolean")) {
    return res
      .status(400)
      .send(getApiValidationError("adoptionStatus", "boolean"));
  }

  if (!validatePrimitive(body.weight, "decimal")) {
    return res.status(400).send(getApiValidationError("weight", "decimal"));
  }

  if (!validatePrimitive(body.neutered, "boolean")) {
    return res.status(400).send(getApiValidationError("neutered", "boolean"));
  }

  if (!validateEnum(body.sex, petSexEnum)) {
    return res.status(400).send(getApiValidationError("sex", "string"));
  }

  if (!validatePrimitive(body.photo, "string")) {
    return res.status(400).send(getApiValidationError("photo", "string"));
  }

  if (!validatePrimitive(body.careInfo.safetyInfo, "string")) {
    return res
      .status(400)
      .send(getApiValidationError("careInfo.safetyInfo", "string"));
  }

  if (!validatePrimitive(body.careInfo.medicalInfo, "string")) {
    return res
      .status(400)
      .send(getApiValidationError("careInfo.medicalInfo", "string"));
  }

  if (!validatePrimitive(body.careInfo.managementInfo, "string")) {
    return res
      .status(400)
      .send(getApiValidationError("careInfo.managementInfo", "string"));
  }

  return next();
};

export const petFilterValidators = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { query } = req;

  if (query.animalTypeId) {
    const animalTypeId = Number(query.animalTypeId);
    if (!validatePrimitive(animalTypeId, "integer")) {
      return res
        .status(400)
        .send(getApiValidationError("animalTypeId", "integer"));
    }
  }

  if (query.name) {
    if (!validatePrimitive(query.name, "string")) {
      return res.status(400).send(getApiValidationError("name", "string"));
    }
  }

  if (query.status) {
    if (!validateEnum(query.status, petStatusEnum)) {
      return res.status(400).send(getApiValidationError("status", "string"));
    }
  }

  if (query.breed) {
    if (!validatePrimitive(query.breed, "string")) {
      return res.status(400).send(getApiValidationError("breed", "string"));
    }
  }

  if (query.age) {
    const age = Number(query.age);
    if (!validatePrimitive(age, "integer")) {
      return res.status(400).send(getApiValidationError("age", "integer"));
    }
  }

  if (query.adoptionStatus) {
    let adoptionStatus;
    if (query.adoptionStatus === "true") {
      adoptionStatus = true;
    } else if (query.adoptionStatus === "false") {
      adoptionStatus = false;
    }
    if (!validatePrimitive(adoptionStatus, "boolean")) {
      return res
        .status(400)
        .send(getApiValidationError("adoptionStatus", "boolean"));
    }
  }

  if (query.weight) {
    const weight = Number(query.weight);
    if (!validatePrimitive(weight, "decimal")) {
      return res.status(400).send(getApiValidationError("weight", "decimal"));
    }
  }

  if (query.neutered) {
    let neutered;
    if (query.neutered === "true") {
      neutered = true;
    } else if (query.neutered === "false") {
      neutered = false;
    }
    if (!validatePrimitive(neutered, "boolean")) {
      return res.status(400).send(getApiValidationError("neutered", "boolean"));
    }
  }

  if (query.sex) {
    if (!validateEnum(query.sex, petSexEnum)) {
      return res.status(400).send(getApiValidationError("sex", "string"));
    }
  }

  return next();
};
