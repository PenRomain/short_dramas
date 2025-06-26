"use client";

import { ReactNode, useEffect, useState } from "react";
import styles from "./orientation-guard.module.css";

export function OrientationGuard({ children }: { children: ReactNode }) {
  const [showOverlay, setShowOverlay] = useState(false);

  useEffect(() => {
    const isTouchDevice =
      typeof window !== "undefined" &&
      ("ontouchstart" in window || navigator.maxTouchPoints > 0);

    if (!isTouchDevice) {
      return;
    }

    const mql = window.matchMedia("(orientation: landscape)");
    const onChange = (e: MediaQueryListEvent) => {
      setShowOverlay(e.matches);
    };

    setShowOverlay(mql.matches);

    mql.addEventListener("change", onChange);
    return () => {
      mql.removeEventListener("change", onChange);
    };
  }, []);

  return (
    <>
      <div className={styles.phoneFrame}>{children}</div>
      {showOverlay && (
        <div className={styles.overlay}>
          <p>Rotate your device ↻</p>
        </div>
      )}
    </>
  );
}
