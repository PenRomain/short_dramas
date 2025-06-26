"use server";

import { NextResponse } from "next/server";

const SWIPEY = "https://ud824.com/v2/icons/coin.svg";

export async function GET() {
  const upstream = await fetch(SWIPEY, { cache: "force-cache" });
  if (!upstream.ok) {
    return NextResponse.json({ error: "Icon fetch failed" }, { status: 502 });
  }
  const svg = await upstream.text();

  return new NextResponse(svg, {
    status: 200,
    headers: {
      "Content-Type": "image/svg+xml; charset=utf-8",
      "Cache-Control": "public, max-age=86400, immutable",
    },
  });
}
