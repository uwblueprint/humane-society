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

export enum TaskType {
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

export interface Task {
  id: number;
  name: string;
  category: TaskType;
  instructions: string;
}

export const mockTasks: Task[] = [
  {
    id: 1,
    name: "Morning walk",
    category: TaskType.WALK,
    instructions:
      "Morning walks with the walker walkwalkwalkwalkwalkwalkwalkwalk…",
  },
  {
    id: 2,
    name: "Everything is Awesome!",
    category: TaskType.GAMES,
    instructions:
      "The focus of Everything is Awesome game is to make the dog feel appreciated and engaged.",
  },
  {
    id: 3,
    name: "Nap time",
    category: TaskType.PEN_TIME,
    instructions: "Instructions here blablablabalbblablablablablablalbalb.",
  },
  {
    id: 4,
    name: "Feeding",
    category: TaskType.HUSBANDRY,
    instructions:
      "Feeding the pet instructions here filler text filler text filler text filler text.",
  },
  {
    id: 5,
    name: "Toilet training",
    category: TaskType.TRAINING,
    instructions: "Step‐by‐step guide to toilet training your pet goes here.",
  },
  {
    id: 6,
    name: "blahblahblahblahblahbalhalhalblahblabla…",
    category: TaskType.MISC,
    instructions: "Instructions here blablablabalbblablablablablablablblabb.",
  },
];
