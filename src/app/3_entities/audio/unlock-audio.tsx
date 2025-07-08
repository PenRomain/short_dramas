"use client";

import { memo, useEffect, useRef } from "react";

export function isSSR() {
  return typeof (globalThis as { window: unknown }).window === "undefined";
}

export default memo(function UnlockAudio() {
  const audioCtxRef = useRef<AudioContext | null>(null);

  const unlockAudio = () => {
    if (!audioCtxRef.current) {
      const ctx = new AudioContext();
      ctx.resume();
      audioCtxRef.current = ctx;
    }
  };

  useEffect(() => {
    if (!isSSR()) {
      unlockAudio();
    }
  }, []);

  return <></>;
});
