export type TeamRole = "PM" | "DESIGNER" | "PL" | "DEVELOPER";

export type TeamMember = {
  id: string;
  firstName: string;
  lastName: string;
  teamRole: TeamRole;
};