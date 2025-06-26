import { promises as fs } from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DIR = path.resolve(__dirname, "../src/app/exported.articy");

const read = (file) =>
  fs.readFile(path.join(DIR, file), "utf8").then(JSON.parse);

const anyToArray = (raw) =>
  Array.isArray(raw)
    ? raw
    : typeof raw === "object"
      ? Object.values(raw).flat()
      : [];

async function readLoc(file) {
  const raw = await read(file);
  return Object.fromEntries(
    Object.entries(raw).map(([k, v]) => [k, v[""]?.Text ?? ""]),
  );
}

const manifest = await read("manifest.json");
const locMaps = await Promise.all(
  manifest.Packages.filter((p) => p.IsIncluded !== false).map((p) =>
    readLoc(p.Files.Texts.FileName),
  ),
);

const i18n = Object.assign({}, ...locMaps);

const TEXT_FIELDS = ["Text", "MenuText", "DisplayName", "StageDirections"];

function applyLocalization(model) {
  if (model && typeof model === "object") {
    if (model.Properties) {
      for (const key of TEXT_FIELDS) {
        const val = model.Properties[key];
        if (i18n[val]) {
          model.Properties[key] = i18n[val];
          continue;
        }
        const dot = val?.lastIndexOf(".");
        if (dot !== -1) {
          const id = val?.slice(0, dot);
          const tr = i18n[id];
          if (tr) {
            model.Properties[key] = tr;
          } else if (key === "Text") {
            model.Properties[key] = "";
          }
        }
      }
    }
  }
  return model;
}

/* —–– ObjectDefinitions —–– */
const objectDefs = [
  ...anyToArray(await read(manifest.ObjectDefinitions.Types.FileName)),
  ...anyToArray(await read(manifest.ObjectDefinitions.Texts.FileName)),
];

/* —–– GlobalVariables —–– */
const globalVarsRaw = await read(manifest.GlobalVariables.FileName);
const globalVariables = Array.isArray(globalVarsRaw)
  ? globalVarsRaw
  : anyToArray(globalVarsRaw.GlobalVariables);

/* —–– ScriptMethods, Hierarchy —–– */
const scriptMethods = await read(manifest.ScriptMethods.FileName);
const hierarchyRaw = await read(manifest.Hierarchy.FileName);
const hierarchy = {
  ...hierarchyRaw,
  Children: anyToArray(hierarchyRaw.Children),
};

/* —–– Packages —–– */
const packages = await Promise.all(
  manifest.Packages.filter((p) => p.IsIncluded !== false).map(async (p) => {
    const rawPkg = await read(p.Files.Objects.FileName);
    const models = anyToArray(rawPkg.Objects ?? rawPkg).map(applyLocalization);

    return {
      Name: p.Name,
      Description: p.Description ?? "",
      IsDefaultPackage: !!p.IsDefaultPackage,
      Models: models,
    };
  }),
);

const bundle = {
  Project: manifest.Project,
  Settings: manifest.Settings,
  GlobalVariables: globalVariables,
  ObjectDefinitions: objectDefs,
  Packages: packages,
  ScriptMethods: scriptMethods,
  Hierarchy: hierarchy,
};

function assertArray(name, value) {
  if (!Array.isArray(value)) {
    console.error("\n⛔", name, "должен быть массивом, а пришло", typeof value);
    console.error("Пример данных:", JSON.stringify(value).slice(0, 250), "…\n");
    throw new Error(`${name} is not array`);
  }
}
bundle.Packages.forEach((p) =>
  assertArray(`Package ${p.Name}.Models`, p.Models),
);
assertArray("ObjectDefinitions", bundle.ObjectDefinitions);
assertArray("GlobalVariables", bundle.GlobalVariables);
assertArray("Hierarchy.Children", bundle.Hierarchy.Children);

await fs.writeFile(
  path.join(DIR, "articy.bundle.json"),
  JSON.stringify(bundle, null, 2),
);
console.log("✅ articy.bundle.json written");
