import type {
  ArticyClass,
  ArticyData,
  ArticyObjectProps,
  EnumDefinition,
  FeatureDefinition,
  GlobalFeatures,
  GlobalVariableDef,
  HierarchyEntry,
  ModelData,
  ObjectDefinition,
  PackageData,
  Project,
  PropertyDefinition,
  ScriptMethodDef,
  TemplateDefinition,
  TemplateProps,
  TemplateTypeDefinition,
  TypeDefinition,
  VariableNamespaceDef,
} from "articy-js";
import { Database } from "articy-js";
import rawData from "../../exported.articy/articy.bundle.json" assert { type: "json" };
// import rawData from "../../exported.articy.json";
import { z } from "zod";
import { assertIsArticyData } from "../assert/assert-is-articy";

type NonEnumArticyClass = Exclude<ArticyClass, "Enum">;

const Bool = z.union([z.literal("True"), z.literal("False")]);
const Id = z.string();

const nonEnumArticyClass: z.ZodType<NonEnumArticyClass> = z.union([
  z.literal("Primitive"),
  z.literal("ArticyObject"),
  z.literal("FlowFragment"),
  z.literal("Dialogue"),
  z.literal("DialogueFragment"),
  z.literal("Hub"),
  z.literal("Jump"),
  z.literal("Comment"),
  z.literal("Entity"),
  z.literal("Location"),
  z.literal("Spot"),
  z.literal("Zone"),
  z.literal("Path"),
  z.literal("Link"),
  z.literal("Asset"),
  z.literal("Condition"),
  z.literal("Instruction"),
  z.literal("LocationText"),
  z.literal("LocationImage"),
  z.literal("Document"),
  z.literal("TextObject"),
  z.literal("UserFolder"),
]);

const propertyDefinition: z.ZodType<PropertyDefinition> = z.object({
  Property: z.string(),
  Type: z.string(),
  DisplayName: z.string().optional(),
  Localizable: z.boolean().optional(),
});

const featurePropertyDefinition: z.ZodType<Required<PropertyDefinition>> =
  z.object({
    Property: z.string(),
    Type: z.string(),
    DisplayName: z.string(),
    Localizable: z.boolean(),
  });

const featureDefinition: z.ZodType<FeatureDefinition> = z.object({
  TechnicalName: z.string(),
  DisplayName: z.string(),
  Properties: z.array(featurePropertyDefinition),
});

const templateDefinition: z.ZodType<TemplateDefinition> = z.object({
  TechnicalName: z.string(),
  DisplayName: z.string(),
  Features: z.array(featureDefinition),
});

const articyClass: z.ZodType<ArticyClass> = z.union([
  z.literal("Enum"),
  nonEnumArticyClass,
]);

const baseObjectDefinition = z.object({
  Type: z.string(),
  Class: articyClass,
});

const projectSchema: z.ZodType<Project> = z.object({
  Name: z.string(),
  DetailName: z.string(),
  Guid: z.string(),
  TechnicalName: z.string(),
});

const settingsSchema = z
  .object({
    set_Localization: Bool,
    set_TextFormatter: z.string(),
    set_IncludedNodes: z.string(),
    set_UseScriptSupport: z.string(),
    ExportVersion: z.string(),
  })
  .strict();

const articyObjectProps: z.ZodType<ArticyObjectProps> = z.object({
  Id: Id,
  TechnicalName: z.string(),
});

const templateProps: z.ZodType<TemplateProps> = z.object({});
const globalFeatures: z.ZodType<Partial<GlobalFeatures>> = z.object({});

const modelDataSchema: z.ZodType<ModelData> = z.object({
  Type: z.string(),
  Properties: articyObjectProps,
  Template: z.union([globalFeatures, templateProps]).optional(),
  AssetRef: z.string().optional(),
  AssetCategory: z.string().optional(),
});

const packageSchema: z.ZodType<PackageData> = z
  .object({
    Name: z.string(),
    Description: z.string(),
    IsDefaultPackage: z.boolean(),
    Models: z.array(modelDataSchema),
  })
  .passthrough();

const enumDefinition: z.ZodType<EnumDefinition> = z.object({
  Type: z.string(),
  Class: z.literal("Enum"),
  Values: z.record(z.string(), z.number()),
  DisplayNames: z.record(z.string(), z.string()),
});

const typeDefinition: z.ZodType<TypeDefinition> = baseObjectDefinition
  .extend({
    Class: nonEnumArticyClass,
    Properties: z.array(propertyDefinition),
  })
  .passthrough();

const templateTypeDefinition: z.ZodType<TemplateTypeDefinition> =
  baseObjectDefinition.extend({
    Class: nonEnumArticyClass,
    InheritsFrom: z.string().optional(),
    Template: templateDefinition,
  });

const objectDefSchema: z.ZodType<ObjectDefinition> = z.union([
  enumDefinition,
  typeDefinition,
  templateTypeDefinition,
]);

const globalVariableDef: z.ZodType<GlobalVariableDef> = z.object({
  Variable: z.string(),
  Type: z.union([
    z.literal("Boolean"),
    z.literal("String"),
    z.literal("Integer"),
    z.string(),
  ]),
  Value: z.string(),
  Description: z.string(),
});

const variableNSchema: z.ZodType<VariableNamespaceDef> = z.object({
  Namespace: z.string(),
  Description: z.string(),
  Variables: z.array(globalVariableDef),
});

const hierarchySchema: z.ZodType<HierarchyEntry> = z.lazy(() =>
  z.object({
    Id: Id,
    Type: z.string(),
    Children: z.array(hierarchySchema).optional(),
  }),
);

const scriptMethodSchema: z.ZodType<ScriptMethodDef> = z.object({
  Name: z.string(),
  ReturnType: z.union([
    z.literal("float"),
    z.literal("void"),
    z.literal("int"),
    z.literal("boolean"),
    z.string(),
  ]),
});

export const articySchema: z.ZodType<ArticyData> = z.object({
  Project: projectSchema,
  Settings: settingsSchema,
  Packages: z.array(packageSchema),
  ObjectDefinitions: z.array(objectDefSchema),
  GlobalVariables: z.array(variableNSchema),
  Hierarchy: hierarchySchema,
  ScriptMethods: z.array(scriptMethodSchema),
});

// const gameData: ArticyData = articySchema.parse(rawData);

assertIsArticyData(rawData);
export const db = new Database(rawData);
