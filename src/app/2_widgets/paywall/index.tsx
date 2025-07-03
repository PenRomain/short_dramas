"use client";

import { useGameState } from "@/shared/context/game-context";
import { memo, useCallback, useMemo, useState } from "react";
import styles from "./paywall.module.css";
import Image from "next/image";
import { Anton } from "next/font/google";
import cx from "clsx";
import Link from "next/link";
import { CloudflareAnalyticsService } from "../../3_entities/cloudflare/cloudflare-analytics";
import Button from "@/shared/uikit/button";

const anton = Anton({
  variable: "--font-anton",
  weight: "400",
  subsets: ["latin"],
});

const payBoxes = [
  {
    title: "Open chapter two",
    price: "$1.99",
    popular: false,
  },
  {
    title: "Subscribe to all premium stories",
    price: "$9.99/mo",
    popular: true,
  },
  {
    title: "Open full story",
    price: "$4.99",
    popular: false,
  },
];

const EmailFormModal = memo(function EmailFormModal({
  controller,
}: {
  controller: CloudflareAnalyticsService;
}) {
  const [value, setValue] = useState("");
  const [gratitude, setGratitude] = useState(false);
  const handleSubscribe = useCallback(async () => {
    try {
      const result = await controller.updateUser({ email: value });
      if (result.status === "success") {
        setValue("");
        setGratitude(true);
      }
    } catch (e) {
      console.log(
        "%csrc/app/2_widgets/paywall/index.tsx:53 e",
        "color: #007acc;",
        e,
      );
    }
  }, [controller, value]);

  return (
    <div className={styles.modalWrap}>
      <div className={styles.modalContent}>
        {gratitude ? (
          <p className={styles.gratitude}>
            Thank you for subscribing, you will definitely be contacted
          </p>
        ) : (
          <>
            <p className={styles.emailFormTitle}>Subscribe to our newsletter</p>
            <form className={styles.emailForm}>
              <input
                className={styles.emailInput}
                onChange={(e) => setValue(e.target.value)}
                value={value}
                type="email"
                placeholder="Your email"
              />
              <Button onClick={handleSubscribe}>Subscribe</Button>
            </form>
          </>
        )}
      </div>
    </div>
  );
});

export default memo(function Paywall() {
  const [state] = useGameState();
  const [payed, setPayed] = useState(false);
  const openPaywall = state.variables.Paywall.OpenPaywall;
  const controller = useMemo(() => new CloudflareAnalyticsService(), []);

  const handlePayClick = async () => {
    if (payed) {
      return;
    }

    try {
      const result = await controller.payClick();
      if (result.status === "success") {
        setPayed(true);
      }
    } catch (e) {
      console.log(
        "%csrc/app/2_widgets/paywall/index.tsx:100 e",
        "color: #007acc;",
        e,
      );
    }
  };

  if (!openPaywall) return null;

  return (
    <>
      {payed && <EmailFormModal controller={controller} />}
      <div className={cx(styles.wrap, anton.className)}>
        <div className={styles.imageWrap}>
          <Image src="/paywall.png" fill alt="paywall" />
        </div>
        <div className={styles.contentWrap}>
          <h1 className={styles.title}>Open chapter two?</h1>
          <span className={styles.subtitle}>Choose your payment option</span>
          <div className={styles.paysWrap}>
            {payBoxes.map((p, i) => (
              <div
                onClick={handlePayClick}
                key={i}
                className={cx(styles.payBox, p.popular && styles.popular)}
              >
                <span>{p.title}</span>
                <span>{p.price}</span>
              </div>
            ))}
          </div>
          <span className={styles.subtitle}>I want to change chapter one</span>
          <span className={styles.footerText}>
            By purchasing, you agree to the{" "}
            <Link className={styles.link} href="#">
              Terms of Use
            </Link>{" "}
            and{" "}
            <Link className={styles.link} href="#">
              Privacy Policy
            </Link>
            .
          </span>
        </div>
      </div>
    </>
  );
});
