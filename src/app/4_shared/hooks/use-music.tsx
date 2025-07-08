"use client";

import { useEffect, useRef } from "react";
import { useGameState } from "../context/game-context";

export function useMusic() {
  const [state] = useGameState();
  const musicVars = (state.variables?.Music ?? {}) as Record<string, boolean>;
  const trackKey = Object.entries(musicVars).find(([, on]) => on)?.[0] ?? null;
  const trackFileName = trackKey ? `${trackKey}.ogg` : null;

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audio = useRef(new Audio());

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.pause();
    }

    if (!trackFileName) {
      return;
    }

    const url = `/amazons/${encodeURIComponent(trackFileName)}`;

    fetch(url)
      .then((r) => {
        if (!r.ok) throw new Error("Cannot fetch music");
        return r.blob();
      })
      .then((blob) => {
        const blobUrl = URL.createObjectURL(blob);
        audio.current.src = blobUrl;
        audio.current.loop = true;
        audio.current.currentTime = 0;
        audio.current.play().catch(console.error);
        audioRef.current = audio.current;

        audio.current.addEventListener("playing", () => {
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
