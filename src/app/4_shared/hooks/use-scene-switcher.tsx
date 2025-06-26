import { useAnimation } from "framer-motion";
import { type AnimationControls } from "framer-motion";
import { useGameContext } from "../context/game-context";

const DURATION = 2;

export default function useSceneSwitcher(): [
  AnimationControls,
  (cb: VoidFunction) => Promise<void>,
] {
  const controls = useAnimation();
  const { setIsFading } = useGameContext();

  const switchScene = async (cb: VoidFunction) => {
    setIsFading(true);
    await controls.start({ opacity: 1, transition: { duration: DURATION } });
    cb();
    await controls.start({ opacity: 0, transition: { duration: DURATION } });
    setIsFading(false);
  };

  return [controls, switchScene];
}
