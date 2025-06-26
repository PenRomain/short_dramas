"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useGameChoice, useGameState } from "@/shared/context/game-context";
import { db } from "@/shared/model";
import { DialogueFragment } from "articy-js";
import { useNodeTextWithName } from "@/shared/hooks/use-node-text-with-name";
import styles from "./info-toast.module.css";
import stars from "./stars.svg";
import Image from "next/image";

const DUR = 0.25;
const SHOW_MS = 4500;

export default function InfoToast() {
  const [state] = useGameState();
  const next = useGameChoice();
  const node = db.getObject(state.id, DialogueFragment);
  const isInfo = node?.Speaker?.properties.DisplayName === "Information";
  const rawText = useNodeTextWithName();

  const [msg, setMsg] = useState<string | null>(null);
  useEffect(() => {
    if (isInfo && rawText) {
      setMsg(rawText);
      next(0);
    }
  }, [isInfo, rawText, next]);

  useEffect(() => {
    if (!msg) return;
    const id = setTimeout(() => setMsg(null), SHOW_MS);
    return () => clearTimeout(id);
  }, [msg]);

  return (
    <AnimatePresence mode="wait">
      {msg && (
        <motion.div
          key={msg}
          className={styles.toast}
          initial={{ y: -30, scale: 0.8, opacity: 0 }}
          animate={{
            y: 0,
            scale: 1,
            opacity: 1,
            transition: { duration: DUR },
          }}
          exit={{
            y: -30,
            scale: 0.8,
            opacity: 0,
            transition: { duration: DUR },
          }}
        >
          <Image
            className={styles.icon}
            width={stars.width}
            height={stars.height}
            src={stars.src}
            alt={"stars"}
          />
          {msg}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
