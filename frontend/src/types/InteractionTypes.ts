export type InteractionDTO = {
  id: number;
  shortDescription: string;
  longDescription: string;
  createdAt: string;
  interactionType: string;
  animalTag: string | null;
  actor: {
    id: number;
    firstName: string;
    lastName: string;
    role: string;
    profilePhoto: string | null;
  };
};
