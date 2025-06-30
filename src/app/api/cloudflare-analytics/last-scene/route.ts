import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

const ENDPOINT =
  process.env.CLOUDFLARE_ANALYTICS_ENDPOINT ||
  "https://cf-analytics-worker.romandreevichg.workers.dev";

export async function POST(req: NextRequest) {
  const userId = req.cookies.get("analytics_user_id")?.value;

  if (!userId) {
    return NextResponse.json(
      { error: "User not authenticated" },
      { status: 401 },
    );
  }

  try {
    await axios.post(
      `${ENDPOINT}/events/last-scene`,
      { userId, ts: Date.now() },
      { headers: { "Content-Type": "application/json" } },
    );

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err) {
    const status = axios.isAxiosError(err) ? err.response?.status : 502;
    return NextResponse.json({ error: "Analytics service error" }, { status });
  }
}
