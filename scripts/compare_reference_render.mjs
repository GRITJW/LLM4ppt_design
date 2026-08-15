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

const referenceArg = valueAfter("--reference");
const renderArg = valueAfter("--render");
const outDirArg = valueAfter("--out-dir");
if (!referenceArg || !renderArg || !outDirArg) {
  console.error("Usage: node compare_reference_render.mjs --reference reference.png --render slide.png --out-dir comparison");
  process.exit(2);
}

const reference = path.resolve(referenceArg);
const render = path.resolve(renderArg);
const outDir = path.resolve(outDirArg);
const metadata = await sharp(reference).metadata();
if (!metadata.width || !metadata.height) throw new Error("Unable to read reference dimensions.");
const width = metadata.width;
const height = metadata.height;

const referenceRaw = await sharp(reference).resize(width, height, { fit: "fill" }).ensureAlpha().raw().toBuffer();
const renderRaw = await sharp(render).resize(width, height, { fit: "fill" }).ensureAlpha().raw().toBuffer();
const overlay = Buffer.alloc(referenceRaw.length);
const difference = Buffer.alloc(referenceRaw.length);
let absoluteError = 0;
let changedPixels = 0;

for (let offset = 0; offset < referenceRaw.length; offset += 4) {
  let pixelError = 0;
  for (let channel = 0; channel < 3; channel += 1) {
    const ref = referenceRaw[offset + channel];
    const actual = renderRaw[offset + channel];
    const delta = Math.abs(ref - actual);
    absoluteError += delta;
    pixelError += delta;
    overlay[offset + channel] = Math.round((ref + actual) / 2);
    difference[offset + channel] = Math.min(255, delta * 4);
  }
  overlay[offset + 3] = 255;
  difference[offset + 3] = 255;
  if (pixelError / 3 > 16) changedPixels += 1;
}

await fs.mkdir(outDir, { recursive: true });
const overlayPath = path.join(outDir, "overlay.png");
const differencePath = path.join(outDir, "difference.png");
await sharp(overlay, { raw: { width, height, channels: 4 } }).png().toFile(overlayPath);
await sharp(difference, { raw: { width, height, channels: 4 } }).png().toFile(differencePath);

const metrics = {
  reference,
  render,
  comparedCanvas: { width, height },
  meanAbsoluteRgbError: Number((absoluteError / (width * height * 3)).toFixed(3)),
  changedPixelShareAt16: Number((changedPixels / (width * height)).toFixed(4)),
  overlay: overlayPath,
  difference: differencePath,
  note: "Use these metrics and images diagnostically; font rasterization and antialiasing make strict pixel equality inappropriate.",
};
const metricsPath = path.join(outDir, "metrics.json");
await fs.writeFile(metricsPath, `${JSON.stringify(metrics, null, 2)}\n`, "utf8");
process.stdout.write(`${JSON.stringify(metrics, null, 2)}\n`);
