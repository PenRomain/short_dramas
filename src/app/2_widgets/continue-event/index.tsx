"use client";

import {
  useGameChoice,
  useGameContext,
  useGameState,
} from "@/shared/context/game-context";
import { memo } from "react";

export default memo(function ContinueEvent() {
  const [state] = useGameState();
  const handleChoice = useGameChoice();
  const { isFading } = useGameContext();

  const needsName =
    state.variables.Enter._cname_ === "" && state.branches.length > 0;

  if (needsName || state.branches.length > 1 || isFading) return;
  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 4,
        background: "transparent",
      }}
      onClick={() => {
        handleChoice(0);
      }}
    />
  );
});
