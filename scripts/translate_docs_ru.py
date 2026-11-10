#!/usr/bin/env python3
"""Translate VitePress markdown docs EN->RU (rate-limit friendly)."""
from __future__ import annotations

import re
import sys
import time
from pathlib import Path

from deep_translator import GoogleTranslator

ROOT = Path(__file__).resolve().parents[1] / "docs"
translator = GoogleTranslator(source="en", target="ru")
CHUNK = 2800
SKIP = {ROOT / "ATTRIBUTION.md", ROOT / "index.md"}


def cyrillic_ratio(text: str) -> float:
    letters = [c for c in text if c.isalpha()]
    if not letters:
        return 0.0
    return sum(1 for c in letters if "\u0400" <= c <= "\u04FF") / len(letters)


def split_protect(text: str) -> tuple[str, list[tuple[str, str]]]:
    parts: list[tuple[str, str]] = []

    def repl(m: re.Match[str]) -> str:
        key = f"\uE000{len(parts)}\uE001"
        parts.append((key, m.group(0)))
        return key

    text = re.sub(r"```[\s\S]*?```", repl, text)
    text = re.sub(r"`[^`\n]+`", repl, text)
    return text, parts


def restore(text: str, parts: list[tuple[str, str]]) -> str:
    for key, orig in parts:
        text = text.replace(key, orig)
    return text


def translate_chunk(s: str) -> str:
    s = s.strip()
    if not s or cyrillic_ratio(s) > 0.4:
        return s
    for attempt in range(8):
        try:
            out = translator.translate(s)
            time.sleep(2.2)
            return out
        except Exception as e:
            msg = str(e).lower()
            if "too many requests" in msg or "429" in msg:
                time.sleep(15 * (attempt + 1))
                continue
            if attempt >= 7:
                print(f"  FAIL: {e}", file=sys.stderr)
                return s
            time.sleep(3)
    return s


def translate_body(body: str) -> str:
    body, parts = split_protect(body)
    paragraphs = re.split(r"\n\n+", body)
    out: list[str] = []
    buf = ""
    for p in paragraphs:
        if len(buf) + len(p) + 2 > CHUNK and buf:
            out.append(translate_chunk(buf))
            buf = p
        else:
            buf = f"{buf}\n\n{p}" if buf else p
    if buf:
        out.append(translate_chunk(buf))
    body = "\n\n".join(out)
    body = restore(body, parts)
    return (
        body.replace("Axolotl-PM", "RubyxGames")
        .replace("Axolotl‑PM", "RubyxGames")
        .replace("Axolotl-PM", "RubyxGames")
    )


def process_file(path: Path) -> None:
    if path in SKIP:
        return
    raw = path.read_text(encoding="utf-8")
    if cyrillic_ratio(raw) > 0.32:
        print(f"skip: {path.relative_to(ROOT)}")
        return

    m = re.match(r"^---\n([\s\S]*?)\n---\n([\s\S]*)$", raw)
    if not m:
        path.write_text(translate_body(raw), encoding="utf-8")
        print(f"ok: {path.relative_to(ROOT)}")
        return

    fm, body = m.group(1), m.group(2)
    for key in ("title", "description"):
        mm = re.search(rf"^{key}:\s*(.+)$", fm, flags=re.M)
        if mm and cyrillic_ratio(mm.group(1)) < 0.3:
            val = mm.group(1).strip().strip('"')
            tr = translate_chunk(val)
            fm = re.sub(
                rf"^{key}:.*$",
                f'{key}: "{tr}"' if ":" in tr or tr.startswith("http") else f"{key}: {tr}",
                fm,
                count=1,
                flags=re.M,
            )
    path.write_text(f"---\n{fm}\n---\n{translate_body(body)}", encoding="utf-8")
    print(f"ok: {path.relative_to(ROOT)}")


def main() -> None:
    for f in sorted(ROOT.rglob("*.md")):
        process_file(f)


if __name__ == "__main__":
    main()
