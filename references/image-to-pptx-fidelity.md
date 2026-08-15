# High-fidelity image-to-PPTX reconstruction

Use this workflow when an approved PNG/JPG prototype must become a PowerPoint page that remains meaningfully editable.

## Target outcome

Reproduce the reference as closely as practical without turning the entire page into a screenshot. Preserve semantic content as native PowerPoint objects and preserve visually distinctive assets as independent SVG/PNG/JPG elements.

High fidelity includes:

- the same composition and reading order;
- the same visual density and whitespace rhythm;
- a matched semantic palette;
- a normalized but equivalent typography hierarchy;
- the same recognizable icons, illustrations, textures, and decorative marks;
- correct z-order, borders, shadows, gradients, and corner treatment.

## 1. Establish the reference coordinate system

Record reference width `Rw`, reference height `Rh`, slide width `Sw`, and slide height `Sh`.

When aspect ratios match:

```text
sx = Sw / Rw
sy = Sh / Rh
x_slide = x_reference * sx
y_slide = y_reference * sy
w_slide = w_reference * sx
h_slide = h_reference * sy
```

Use one transform for every object. Do not independently eyeball positions. If aspect ratios differ, choose `contain`, `cover`, or deliberate recomposition and record the decision.

## 2. Build an element inventory

Inventory every visible element before coding:

| Field | Meaning |
|---|---|
| `id` | Stable element name |
| `bbox` | Reference pixel bounds `[x, y, width, height]` |
| `role` | Title, body, metric, card, icon, texture, photo, connector, etc. |
| `representation` | `native`, `svg`, `raster`, or `background` |
| `editable` | Whether the user is likely to change it |
| `z` | Layer order |
| `source` | User asset, extracted crop, generated asset, or native reconstruction |
| `notes` | Crop padding, transparency, gradient, shadow, or known deviation |

Do not classify a visible icon as optional merely because it contains no text.

Save the inventory as `page-spec.json` beside the page source for complex reconstructions. Use one record per visible element so later AI edits can change a single object without reinterpreting the entire screenshot. A minimal record is:

```json
{
  "id": "competition-trophy",
  "bbox": [969, 122, 96, 98],
  "role": "icon",
  "representation": "raster",
  "editable": false,
  "z": 18,
  "source": "assets/competition-trophy.png"
}
```

## 3. Route elements

Use native objects for titles, body copy, metrics, labels, tables, charts, cards, lines, and simple process geometry. Use SVG for supplied vector icons and reusable ornamental geometry. Use PNG/JPG for raster pictograms, generated illustrations, photos, textures, complex shadows, and decorative artwork.

Prefer the original asset when available. When only a flattened prototype exists, physically crop the asset into an independent PNG. Use `scripts/extract_visual_assets.mjs` with a reviewed manifest. Add small padding to avoid cutting antialiasing or shadows.

Example manifest:

```json
{
  "assets": [
    {"name": "competition-trophy", "bbox": [969, 122, 96, 98], "padding": 2, "format": "png"},
    {"name": "campus-sketch", "bbox": [622, 150, 260, 125], "format": "png"}
  ]
}
```

Do not depend on presentation-library crop metadata for critical icons. Some renderers ignore or reinterpret crops. Embed the actual cropped file.

## 4. Match color deliberately

Run `scripts/analyze_reference_image.mjs` for color candidates, then assign colors to semantic roles:

- background and surface;
- primary and secondary text;
- primary accent and secondary accent;
- border and divider;
- success, warning, or highlight;
- gradient endpoints and shadow color.

Sample representative regions rather than choosing a visually similar color from memory. Store the final values in `theme.json`. Equivalent roles must use the same token.

If a raster asset was cropped from a flat background, keep the surrounding surface color identical so the crop boundary disappears. If the local background varies, create transparency or regenerate the asset instead of leaving a visible rectangle.

## 5. Normalize typography

Infer semantic roles, not dozens of exact raster measurements. Define a slide or deck type scale with integer or 0.5 pt values. Keep one default and at most one compact variant per role.

Preserve these relationships:

- deck title to slide title;
- slide title to card title;
- metric to metric label;
- main copy to annotations;
- Chinese, Latin, and numeric font pairing.

Do not solve overflow by creating arbitrary one-off sizes. Shorten copy, widen the frame, or adjust composition first.

## 6. Reconstruct in z-order

Build from back to front:

1. background and atmospheric fields;
2. panels, cards, and dividers;
3. connectors and timeline lines;
4. native text and metrics;
5. icons, illustrations, and decorative assets;
6. foreground labels and callouts.

Place image assets after their supporting native shapes when they must cover simplified placeholders. Remove placeholders when they create visible rims, duplicate marks, or color contamination.

## 7. Review fidelity

Render the actual PPTX, not only the builder preview. Match the reference aspect ratio and preferably the same pixel dimensions.

Use `scripts/compare_reference_render.mjs` to produce:

- a 50% overlay for alignment and scale;
- a difference image for missing or shifted regions;
- mean absolute pixel error as a diagnostic.

The numerical difference is not a pass/fail threshold because native font rendering and antialiasing differ. Visually inspect:

- missing icons or decorations;
- palette drift;
- title and metric scale;
- card bounds, margins, and whitespace;
- line, border, radius, shadow, and gradient treatment;
- image crop, sharpness, and background seams;
- z-order and accidental overlaps.

Record any accepted deviation. If an obvious visual asset is missing, the page is not ready.

## 8. Verify editability

Run `scripts/check_editability.py` and inspect the PPTX structure. A valid hybrid page normally contains native text and shapes plus several independent pictures. It must not contain an unexplained full-slide image.

Deliver the PPTX with its page source, `theme.json`, asset manifest, extracted assets, reference image, and fidelity notes so later AI edits remain localized and repeatable.
