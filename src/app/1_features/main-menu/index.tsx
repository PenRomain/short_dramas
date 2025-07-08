"use client";

import { memo, ReactNode, useCallback, useRef, useState } from "react";
import styles from "./main-menu.module.css";
import Button from "@/shared/uikit/button";

export function isSSR() {
  return typeof (globalThis as { window: unknown }).window === "undefined";
}

type MainMenuProps = {
  children: ReactNode;
};
export default memo(function MainMenu({ children }: MainMenuProps) {
  const audioCtxRef = useRef<AudioContext | null>(null);
  const [started, setStarted] = useState(false);

  const unlockAudio = useCallback(() => {
    if (!audioCtxRef.current && !isSSR()) {
      const ctx = new AudioContext();
      ctx.resume();
      audioCtxRef.current = ctx;
    }
  }, []);

  if (!started) {
    return (
      <div className={styles.wrap}>
        <Button
          onClick={() => {
            unlockAudio();
            setStarted(true);
          }}
        >
          Start the Game
        </Button>
      </div>
    );
  }

  return <>{children}</>;
});
