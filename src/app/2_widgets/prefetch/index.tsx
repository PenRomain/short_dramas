"use client";

import { useEffect, useRef, useState } from "react";
import Spinner from "@/shared/uikit/spinner";
import styles from "./prefetch.module.css";

const CONCURRENCY = 8;

export function Prefetch({ children }: { children: React.ReactNode }) {
  const [pct, setPct] = useState(0);
  const [done, setDone] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const startTimeRef = useRef<number>(0);

  useEffect(() => {
    let cancelled = false;
    startTimeRef.current = performance.now();

    const timer = setInterval(() => {
      setElapsed((performance.now() - startTimeRef.current) / 1000);
    }, 200);

    (async () => {
      const list: string[] = await fetch("/api/assets-list").then((r) =>
        r.json(),
      );

      const queue = list.filter(
        (l) =>
          l.toLowerCase().includes("loc") ||
          l.toLowerCase().includes("show") ||
          l.toLowerCase().includes("ogg"),
      );
      const total = queue.length;
      let loaded = 0;

      async function worker() {
        while (!cancelled && queue.length) {
          const rel = queue.shift()!;
          const url = `/ivhid_src/${encodeURIComponent(rel)}`;

          const res = await fetch(url);
          if (res.ok) {
            await res.blob();
          }
          loaded++;
          setPct(Math.floor((loaded / total) * 100));
        }
      }

      await Promise.all(Array.from({ length: CONCURRENCY }, () => worker()));
      if (!cancelled) {
        clearInterval(timer);
        const totalSec = (performance.now() - startTimeRef.current) / 1000;
        setElapsed(totalSec);
        setDone(true);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  if (!done) {
    return (
      <div className={styles.spinnerWrap}>
        <Spinner />
        <p className={styles.progress}>
          {pct.toFixed(0)} % — {elapsed.toFixed(1)} s
        </p>
      </div>
    );
  }
  return <>{children}</>;
}
