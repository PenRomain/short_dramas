"use client";

import { useGameState } from "../../4_shared/context/game-context";
import { db } from "../../4_shared/model";
import { DialogueFragment } from "articy-js";
import { memo, useEffect, useMemo, useRef } from "react";
import styles from "./character.module.css";
import cx from "clsx";
import { useGetSheetsManifestQuery } from "@/shared/store/services/google";
import { Characters } from "@/shared/types";
import { motion, useAnimation, Variants } from "framer-motion";
import { useEmotion } from "@/shared/context/emotion-context";

const leftVariants: Variants = {
  hidden: { x: "-15%", opacity: 0 },
  show: { x: "0%", opacity: 1, transition: { duration: 0.2 } },
  exit: { x: "-15%", opacity: 0.65, transition: { duration: 0.2 } },
};

const rightVariants: Variants = {
  hidden: { x: "15%", opacity: 0 },
  show: { x: "0%", opacity: 1, transition: { duration: 0.2 } },
  exit: { x: "15%", opacity: 0.65, transition: { duration: 0.2 } },
};

export function isKeyOf<T extends object>(
  key: string | number | symbol,
  obj: T,
): key is keyof T {
  return key in obj;
}

export default memo(function Character() {
  const [state] = useGameState();
  const node = db.getObject(state.id, DialogueFragment);
  const [emotion] = useEmotion();
  const character = node?.Speaker?.properties.DisplayName;
  const { data: sheets } = useGetSheetsManifestQuery();
  const race = +state.variables.Wardrobe.mainCh_Race - 1;
  const isOpenWardrobe = state.variables.Open.Wardrobe;

  const { bodyImg, emoImg, suitImg } = useMemo(() => {
    const res = sheets?.emotions.filter((r) => r[0] === character) ?? [];

    const [, , , , body, , ...emotions] = res[race] ?? res[0] ?? [];
    const emo = emotions.find((e) => e.includes(emotion));

    const mainClothes = state.variables.Wardrobe.mainCh_Clothes;
    const caroClothes = state.variables.Wardrobe.Carolina;

    return {
      bodyImg: body ? `${body}.png` : undefined,
      emoImg: emo ? `${emo}.png` : undefined,
      suitImg:
        character === Characters.Protagonist && mainClothes
          ? `mainCh_Clothes_${mainClothes}.png`
          : character === Characters.Carolina && caroClothes
            ? `Ivhid_Wardrobe_Carolina_${caroClothes}.png`
            : undefined,
    };
  }, [
    character,
    emotion,
    race,
    sheets?.emotions,
    state.variables.Wardrobe.Carolina,
    state.variables.Wardrobe.mainCh_Clothes,
  ]);

  const urls = [bodyImg, suitImg, emoImg].filter((u): u is string =>
    Boolean(u),
  );
  const urlsString = useMemo(() => urls.join("|"), [urls]);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const controls = useAnimation();
  const width = 400,
    height = 800;

  useEffect(() => {
    let cancelled = false;
    controls.set("hidden");

    (async () => {
      const bitmaps = await Promise.all(
        urls.map((u) =>
          fetch(`/ivhid_src/${u}`)
            .then((r) => r.blob())
            .then((b) => createImageBitmap(b)),
        ),
      );

      if (cancelled) return;
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d")!;
      canvas.setAttribute("sizes", "100dvw");
      canvas.setAttribute("unselectable", "on");
      canvas.setAttribute("draggable", "false");
      canvas.setAttribute("decoding", "async");
      canvas.setAttribute("quality", "100");
      const dpr = 2;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.scale(dpr, dpr);
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";

      bitmaps.forEach((bm) => ctx.drawImage(bm, 0, 0, width, height));
      await controls.start("show");
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [character, urlsString]);

  if (!character || !sheets || isOpenWardrobe) return null;

  const isLeftSide = character === Characters.Protagonist;
  const variants = isLeftSide ? leftVariants : rightVariants;

  return (
    <motion.div
      key={character}
      className={styles.wrap}
      initial="hidden"
      animate={controls}
      variants={variants}
    >
      <canvas
        ref={canvasRef}
        className={cx(styles.character, styles[character])}
        width={width}
        height={height}
      />
    </motion.div>
  );
});
