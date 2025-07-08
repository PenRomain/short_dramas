"use client";

import { memo, useRef } from "react";

export default memo(function UnlockAudio() {
  const audioCtxRef = useRef<AudioContext | null>(null);

  const unlockAudio = () => {
    if (!audioCtxRef.current) {
      const ctx = new AudioContext();
      ctx.resume();
      audioCtxRef.current = ctx;
    }
  };

  unlockAudio();
  return <></>;
});
