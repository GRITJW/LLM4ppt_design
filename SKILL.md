---
name: build-polished-decks
description: Design polished PowerPoint decks one slide at a time and convert approved reference images into high-fidelity, selectively editable PPTX pages. Use when Codex needs to shape presentation content, calibrate a visual style, generate a prototype, reconstruct an image or slide with native text and layout plus preserved SVG/PNG visual assets, enforce consistent colors and typography, review slide fidelity, preserve locked page modules, or compile a final deck.
---

# Build Polished Decks

Create presentation pages through an approval-led workflow: first make the message clear, then make the page beautiful, and finally rebuild it as an editable PowerPoint. Treat each page as an independent module so the user can develop one or two pages at a time and compile them later.

## Non-negotiable contract

- Keep titles, body copy, metrics, conclusions, diagram labels, connectors, tables, and charts as native PowerPoint objects.
- Preserve approved visual assets by default. Do not replace a trophy, pictogram, illustration, logo, texture, or decorative mark with generic text or a crude native shape merely to maximize editability.
- Use SVG for supplied or reusable vector icons and decorative geometry. Use PNG/JPG for raster icons, generated illustrations, photos, textures, lighting, and detailed decoration. Keep meaningful text outside those assets.
- Prefer selective editability over forced total editability: semantic content stays native; visually distinctive assets may remain images.
- Match the approved prototype's composition, colors, typography hierarchy, iconography, and visual density as closely as practical. Treat visible omissions as fidelity defects unless the user approved them.
- Normalize typography by role. Use a deliberate type scale with integer or 0.5 pt values; do not emit arbitrary sizes such as 12.8 or 17.3 pt unless reproducing a verified source size is essential.
- Never deliver a full-slide screenshot as the final editable slide.
- Never imply that an image prototype converts automatically into editable objects. Reconstruct the approved design deliberately.
- Do not alternate indefinitely between manual PowerPoint edits and source-code edits. Once a slide is locked, preserve it and compile it unchanged unless the user explicitly reopens it.
- Verify both the rendered appearance and the object structure before delivery.

Read [references/editability.md](references/editability.md) and [references/image-to-pptx-fidelity.md](references/image-to-pptx-fidelity.md) before rebuilding any approved image or final slide.

## Choose the current operation

1. If the user has only a broad topic or raw documents, enter **content shaping**.
2. If the user knows what the page should say but not how it should look, enter **style calibration** and **visual drafting**.
3. If the user approves a reference image or draft, enter **native building**.
4. If a slide module already exists, edit only that page unless the user requests a deck-wide change.
5. If all requested pages are locked, compile and perform deck-level QA.

Read [references/workflow.md](references/workflow.md) for the page state machine and approval rules.

## Phase 1 — Shape content

Work conversationally. The user does not need to define the entire deck upfront.

For the current page:

1. Identify the audience, occasion, speaking goal, and single takeaway.
2. Extract candidate facts, evidence, numbers, and constraints from the supplied material.
3. Propose an information hierarchy and a page type: argument, comparison, timeline, process, architecture, data story, case study, profile, or transition.
4. Rewrite the copy into presentation language. Prefer a conclusion-led title and compact supporting text.
5. Surface unsupported claims, missing units, ambiguous metrics, or confidential information.
6. Ask for content approval before visual polishing.

Save approved content in the page's `brief.md`; do not force the rest of the deck to be planned.

## Phase 2 — Calibrate style

Ask for a reference image, an existing deck, or a verbal description. If none exists, propose a default suited to the audience.

Confirm at least:

- canvas and aspect ratio;
- Chinese, Latin, and numeric fonts plus fallbacks;
- brand/logo rules and primary, accent, text, and background colors;
- light/dark mode, density, tone, whitespace, radius, shadow, gradient, border, and line-weight preferences;
- photo/illustration/icon restrictions;
- diagram, chart, and table conventions.

When a reference image exists, extract its canvas size, stable palette, spacing grid, type hierarchy, icon treatment, and asset inventory before coding. Use `scripts/analyze_reference_image.mjs` to obtain color candidates and dimensions, then reconcile them into semantic tokens rather than introducing visually similar ad hoc colors.

The personal default supplied with this skill is 16:9, Microsoft YaHei for Chinese, Times New Roman for Latin text and numbers, and a restrained light business style. State defaults explicitly and let the user override them.

Extract stable design tokens from reference images rather than copying incidental content. Save approved tokens in `theme.json` and keep the reference beside the page or project. Read [references/style-brief.md](references/style-brief.md).

## Phase 3 — Draft the visual concept

Choose the cheapest faithful method:

