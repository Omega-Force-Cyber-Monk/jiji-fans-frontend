import { TUniObject } from "@/types";

export const queryFormat = (obj: TUniObject) =>
  Object.entries(obj)
    .filter(([_, value]) => value !== null && value !== undefined && value !== "")
    .flatMap(([name, value]) => {
      if (Array.isArray(value)) {
        // Map over the array and return the result
        return value.map(cValue => ({ name, value: cValue.toString() }));
      } else {
        return [{ name, value: value.toString() }];
      }
    });