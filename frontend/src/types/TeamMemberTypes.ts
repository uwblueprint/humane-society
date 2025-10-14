export type TeamRole = "PM" | "DESIGNER" | "PL" | "DEVELOPER";

export type TeamMember = {
  id: number;
  firstName: string;
  lastName: string;
  teamRole: TeamRole;
};

export type CreateTeamMember = Omit<TeamMember, "id">;