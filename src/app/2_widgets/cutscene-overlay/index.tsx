"use client";

import { motion, useAnimation, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { useCutscene } from "@/shared/context/game-context";
import { useGetDriveManifestQuery } from "@/shared/store/services/google";
import styles from "./cutscene-overlay.module.css";
import { useBackgroundSetter } from "@/shared/context/background-context";
import cx from "clsx";

const DURATION_SLOW = 1.9;

export default function CutsceneOverlay() {
  const [cutscene, setCutscene] = useCutscene();
  const setBg = useBackgroundSetter();
  const { data } = useGetDriveManifestQuery();
  const controls = useAnimation();
  const [clickDisabled, setClickDisabled] = useState(false);

  useEffect(() => {
    if (!cutscene || !data) return;

    setClickDisabled(true);
    const enableTimer = setTimeout(() => setClickDisabled(false), 3000);

    const runSequence = async () => {
      await controls.start({
        opacity: 1,
        transition: { duration: DURATION_SLOW },
      });
      setBg(cutscene);
      await controls.start({
        opacity: 0,
        transition: { duration: DURATION_SLOW },
      });
    };

    runSequence();

    return () => {
      clearTimeout(enableTimer);
    };
  }, [controls, cutscene, data, setBg]);

  const closeScene = async () => {
    if (!cutscene || clickDisabled) return;
    await controls.start({
      opacity: 1,
      transition: { duration: DURATION_SLOW },
    });
    setBg(null);
    await controls.start({
      opacity: 0,
      transition: { duration: DURATION_SLOW },
    });
    setCutscene(null);
  };

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key="blackout"
        className={cx(styles.fullscreen, !cutscene && styles.hidden)}
        initial={{ opacity: 0 }}
        animate={controls}
        exit={{ opacity: 0 }}
        onClick={closeScene}
      />
    </AnimatePresence>
  );
}
