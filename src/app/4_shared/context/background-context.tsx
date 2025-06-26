"use client";

import { Dialogue, DialogueFragment, Location, TemplateProps } from "articy-js";
import {
  createContext,
  memo,
  ReactNode,
  useContext,
  useMemo,
  useState,
} from "react";
import { db } from "../model";
import { useGameState } from "./game-context";

type BackgroundContext = {
  background: string | null;
  setBackground: (bg: string | null) => void;
  location: Location<TemplateProps>["properties"]["DisplayName"] | undefined;
};

const backgroundContext = createContext<BackgroundContext | undefined>(
  undefined,
);

type BackgroundProviderProps = {
  children: ReactNode;
};
export const BackgroundProvider = memo(function BackgroundProvider({
  children,
}: BackgroundProviderProps) {
  const [state] = useGameState();
  const frag = db.getObject(state.id, DialogueFragment);
  const sceneId = frag?.properties.Parent;
  const scene = sceneId ? db.getObject(sceneId, Dialogue) : undefined;
  const locId = scene?.properties.Attachments?.[0];
  const location = locId
    ? db.getObject(locId, Location)?.properties.DisplayName
    : undefined;
  const [background, setBackground] = useState<string | null>(null);

  const value = useMemo(
    () => ({
      location,
      background,
      setBackground,
    }),
    [background, location],
  );

  return (
    <backgroundContext.Provider value={value}>
      {children}
    </backgroundContext.Provider>
  );
});

export const useBackgroundContext = () => {
  const context = useContext(backgroundContext);
  if (!context) {
    throw new Error(
      "useBackgroundContext must be used within a BackgroundProvider",
    );
  }

  return context;
};

export const useBackgroundSetter = () => {
  const { setBackground } = useBackgroundContext();

  return setBackground;
};
