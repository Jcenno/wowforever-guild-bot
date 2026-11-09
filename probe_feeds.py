#!/usr/bin/env python3
"""Checks which news feeds the tracker can read from GitHub Actions. Prints status, type and a sample per URL."""
import sys, urllib.request, re
URLS = [
    "https://www.wowhead.com/forever/blue-tracker?rss",
    "https://www.wowhead.com/blue-tracker?rss",
    "https://us.forums.blizzard.com/en/wow/c/wow-forever/1234.rss",
    "https://us.forums.blizzard.com/en/wow/latest.rss",
    "https://us.forums.blizzard.com/en/wow/groups/blizzard-tracker/posts.rss",
    "https://us.forums.blizzard.com/en/wow/posts.rss",
    "https://us.forums.blizzard.com/en/wow/categories.json",
    "https://worldofwarcraft.blizzard.com/en-us/news/rss",
    "https://news.blizzard.com/en-us/rss",
    "https://news.blizzard.com/en-us/blog/list?pageNum=1&pageSize=10&community=wow",
]
for u in URLS:
    try:
        req = urllib.request.Request(u, headers={"User-Agent": "Mozilla/5.0 (guild-bot feed probe)"})
        with urllib.request.urlopen(req, timeout=20) as r:
            body = r.read(200000).decode("utf-8", "replace")
            ct = r.headers.get("content-type", "")
            titles = re.findall(r"<title>(.*?)</title>", body)[:6]
            print(f"OK  {r.status} {ct[:40]:40} {u}\n    titles={titles}")
    except Exception as e:
        print(f"ERR {str(e)[:80]:50} {u}")
