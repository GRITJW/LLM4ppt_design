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

const inputArg = valueAfter("--input") ?? process.argv[2];
if (!inputArg) {
  console.error("Usage: node analyze_reference_image.mjs --input reference.png [--out analysis.json] [--colors 12]");
  process.exit(2);
}

const input = path.resolve(inputArg);
const outArg = valueAfter("--out");
const colorCount = Math.max(4, Math.min(32, Number(valueAfter("--colors", "12")) || 12));
const metadata = await sharp(input).metadata();
if (!metadata.width || !metadata.height) throw new Error("Unable to read image dimensions.");

const sampleWidth = Math.min(320, metadata.width);
const { data, info } = await sharp(input)
  .resize({ width: sampleWidth, withoutEnlargement: true })
  .ensureAlpha()
  .raw()
  .toBuffer({ resolveWithObject: true });

const histogram = new Map();
let visiblePixels = 0;
for (let offset = 0; offset < data.length; offset += 4) {
  const alpha = data[offset + 3];
  if (alpha < 32) continue;
  const r = Math.min(255, (data[offset] & 0xf0) + 8);
  const g = Math.min(255, (data[offset + 1] & 0xf0) + 8);
  const b = Math.min(255, (data[offset + 2] & 0xf0) + 8);
  const key = `${r},${g},${b}`;
  histogram.set(key, (histogram.get(key) ?? 0) + 1);
  visiblePixels += 1;
}

function colorMetrics(r, g, b) {
  const max = Math.max(r, g, b) / 255;
  const min = Math.min(r, g, b) / 255;
  const saturation = max === 0 ? 0 : (max - min) / max;
  const luminance = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
  return { saturation, luminance };
}

function describeColor([key, pixels]) {
    const [r, g, b] = key.split(",").map(Number);
    const { saturation, luminance } = colorMetrics(r, g, b);
    return {
      hex: `#${[r, g, b].map((value) => value.toString(16).padStart(2, "0")).join("").toUpperCase()}`,
      share: Number((pixels / visiblePixels).toFixed(4)),
      luminance: Number(luminance.toFixed(3)),
      saturation: Number(saturation.toFixed(3)),
    };
}

const rankedColors = [...histogram.entries()]
  .sort((a, b) => b[1] - a[1])
  .map(describeColor);
const colors = rankedColors.slice(0, colorCount);
const darkColors = rankedColors.filter((color) => color.luminance <= 0.48).slice(0, colorCount);
const chromaticColors = rankedColors
  .filter((color) => color.saturation >= 0.28 && color.luminance >= 0.12 && color.luminance <= 0.92)
  .slice(0, colorCount);

const report = {
  input,
  canvas: { width: metadata.width, height: metadata.height, aspectRatio: Number((metadata.width / metadata.height).toFixed(6)) },
  sample: { width: info.width, height: info.height, visiblePixels },
  dominantColorCandidates: colors,
  dominantDarkCandidates: darkColors,
  dominantChromaticCandidates: chromaticColors,
  note: "Assign candidates to semantic theme roles after visual inspection; quantization groups nearby colors into 16-level RGB bins.",
};

const json = `${JSON.stringify(report, null, 2)}\n`;
if (outArg) {
  const out = path.resolve(outArg);
  await fs.mkdir(path.dirname(out), { recursive: true });
  await fs.writeFile(out, json, "utf8");
}
process.stdout.write(json);
