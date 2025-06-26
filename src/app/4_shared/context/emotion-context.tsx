"use client";

import { DialogueFragment } from "articy-js";
import {
  createContext,
  memo,
  ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { db } from "../model";
import { useGameState } from "./game-context";

type EmotionContext = {
  emotion: string;
  setEmotion: (emotion: string) => void;
};

const emotionContext = createContext<EmotionContext | undefined>(undefined);

type EmotionProviderProps = {
  children: ReactNode;
};
export const EmotionProvider = memo(function EmotionProvider({
  children,
}: EmotionProviderProps) {
  const [state] = useGameState();
  const node = db.getObject(state.id, DialogueFragment);
  const [emotion, setEmotion] = useState<string>("Idle");
  const blue = node?.properties.Color.b;
  const green = node?.properties.Color.g;
  const red = node?.properties.Color.r;

  const emotions = useMemo(
    () => ({
      Surprise: {
        red: 1,
        green: 1,
        blue: 0,
      },
      Thoughtfulness: {
        red: 0,
        green: 0.4392157,
        blue: 0.7529412,
      },
      Determination: {
        red: 0,
        green: 0.1254902,
        blue: 0.3764706,
      },
      Embarrassment: {
        red: 0.8509804,
        green: 0.5882353,
        blue: 0.5803922,
      },
      Happy: {
        red: 0,
        green: 0.6901961,
        blue: 0.3137255,
      },
      Bed_Happy: {
        red: 0.57254905,
        green: 0.8156863,
        blue: 0.3137255,
      },
      Bed_Idle: {
        red: 1,
        green: 1,
        blue: 1,
      },
      Sad: {
        red: 0.4392157,
        green: 0.1882353,
        blue: 0.627451,
      },
    }),
    [],
  );

  useEffect(() => {
    setEmotion(
      Object.entries(emotions).find(([key, value]) => {
        if (value.blue === blue && value.green === green && value.red === red) {
          return key;
        }
      })?.[0] ?? "Idle",
    );
  }, [blue, emotions, green, red]);

  const value = useMemo(
    () => ({
      emotion,
      setEmotion,
    }),
    [emotion],
  );

  return (
    <emotionContext.Provider value={value}>{children}</emotionContext.Provider>
  );
});

export const useEmotionContext = () => {
  const context = useContext(emotionContext);
  if (!context) {
    throw new Error("useEmotionContext must be used within a EmotionProvider");
  }

  return context;
};

export const useEmotion = () => {
  const { emotion, setEmotion } = useEmotionContext();

  return [emotion, setEmotion] as const;
};
