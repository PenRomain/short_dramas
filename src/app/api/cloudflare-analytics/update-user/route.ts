import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

const ENDPOINT =
  process.env.CLOUDFLARE_ANALYTICS_ENDPOINT ??
  "https://cf-analytics-worker.romandreevichg.workers.dev";

export async function POST(req: NextRequest) {
  const userId = req.cookies.get("analytics_user_id")?.value;
  const { email } = await req.json();

  if (!userId) {
    return NextResponse.json({ error: "No userId" }, { status: 400 });
  }

  try {
    await axios.post(
      `${ENDPOINT}/events/update-user`,
      { userId, email },
      { headers: { "Content-Type": "application/json" } },
    );
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (e) {
    console.error("Analytics error", e);
    return NextResponse.json({ error: "Analytics failed" }, { status: 500 });
  }
}
