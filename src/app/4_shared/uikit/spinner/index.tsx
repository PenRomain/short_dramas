import React, { memo } from "react";
import cx from "clsx";
import styles from "./spinner.module.css";

export default memo(function Spinner({ className }: { className?: string }) {
  return (
    <div className={cx(styles.wrap, className)}>
      <div className={styles.spinner} />
    </div>
  );
});
