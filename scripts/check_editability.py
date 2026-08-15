#!/usr/bin/env python3
"""Inspect PPTX OOXML and report common editability risks."""

from __future__ import annotations

import argparse
import json
import re
import sys
import zipfile
from pathlib import Path
from xml.etree import ElementTree as ET


NS = {
    "a": "http://schemas.openxmlformats.org/drawingml/2006/main",
    "p": "http://schemas.openxmlformats.org/presentationml/2006/main",
}


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Report native text, shapes, pictures, and full-slide image risks."
    )
    parser.add_argument("pptx", type=Path, help="PowerPoint file to inspect")
    parser.add_argument(
        "--strict",
        action="store_true",
        help="Exit nonzero when a slide has no native text or uses a full-slide picture.",
    )
    parser.add_argument(
        "--allow-full-slide-background",
        action="store_true",
        help="Do not fail strict mode solely because of a full-slide picture.",
    )
    return parser.parse_args()


def slide_number(name: str) -> int:
    match = re.search(r"slide(\d+)\.xml$", name)
    return int(match.group(1)) if match else 0


def read_slide_size(archive: zipfile.ZipFile) -> tuple[int, int]:
    root = ET.fromstring(archive.read("ppt/presentation.xml"))
    size = root.find("p:sldSz", NS)
    if size is None:
        return 12192000, 6858000  # 13.333 x 7.5 in, in EMU
    return int(size.attrib["cx"]), int(size.attrib["cy"])


def picture_box(pic: ET.Element) -> tuple[int, int, int, int] | None:
    xfrm = pic.find("p:spPr/a:xfrm", NS)
    if xfrm is None:
        return None
    off = xfrm.find("a:off", NS)
    ext = xfrm.find("a:ext", NS)
    if off is None or ext is None:
        return None
    return (
        int(off.attrib.get("x", 0)),
        int(off.attrib.get("y", 0)),
        int(ext.attrib.get("cx", 0)),
        int(ext.attrib.get("cy", 0)),
    )


def is_full_slide(box: tuple[int, int, int, int], width: int, height: int) -> bool:
    x, y, cx, cy = box
    tolerance_x = width * 0.02
    tolerance_y = height * 0.02
    return (
        abs(x) <= tolerance_x
        and abs(y) <= tolerance_y
        and cx >= width * 0.98
        and cy >= height * 0.98
    )


def inspect(pptx_path: Path) -> dict:
    with zipfile.ZipFile(pptx_path) as archive:
        width, height = read_slide_size(archive)
        slide_names = sorted(
            (
                name
                for name in archive.namelist()
                if re.fullmatch(r"ppt/slides/slide\d+\.xml", name)
            ),
            key=slide_number,
        )
        slides = []
        for index, name in enumerate(slide_names, start=1):
            root = ET.fromstring(archive.read(name))
            text_nodes = root.findall(".//a:t", NS)
            native_text = [node.text or "" for node in text_nodes if (node.text or "").strip()]
            shapes = root.findall(".//p:sp", NS)
            pictures = root.findall(".//p:pic", NS)
            graphic_frames = root.findall(".//p:graphicFrame", NS)
            full_slide_pictures = []
            for picture in pictures:
                box = picture_box(picture)
                if box and is_full_slide(box, width, height):
                    props = picture.find("p:nvPicPr/p:cNvPr", NS)
                    full_slide_pictures.append(
                        props.attrib.get("name", "unnamed") if props is not None else "unnamed"
                    )
            warnings = []
            if not native_text:
                warnings.append("no native text found")
            if full_slide_pictures:
                warnings.append("full-slide picture detected")
            slides.append(
                {
                    "slide": index,
                    "native_text_runs": len(native_text),
                    "native_shapes": len(shapes),
                    "graphic_frames": len(graphic_frames),
                    "pictures": len(pictures),
                    "full_slide_pictures": full_slide_pictures,
                    "warnings": warnings,
                }
            )
    return {
        "file": str(pptx_path),
        "slide_size_emu": {"width": width, "height": height},
        "slides": slides,
    }


def main() -> int:
    args = parse_args()
    pptx_path = args.pptx.expanduser().resolve()
    if not pptx_path.is_file():
        raise SystemExit(f"PPTX does not exist: {pptx_path}")
    if not zipfile.is_zipfile(pptx_path):
        raise SystemExit(f"Not a valid PPTX/ZIP package: {pptx_path}")

    report = inspect(pptx_path)
    print(json.dumps(report, ensure_ascii=False, indent=2))

    if args.strict:
        for slide in report["slides"]:
            if slide["native_text_runs"] == 0:
                return 1
            if slide["full_slide_pictures"] and not args.allow_full_slide_background:
                return 1
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except zipfile.BadZipFile as exc:
        print(f"Invalid PPTX package: {exc}", file=sys.stderr)
        raise SystemExit(2) from exc
