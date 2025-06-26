"use client";

import { memo, ButtonHTMLAttributes } from "react";
import styles from "./button.module.css";
import cx from "clsx";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement>;
export default memo(function Button({
  children,
  className,
  ...rest
}: ButtonProps) {
  return (
    <button className={cx(styles.wrap, className)} {...rest}>
      {children}
    </button>
  );
});
