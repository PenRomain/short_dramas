"use client";

import { useEffect, useState, memo } from "react";
import axios from "axios";
import Image from "next/image";

export default memo(function SwipeyCoinIcon() {
  const [src, setSrc] = useState<string>("");

  useEffect(() => {
    if (!src) {
      axios.get<string>("/api/swipey/icon").then((res) => {
        setSrc(`data:image/svg+xml;utf8,${encodeURIComponent(res.data)}`);
      });
    }
  }, [src]);

  if (!src) return null;

  return <Image src={src} width={24} height={24} alt="swipey coin" />;
});
