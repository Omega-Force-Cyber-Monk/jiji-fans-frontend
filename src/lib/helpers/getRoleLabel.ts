import { ROLE, TRole } from "@/types";

export const getRoleLabel = (role: TRole) => {
  switch (role) {
    case ROLE.ADMIN:
      return "Admin";
    case ROLE.CREATOR:
      return "Creator";
    default:
      return "User";
  }
};
