#!/usr/bin/env node
import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { loadSharp } from "./lib/load_sharp.mjs";

const sharp = loadSharp();

function valueAfter(flag, fallback = undefined) {
  const index = process.argv.indexOf(flag);
  return index >= 0 ? process.argv[index + 1] : fallback;
}

const inputArg = valueAfter("--input");
const manifestArg = valueAfter("--manifest");
const outDirArg = valueAfter("--out-dir");
if (!inputArg || !manifestArg || !outDirArg) {
  console.error("Usage: node extract_visual_assets.mjs --input reference.png --manifest assets.json --out-dir assets");
  process.exit(2);
}

const input = path.resolve(inputArg);
const manifestPath = path.resolve(manifestArg);
const outDir = path.resolve(outDirArg);
const sourceMetadata = await sharp(input).metadata();
if (!sourceMetadata.width || !sourceMetadata.height) throw new Error("Unable to read source dimensions.");

const manifest = JSON.parse(await fs.readFile(manifestPath, "utf8"));
const entries = Array.isArray(manifest) ? manifest : manifest.assets;
if (!Array.isArray(entries) || entries.length === 0) throw new Error("Manifest must contain a non-empty assets array.");
await fs.mkdir(outDir, { recursive: true });

const outputs = [];
for (const entry of entries) {
  const name = String(entry.name ?? "").trim();
  if (!/^[a-z0-9][a-z0-9_-]*$/i.test(name)) throw new Error(`Invalid asset name: ${name}`);
  const bbox = Array.isArray(entry.bbox)
    ? { x: entry.bbox[0], y: entry.bbox[1], width: entry.bbox[2], height: entry.bbox[3] }
    : entry.bbox;
  if (!bbox) throw new Error(`Missing bbox for ${name}`);

  const padding = Math.max(0, Math.round(Number(entry.padding ?? 0)));
  const left = Math.max(0, Math.round(Number(bbox.x)) - padding);
  const top = Math.max(0, Math.round(Number(bbox.y)) - padding);
  const right = Math.min(sourceMetadata.width, Math.round(Number(bbox.x) + Number(bbox.width)) + padding);
  const bottom = Math.min(sourceMetadata.height, Math.round(Number(bbox.y) + Number(bbox.height)) + padding);
  const width = right - left;
  const height = bottom - top;
  if (width <= 0 || height <= 0) throw new Error(`Invalid bbox for ${name}`);

  const format = String(entry.format ?? "png").toLowerCase();
  if (!new Set(["png", "jpeg", "jpg", "webp"]).has(format)) throw new Error(`Unsupported format for ${name}: ${format}`);
  const extension = format === "jpeg" ? "jpg" : format;
  const output = path.join(outDir, `${name}.${extension}`);
  let pipeline = sharp(input).extract({ left, top, width, height });
  if (format === "jpg" || format === "jpeg") pipeline = pipeline.jpeg({ quality: Number(entry.quality ?? 92) });
  else if (format === "webp") pipeline = pipeline.webp({ quality: Number(entry.quality ?? 92) });
  else pipeline = pipeline.png();
  await pipeline.toFile(output);
  outputs.push({ name, output, bbox: [left, top, width, height], format: extension });
}

process.stdout.write(`${JSON.stringify({ input, outDir, assets: outputs }, null, 2)}\n`);
