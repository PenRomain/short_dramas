"use client";

import Button from "../../4_shared/uikit/button";
import { memo, useState } from "react";
import styles from "./c-name.module.css";
import {
  useGameChoice,
  useGameState,
} from "../../4_shared/context/game-context";

export default memo(function CName() {
  const [input, setInput] = useState("");
  const [state, setState] = useGameState();
  const handleChoice = useGameChoice();

  const needsName =
    state.variables.Enter._cname_ === "" && state.branches.length > 0;

  function confirmName() {
    setState((prev) => ({
      ...prev,
      variables: {
        ...prev.variables,
        Enter: { ...prev.variables.Enter, _cname_: input },
        Names: { ...prev.variables.Names, cname: input },
      },
    }));
    handleChoice(state.branches[0].index);
  }
  if (!needsName) return;
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        confirmName();
      }}
      className={styles.form}
    >
      <p className={styles.title}>What is your name?</p>
      <div className={styles.box}>
        <input
          className={styles.input}
          value={input}
          onChange={(e) => {
            const formatted = e.target.value
              .toLowerCase()
              .replace(
                /(^|\s|-)(\p{L})/gu,
                (_, p1, p2) => p1 + p2.toUpperCase(),
              );

            setInput(formatted);
          }}
          required
        />
        <Button type="submit">OK</Button>
      </div>
    </form>
  );
});
