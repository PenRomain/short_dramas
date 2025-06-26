"use server";

import { google } from "googleapis";
import { NextRequest } from "next/server";

const privateKey = (process.env.GOOGLE_PRIVATE_KEY ?? "").replace(/\\n/g, "\n");

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const image = searchParams.get("image");
  const music = searchParams.get("music");

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

  if (image) {
    const q = `name='${image}' and trashed=false`;
    const { data } = await drive.files.list({
      q,
      fields: "files(webContentLink,name,id,mimeType)",
    });

    const f = data.files?.[0];

    if (!f?.id) return new Response("image not found", { status: 404 });
    const { data: arrayBuf, headers } = await drive.files.get(
      {
        fileId: f.id,
        alt: "media",
      },
      { responseType: "arraybuffer" },
    );

    const mimeType =
      f.mimeType ?? headers["content-type"] ?? "application/octet-stream";

    return new Response(new Uint8Array(arrayBuf as ArrayBuffer), {
      status: 200,
      headers: {
        "Content-Type": mimeType,
        "Cache-Control": "public, max-age=2592000, immutable",
      },
    });
  }

  if (music) {
    const { data } = await drive.files.list({
      q: `name='${music}' and trashed=false`,
      fields: "files(id,mimeType)",
    });

    const f = data.files?.[0];
    if (!f) return new Response("track not found", { status: 404 });

    const { data: arrayBuf, headers } = await drive.files.get(
      { fileId: f.id!, alt: "media" },
      { responseType: "arraybuffer" },
    );

    return new Response(new Uint8Array(arrayBuf as ArrayBuffer), {
      headers: {
        "Content-Type": f.mimeType ?? headers["content-type"] ?? "audio/ogg",
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  }

  return new Response("No query param provided", { status: 400 });
}
