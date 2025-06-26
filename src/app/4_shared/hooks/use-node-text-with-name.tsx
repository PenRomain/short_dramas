import { useMemo } from "react";
import { useGameState } from "../context/game-context";
import { DialogueFragment } from "articy-js";
import { db } from "../model";

export function useNodeTextWithName() {
  const [state] = useGameState();
  const characterName = state.variables.Enter["_cname_"].toString();
  const node = db.getObject(state.id, DialogueFragment);
  const text = useMemo(() => {
    const raw = node?.properties.Text ?? undefined;
    if (!raw) return undefined;
    return raw.includes("_cname_")
      ? raw.replaceAll("_cname_", characterName)
      : raw;
  }, [node?.properties.Text, characterName]);

  return text;
}
