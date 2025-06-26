import React, { memo } from "react";
import styles from "./spinner.module.css";

export default memo(function Spinner() {
  return (
    <div className={styles.wrap}>
      <div className={styles.spinner} />
    </div>
  );
});
