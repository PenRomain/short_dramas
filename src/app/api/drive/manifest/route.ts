"use server";

import { google } from "googleapis";

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
    scopes: ["https://www.googleapis.com/auth/drive.readonly"],
  });
  const drive = google.drive({ version: "v3", auth });

  const imgRes = await drive.files.list({
    q: "trashed = false and mimeType contains 'image/'",
    fields: "files(id,name,webContentLink)",
    pageSize: 1000,
  });
  const images = Object.fromEntries(
    (imgRes.data.files ?? []).map((f) => [
      f.name!,
      {
        id: f.id,
        mime: f.mimeType,
        name: f.name,
        webContentLink: f.webContentLink,
      },
    ]),
  );

  const audRes = await drive.files.list({
    q: "trashed = false and mimeType contains 'audio/'",
    fields: "files(id,name,mimeType)",
    pageSize: 1000,
  });
  const tracks = Object.fromEntries(
    (audRes.data.files ?? []).map((f) => [
      f.name,
      { id: f.id, mime: f.mimeType, name: f.name },
    ]),
  );

  return Response.json({ images, tracks });
}
