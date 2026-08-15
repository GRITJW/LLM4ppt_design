# Editability contract

## Route each element deliberately

| Element | Final representation | Reason |
|---|---|---|
| Title, body, labels, metrics, citations | Native text boxes | Directly editable and searchable |
| Cards, dividers, badges, timelines, nodes | Native shapes | Easy resizing and recoloring |
| Arrows and process connections | Native connectors/lines | Editable routing and endpoints |
| Tables | Native tables or grouped text/shapes | Cell-level edits remain possible |
| Charts | Native charts when feasible | Data and styling remain editable |
| Supplied vector icon, logo, or ornamental geometry | SVG | Preserve the approved visual; keep labels separate |
| Raster pictogram or generated icon from the prototype | Cropped PNG | Fidelity matters more than editing the icon |
| Photo or generated illustration | PNG/JPG | Raster is appropriate for pictorial content |
| Texture or atmospheric background | PNG/JPG | Noncritical decoration may be raster |
| Entire page screenshot | Prohibited as final slide | Hides all structure and text |

## SVG is not automatically fully editable

PowerPoint can insert and scale SVG cleanly. Some desktop versions can convert an SVG to shapes, but compatibility and grouping vary. Treat SVG as a vector asset, not as a substitute for native slide composition. Do not place important text inside an SVG.

## Image prototype to PPTX

The prototype is a visual specification. Reconstruct it by identifying the grid and bounding boxes, typography hierarchy, native shapes and connectors, reusable vector or raster assets, and exact approved copy and data.

Default to a hybrid slide, not an all-native slide. Rebuild anything the user is likely to edit as native objects, and preserve anything whose value is primarily visual as SVG/PNG/JPG. Approximate subtle textures or lighting with an image. Do not use automatic vector tracing as the main conversion method; it does not restore semantic text, tables, or charts.

Do not delete or replace visible icons merely because they are not editable. Graduation caps, trophies, medals, article marks, decorative diagrams, branded illustrations, and similar assets should remain present unless the user asks to simplify them.

For raster prototypes, physically crop important visual regions into independent PNG files. Critical icons should not rely only on PowerPoint or exporter crop metadata because crop behavior varies across libraries and versions. Keep the original reference and the extracted assets beside the page source.

## Fidelity hierarchy

When editability conflicts with visual fidelity, use this priority:

1. Preserve semantic truth and readable copy.
2. Preserve layout, hierarchy, colors, and recognizable visual assets.
3. Keep likely-to-change content native.
4. Keep purely visual assets as SVG or raster images.
5. Sacrifice fidelity only when the asset cannot be extracted, sourced, or regenerated safely.

A slide with editable text plus several non-editable icons is considered editable. A slide that omits those icons is not considered a faithful reconstruction.

## Structural QA

For every slide:

- at least one native text object should exist unless it is intentionally image-only artwork;
- full-slide pictures require an explicit decorative-background exception;
- meaningful labels must be selectable separately from diagrams;
- visible assets in the approved prototype must be present or listed as explicit deviations;
- raster icons must be independent assets rather than a hidden full-slide screenshot;
- charts and tables should not be screenshots when users may update data;
- alternative text should be added to meaningful images where the authoring library supports it;
- source assets should be retained beside the module.

Run `scripts/check_editability.py` for a machine-readable risk report, then open the PPTX and test selection/editing manually.
