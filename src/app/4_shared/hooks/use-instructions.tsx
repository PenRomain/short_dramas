import { Instruction } from "articy-js";
import { useGameState } from "../context/game-context";
import { db } from "../model";
import { useEffect } from "react";

export function useInstructions() {
  const [state, setState] = useGameState();
  const instruction = state.branches
    .map(({ path }) => path.map((id) => db.getObject(id, Instruction)))
    .flat()
    .filter(Boolean)[0];

  useEffect(() => {
    const expressions = instruction?.properties.Expression.split("=");

    const [ns, name] = expressions?.[0].split(".").map((s) => s.trim()) ?? [];
    const value = expressions?.[1].trim().replace(";", "");

    if (ns && name && value) {
      setState((prev) => ({
        ...prev,
        variables: {
          ...prev.variables,
          [ns]: {
            ...(["Music", "Sound"].includes(ns)
              ? Object.keys(prev.variables[ns]).reduce(
                  (acc, k) => ({ ...acc, [k]: false }),
                  {},
                )
              : prev.variables[ns]),
            [name]: value,
          },
        },
      }));
    }
  }, [instruction?.properties.Expression, setState]);
}
