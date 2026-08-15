# Incremental slide workflow

## Principle

Develop one page or a small batch at a time. A page may exist before the whole deck structure is known. Keep global tokens stable while allowing page-level composition to evolve.

## Page states

| State | Meaning | Allowed next states |
|---|---|---|
| `idea` | Topic, material, or rough intent exists | `content-discussion` |
| `content-discussion` | Message and evidence are being shaped | `content-approved`, `idea` |
| `content-approved` | Copy and information hierarchy are accepted | `visual-drafting`, `content-discussion` |
| `visual-drafting` | Style/composition is being explored | `visual-approved`, `content-discussion` |
| `visual-approved` | Composition and visual language are accepted | `native-building`, `visual-drafting` |
| `native-building` | Editable PPT objects are being implemented | `qa-passed`, `visual-drafting` |
| `qa-passed` | Visual and structural checks pass | `locked`, `native-building` |
| `locked` | Page is stable and included in compilation | Reopen only on explicit request |

Do not silently advance through approval states. Approval can be a short natural-language confirmation; it does not require a form.

## Minimum page brief

Store this in `pages/<id>/brief.md`:

```markdown
# Page 001 — Working title

- State: content-approved
- Audience:
- Occasion:
- Speaking goal:
- One-sentence takeaway:
- Page type:
- Source/evidence:
- Must show:
- Must not show:
- Approved copy:
- Visual direction:
- Presenter note:
```

## Content discussion prompts

Ask only questions that materially alter the result. Determine what the audience should remember after ten seconds, which evidence earns that conclusion, what belongs in speech instead of on the slide, what deserves visual emphasis, and whether the page depends on adjacent pages.

When information is incomplete, propose a working assumption and label it. Do not invent business metrics, citations, dates, or outcomes.

## Page-level iteration

- Compile the active page alone for speed.
- Keep page-specific assets next to the page.
- Keep shared assets under `assets/`.
- Modify global `theme.json` only after checking the effect on locked pages.
- For a deck-wide style change, render at least one representative locked page and the active page before applying broadly.

## Locking policy

A page may be locked when its takeaway and copy are approved, the preview is accepted, meaningful content is editable, no clipping or collision remains, the page module compiles independently, and its state is updated in `manifest.json`.

After final delivery, manual animations and small logo adjustments are expected. They are outside source synchronization unless the user deliberately reopens the page and provides the updated PPTX as a new reference.
