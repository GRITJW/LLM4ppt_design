const SHADOW = {
  type: "outer",
  color: "8FA8C7",
  opacity: 0.16,
  blur: 2,
  angle: 45,
  distance: 1,
};

export function addPageTitle(slide, theme, title, subtitle = "") {
  slide.addText(title, {
    x: 0.58,
    y: 0.35,
    w: 11.2,
    h: 0.62,
    fontFace: theme.fonts.zh,
    fontSize: theme.typeScale.title,
    bold: true,
    color: theme.colors.ink,
    margin: 0,
    breakLine: false,
    fit: "shrink",
  });
  if (subtitle) {
    slide.addText(subtitle, {
      x: 0.6,
      y: 1.03,
      w: 10.8,
      h: 0.3,
      fontFace: theme.fonts.zh,
      fontSize: 16,
      color: theme.colors.muted,
      margin: 0,
      fit: "shrink",
    });
  }
  slide.addShape("rect", {
    x: 0.58,
    y: 1.34,
    w: 4.1,
    h: 0.045,
    line: { color: theme.colors.primary, transparency: 100 },
    fill: { color: theme.colors.primary },
  });
  slide.addShape("rect", {
    x: 4.68,
    y: 1.34,
    w: 1.15,
    h: 0.045,
    line: { color: theme.colors.accent, transparency: 100 },
    fill: { color: theme.colors.accent },
  });
}

export function addCard(slide, theme, { x, y, w, h, fill, line, shadow = true }) {
  slide.addShape("roundRect", {
    x,
    y,
    w,
    h,
    fill: { color: fill || theme.colors.surface },
    line: { color: line || theme.colors.line, width: theme.geometry.lineWidth },
    // PptxGenJS normalizes shadow units in place; clone to avoid exponential
    // growth when the same style object is reused across multiple cards.
    shadow: shadow ? { ...SHADOW } : undefined,
  });
}

export function addPill(slide, theme, text, { x, y, w, fill, color }) {
  slide.addShape("roundRect", {
    x,
    y,
    w,
    h: 0.34,
    rectRadius: 0.16,
    fill: { color: fill },
    line: { color: fill, transparency: 100 },
  });
  slide.addText(text, {
    x,
    y: y + 0.01,
    w,
    h: 0.28,
    fontFace: theme.fonts.zh,
    fontSize: 11,
    bold: true,
    color,
    align: "center",
    valign: "mid",
    margin: 0,
    fit: "shrink",
  });
}

export function addText(slide, theme, text, options = {}) {
  const {
    latin = false,
    number = false,
    fontSize = theme.typeScale.body,
    color = theme.colors.ink,
    ...rest
  } = options;
  slide.addText(text, {
    fontFace: number
      ? theme.fonts.numbers
      : latin
        ? theme.fonts.latin
        : theme.fonts.zh,
    fontSize,
    color,
    margin: 0,
    breakLine: false,
    fit: "shrink",
    ...rest,
  });
}

export function addArrow(slide, theme, { x, y, w, h = 0, color }) {
  slide.addShape("line", {
    x,
    y,
    w,
    h,
    line: {
      color: color || theme.colors.primary,
      width: 1.5,
      beginArrowType: "none",
      endArrowType: "triangle",
    },
  });
}
