#!/usr/bin/env python3
"""Create a deck workspace from the bundled PptxGenJS starter."""

from __future__ import annotations

import argparse
import shutil
from pathlib import Path


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Copy the build-polished-decks starter into a new directory."
    )
    parser.add_argument("destination", type=Path, help="New deck workspace path")
    parser.add_argument(
        "--force-empty",
        action="store_true",
        help="Allow an existing destination only when it is empty.",
    )
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    skill_root = Path(__file__).resolve().parents[1]
    starter = skill_root / "assets" / "starter"
    destination = args.destination.expanduser().resolve()

    if not starter.is_dir():
        raise SystemExit(f"Starter directory is missing: {starter}")

    if destination.exists():
        if not args.force_empty:
            raise SystemExit(
                f"Destination already exists: {destination}. "
                "Choose a new path or pass --force-empty for an empty directory."
            )
        if any(destination.iterdir()):
            raise SystemExit(f"Destination is not empty: {destination}")
        shutil.copytree(
            starter,
            destination,
            dirs_exist_ok=True,
            ignore=shutil.ignore_patterns("node_modules", "output", "*.tmp", "*.log"),
        )
    else:
        shutil.copytree(
            starter,
            destination,
            ignore=shutil.ignore_patterns("node_modules", "output", "*.tmp", "*.log"),
        )

    print(f"Created editable deck workspace: {destination}")
    print("Next: cd into it, run npm install, then npm run build:page")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
