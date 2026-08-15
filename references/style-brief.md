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
  "typeScale": {"title": 35, "section": 24, "body": 16, "caption": 11, "metric": 32},
  "geometry": {"marginX": 0.55, "marginY": 0.42, "radius": 0.12, "lineWidth": 1},
  "style": {"mode": "light", "density": "balanced", "tone": ["technical", "executive", "restrained"], "shadow": "soft", "gradient": "minimal"}
}
```

PowerPoint and operating systems may substitute missing fonts. A font declaration does not embed the font. Validate on the delivery machine or deliberately choose compatible fallbacks.
