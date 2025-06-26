"use client";

import { useEffect, useState } from "react";

export default function HeadLinks() {
  const URL = process.env.NEXT_PUBLIC_DEV_URL ?? process.env.NEXT_PUBLIC_URL;

  const [list, setList] = useState<string[]>([]);
  useEffect(() => {
    fetch(`${URL}/api/assets-list`)
      .then((r) => r.json())
      .then(setList);
  }, [URL]);

  const preloadLinks = list
    .filter((l) => l.includes("png"))
    .map((name) => {
      const url = `/ivhid_src/${encodeURIComponent(name)}`;
      return `/_next/image?url=${encodeURIComponent(url)}&w=640&q=100`;
    });
  return (
    <>
      {preloadLinks.map((href) => (
        <link key={href} rel="preload" as="image" href={href} />
      ))}
    </>
  );
}
