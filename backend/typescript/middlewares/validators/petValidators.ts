import { Request, Response, NextFunction } from "express";
import { getApiValidationError, validatePrimitive, validateEnum } from "./util";
import { PetStatus, Sex } from "../../types";

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

  const petStatusEnum: PetStatus[] = ["Assigned", "Active", "Needs Care", "Does Not Need Care"];
  if (!validateEnum(body.status, petStatusEnum)) {
    return res.status(400).send(getApiValidationError("status", "string"));
  }

  if (!validatePrimitive(body.breed, "string")) {
    return res.status(400).send(getApiValidationError("breed", "string"));
  }

  if (!validatePrimitive(body.age, "integer")) {
    return res.status(400).send(getApiValidationError("age", "integer"));
  }

  if (!validatePrimitive(body.adoptionStatus, "string")) {
    return res
      .status(400)
      .send(getApiValidationError("adoptionStatus", "string"));
  }

  if (!validatePrimitive(body.weight, "decimal")) {
    return res.status(400).send(getApiValidationError("weight", "decimal"));
  }

  if (!validatePrimitive(body.neutered, "boolean")) {
    return res.status(400).send(getApiValidationError("neutered", "boolean"));
  }

  const petSexEnum: Sex[] = ["M", "F"];
  if (!validateEnum(body.sex, petSexEnum)) {
    return res.status(400).send(getApiValidationError("sex", "string"));
  }

  if (!validatePrimitive(body.photo, "string")) {
    return res.status(400).send(getApiValidationError("photo", "string"));
  }

  // Add pet care info

  return next();
};
