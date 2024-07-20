export interface AnimalTypeRequestDTO {
  animal_type_name: string;
}

export interface AnimalTypeResponseDTO {
  id: number;
  animal_type_name: string;
}

export interface IAnimalTypeService {
  /**
   * retrieve the SimpleEntity with the given id
   * @param id SimpleEntity id
   * @returns requested SimpleEntity
   * @throws Error if retrieval fails
   */
  getAnimalType(id: string): Promise<AnimalTypeResponseDTO>;

  /**
   * retrieve all SimpleEntities
   * @param
   * @returns returns array of SimpleEntities
   * @throws Error if retrieval fails
   */
  getAnimalTypes(): Promise<AnimalTypeResponseDTO[]>;

  /**
   * create a SimpleEntity with the fields given in the DTO, return created SimpleEntity
   * @param entity new SimpleEntity
   * @returns the created SimpleEntity
   * @throws Error if creation fails
   */
  createAnimalType(
    animalType: AnimalTypeRequestDTO,
  ): Promise<AnimalTypeResponseDTO>;

  /**
   * update the SimpleEntity with the given id with fields in the DTO, return updated SimpleEntity
   * @param id SimpleEntity id
   * @param entity Updated SimpleEntity
   * @returns the updated SimpleEntity
   * @throws Error if update fails
   */
  updateAnimalType(
    id: string,
    animalType: AnimalTypeRequestDTO,
  ): Promise<AnimalTypeResponseDTO | null>;

  /**
   * delete the SimpleEntity with the given id
   * @param id SimpleEntity id
   * @returns id of the SimpleEntity deleted
   * @throws Error if deletion fails
   */
  deleteAnimalType(id: string): Promise<string>;
}
