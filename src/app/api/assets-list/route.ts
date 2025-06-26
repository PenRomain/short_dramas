import { NextResponse } from "next/server";
import path from "node:path";
import {
  S3Client,
  ListObjectsV2Command,
  type ListObjectsV2CommandOutput,
} from "@aws-sdk/client-s3";

const BUCKET = process.env.R2_BUCKET!;
const PREFIX = "ivhid_src/";

const s3 = new S3Client({
  region: "auto",
  endpoint: process.env.R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY!,
    secretAccessKey: process.env.R2_SECRET_KEY!,
  },
});

export async function GET() {
  try {
    const allNames: string[] = [];
    let continuationToken: string | undefined;

    do {
      const res: ListObjectsV2CommandOutput = await s3.send(
        new ListObjectsV2Command({
          Bucket: BUCKET,
          Prefix: PREFIX,
          ContinuationToken: continuationToken,
        }),
      );

      for (const item of res.Contents ?? []) {
        if (item.Key) {
          const withoutPrefix = item.Key.slice(PREFIX.length);
          const nameOnly = path.posix.basename(withoutPrefix);
          allNames.push(nameOnly);
        }
      }

      continuationToken = res.NextContinuationToken ?? undefined;
    } while (continuationToken);

    return NextResponse.json(allNames);
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Failed to list bucket" },
      { status: 500 },
    );
  }
}
