# Editability contract

## Route each element deliberately

| Element | Final representation | Reason |
|---|---|---|
| Title, body, labels, metrics, citations | Native text boxes | Directly editable and searchable |
| Cards, dividers, badges, timelines, nodes | Native shapes | Easy resizing and recoloring |
| Arrows and process connections | Native connectors/lines | Editable routing and endpoints |
| Tables | Native tables or grouped text/shapes | Cell-level edits remain possible |
| Charts | Native charts when feasible | Data and styling remain editable |
| Reusable icon or ornamental geometry | SVG | Crisp vector asset; keep labels separate |
| Photo or generated illustration | PNG/JPG | Raster is appropriate for pictorial content |
| Texture or atmospheric background | PNG/JPG | Noncritical decoration may be raster |
| Entire page screenshot | Prohibited as final slide | Hides all structure and text |

## SVG is not automatically fully editable

PowerPoint can insert and scale SVG cleanly. Some desktop versions can convert an SVG to shapes, but compatibility and grouping vary. Treat SVG as a vector asset, not as a substitute for native slide composition. Do not place important text inside an SVG.

## Image prototype to PPTX

The prototype is a visual specification. Reconstruct it by identifying the grid and bounding boxes, typography hierarchy, native shapes and connectors, reusable vector or raster assets, and exact approved copy and data.

Approximate subtle textures or lighting with an image. Rebuild anything the user is likely to edit as native objects. Do not use automatic vector tracing as the main conversion method; it does not restore semantic text, tables, or charts.

## Structural QA

For every slide:

- at least one native text object should exist unless it is intentionally image-only artwork;
- full-slide pictures require an explicit decorative-background exception;
- meaningful labels must be selectable separately from diagrams;
- charts and tables should not be screenshots when users may update data;
- alternative text should be added to meaningful images where the authoring library supports it;
- source assets should be retained beside the module.

Run `scripts/check_editability.py` for a machine-readable risk report, then open the PPTX and test selection/editing manually.
