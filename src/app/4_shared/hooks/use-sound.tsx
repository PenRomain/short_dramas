"use client";

import { useEffect, useRef } from "react";
import { useGameState } from "../context/game-context";

export function useSound() {
  const [state] = useGameState();

  const soundVars = (state.variables?.Sound ?? {}) as Record<string, boolean>;
  const soundKey = Object.entries(soundVars).find(([, on]) => on)?.[0] ?? null;
  const playedRef = useRef<Set<string>>(new Set());
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const fileName = soundKey ? `${soundKey}.ogg` : null;

  useEffect(() => {
    if (!fileName || !soundKey) return;

    const urlPath = `/ivhid_src/${encodeURIComponent(fileName)}`;
    if (!playedRef.current.has(soundKey)) {
      playedRef.current.add(soundKey);

      fetch(urlPath)
        .then((r) => {
          if (!r.ok) throw new Error("Cannot fetch sound");
          return r.blob();
        })
        .then((blob) => {
          const blobUrl = URL.createObjectURL(blob);
          const audio = new Audio(blobUrl);
          audio.play().catch(console.error);
          audioRef.current = audio;

          audio.addEventListener("playing", () => {
            URL.revokeObjectURL(blobUrl);
          });
        })
        .catch(console.error);
    }
  }, [fileName, soundKey]);
}
