"use client";

import { memo, useState, useEffect, useMemo, forwardRef, useRef } from "react";
import Image, { type ImageProps } from "next/image";
import { useBackgroundContext } from "../../4_shared/context/background-context";
import {
  useCutscene,
  useGameContext,
  useGameState,
} from "@/shared/context/game-context";
import {
  useGetDriveManifestQuery,
  useGetSheetsManifestQuery,
} from "@/shared/store/services/google";
import styles from "./background.module.css";
import {
  AnimatePresence,
  AnimationControls,
  motion,
  useAnimation,
} from "framer-motion";
import { db } from "@/shared/model";
import { DialogueFragment } from "articy-js";
import { Characters } from "@/shared/types";
import { isKeyOf } from "../character";
import useSceneSwitcher from "@/shared/hooks/use-scene-switcher";
import cx from "clsx";
import useIsMindShade from "@/shared/hooks/use-is-mind-shade";

const ImageProxy = forwardRef<HTMLImageElement, ImageProps>(
  function NextImageProxy(p, ref) {
    return <Image ref={ref} {...p} />;
  },
);
const MotionImage = motion.create(ImageProxy);

function useBackgroundShift(): AnimationControls {
  const shiftControls = useAnimation();
  const [state] = useGameState();
  const node = db.getObject(state.id, DialogueFragment);
  const character = node?.Speaker?.properties.DisplayName;
  const isCharacter = character && isKeyOf(character, Characters);
  const isMainCharacter = character === Characters.Protagonist;
  const targetPos = isMainCharacter ? "20px" : isCharacter ? "-20px" : "0px";

  useEffect(() => {
    shiftControls.start({
      objectPosition: `calc(50% + ${targetPos}) 50%`,
      transition: { duration: 0.4, ease: "easeOut" },
    });
  }, [targetPos, shiftControls]);

  return shiftControls;
}

const BackgroundImageInternal = memo(function BackgroundImageInternal({
  image,
}: {
  image: string;
}) {
  const shiftControls = useBackgroundShift();

  return (
    <MotionImage
      animate={shiftControls}
      src={`/ivhid_src/${image}.png`}
      fill
      sizes="100dvw"
      priority
      unselectable="on"
      draggable={false}
      quality={100}
      className={styles.background}
      alt="background"
    />
  );
});

function useCutsceneZoom(): AnimationControls {
  const controls = useAnimation();
  const [cutscene] = useCutscene();
  const { background } = useBackgroundContext();

  useEffect(() => {
    if (!cutscene || !background) {
      controls.stop();
      controls.set({
        transform: "scale(1)",
        transition: { duration: 0 },
      });
      return;
    }

    const runSequence = async () => {
      await controls.start({
        transform: "scale(1.2)",
        transition: { duration: 20 },
      });
    };
    runSequence();
  }, [background, controls, cutscene]);

  return controls;
}

export default memo(function Background() {
  const { location, background } = useBackgroundContext();
  const { data: sheets } = useGetSheetsManifestQuery();
  const { data, isLoading } = useGetDriveManifestQuery();
  const controls = useCutsceneZoom();

  const [imageNameToLoad, setImageNameToLoad] = useState<
    string | null | undefined
  >(null);
  const [switchController, switchScene] = useSceneSwitcher();
  const { isFading } = useGameContext();
  const mindControls = useIsMindShade();
  const sheet = sheets?.locations;

  const defaultImageName = useMemo(
    () => sheet?.find((r) => r[0] === location)?.at(-1),
    [location, sheet],
  );

  const [gameState, setGameState] = useGameState();
  const [sceneIdOfTemp, setSceneIdOfTemp] = useState<string | null>(null);
  const [cutscene, setCutscene] = useCutscene();
  const prevLocationRef = useRef<null | string>(null);

  useEffect(() => {
    const cuts = gameState.variables?.Cutscenes;
    if (!Object.values(cuts).some((c) => c)) return;

    const activeKey = Object.entries(cuts).find(([, v]) => v === true)?.[0];
    if (!activeKey) return;

    setSceneIdOfTemp(gameState.id);
    setCutscene(activeKey);
    setGameState((prev) => ({
      ...prev,
      variables: {
        ...prev.variables,
        Cutscenes: { ...prev.variables.Cutscenes, [activeKey]: false },
      },
    }));
  }, [gameState.id, gameState.variables.Cutscenes, setCutscene, setGameState]);

  useEffect(() => {
    if (sceneIdOfTemp && gameState.id !== sceneIdOfTemp) {
      setSceneIdOfTemp(null);
    }
  }, [gameState.id, sceneIdOfTemp, setCutscene]);

  useEffect(() => {
    if (isFading) return;
    if (!cutscene && location && location !== prevLocationRef.current) {
      prevLocationRef.current = location;
      switchScene(() => setImageNameToLoad(background ?? defaultImageName));
    } else {
      setImageNameToLoad(background ?? defaultImageName);
    }
  }, [background, cutscene, defaultImageName, isFading, location, switchScene]);

  if (!imageNameToLoad || !data || isLoading) return null;

  return (
    <AnimatePresence>
      <motion.div
        key={"fade"}
        className={cx(styles.fadeLayer, isFading && styles.inActive)}
        initial={{ opacity: 0 }}
        animate={switchController}
        exit={{ opacity: 0 }}
      />

      <motion.div
        key="mind"
        className={styles.mindOverlay}
        initial={{ opacity: 0 }}
        animate={mindControls}
        exit={{ opacity: 0 }}
      />
      <motion.div
        key="background"
        initial={{ transform: "scale(1)" }}
        animate={controls}
        exit={{ transform: "scale(1)" }}
        className={styles.backgroundWrap}
      >
        <BackgroundImageInternal image={imageNameToLoad} />
      </motion.div>
    </AnimatePresence>
  );
});
