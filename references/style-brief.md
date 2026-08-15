# Style calibration

## Ask once, then reuse

Use a concise conversation rather than a long questionnaire. If the user provides a reference image or deck, extract a draft token set and ask them to confirm only uncertain or consequential choices.

## Core decisions

1. **Canvas** — default `LAYOUT_WIDE` / 16:9.
2. **Fonts** — default Chinese `Microsoft YaHei`; Latin and numbers `Times New Roman`. Recommended fallbacks: Chinese `Noto Sans CJK SC`, `Source Han Sans SC`, `SimHei`; Latin `Aptos`, `Arial`, `Liberation Sans`.
3. **Brand** — logo files, safe area, forbidden recoloring, brand primary and accent colors.
4. **Tone** — formal, technical, executive, academic, energetic, editorial, or another clear adjective set.
5. **Density** — sparse, balanced, or information-dense.
6. **Surface** — light/dark, flat/gradient, card usage, corner radius, shadow softness, border and divider weight.
7. **Imagery** — photos, generated illustration, 3D, line icons, diagrams, or no decorative images.
8. **Data** — chart palette, gridline strength, label precision, unit format, and whether source notes are required.
9. **Motion** — whether the user will add animations after export; do not encode animation assumptions into static layout.

## Reference extraction

Separate stable style—color temperature, typography hierarchy, whitespace, alignment grid, shape vocabulary, image treatment, chart language—from incidental names, numbers, claims, illustrations, and page-specific copy.

Do not clone protected logos or copyrighted artwork. User-supplied brand assets may be placed as supplied.

## Color fidelity

When a reference image is approved, treat its palette as a constraint rather than inspiration.

1. Run `scripts/analyze_reference_image.mjs` to obtain canvas dimensions and dominant color candidates.
2. Inspect representative pixels from the title, body text, accent, background, surface, border, and illustration regions.
3. Assign each selected color to a semantic token in `theme.json`.
4. Reuse those tokens everywhere. Do not create slightly different blues, grays, or golds for visually equivalent roles.
5. Render the PPTX and compare it with the reference. Correct palette drift caused by theme substitution, transparency, gradients, or font anti-aliasing.

For gradients, record both endpoints, direction, and approximate stop positions. For translucent surfaces, record the composited appearance and the underlying background.

## Typography normalization

Extract hierarchy first, then normalize sizes. Do not reproduce every rasterized measurement as a separate font size.

- Define semantic roles such as `deckTitle`, `slideTitle`, `section`, `cardTitle`, `body`, `caption`, `metric`, and `annotation`.
- Give every role one default size and at most one compact variant.
- Use integer or 0.5 pt increments. Round noisy inferred values such as 12.8 to 13 and 17.3 to 17.5.
- Keep the same role at the same size across a slide and preferably across the deck.
- Preserve important ratios from the reference: title-to-body, metric-to-label, and primary-to-secondary hierarchy.
- Shorten copy or adjust the frame before shrinking text. Do not create one-off tiny sizes merely to force a fit.

Suggested 16:9 business ranges:

| Role | Typical range |
|---|---:|
| Deck title | 44-56 pt |
| Slide title | 30-40 pt |
| Section/card title | 20-28 pt |
| Body | 16-20 pt |
| Caption/annotation | 11-15 pt |
| Metric | 32-56 pt |

These ranges are guardrails, not replacements for a supplied template. After choosing sizes, store them in `theme.json` and reference the tokens from slide code instead of hardcoding repeated values.

## Suggested `theme.json`

```json
{
  "layout": "LAYOUT_WIDE",
  "fonts": {
    "zh": "Microsoft YaHei",
    "latin": "Times New Roman",
    "numbers": "Times New Roman",
    "fallbackZh": ["Noto Sans CJK SC", "Source Han Sans SC", "SimHei"],
    "fallbackLatin": ["Aptos", "Arial", "Liberation Sans"]
  },
  "colors": {
    "primary": "1769FF",
    "accent": "13B8FF",
    "ink": "101828",
    "muted": "667085",
    "background": "F7FAFF",
    "surface": "FFFFFF",
    "line": "D9E5F5"
  },
  "typeScale": {"deckTitle": 50, "slideTitle": 36, "section": 24, "cardTitle": 20, "body": 17, "caption": 12, "metric": 42, "annotation": 12},
  "geometry": {"marginX": 0.55, "marginY": 0.42, "radius": 0.12, "lineWidth": 1},
  "style": {"mode": "light", "density": "balanced", "tone": ["technical", "executive", "restrained"], "shadow": "soft", "gradient": "minimal"}
}
```

PowerPoint and operating systems may substitute missing fonts. A font declaration does not embed the font. Validate on the delivery machine or deliberately choose compatible fallbacks.
