"use client";

import { memo, useCallback, useMemo, useState } from "react";
import Image from "next/image";
import { useKeenSlider } from "keen-slider/react";
import "keen-slider/keen-slider.min.css";

import {
  iterationConfig,
  stepUntilUseful,
  useGameState,
} from "@/shared/context/game-context";
import { useGetDriveManifestQuery } from "@/shared/store/services/google";
import { parseBranch, lookImages } from "./utils";
import styles from "./wardrobe.module.css";
import { advanceGameFlowState, DialogueFragment } from "articy-js";
import { db } from "@/shared/model";
import { getBranchLabel } from "@/shared/utils/get-branch-label";
import Button from "@/shared/uikit/button";
import Arrow from "@/shared/uikit/arrow";
import { AnimatePresence, motion } from "framer-motion";
import SwipeyCoinIcon from "@/shared/uikit/swipey-coin-icon";
import { SwipeyPayService } from "@/shared/swipey/swipey-pay.service";
import cx from "clsx";

const PRICE = 120;

const WardrobeImage = memo(function WardrobeImage({
  image,
}: {
  image: string;
}) {
  return (
    <Image
      sizes="100dvw"
      src={`/ivhid_src/${image}`}
      alt={image}
      width={400}
      height={800}
      quality={100}
      priority
      unselectable="on"
      draggable={false}
      className={styles.layer}
    />
  );
});

export default memo(function Wardrobe() {
  const [state, setState] = useGameState();
  const { data: drive } = useGetDriveManifestQuery();
  const open = state.variables.Open.Wardrobe;
  const [sliderRef, slider] = useKeenSlider({
    loop: true,
    initial: 0,
    slideChanged: (s) => setIdx(s.track.details.rel),
  });
  const [idx, setIdx] = useState(0);
  const node = db.getObject(state.id, DialogueFragment);
  const mainCh_Race = state.variables.Wardrobe.mainCh_Race;
  const { pay } = useMemo(() => new SwipeyPayService(), []);
  const [loading, setLoading] = useState(false);

  const confirm = useCallback(() => {
    setState((prev) => {
      const next = stepUntilUseful(
        advanceGameFlowState(db, prev, iterationConfig, idx)[0],
      );
      return {
        ...next,
        variables: {
          ...next.variables,
          Open: { ...next.variables.Open, Wardrobe: false },
        },
      };
    });
    setIdx(0);
  }, [idx, setState]);

  const payHandler = useCallback(async () => {
    if (loading) return;
    setLoading(true);

    try {
      const result = await pay(PRICE);
      if (result.status === "deposit") {
        window.open(result.depositUrl, "_blank", "noopener,noreferrer");
      }
      if (result.status === "success") {
        confirm();
      }
    } catch (e) {
      console.log(
        "%csrc/app/2_widgets/wardrobe/index.tsx:82 e",
        "color: #007acc;",
        e,
      );
    } finally {
      setLoading(false);
    }
  }, [confirm, loading, pay]);

  const looks = state.branches
    .map((br) => parseBranch(br, mainCh_Race))
    .filter(Boolean);
  const labels = state.branches.map(getBranchLabel).filter(Boolean);
  const wardrobeItem: string | undefined = labels[idx];
  const isPremium = wardrobeItem?.includes("premium");

  if (!open || !drive || !node) return null;

  return (
    <div className={styles.full}>
      <AnimatePresence mode="wait">
        <motion.div
          key={node.id}
          className={styles.dialogueBox}
          initial={{ opacity: 0, scale: 0.05, originX: 0.5, originY: 0.5 }}
          animate={{
            opacity: 1,
            transition: { duration: 0.25, ease: "easeOut" },
            scale: 1,
          }}
          exit={{
            opacity: 0,
            transition: { duration: 0.2, ease: "easeIn" },
            scale: 0.05,
            originX: 0.5,
            originY: 0.5,
          }}
        >
          <p className={styles.title}>{node.properties.Text}</p>
          <div className={styles.dialogue}>
            {isPremium ? (
              <>
                <span className={styles.wardrobeItem}>
                  {wardrobeItem.replace("[premium]", "")}
                </span>
                <Button
                  disabled={loading}
                  className={cx(styles.ok, loading && styles.loading)}
                  onClick={payHandler}
                >
                  Choose
                  <span className={styles.premiumPrice}>
                    {` ${PRICE} `}
                    <SwipeyCoinIcon />
                  </span>
                </Button>
              </>
            ) : (
              <>
                <span className={styles.wardrobeItem}>{wardrobeItem}</span>
                <Button className={styles.ok} onClick={confirm}>
                  Choose
                </Button>
              </>
            )}
            <Arrow
              onClick={() => slider.current?.prev()}
              className={styles.arrowLeft}
            />
            <Arrow
              onClick={() => slider.current?.next()}
              right
              className={styles.arrowRight}
            />
          </div>
        </motion.div>
      </AnimatePresence>
      <div ref={sliderRef} className="keen-slider">
        {looks.map(
          (look, i) =>
            look && (
              <div key={i} className="keen-slider__slide">
                <div className={styles.card}>
                  {lookImages(look).map((img, j) => {
                    if (!img) return null;
                    return <WardrobeImage key={j} image={img} />;
                  })}
                </div>
              </div>
            ),
        )}
      </div>
    </div>
  );
});
