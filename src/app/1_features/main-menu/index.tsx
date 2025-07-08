"use client";

import { memo, ReactNode, useCallback, useRef, useState } from "react";
import cx from "clsx";
import Button from "@/shared/uikit/button";
import Image from "next/image";
import styles from "./main-menu.module.css";

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
        <Image src={"/forest.png"} fill alt="forest" />
        <Button className={cx(styles.startButton, styles.fullWidth)}>
          <Image src={"/banana.svg"} width={24} height={24} alt={"banana"} />
          <div className={styles.divider} />
          <span>100</span>
        </Button>
        <div className={styles.amazonsWrap}>
          <Image
            className={styles.amazons}
            src={"/amazons.png"}
            fill
            alt={"amazons"}
          />
          <Button
            className={cx(styles.startButton, styles.fullWidth)}
            onClick={() => {
              unlockAudio();
              setStarted(true);
            }}
          >
            PLAY
          </Button>
        </div>

        <div className={styles.amazonsLabelWrap}>
          <Image
            className={styles.amazonsLabel}
            src={"/amazons_label.png"}
            fill
            alt={"amazons label"}
          />
        </div>
      </div>
    );
  }

  return <>{children}</>;
});
