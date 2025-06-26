"use server";

import { google } from "googleapis";

const TAB_RANGES: Record<string, string> = {
  locations: "Локации!A1:Q",
  emotions: "Эмоции!A1:Q",
  cutscenes: "Cutscenes!A1:Q",
};

const privateKey = (process.env.GOOGLE_PRIVATE_KEY ?? "").replace(/\\n/g, "\n");

export async function GET() {
  const auth = await google.auth.getClient({
    projectId: process.env.GOOGLE_PROJECT_ID,
    credentials: {
      type: process.env.GOOGLE_TYPE,
      project_id: process.env.GOOGLE_PROJECT_ID,
      private_key_id: process.env.GOOGLE_PRIVATE_KEY_ID,
      private_key: privateKey,
      client_email: process.env.GOOGLE_CLIENT_EMAIL,
      universe_domain: process.env.GOOGLE_UNIVERSE_DOMAIN,
    },
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });

  const sheets = google.sheets({ version: "v4", auth });

  const { data } = await sheets.spreadsheets.values.batchGet({
    spreadsheetId: process.env.GOOGLE_SHEETS_ID,
    ranges: Object.values(TAB_RANGES),
  });

  const manifest = Object.fromEntries(
    data.valueRanges!.map((vr, i) => [
      Object.keys(TAB_RANGES)[i],
      vr.values ?? [],
    ]),
  );

  return Response.json(manifest, {
    headers: { "Cache-Control": "public, max-age=86400" },
  });
}
