#!/usr/bin/env python3
"""Shows what the news feed would post right now (first-run rules), without posting anything."""
import json, news
embeds, state = news.build_news({})
print(f"{len(embeds)} card(s); {len(state['news_seen'])} titles recorded")
print(json.dumps(embeds, indent=1, ensure_ascii=False))
