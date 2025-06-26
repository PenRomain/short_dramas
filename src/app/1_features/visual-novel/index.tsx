"use client";

import { memo, useState, MouseEvent, useMemo } from "react";
import { DialogueFragment } from "articy-js";
import styles from "./visual-novel.module.css";
import Button from "../../4_shared/uikit/button";
import { db } from "../../4_shared/model";
import CName from "../../2_widgets/c-name";
import {
  useCutscene,
  useGameChoice,
  useGameContext,
  useGameState,
} from "../../4_shared/context/game-context";
import { useInstructions } from "../../4_shared/hooks/use-instructions";
import cx from "clsx";
import { Characters } from "@/shared/types";
import { isKeyOf } from "@/widgets/character";
import { getBranchLabel } from "@/shared/utils/get-branch-label";
import { AnimatePresence, motion } from "framer-motion";
import TypingEffect from "@/shared/uikit/typing-effect";
import { useNodeTextWithName } from "@/shared/hooks/use-node-text-with-name";
import { useMusic } from "@/shared/hooks/use-music";
import { useGetDriveManifestQuery } from "@/shared/store/services/google";
import SwipeyCoinIcon from "@/shared/uikit/swipey-coin-icon";
import { SwipeyPayService } from "@/shared/swipey/swipey-pay.service";
import { useSound } from "@/shared/hooks/use-sound";

const PRICE = 120;

type PremiumButtonProps = {
  onSuccess: VoidFunction;
  label: string;
};
const PremiumButton = memo(function PremiumButton({
  onSuccess,
  label,
}: PremiumButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { pay } = useMemo(() => new SwipeyPayService(), []);

  const handleClick = async (e: MouseEvent) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);

    try {
      const result = await pay(PRICE);
      if (result.status === "deposit") {
        window.open(result.depositUrl, "_blank", "noopener,noreferrer");
      }
      if (result.status === "success") {
        onSuccess();
      }
      if (result.status === "error") {
        setError(result.message ?? "Something went wrong");
      }
    } catch (e) {
      console.log(
        "%csrc/app/1_features/visual-novel/index.tsx:62 e",
        "color: #007acc;",
        e,
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      onClick={handleClick}
      className={cx(
        styles.premiumButton,
        error && styles.error,
        loading && styles.loading,
      )}
      disabled={loading}
    >
      <span className={styles.premiumText}>
        {label.replace("[premium]", "")}
        {` ${PRICE}`}
        <SwipeyCoinIcon />
      </span>
    </Button>
  );
});

export default memo(function VisualNovel() {
  const [state] = useGameState();
  useInstructions();
  useMusic();
  useSound();
  const handleChoice = useGameChoice();
  const [cutscene] = useCutscene();
  const { isFading } = useGameContext();
  const node = db.getObject(state.id, DialogueFragment);
  const text = useNodeTextWithName();
  const { isLoading } = useGetDriveManifestQuery();

  const characterName = state.variables.Enter["_cname_"].toString();

  const isOpenWardrobe = state.variables.Open.Wardrobe;

  if (cutscene || isOpenWardrobe || isFading || isLoading || !node) return null;

  const character = node.Speaker?.properties.DisplayName;
  const isMainCharacter = character === Characters.Protagonist;
  const isCharacter = character && isKeyOf(character, Characters);

  return (
    <div className={cx(styles.container, character && styles[character])}>
      <AnimatePresence mode="wait">
        <motion.div
          key={node.id}
          className={styles.dialogueBox}
          initial={{
            scale: 0.05,
            opacity: 0,
            originX: isMainCharacter ? 0 : 1,
            originY: 0,
          }}
          animate={{
            scale: 1,
            opacity: 1,
            transition: { duration: 0.25, ease: "easeOut" },
          }}
          exit={{
            scale: 0.05,
            opacity: 0,
            originX: 1,
            originY: 0,
            transition: { duration: 0.2, ease: "easeIn" },
          }}
        >
          {isCharacter && (
            <p
              className={cx(
                styles.character,
                isMainCharacter && styles.isMainCharacter,
              )}
            >
              {isMainCharacter ? characterName : character}
            </p>
          )}

          {text && (
            <TypingEffect key={text} text={text} className={styles.dialogue} />
          )}
        </motion.div>
      </AnimatePresence>
      <CName />
      <div className={styles.choices}>
        {state.branches.length > 1 &&
          state.branches.map((br, i) => {
            const label = getBranchLabel(br);
            const isPremium = label.includes("premium");

            if (isPremium) {
              return (
                <PremiumButton
                  key={i}
                  label={label}
                  onSuccess={() => handleChoice(br.index)}
                />
              );
            }
            return (
              <Button
                key={i}
                onClick={() => {
                  handleChoice(br.index);
                }}
              >
                {label}
              </Button>
            );
          })}
      </div>
    </div>
  );
});