- Use native shapes directly for clean editorial layouts, simple diagrams, tables, and charts.
- Use an image generator for visual exploration, hero illustrations, complex atmosphere, or when the user wants a polished visual prototype before coding.
- Use an existing approved reference when it already resolves style and composition.

When image generation is useful, use the environment's best available image tool. In Codex or ChatGPT, use the built-in image generation capability. In another agent, use its available image provider; if none exists, produce a complete generation prompt and continue with a low-fidelity wireframe. Never make the workflow depend on one provider. Read [references/image-provider.md](references/image-provider.md).

Show the page preview and obtain approval for composition, hierarchy, emphasis, and style. Do not treat generated text inside an image as authoritative; the native build must use the approved copy from `brief.md`.

Before native reconstruction, classify every visible element as `native`, `svg`, `raster`, or `background`. Small pictograms and decorative symbols are not optional details. If they are visible in the approved prototype, preserve or faithfully replace them.

## Phase 4 — Build the editable slide

Use the starter under `assets/starter/`:

1. Run `python scripts/init_project.py <output-directory>` to copy a deck workspace.
2. Create one folder per page under `pages/`, for example `pages/001/`.
3. Store the approved page copy and intent in `brief.md`.
4. Implement `slide.mjs` with PptxGenJS native objects and reusable helpers.
5. Add the page to `manifest.json` with its state.
6. Compile only the current page while iterating: `node compile.mjs --only 001 --out output/page-001.pptx`.
7. Compile the full deck when needed: `node compile.mjs --out output/deck.pptx`.

For image-to-PPTX work, map positions from the reference canvas to the slide canvas using a single scale transform. For complex pages, store the element inventory in `page-spec.json`. Physically extract reusable raster regions with `scripts/extract_visual_assets.mjs`; do not depend on exporter-specific crop metadata for critical icons. Keep source assets beside the page module and record their bounds and role.

Do not rasterize a whole page to reproduce the prototype. Rebuild semantic content natively, but retain non-semantic visual assets as images when that produces higher fidelity. Approximate a visual only when extraction, sourcing, or regeneration is impossible, and record the deviation.

## Phase 5 — Render and review

Render every changed slide to PNG or PDF using the environment's presentation renderer, LibreOffice plus Poppler, or PowerPoint export. Inspect the actual image; successful code execution is not visual QA.

Review message hierarchy and reading order; clipping, overflow, collisions, awkward wrapping, and tiny text; alignment, spacing, contrast, and visual balance; consistency with `theme.json` and the approved prototype; and editability of all meaningful elements.

For reference-based reconstruction, render at the same aspect ratio and compare the approved image with the actual PPTX render. Use `scripts/compare_reference_render.mjs` to create an overlay and difference image. Inspect missing assets, palette drift, typography drift, spacing drift, and z-order errors; pixel difference is diagnostic rather than an automatic pass/fail score.

Run `python scripts/check_editability.py <pptx>` and resolve unexpected full-slide images or textless slides. The checker is a guardrail, not a substitute for opening the deck.

## Phase 6 — Lock and compile

Set the page state to `locked` only after content, visual, and editability approval. Locked page modules remain source-of-truth for AI changes. The user may add animations or last-mile tweaks manually after final export; these do not need to sync back unless the page is explicitly reopened.

Before delivery:

1. compile pages in manifest order;
2. render and inspect the complete deck;
3. run the editability checker;
4. confirm fonts or fallbacks exist on the target machine;
5. deliver the PPTX, preview images, source modules, `theme.json`, and manifest.

## Resources

- `references/workflow.md`: state machine, page brief, and approval gates.
- `references/style-brief.md`: style questionnaire and token schema.
- `references/editability.md`: object-routing rules and QA criteria.
- `references/image-to-pptx-fidelity.md`: high-fidelity reference-image reconstruction, asset routing, coordinate mapping, color, typography, and visual QA.
- `references/image-provider.md`: provider-neutral image-generation adapter.
- `references/slide-patterns.md`: common page structures and selection guidance.
- `references/safety.md`: current asset-ingestion and dependency precautions.
- `scripts/init_project.py`: copies the starter workspace.
- `scripts/check_editability.py`: inspects PPTX OOXML for structural risks.
- `scripts/analyze_reference_image.mjs`: reports reference dimensions and dominant color candidates.
- `scripts/extract_visual_assets.mjs`: physically crops approved icons and decorative regions from a reference image using a JSON manifest.
- `scripts/compare_reference_render.mjs`: produces overlay/difference images and diagnostic pixel metrics.
- `assets/starter/`: minimal modular PptxGenJS project.
