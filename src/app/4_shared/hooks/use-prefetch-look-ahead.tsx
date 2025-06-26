import { useCallback, useEffect, useRef, useState } from "react";
import {
  advanceGameFlowState,
  Dialogue,
  DialogueFragment,
  GameFlowState,
  GameIterationConfig,
  Location,
} from "articy-js";
import { db } from "@/shared/model";
import { useGameState } from "@/shared/context/game-context";
import {
  googleApi,
  useGetSheetsManifestQuery,
} from "@/shared/store/services/google";
import { useAppDispatch } from "@/shared/store/hooks";
import { Characters } from "@/shared/types";
import { useBackgroundContext } from "../context/background-context";

const ITER_CFG: GameIterationConfig = { stopAtTypes: ["DialogueFragment"] };
const LOOK_AHEAD = 10;
const MAX_BRANCHES = 5;
const HIDE_DELAY = 150;
const CAROLINAS_CLOTHES = 5;
const PROTOGONIST_RACES = 3;
const PROTOGONIST_CLOHTES = 3;

export function usePrefetchLookAhead() {
  const dispatch = useAppDispatch();
  const [state] = useGameState();
  const { background } = useBackgroundContext();
  const { data: sheets } = useGetSheetsManifestQuery();
  const queue = useRef(new Set<string>());
  const requested = useRef(new Set<string>());
  const pending = useRef(0);
  const [loading, setLoading] = useState(false);
  const hideTimer = useRef<ReturnType<typeof setTimeout>>(null);
  const sheet = sheets?.locations;

  const bumpLoading = useCallback((val: boolean) => {
    if (val && hideTimer.current) {
      clearTimeout(hideTimer.current);
      setLoading(true);
    } else {
      hideTimer.current = setTimeout(() => setLoading(false), HIDE_DELAY);
    }
  }, []);

  const inc = useCallback(() => {
    if (++pending.current === 1) bumpLoading(true);
  }, [bumpLoading]);
  const dec = useCallback(() => {
    if (--pending.current === 0) bumpLoading(false);
  }, [bumpLoading]);

  const reallySchedule = useCallback(
    (id: string) => {
      if (!id || requested.current.has(id)) return;
      requested.current.add(id);

      inc();
      dispatch(googleApi.endpoints.getImage.initiate(id)).unwrap().finally(dec);
    },
    [dec, dispatch, inc],
  );

  const schedule = useCallback(
    (id: string) => {
      if (queue.current.has(id) || requested.current.has(id)) return;
      queue.current.add(id);

      queueMicrotask(() => {
        const [next] = queue.current;
        if (!next) return;
        queue.current.delete(next);
        reallySchedule(next);
      });
    },
    [reallySchedule],
  );

  useEffect(() => {
    if (!sheets) return;
    const imgNames = new Set<string>();

    function walk(node: GameFlowState, depth: number) {
      if (depth > LOOK_AHEAD) return;

      collectAssets(node);
      for (const br of node.branches.slice(0, MAX_BRANCHES)) {
        const [next] = advanceGameFlowState(db, node, ITER_CFG, br.index);
        walk(next, depth + 1);
      }
    }

    function collectAssets(g: GameFlowState) {
      const frag = db.getObject(g.id, DialogueFragment);
      const character = frag?.Speaker?.properties.DisplayName;
      const row = sheets?.emotions.filter((r) => r[0] === character) ?? [];
      const sceneId = frag?.properties.Parent;
      const scene = sceneId ? db.getObject(sceneId, Dialogue) : undefined;
      const locId = scene?.properties.Attachments?.[0];
      const location = locId
        ? db.getObject(locId, Location)?.properties.DisplayName
        : undefined;
      const defaultImageName = sheet?.find((r) => r[0] === location)?.at(-1);
      const [, , , , body, , ...emotions] = row[0] ?? [];

      if (body) imgNames.add(`${body}.png`);
      emotions.forEach((e) => e && imgNames.add(`${e}.png`));

      if (background) {
        imgNames.add(`${background}.png`);
      }
      if (defaultImageName) {
        imgNames.add(`${defaultImageName}.png`);
      }

      if (character === Characters.Protagonist) {
        Array.from({ length: PROTOGONIST_RACES }).forEach((_, i) => {
          const [, , , , body, , ...emotions] = row[i] ?? row[0] ?? [];
          if (body) imgNames.add(`${body}.png`);
          emotions.forEach((e) => e && imgNames.add(`${e}.png`));
        });
        Array.from({ length: PROTOGONIST_CLOHTES }).forEach((_, i) => {
          imgNames.add(`mainCh_Clothes_${i + 1}.png`);
        });
      }
      if (character === Characters.Carolina) {
        Array.from({ length: CAROLINAS_CLOTHES }).forEach((_, i) => {
          imgNames.add(`Ivhid_Wardrobe_Carolina_${i + 1}.png`);
        });
      }
    }

    walk(state, 0);
    imgNames.forEach(schedule);
  }, [background, schedule, sheet, sheets, state]);

  return { loading };
}
