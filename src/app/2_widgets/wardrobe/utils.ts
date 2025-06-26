import { FlowBranch, DialogueFragment, Instruction, Variable } from "articy-js";
import { db } from "@/shared/model";

const wardrobeKeys = ["mainCh_Race", "mainCh_Clothes", "Carolina"] as const;
export type WardrobeKey = (typeof wardrobeKeys)[number];

const isWardrobeKey = (key: string): key is WardrobeKey =>
  wardrobeKeys.includes(key as WardrobeKey);

export type WardrobeLook = {
  key: WardrobeKey;
  race?: number;
  clothes?: number;
};

export function parseBranch(
  br: FlowBranch,
  mainCh_Race: Variable,
): WardrobeLook | null {
  const frag = db.getObject(br.path.at(-1), DialogueFragment);
  const instrId = frag?.properties.OutputPins?.[0]?.Connections?.[0]?.Target;
  const instr = db.getObject(instrId, Instruction);
  if (!instr) return null;

  const [lhs, rhs] = instr.properties.Expression.split("=").map((s) =>
    s.trim().replace(";", ""),
  );

  const key = lhs.split(".")[1];
  const keys = {
    mainCh_Race: "race",
    mainCh_Clothes: "clothes",
    Carolina: "clothes",
  };
  const value = Number(rhs);
  if (isNaN(value) || !isWardrobeKey(key)) return null;

  return {
    key,
    [keys[key]]: value,
    ...(key !== "mainCh_Race" && key !== "Carolina" && { race: +mainCh_Race }),
  };
}

export function lookImages({
  key,
  race = 1,
  clothes = 1,
}: WardrobeLook): string[] {
  switch (key) {
    case "mainCh_Race":
      return [
        `Ivhid_Main_${race}_Body.png`,
        "mainCh_Clothes_1.png",
        `Ivhid_Main_${race}_Idle.png`,
      ];

    case "mainCh_Clothes":
      return [
        `Ivhid_Main_${race}_Body.png`,
        `mainCh_Clothes_${clothes}.png`,
        `Ivhid_Main_${race}_Idle.png`,
      ];

    case "Carolina":
      return [
        `Ivhid_Carolina_Body.png`,
        `Ivhid_Wardrobe_Carolina_${clothes}.png`,
        `Ivhid_Carolina_Idle.png`,
      ];
  }
}
