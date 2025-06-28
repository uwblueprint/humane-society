export type Task = {
  id: number;
  user_id: number;
  pet_id: number;
  task_template_id: number;
  scheduled_start_time: Date;
  start_time: Date;
  end_time: Date;
  notes?: string | null;
  created_at: Date;
  updated_at: Date;
};

export enum ColorLevel {
  GREEN = "Green",
  YELLOW = "Yellow",
  ORANGE = "Orange",
  RED = "Red",
  BLUE = "Blue",
}

export enum TaskCategory {
  WALK = "Walk",
  GAMES = "Games",
  PEN_TIME = "Pen Time",
  HUSBANDRY = "Husbandry",
  TRAINING = "Training",
  MISC = "Misc.",
}

export enum TaskStatus {
  NEEDS_CARE = "Needs Care",
  DOES_NOT_NEED_CARE = "Does Not Need Care",
  ASSIGNED = "Assigned to You",
}

export enum AnimalTag {
  BIRD = "Bird",
  BUNNY = "Bunny",
  CAT = "Cat",
  DOG = "Dog",
  SMALL_ANIMAL = "Small Animal",
}
