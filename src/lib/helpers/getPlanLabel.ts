import { TPlanName } from "@/types/subscription.type";

export const getPlanLabel = (name: TPlanName) => {
  switch (name) {
    case "basic_plan":
      return "Basic Plan";
    case "standard_plan":
      return "Standard Plan";
    case "unlimited_plan":
      return "Unlimited Plan";
    default:
      return "N/A";
  }
};
