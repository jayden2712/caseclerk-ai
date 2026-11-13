"""Kiểm tra knowledge/matrix.json rồi xuất prototype/matrix.js cho giao diện.

Chạy: python scripts/build_matrix.py
Thoát mã 1 nếu bảng có lỗi; cảnh báo không chặn việc xuất.
"""

from __future__ import annotations

import json
import re
import sys
from collections import Counter
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "knowledge" / "matrix.json"
OUT = ROOT / "prototype" / "matrix.js"
ROLES = {"dien-hinh", "co-the", "khong-ung-ho", "loai-tru"}
ID_PATTERN = re.compile(r"^[a-z0-9]+(?:-[a-z0-9]+)*$")
MIN_FINDINGS = 3


def validate(data: dict) -> tuple[list[str], list[str]]:
    errors: list[str] = []
    warnings: list[str] = []
    symptoms = data.get("symptoms", [])
    diseases = data.get("diseases", [])

    sym_ids = [s.get("id", "") for s in symptoms]
    dis_ids = [d.get("id", "") for d in diseases]
    for kind, ids in (("triệu chứng", sym_ids), ("bệnh", dis_ids)):
        for dup, n in Counter(ids).items():
            if n > 1:
                errors.append(f"Trùng id {kind}: {dup}")
        for i in ids:
            if not ID_PATTERN.match(i):
                errors.append(f"Id {kind} sai dạng: {i!r}")

    for s in symptoms:
        if not s.get("label") or not s.get("question"):
            errors.append(f"Triệu chứng {s.get('id')} thiếu label hoặc question")

    known = set(sym_ids)
    used: set[str] = set()
    for d in diseases:
        findings = d.get("findings", [])
        if len(findings) < MIN_FINDINGS:
            warnings.append(f"Bệnh {d['id']} chỉ có {len(findings)} dấu hiệu")
        seen: set[str] = set()
        for f in findings:
            sid = f.get("symptom")
            where = f"{d['id']} → {sid}"
            if sid not in known:
                errors.append(f"Triệu chứng không tồn tại: {where}")
            if f.get("role") not in ROLES:
                errors.append(f"Vai trò sai: {where} ({f.get('role')})")
            if not str(f.get("source", "")).strip():
                errors.append(f"Thiếu nguồn: {where}")
            if sid in seen:
                errors.append(f"Lặp dấu hiệu trong cùng bệnh: {where}")
            seen.add(sid)
            used.add(sid)

    unused = sorted(known - used)
    if unused:
        warnings.append(f"{len(unused)} triệu chứng không gắn với bệnh nào: {', '.join(unused[:8])}")
    return errors, warnings


def main() -> int:
    if not SRC.exists():
        print(f"Chưa có {SRC}")
        return 1
    data = json.loads(SRC.read_text(encoding="utf-8"))
    errors, warnings = validate(data)
    for w in warnings:
        print(f"Cảnh báo: {w}")
    for e in errors:
        print(f"Lỗi: {e}")
    if errors:
        print(f"\n{len(errors)} lỗi, chưa xuất matrix.js")
        return 1

    payload = json.dumps(data, ensure_ascii=False, separators=(",", ":"))
    OUT.write_text(
        "// Tạo tự động bởi scripts/build_matrix.py từ knowledge/matrix.json. Không sửa tay.\n"
        f"window.MATRIX = {payload};\n",
        encoding="utf-8",
    )
    n_find = sum(len(d["findings"]) for d in data["diseases"])
    print(f"Đã xuất {OUT.name}: {len(data['diseases'])} bệnh, {len(data['symptoms'])} triệu chứng, {n_find} dấu hiệu")
    return 0


if __name__ == "__main__":
    sys.exit(main())
