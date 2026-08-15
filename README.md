# LLM4PPT Design

一个面向 **AI 辅助制作精美、高保真、混合可编辑 PowerPoint** 的逐页工作流。

它不追求一次生成整套 PPT，而是帮助用户先把单页内容和视觉方向讨论清楚，再将确认后的设计重建为可编辑的 PowerPoint 对象，最后按顺序合并成完整演示文稿。

## 适合谁

- 有汇报、答辩、路演或个人展示需求，但不擅长梳理页面逻辑的人；
- 希望利用 AI 提升 PPT 审美，同时保留后续人工编辑能力的人；
- 经常需要逐页打磨，而不是一次性生成整套模板的人；
- 希望在 Codex 或其他 Agent 中复用一套稳定 PPT 制作流程的开发者。

## 核心能力

- **内容成型**：从模糊想法、Markdown、文档或素材中提炼单页结论、证据与信息层级。
- **风格校准**：通过参考图片、已有 PPT 或口头描述确定字体、配色、密度和视觉语言。
- **视觉原型**：按需调用当前环境的生图能力，快速验证构图与审美方向。
- **高保真重建**：将标题、正文、指标、形状、连接线、表格和图表重建为原生对象，同时将奖杯、图标、插画和纹理保留为独立 SVG/PNG 资产。
- **风格对齐**：从参考图提取画布、主要颜色和视觉资产，统一配色令牌与字号层级，减少颜色漂移和随意字号。
- **逐页管理**：一页一个 `.mjs` 模块，可单独编译、确认、锁定，最后统一合并。
- **质量检查**：同时检查渲染效果、画布溢出和 PPTX 对象结构，避免交付“整页截图”。

## 工作流程

1. 明确当前页面的受众、目的和核心结论；
2. 讨论并确认页面文案与信息层级；
3. 提供参考图或描述希望采用的视觉风格；
4. 生成或绘制视觉原型，确认构图、配色与重点；
5. 建立元素清单，将页面内容路由为原生对象、SVG、PNG/JPG 或背景；
6. 按参考图坐标映射重建页面，并保留不可编辑但重要的视觉标识；
7. 渲染预览并通过叠加图、差异图检查构图、颜色、字号和遗漏元素；
8. 锁定当前页面，继续制作下一页；
9. 按 `manifest.json` 的顺序编译完整 PPTX。

页面状态依次为：

`idea → content-discussion → content-approved → visual-drafting → visual-approved → native-building → qa-passed → locked`

## 能力边界

- 视觉原型是设计参考，**不能自动无损转换**为语义化、可编辑的 PPT 对象；最终页面需要重新构建。
- 不支持 PowerPoint 人工修改与代码之间的实时双向同步；页面锁定后以最后交付的 PPTX 为人工编辑入口。
- 不自动生成复杂动画；建议在最终导出后由用户在 PowerPoint 中添加。
- 采用“选择性可编辑”：重要文字、数据和结构必须原生可编辑；图标、奖杯、插画、纹理等视觉资产可以作为独立 SVG/PNG/JPG 保留。
- 不允许为追求全原生对象而删除参考图中可见的标识，也不允许把整页参考图直接作为最终幻灯片。
- SVG 适合图标和矢量装饰，但并不等同于 PowerPoint 原生文本、表格或图表。
- 生图能力采用适配方式：Codex/ChatGPT 使用内置生图工具，其他 Agent 可调用自身可用的图片模型。

## 安装 Skill

### 推荐：让 Codex 技能安装器处理

在 Codex 中输入：

```text
请使用 $skill-installer 从 https://github.com/GRITJW/LLM4ppt_design 安装根目录 Skill，名称设为 build-polished-decks。
```

技能安装器会将它放到 `$CODEX_HOME/skills/build-polished-decks`；未设置 `CODEX_HOME` 时，默认使用 `~/.codex/skills/build-polished-decks`。

也可以直接调用 Codex 自带的安装脚本：

```powershell
python "$HOME\.codex\skills\.system\skill-installer\scripts\install-skill-from-github.py" `
  --repo GRITJW/LLM4ppt_design `
  --path . `
  --name build-polished-decks
```

### Windows PowerShell 手动安装

不要把 `~/.codex/...` 直接作为 `git clone` 的目标参数；部分 Windows 终端会将 `~` 当作普通目录名。使用明确展开的 `$HOME`：

```powershell
$skillPath = Join-Path $HOME ".codex\skills\build-polished-decks"
git clone https://github.com/GRITJW/LLM4ppt_design.git $skillPath
```

### macOS / Linux 手动安装

```bash
git clone https://github.com/GRITJW/LLM4ppt_design.git \
  "${CODEX_HOME:-$HOME/.codex}/skills/build-polished-decks"
```

安装完成后，在下一轮 Codex 对话中使用 `$build-polished-decks`。如果当前客户端没有刷新技能列表，请新建任务或重启 Codex。

## 创建 PPT 工程

`npm install` **不是安装 Codex Skill**，它只负责安装生成 PPTX 所需的 PptxGenJS 运行依赖。

先使用 Skill 附带的脚本创建一个独立 PPT 工程：

```bash
python scripts/init_project.py ./my-deck
cd my-deck
npm install
npm run build:page
```

编译当前页面：

```bash
node compile.mjs --only 001 --out output/page-001.pptx
```

编译完整演示文稿：

```bash
node compile.mjs --out output/deck.pptx
```

检查 PPTX 的原生对象和整页图片风险：

```bash
python scripts/check_editability.py output/deck.pptx --strict
```

分析参考图尺寸和颜色候选：

```bash
node scripts/analyze_reference_image.mjs --input reference.png --out reference-analysis.json
```

按照清单裁切独立视觉资产：

```bash
node scripts/extract_visual_assets.mjs --input reference.png --manifest assets.json --out-dir assets
```

比较参考图与 PPTX 渲染结果：

```bash
node scripts/compare_reference_render.mjs --reference reference.png --render slide-1.png --out-dir comparison
```

以上图像脚本使用 `sharp`。在 Codex 中会优先加载工作区依赖运行时；在其他本地环境中，如果没有该依赖，请先执行 `npm install sharp`。

## 项目结构

```text
SKILL.md              AI 执行工作流
references/           内容、风格、图片与可编辑性规范
scripts/              工程初始化和 PPTX 结构检查工具
assets/starter/       可直接复制的 PptxGenJS 示例工程
agents/openai.yaml    Codex 技能界面信息
```

默认采用 16:9 画布，中文字体为微软雅黑，英文与数字字体为 Times New Roman；所有主题配置均可在 `theme.json` 中修改。

## License

[MIT](LICENSE)
