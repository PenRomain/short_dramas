#!/usr/bin/env node

import {
  S3Client,
  ListObjectsV2Command,
  GetObjectCommand,
  PutObjectCommand,
} from "@aws-sdk/client-s3";
import { promises as fs, createWriteStream, createReadStream } from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { pipeline } from "node:stream/promises";
import { performance } from "node:perf_hooks";
import { Upload } from "@aws-sdk/lib-storage";

const t0 = performance.now();

const BKT = process.env.R2_BUCKET;
const PREFIX = "ivhid_src/";
const OUTDIR = "ivhid_bundles";
const TMP = ".bundle.tmp";

const s3 = new S3Client({
  region: "auto",
  endpoint: process.env.R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY,
    secretAccessKey: process.env.R2_SECRET_KEY,
  },
});

const sha1 = (b) => crypto.createHash("sha1").update(b).digest("hex");
const mb = (x) => (x / 1024 / 1024).toFixed(2);

console.time("list");
const objs = [];
let Token;
do {
  const { Contents, NextContinuationToken } = await s3.send(
    new ListObjectsV2Command({
      Bucket: BKT,
      Prefix: PREFIX,
      ContinuationToken: Token,
    }),
  );
  objs.push(...(Contents || []));
  Token = NextContinuationToken;
} while (Token);
console.timeEnd("list");

if (!objs.length) {
  console.error("bucket empty");
  process.exit(1);
}

let offset = 0;
const manifest = [];
const ws = createWriteStream(TMP);
ws.setMaxListeners(0);

console.time("download");
for (const [i, o] of objs.entries()) {
  if (i % 25 === 0) console.log(`  → ${i}/${objs.length}…`);
  const { Body } = await s3.send(
    new GetObjectCommand({ Bucket: BKT, Key: o.Key }),
  );
  await pipeline(Body, ws, { end: false });
  manifest.push({
    path: path.basename(o.Key),
    offset,
    size: Number(o.Size),
    mime: o.Key.endsWith(".png")
      ? "image/png"
      : o.Key.endsWith(".ogg")
        ? "audio/ogg"
        : "application/octet-stream",
    sha1: sha1(`${o.ETag}:${o.Size}`),
  });
  offset += Number(o.Size);
}
await new Promise((r) => ws.end(r));
console.timeEnd("download");

const manBuf = Buffer.from(JSON.stringify(manifest, null, 2));
const hash = sha1(manBuf).slice(0, 16);

console.time("upload");

async function uploadWithProgress({ stream, size, key }) {
  const up = new Upload({
    client: s3,
    params: { Bucket: BKT, Key: key, Body: stream },
  });
  up.on("httpUploadProgress", (p) => {
    if (p.loaded) {
      const total = p.total ?? size;
      const pct = ((p.loaded / total) * 100).toFixed(1);
      process.stdout.write(`\rupload ${pct}%…`);
    }
  });
  await up.done();
  console.log("\rupload 100%  ");
}

await uploadWithProgress({
  stream: createReadStream(TMP),
  size: offset,
  key: `${OUTDIR}/${hash}/bundle.bin`,
});
await Promise.all([
  s3.send(
    new PutObjectCommand({
      Bucket: BKT,
      Key: `${OUTDIR}/${hash}/manifest.json`,
      Body: manBuf,
      ContentType: "application/json",
    }),
  ),
  s3.send(
    new PutObjectCommand({
      Bucket: BKT,
      Key: `${OUTDIR}/latest.txt`,
      Body: hash,
      ContentType: "text/plain",
    }),
  ),
]);
console.timeEnd("upload");

await fs.unlink(TMP);

console.log(`✅  files: ${objs.length}, size ${mb(offset)} MiB, hash ${hash}`);
console.log(`⏱  total ${((performance.now() - t0) | 0) / 1000}s`);
