export enum ColorLevel {
  GREEN = "Green",
  YELLOW = "Yellow",
  ORANGE = "Orange",
  RED = "Red",
  BLUE = "Blue",
}

export const colorLevelMap: Record<number, ColorLevel> = {
  1: ColorLevel.GREEN,
  2: ColorLevel.YELLOW,
  3: ColorLevel.ORANGE,
  4: ColorLevel.RED,
  5: ColorLevel.BLUE,
};

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
