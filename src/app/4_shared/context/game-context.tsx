"use client";

import {
  advanceGameFlowState,
  DialogueFragment,
  GameFlowState,
  GameIterationConfig,
  startupGameFlowState,
} from "articy-js";
import {
  createContext,
  Dispatch,
  memo,
  ReactNode,
  SetStateAction,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import { db } from "../model";

export function stepUntilUseful(state: GameFlowState): GameFlowState {
  let cur = state;

  while (true) {
    const frag = db.getObject(cur.id, DialogueFragment);
    const emptyText = !frag?.properties.Text?.trim();
    const noChoices = cur.branches.length === 1;
    if (!(emptyText && noChoices)) break;

    cur = advanceGameFlowState(
      db,
      cur,
      iterationConfig,
      cur.branches[0].index,
    )[0];
  }
  return cur;
}

type GameContext = {
  state: GameFlowState;
  setState: Dispatch<SetStateAction<GameFlowState>>;
  cutscene: string | null;
  setCutscene: (name: string | null) => void;
  handleChoice: (index: number) => void;
  isFading: boolean;
  setIsFading: (isFading: boolean) => void;
};

const gameContext = createContext<GameContext | undefined>(undefined);

export const iterationConfig: GameIterationConfig = {
  stopAtTypes: ["DialogueFragment"],
};
type GameProviderProps = {
  children: ReactNode;
  startId: string;
};
export const GameProvider = memo(function GameProvider({
  startId,
  children,
}: GameProviderProps) {
  const [state, setState] = useState<GameFlowState>(() =>
    stepUntilUseful(startupGameFlowState(db, startId, iterationConfig)[0]),
  );
  const [cutscene, setCutscene] = useState<string | null>(null);
  const [isFading, setIsFading] = useState(false);

  const handleChoice = useCallback(
    (index: number) => {
      setState((prev) =>
        stepUntilUseful(
          advanceGameFlowState(db, prev, iterationConfig, index)[0],
        ),
      );
    },
    [setState],
  );

  const value = useMemo(
    () => ({
      state,
      setState,
      cutscene,
      setCutscene,
      handleChoice,
      isFading,
      setIsFading,
    }),
    [cutscene, handleChoice, isFading, state],
  );

  return <gameContext.Provider value={value}>{children}</gameContext.Provider>;
});

export const useGameContext = () => {
  const context = useContext(gameContext);
  if (!context) {
    throw new Error("useGameContext must be used within a GameProvider");
  }

  return context;
};

export const useGameState = () => {
  const { state, setState } = useGameContext();

  return [state, setState] as const;
};

export const useCutscene = () => {
  const { cutscene, setCutscene } = useGameContext();

  return [cutscene, setCutscene] as const;
};

export const useGameChoice = () => {
  const { handleChoice } = useGameContext();

  return handleChoice;
};
