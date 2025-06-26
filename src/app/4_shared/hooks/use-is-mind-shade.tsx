import { DialogueFragment } from "articy-js";
import { useGameState } from "../context/game-context";
import { db } from "../model";
import { useAnimation } from "framer-motion";
import { useEffect } from "react";

export default function useIsMindShade() {
  const [state] = useGameState();
  const node = db.getObject(state.id, DialogueFragment);
  const isMind = node?.properties.StageDirections === "IsMind";

  const controls = useAnimation();

  useEffect(() => {
    controls.start({
      opacity: isMind ? 0.4 : 0,
      transition: { duration: 0.4, ease: "easeOut" },
    });
  }, [isMind, controls]);

  return controls;
}
