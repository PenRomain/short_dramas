"use client";

import { useEffect, useRef } from "react";
import { useGameState } from "../context/game-context";

export function useMusic() {
  const [state] = useGameState();
  const musicVars = (state.variables?.Music ?? {}) as Record<string, boolean>;
  const trackKey = Object.entries(musicVars).find(([, on]) => on)?.[0] ?? null;
  const trackFileName = trackKey ? `${trackKey}.ogg` : null;

  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.pause();
    }

    if (!trackFileName) {
      return;
    }

    const url = `/ivhid_src/${encodeURIComponent(trackFileName)}`;

    fetch(url)
      .then((r) => {
        if (!r.ok) throw new Error("Cannot fetch music");
        return r.blob();
      })
      .then((blob) => {
        const blobUrl = URL.createObjectURL(blob);
        const audio = new Audio(blobUrl);
        audio.loop = true;
        audio.currentTime = 0;
        audio.play().catch(console.error);
        audioRef.current = audio;

        audio.addEventListener("playing", () => {
          URL.revokeObjectURL(blobUrl);
        });
      })
      .catch(console.error);

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, [trackFileName]);
}
