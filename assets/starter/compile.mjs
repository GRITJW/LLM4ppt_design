import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import pptxgen from "pptxgenjs";
import * as helpers from "./lib/helpers.mjs";

const root = path.dirname(fileURLToPath(import.meta.url));

function parseArgs(argv) {
  const result = { only: null, out: "output/deck.pptx" };
  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];
    if (token === "--only") result.only = argv[++index];
    else if (token === "--out") result.out = argv[++index];
    else if (token === "--help") {
      console.log("Usage: node compile.mjs [--only PAGE_ID] [--out FILE.pptx]");
      process.exit(0);
    } else {
      throw new Error(`Unknown argument: ${token}`);
    }
  }
  if (!result.out.toLowerCase().endsWith(".pptx")) {
    throw new Error("--out must end in .pptx");
  }
  return result;
}

async function readJson(fileName) {
  return JSON.parse(await fs.readFile(path.join(root, fileName), "utf8"));
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const theme = await readJson("theme.json");
  const manifest = await readJson("manifest.json");
  const selected = manifest.pages.filter(
    (page) => page.enabled !== false && (!args.only || page.id === args.only),
  );

  if (selected.length === 0) {
    throw new Error(args.only ? `Unknown or disabled page: ${args.only}` : "No enabled pages");
  }

  const pptx = new pptxgen();
  pptx.layout = theme.layout || "LAYOUT_WIDE";
  pptx.author = manifest.author || "build-polished-decks";
  pptx.company = manifest.company || "";
  pptx.subject = manifest.subject || "Editable PowerPoint deck";
  pptx.title = manifest.title || "Editable deck";
  pptx.lang = manifest.language || "zh-CN";
  pptx.theme = {
    headFontFace: theme.fonts.zh,
    bodyFontFace: theme.fonts.zh,
    lang: manifest.language || "zh-CN",
  };
  pptx.defineSlideMaster({
    title: "BASE",
    background: { color: theme.colors.background },
    objects: [],
    slideNumber: {
      x: 12.35,
      y: 7.1,
      w: 0.4,
      h: 0.18,
      fontFace: theme.fonts.numbers,
      fontSize: 8,
      color: theme.colors.muted,
      align: "right",
      margin: 0,
    },
  });

  for (const entry of selected) {
    const moduleUrl = pathToFileURL(path.resolve(root, entry.module)).href;
    const pageModule = await import(moduleUrl);
    if (typeof pageModule.addSlide !== "function") {
      throw new Error(`${entry.module} must export addSlide(pptx, theme, helpers)`);
    }
    await pageModule.addSlide(pptx, theme, helpers, entry);
  }

  const outputPath = path.resolve(root, args.out);
  await fs.mkdir(path.dirname(outputPath), { recursive: true });
  await pptx.writeFile({ fileName: outputPath });
  console.log(`Wrote ${selected.length} slide(s): ${outputPath}`);
}

main().catch((error) => {
  console.error(error.stack || error.message || String(error));
  process.exitCode = 1;
});
