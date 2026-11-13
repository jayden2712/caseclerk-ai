"""Kiểm tra kho kiến thức: đủ mục, có trích nguồn, mục nào trống.

Chạy: python scripts/check_knowledge.py
"""

from __future__ import annotations

import re
import sys
from dataclasses import dataclass, field
from pathlib import Path

KNOWLEDGE_DIR = Path(__file__).resolve().parent.parent / "knowledge"
REQUIRED_FRONTMATTER = ("bai:", "nguon:", "trang_thai:")
EMPTY_MARKER = "Không có trong bài giảng"
SOURCE_TAG = re.compile(r"\[[^\]]+§[^\]]+\]")
CONTENT_LINE = re.compile(r"^\s*(?:[-*+]\s|\d+\.\s|\|)")
TABLE_RULE = re.compile(r"^\s*\|[\s:|-]+\|\s*$")


@dataclass
class Report:
    name: str
    lines: int = 0
    status: str = "?"
    missing_frontmatter: list[str] = field(default_factory=list)
    empty_sections: list[str] = field(default_factory=list)
    untagged: list[int] = field(default_factory=list)
    content_lines: int = 0


def is_table_header(lines: list[str], i: int) -> bool:
    return i + 1 < len(lines) and bool(TABLE_RULE.match(lines[i + 1]))


def check_file(path: Path) -> Report:
    text = path.read_text(encoding="utf-8")
    lines = text.splitlines()
    report = Report(name=path.name, lines=len(lines))

    head = text.split("---", 2)[1] if text.startswith("---") else ""
    report.missing_frontmatter = [k for k in REQUIRED_FRONTMATTER if k not in head]
    status = re.search(r"trang_thai:\s*(\S+)", head)
    report.status = status.group(1) if status else "?"

    body_start = frontmatter_end(lines)
    section = None
    group_tagged = False  # nguồn ghi ở dòng tiêu đề nhóm áp dụng cho các gạch đầu dòng bên dưới
    for i, line in enumerate(lines[body_start:], start=body_start):
        if line.startswith("#"):
            section = line.lstrip("#").strip() if line.startswith("## ") else section
            group_tagged = bool(SOURCE_TAG.search(line))
            continue
        if section and EMPTY_MARKER in line:
            report.empty_sections.append(section)
        if not CONTENT_LINE.match(line):
            if line.strip():
                group_tagged = bool(SOURCE_TAG.search(line))
            continue
        if TABLE_RULE.match(line) or is_table_header(lines, i):
            continue
        report.content_lines += 1
        if not (SOURCE_TAG.search(line) or group_tagged):
            report.untagged.append(i + 1)
    return report


def frontmatter_end(lines: list[str]) -> int:
    if not lines or lines[0].strip() != "---":
        return 0
    for i, line in enumerate(lines[1:], start=1):
        if line.strip() == "---":
            return i + 1
    return 0


def main() -> int:
    files = sorted(KNOWLEDGE_DIR.glob("*.md"))
    if not files:
        print(f"Không thấy file nào trong {KNOWLEDGE_DIR}")
        return 1
    worst = 0
    for path in files:
        r = check_file(path)
        tagged = r.content_lines - len(r.untagged)
        pct = 100 * tagged / r.content_lines if r.content_lines else 0
        print(f"\n{r.name}: {r.lines} dòng, trạng thái {r.status}, có nguồn {tagged}/{r.content_lines} ({pct:.0f}%)")
        if r.missing_frontmatter:
            print(f"  Thiếu frontmatter: {', '.join(r.missing_frontmatter)}")
            worst = 1
        if r.empty_sections:
            print(f"  Mục trống: {'; '.join(r.empty_sections)}")
        if r.untagged:
            shown = ", ".join(map(str, r.untagged[:10]))
            more = f" (+{len(r.untagged) - 10})" if len(r.untagged) > 10 else ""
            print(f"  Dòng thiếu nguồn: {shown}{more}")
    return worst


if __name__ == "__main__":
    sys.exit(main())
