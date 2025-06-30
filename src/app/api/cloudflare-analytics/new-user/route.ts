import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import { v4 as uuidv4 } from "uuid";

const ENDPOINT =
  process.env.CLOUDFLARE_ANALYTICS_ENDPOINT ||
  "https://cf-analytics-worker.romandreevichg.workers.dev";

export async function POST(req: NextRequest) {
  let userId = req.cookies.get("analytics_user_id")?.value;
  const responseHeaders = new Headers();

  if (!userId) {
    userId = uuidv4();
    responseHeaders.set(
      "Set-Cookie",
      `analytics_user_id=${userId}; Path=/; Max-Age=${60 * 60 * 24 * 365}`,
    );
  }

  try {
    await axios.get(`${ENDPOINT}/metrics/users/${userId}`);
    return NextResponse.json(
      { userId, created: false },
      {
        status: 200,
        headers: responseHeaders,
      },
    );
  } catch (err) {
    if (axios.isAxiosError(err) && err.response?.status === 404) {
      try {
        await axios.post(
          `${ENDPOINT}/events/user`,
          { userId, ts: Date.now() },
          { headers: { "Content-Type": "application/json" } },
        );
        return NextResponse.json(
          { userId, created: true },
          {
            status: 201,
            headers: responseHeaders,
          },
        );
      } catch (postErr) {
        console.error("Failed to create user in analytics:", postErr);
        return NextResponse.json(
          { error: "Failed to create user" },
          {
            status: 502,
            headers: responseHeaders,
          },
        );
      }
    }

    return NextResponse.json(
      { error: "Analytics service error" },
      {
        status: 500,
        headers: responseHeaders,
      },
    );
  }
}
