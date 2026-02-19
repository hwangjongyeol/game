#!/usr/bin/env python3
from pathlib import Path
import json

root = Path(__file__).resolve().parents[1]

SUPPORTED_EXTS = {".md", ".yaml", ".yml"}

def is_doc_file(path: Path) -> bool:
    return path.suffix.lower() in SUPPORTED_EXTS and "assets" not in path.parts

all_md = sorted(p for p in root.rglob("*") if p.is_file() and is_doc_file(p))

def sort_key(path: Path) -> tuple[int, str]:
    rel = path.relative_to(root).as_posix()
    # Keep top-level overview docs first in navigation.
    if rel == "README.md":
        return (0, rel)
    if rel[:2].isdigit():
        return (1, rel)
    return (2, rel)

items = [
    {
        "path": p.relative_to(root).as_posix(),
        "content": p.read_text(encoding="utf-8")
    }
    for p in sorted(all_md, key=sort_key)
]

payload = {
    "generatedAt": __import__("datetime").datetime.now().isoformat(timespec="seconds"),
    "docs": items,
}

out = root / "assets" / "docs-data.js"
out.write_text("window.DOCS_DATA = " + json.dumps(payload, ensure_ascii=False) + ";\n", encoding="utf-8")
print(f"generated: {out} ({len(items)} docs)")
