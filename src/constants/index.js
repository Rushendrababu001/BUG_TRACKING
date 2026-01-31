export * from "./bugStatuses";
export * from "./bugSeverities";

export const USER_ROLES = {
  ADMIN: "admin",
  USER: "user",
  TEAM_LEAD: "team_lead",
  VIEWER: "viewer",
};

export const PRIORITY_LEVELS = {
  LOWEST: 1,
  LOW: 2,
  MEDIUM: 3,
  HIGH: 4,
  HIGHEST: 5,
};

export const PAGINATION_LIMIT = 50;

export const DATE_FORMATS = {
  SHORT: "MMM dd, yyyy",
  LONG: "MMMM dd, yyyy HH:mm",
  TIME: "HH:mm",
};
