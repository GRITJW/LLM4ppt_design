export async function addSlide(pptx, theme, h) {
  const slide = pptx.addSlide("BASE");
  slide.background = { color: theme.colors.background };

  h.addPageTitle(
    slide,
    theme,
    "从想法到可编辑 PPT：先确认，再重建",
    "视觉原型负责校准审美，原生对象负责后续编辑与交付",
  );

  const steps = [
    {
      x: 0.7,
      n: "01",
      title: "内容成型",
      body: "明确受众、核心结论与证据层级\n先把这一页要讲清楚",
      tag: "CONTENT",
    },
    {
      x: 4.58,
      n: "02",
      title: "视觉确认",
      body: "参考图或生图探索构图、颜色与重点\n原型不是最终 PPT",
      tag: "VISUAL",
    },
    {
      x: 8.46,
      n: "03",
      title: "原生重建",
      body: "文本、形状、连接线与图表分层实现\n关键元素均可选中编辑",
      tag: "EDITABLE",
    },
  ];

  // Draw connectors before nodes so arrows remain behind the editable cards.
  h.addArrow(slide, theme, { x: 3.98, y: 3.74, w: 0.43 });
  h.addArrow(slide, theme, { x: 7.86, y: 3.74, w: 0.43 });

  for (const step of steps) {
    h.addCard(slide, theme, { x: step.x, y: 2.03, w: 3.18, h: 3.42 });
    slide.addShape("ellipse", {
      x: step.x + 0.26,
      y: 2.31,
      w: 0.62,
      h: 0.62,
      fill: { color: theme.colors.primary },
      line: { color: theme.colors.primary, transparency: 100 },
    });
    h.addText(slide, theme, step.n, {
      x: step.x + 0.26,
      y: 2.39,
      w: 0.62,
      h: 0.28,
      number: true,
      fontSize: 14,
      bold: true,
      color: "FFFFFF",
      align: "center",
    });
    h.addPill(slide, theme, step.tag, {
      x: step.x + 1.98,
      y: 2.42,
      w: 0.9,
      fill: "E7F0FF",
      color: theme.colors.primary,
    });
    h.addText(slide, theme, step.title, {
      x: step.x + 0.28,
      y: 3.18,
      w: 2.5,
      h: 0.42,
      fontSize: 24,
      bold: true,
    });
    h.addText(slide, theme, step.body, {
      x: step.x + 0.28,
      y: 3.86,
      w: 2.58,
      h: 1.02,
      fontSize: 16,
      color: theme.colors.muted,
      breakLine: true,
      valign: "top",
    });
    slide.addShape("rect", {
      x: step.x + 0.28,
      y: 5.04,
      w: 0.58,
      h: 0.04,
      fill: { color: theme.colors.accent },
      line: { color: theme.colors.accent, transparency: 100 },
    });
  }

  h.addCard(slide, theme, {
    x: 0.7,
    y: 5.86,
    w: 10.94,
    h: 0.78,
    fill: "EDF5FF",
    line: "CFE2FF",
    shadow: false,
  });
  h.addText(slide, theme, "交付原则", {
    x: 0.98,
    y: 6.1,
    w: 0.9,
    h: 0.28,
    fontSize: 16,
    bold: true,
    color: theme.colors.primary,
  });
  h.addText(slide, theme, "关键文字和结构原生可编辑；图片只承担照片、纹理与非关键装饰。", {
    x: 1.88,
    y: 6.08,
    w: 8.9,
    h: 0.3,
    fontSize: 16,
  });

  return slide;
}
