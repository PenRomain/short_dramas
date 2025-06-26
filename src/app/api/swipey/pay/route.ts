"use server";

import axios from "axios";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

const SWIPEY = "https://ud824.com/api/v1";
// const SWIPEY = "https://swipey.ai/api/v1";
const KEY = process.env.SWIPEY_API_KEY ?? "";

export async function GET(req: NextRequest) {
  const price = new URL(req.url).searchParams.get("price");
  const cookieStore = await cookies();
  const userId = cookieStore.get("user_id")?.value;
  const characterId = cookieStore.get("character_id")?.value;

  if (!userId || !characterId) {
    return NextResponse.json(
      { error: "No swipey credentials" },
      { status: 401 },
    );
  }
  if (!price)
    return NextResponse.json(
      {
        error: "Need to fill amount",
      },
      { status: 402 },
    );
  try {
    const { data } = await axios.post(
      `${SWIPEY}/novels/pay`,
      {
        user_id: userId,
        character_id: characterId,
        price,
      },
      {
        headers: {
          Accept: "*/*",
          "Content-Type": "application/json",
          "X-Api-Key": KEY,
        },
      },
    );

    return NextResponse.json(data, { status: data.status });
  } catch (e) {
    console.log("%csrc/app/api/swipey/pay/route.ts:14 e", "color: #007acc;", e);
    return NextResponse.json(
      {
        error: "Failed to pay",
      },
      { status: 401 },
    );
  }
}
