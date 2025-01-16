import type { NamePath } from "../types";

export const namePathToString = (name: NamePath) => {
  return name
    .map(item => (typeof item === "number" ? `[${item}]` : `.${item}`))
    .join("");
};