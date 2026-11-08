#!/usr/bin/env python3
"""Write STRINGS.md: every member-facing string in tracker.py with its line number.
Run after any copy change: python3 tools/extract_strings.py
The QA walkthrough reads STRINGS.md, not the code."""
import re, pathlib
src = pathlib.Path(__file__).resolve().parent.parent / "tracker.py"
out = src.parent / "STRINGS.md"
pat = re.compile(r'(lines\.append\(|headline = |"title": |"name": |"text": |desc = |"description": |"value": |"content": )')
rows = []
for n, line in enumerate(src.read_text().splitlines(), 1):
    if pat.search(line):
        lit = re.findall(r'f?"((?:[^"\\]|\\.)*)"', line)
        text = " | ".join(l for l in lit if len(l) > 2 and not l.startswith(("http", "%", "\\n")))
        if text:
            rows.append((n, text.replace("|", "\\|")))
md = ["# Member-facing strings", "", f"{len(rows)} strings from `tracker.py`. Regenerate with `python3 tools/extract_strings.py`.", "",
      "Rules: one verb per line, no tool names (Jeeves, Blizzard, GitHub, tracker), no AI or admin wording, 'about every 15 minutes' not 'every 15 minutes'.", "",
      "| Line | Text |", "| --- | --- |"]
md += [f"| {n} | `{t}` |" for n, t in rows]
out.write_text("\n".join(md) + "\n")
print(f"{len(rows)} strings -> {out.name}")
