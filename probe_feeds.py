#!/usr/bin/env python3
"""Dumps the first items of the two usable feeds so the parser can be written against real data."""
import urllib.request, re, html
for u in ["https://www.wowhead.com/forever/blue-tracker?rss", "https://us.forums.blizzard.com/en/wow/groups/blizzard-tracker/posts.rss"]:
    req = urllib.request.Request(u, headers={"User-Agent": "Mozilla/5.0 (guild-bot feed probe)"})
    body = urllib.request.urlopen(req, timeout=20).read().decode("utf-8", "replace")
    items = re.findall(r"<item>(.*?)</item>", body, re.S)
    print(f"== {u} items={len(items)}")
    for it in items[:4]:
        print(re.sub(r"\s+", " ", html.unescape(it))[:900])
        print("--")
