"use client";

import { memo } from "react";
import styles from "./arrow.module.css";
import cx from "clsx";

export default memo(function Arrow({
  right,
  className,
  onClick,
}: {
  right?: boolean;
  className?: string;
  onClick?: () => void;
}) {
  return (
    <svg
      onClick={onClick}
      className={cx(styles.wrap, right && styles.right, className)}
    >
      <polygon
        className={cx(styles.arrowTop, styles.polygon)}
        points="37.6,27.9 1.8,1.3 3.3,0 37.6,25.3 71.9,0 73.7,1.3 "
      />
      <polygon
        className={cx(styles.arrowMiddle, styles.polygon)}
        points="37.6,45.8 0.8,18.7 4.4,16.4 37.6,41.2 71.2,16.4 74.5,18.7 "
      />
      <polygon
        className={cx(styles.arrowBottom, styles.polygon)}
        points="37.6,64 0,36.1 5.1,32.8 37.6,56.8 70.4,32.8 75.5,36.1 "
      />
    </svg>
  );
});
