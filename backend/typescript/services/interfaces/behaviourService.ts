export interface BehaviourRequestDTO {
    behaviourName: string; 
  }
  
  export interface BehaviourResponseDTO {
    id: string;
    behaviourName: string;
  }
  
  export interface IBehaviourService {
    /**
     * retrieve the Behaviour with the given id
     * @param id Behaviour id
     * @returns requested Behaviour
     * @throws Error if retrieval fails
     */
    getBehaviour(id: string): Promise<BehaviourResponseDTO>;
  
    /**
     * retrieve all Behaviours
     * @param
     * @returns returns array of Behaviours
     * @throws Error if retrieval fails
     */
    getBehaviours(): Promise<BehaviourResponseDTO[]>;
  
    /**
     * create a Behaviour with the fields given in the DTO, return created Behaviour
     * @param behaviour new Behaviour
     * @returns the created Behaviour
     * @throws Error if creation fails
     */
    createBehaviour(
      behaviour: BehaviourRequestDTO,
    ): Promise<BehaviourResponseDTO>;
  
    /**
     * update the Behaviour with the given id with fields in the DTO, return updated Behaviour
     * @param id Behaviour id
     * @param behaviour Updated Behaviour
     * @returns the updated Behaviour
     * @throws Error if update fails
     */
    updateBehaviour(
      id: string,
      behaviour: BehaviourRequestDTO,
    ): Promise<BehaviourResponseDTO | null>;
  
    /**
     * delete the Behaviour with the given id
     * @param id Behaviour id
     * @returns id of the Behaviour deleted
     * @throws Error if deletion fails
     */
    deleteBehaviour(id: string): Promise<string>;
  }
  