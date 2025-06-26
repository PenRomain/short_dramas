import type { ArticyData, ArticyClass, ObjectDefinition } from "articy-js";

const VALID_CLASS = new Set<ArticyClass>([
  "Primitive",
  "ArticyObject",
  "Asset",
  "Spot",
  "Path",
  "Link",
  "FlowFragment",
  "Dialogue",
  "DialogueFragment",
  "Entity",
  "Hub",
  "Comment",
  "Jump",
  "Location",
  "Zone",
  "Condition",
  "Instruction",
  "LocationText",
  "LocationImage",
  "Document",
  "TextObject",
  "UserFolder",
  "Enum",
]);

function isArticyClass(x: unknown): x is ArticyClass {
  return typeof x === "string" && VALID_CLASS.has(x as ArticyClass);
}

function isObjectDefinition(d: object): d is ObjectDefinition {
  return (
    d &&
    typeof d === "object" &&
    "Type" in d &&
    typeof d.Type === "string" &&
    "Class" in d &&
    isArticyClass(d.Class)
  );
}

export function assertIsArticyData(data: object): asserts data is ArticyData {
  if (!data || typeof data !== "object") {
    throw new Error("Articy bundle is not an object");
  }

  if (
    ("ObjectDefinitions" in data && !Array.isArray(data.ObjectDefinitions)) ||
    ("ObjectDefinitions" in data &&
      Array.isArray(data.ObjectDefinitions) &&
      !data.ObjectDefinitions.every(isObjectDefinition))
  ) {
    throw new Error("Invalid or missing ObjectDefinitions");
  }

  if ("Packages" in data && !Array.isArray(data.Packages)) {
    throw new Error("Packages must be array");
  }
}
