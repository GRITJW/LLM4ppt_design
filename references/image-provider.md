# Provider-neutral visual drafting

## Capability detection

At visual-drafting time:

1. If the current environment exposes image generation, use it directly.
2. If it supports editing a reference, include the approved reference and request a composition-preserving variant.
3. If it only supports text-to-image, describe the layout, palette, typography treatment, and intended blank areas precisely.
4. If no image tool exists, output a reusable prompt plus a native wireframe; do not block content or PPT construction.

In Codex or ChatGPT, prefer the built-in image-generation capability. Other agents may use their own provider. Keep the prompt and reference assets so the page remains reproducible even when the provider changes.

## Prompt contract

Include output type (one 16:9 presentation slide visual concept), audience and tone, composition and hierarchy, approved palette and reference cues, required focal point and whitespace, allowed pictorial elements, and explicit exclusions: no unsupplied logos, no invented metrics, no illegible microtext, and no watermark. State that exact copy will be rebuilt natively and generated text is only a placeholder.

## Revision contract

Revise one dimension at a time when possible: composition, density, palette, hierarchy, or image treatment. Preserve accepted dimensions explicitly in the prompt. Once the user approves the concept, stop image iteration and move to native construction.
