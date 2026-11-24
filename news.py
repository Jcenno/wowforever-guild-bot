"""
Blizzard news for #announcements: official WoW: Forever posts only, deduplicated, linked to the original.

Source: Wowhead's Forever Blue Tracker RSS, which lists every Blizzard post about Forever (forum posts
by blues and news.blizzard.com articles) and nothing else. The US forums' blizzard-tracker RSS supplies
the full body for forum posts when it has the same topic.

Rules:
- US and EU copies of the same post collapse to one card (same title once dates and the
  "— World of Warcraft — Blizzard News" suffix are stripped). US wins when both exist.
- A post is skipped when it is a short blue reply inside a player thread (no news keyword in the
  title and under 200 characters of body). "We're looking into it" is not news.
- Links point at Blizzard, never Wowhead: forum topics to us/eu.forums.blizzard.com, articles to
  news.blizzard.com.
- Rewards earned outside the game (Twitch drops, Prime Gaming, subscription bonuses) post as
  "Free reward" cards even when the title reads like a promo.
- Promotional posts (podcasts, short stories, videos, weekly roundups, streams, contests, merch)
  are skipped by title: #announcements is for things that change the game or the servers.
- At most MAX_PER_RUN cards per run; the rest wait for the next run. Seen titles are kept 14 days.

Uses only the standard library. Nothing here posts; it returns embeds for the tracker's queue.
"""

import html
import re
import time
import urllib.request
from email.utils import parsedate_to_datetime

FOREVER_RSS = "https://www.wowhead.com/forever/blue-tracker?rss"
FORUM_RSS = "https://us.forums.blizzard.com/en/wow/groups/blizzard-tracker/posts.rss"
UA = "Mozilla/5.0 (WoW Forever guild bot; news feed)"
MAX_PER_RUN = 3
KEEP_DAYS = 14
BODY_LIMIT = 700

MONTHS = "january|february|march|april|may|june|july|august|september|october|november|december"
KEYWORDS = {
    "hotfix": ("Hotfixes", 0xE67E22, r"hotfix|patch|tuning|notes|nerf|buff|fixed|adjust"),
    "service": ("Service", 0x3498DB, r"maintenance|realm|server|login|queue|downtime|connection|latency|disconnect|restart|outage"),
    "news": ("News", 0x9B59B6, r"."),
}

# Titles that are marketing rather than game or server changes. Matched on the title only.
PROMO = re.compile(
    r"podcast|short story|\bwatch\b|weekly highlights|wow weekly|\bvideos?\b|livestream|\bstream(ing)?\b"
    r"|cinematic|trailer|fan ?art|community spotlight|contest|giveaway|sweepstakes|twitch|\bdrops\b"
    r"|merch|gear store|interview|soundtrack|\bcomic\b|novel|cosplay|\blore\b",
    re.I)


def is_promo(title):
    return bool(PROMO.search(title or ""))


# Rewards earned outside the game (Twitch drops, Prime Gaming, subscription bonuses, Recruit-a-Friend,
# BlizzCon). These often have promo-sounding titles ("Twitch Drops", "Get the Drop on ..."), so they are
# checked before the promo skip. The title has to point at a reward, and the post has to say how to get it.
REWARD_TITLE = re.compile(
    r"twitch drops?|\bdrops?\b|prime gaming|reward|\btoy\b|\bmount\b|\bpet\b|subscription (offer|bonus)"
    r"|recruit-?a-?friend|blizzcon|free\b|get the drop|campfire",
    re.I)
REWARD_HOW = re.compile(
    r"\bwatch(ing)?\b.*\bhours?\b|link your|account\.battle\.net/connections|drops inventory|\bclaim\b"
    r"|\bredeem\b|prime gaming|subscription|recruit|eligible stream",
    re.I | re.S)


def is_reward(title, body=""):
    return bool(REWARD_TITLE.search(title or "")) and bool(REWARD_HOW.search(f"{title} {body or ''}"))


REWARD_COLOR = 0xF1C40F


def reward_embed(r):
    """Card for one curated reward from characters.json "rewards"."""
    lines = [r.get("what", "").strip()]
    if r.get("how"):
        lines.append(f"**How to get it:** {r['how'].strip()}")
    if r.get("status"):
        lines.append(f"**Status:** {r['status'].strip()}")
    e = {"title": f"Free reward: {r['name']}"[:256], "description": "\n\n".join(x for x in lines if x)[:4000],
         "color": REWARD_COLOR, "footer": {"text": "Reward outside the game"}}
    if r.get("url"):
        e["url"] = r["url"]
    if r.get("image"):
        e["thumbnail"] = {"url": r["image"]}
    return e


def build_rewards(rewards, state, now_ts=None):
    """Curated rewards from characters.json. Returns (public, officers) embed lists.

    Each reward posts once. "publish": false sends it to the officers channel first as a preview;
    flipping it to true posts it publicly. "ends" (YYYY-MM-DD) adds one reminder 3 days before.
    """
    now_ts = now_ts or int(time.time())
    done = state.setdefault("rewards_posted", {})
    public, officers = [], []
    for r in rewards or []:
        rid = r.get("id")
        if not rid or not r.get("name"):
            continue
        rec = done.setdefault(rid, {})
        if r.get("publish"):
            if not rec.get("public"):
                public.append(reward_embed(r))
                rec["public"] = now_ts
        elif not rec.get("preview"):
            e = reward_embed(r)
            e["footer"] = {"text": "Preview for officers. Publish it by setting \"publish\": true."}
            officers.append(e)
            rec["preview"] = now_ts
        ends = r.get("ends")
        if ends and r.get("publish") and rec.get("public") and not rec.get("reminded"):
            try:
                end_ts = int(time.mktime(time.strptime(ends, "%Y-%m-%d")))
            except ValueError:
                continue
            if 0 < end_ts - now_ts <= 3 * 86400:
                e = reward_embed(r)
                e["title"] = f"Last call: {r['name']}"[:256]
                e["description"] = f"Ends {time.strftime('%A %d %B', time.localtime(end_ts))}.\n\n" + e["description"]
                public.append(e)
                rec["reminded"] = now_ts
    return public, officers


def fetch(url, timeout=20):
    req = urllib.request.Request(url, headers={"User-Agent": UA})
    with urllib.request.urlopen(req, timeout=timeout) as r:
        return r.read().decode("utf-8", "replace")


def rss_items(xml):
    out = []
    for raw in re.findall(r"<item>(.*?)</item>", xml, re.S):
        def tag(name):
            m = re.search(rf"<{name}[^>]*>(.*?)</{name}>", raw, re.S)
            if not m:
                return ""
            v = m.group(1).strip()
            v = re.sub(r"^<!\[CDATA\[(.*)\]\]>$", r"\1", v, flags=re.S)
            return html.unescape(v).strip()
        out.append({"title": tag("title"), "link": tag("link"), "description": tag("description"),
                    "pubDate": tag("pubDate"), "creator": tag("dc:creator")})
    return out


MONTH_NUM = {m: str(i + 1) for i, m in enumerate(
    ["january", "february", "march", "april", "may", "june", "july", "august", "september", "october", "november", "december"])}
MONTH_NUM.update({m[:3]: n for m, n in list(MONTH_NUM.items())})


def legacy_key(title):
    """Key shape used before v1.12 (dates stripped). Only for reading old state."""
    t = title.lower().replace("— world of warcraft — blizzard news", "")
    t = re.sub(rf"\b({MONTHS})\b", " ", t)
    t = re.sub(r"\b\d{1,4}\b", " ", t)
    t = re.sub(r"[^a-z]+", " ", t)
    return " ".join(t.split())


def norm_title(title):
    """
    Key for US/EU dedupe. Month names become numbers and the remaining tokens
    are sorted, so "Hotfixes - November 6, 2026" and "Hotfixes: 6 November 2026"
    match each other but not the November 13 note.
    """
    t = title.lower()
    t = t.replace("— world of warcraft — blizzard news", "")
    t = re.sub(r"[^a-z0-9]+", " ", t)
    toks = [MONTH_NUM.get(w, w) for w in t.split()]
    return " ".join(sorted(toks))


def clean_title(title):
    return re.sub(r"\s*—\s*World of Warcraft\s*—\s*Blizzard News\s*$", "", title).strip()


def html_to_text(s):
    s = re.sub(r"<br\s*/?>", "\n", s)
    s = re.sub(r"</p>|</li>|</ul>|</h\d>|<hr\s*/?>", "\n", s)
    s = re.sub(r"<li[^>]*>", "• ", s)
    s = re.sub(r"<strong>(.*?)</strong>", r"**\1**", s, flags=re.S)
    s = re.sub(r"<[^>]+>", "", s)
    s = html.unescape(s)
    lines = [ln.strip() for ln in s.splitlines()]
    text = "\n".join(ln for ln in lines if ln.strip())
    return re.sub(r"\n{3,}", "\n\n", text).strip()


def trim(text, limit=BODY_LIMIT):
    if len(text) <= limit:
        return text
    cut = text[:limit]
    cut = cut[: max(cut.rfind("\n"), cut.rfind(". ") + 1, limit - 120)]
    return cut.rstrip() + " …"


def blizzard_link(wowhead_link, title):
    """Wowhead's tracker URL carries the region and Blizzard's own id; rebuild the original."""
    m = re.search(r"/blue-tracker/topic/(us|eu)/(\d+)", wowhead_link)
    if m:
        return f"https://{m.group(1)}.forums.blizzard.com/en/wow/t/{m.group(2)}", m.group(1), m.group(2)
    m = re.search(r"/blue-tracker/news/(us|eu)/(\d+)", wowhead_link)
    if m:
        return f"https://news.blizzard.com/en-us/article/{m.group(2)}", m.group(1), m.group(2)
    return wowhead_link, "us", None


def classify(title, body=""):
    text = f"{title} {body[:240]}"
    for key, (label, color, pattern) in KEYWORDS.items():
        if key != "news" and re.search(pattern, text, re.I):
            return key, label, color
    label, color, _ = KEYWORDS["news"]
    return "news", label, color


def strip_author(desc):
    """Wowhead appends 'By<a>Name</a> on date' to its summaries."""
    m = re.search(r"By\s*<a[^>]*>(.*?)</a>\s*on\s*(.*)$", desc, re.S)
    author = html.unescape(m.group(1)).strip() if m else ""
    body = desc[: m.start()] if m else desc
    return html_to_text(body), author


def build_news(state, now_ts=None, fetcher=fetch):
    """Return (embeds, state) with new Forever posts as Discord embeds, newest last."""
    now_ts = now_ts or int(time.time())
    seen = state.setdefault("news_seen", {})
    for k in [k for k, ts in seen.items() if now_ts - ts > KEEP_DAYS * 86400]:
        del seen[k]
    first_run = not seen and not state.get("news_started")
    recent = state.setdefault("news_recent", {})
    for k in [k for k, v in recent.items() if now_ts - v.get("ts", 0) > 3 * 86400]:
        del recent[k]

    try:
        items = rss_items(fetcher(FOREVER_RSS))
    except Exception as err:  # the feed being down is not an outage for the guild
        print(f"[warn] news feed: {err}")
        return [], state
    forum_bodies = {}
    try:
        for it in rss_items(fetcher(FORUM_RSS)):
            m = re.search(r"/t/[^/]+/(\d+)", it["link"])
            if m:
                forum_bodies[m.group(1)] = it
    except Exception as err:
        print(f"[warn] forum feed: {err}")

    # Oldest first so the channel reads in order; US copy preferred over EU.
    groups = {}
    for it in items:
        key = norm_title(it["title"])
        link, region, bid = blizzard_link(it["link"], it["title"])
        cur = groups.get(key)
        if cur is None or (cur["region"] == "eu" and region == "us"):
            groups[key] = {**it, "key": key, "url": link, "region": region, "bid": bid}

    def when(it):
        try:
            return parsedate_to_datetime(it["pubDate"]).timestamp()
        except Exception:
            return 0
    ordered = sorted(groups.items(), key=lambda kv: when(kv[1]))  # oldest first
    if first_run:
        # Start the channel with the newest few; record the rest quietly so the backlog never posts.
        for key, _ in ordered[:-MAX_PER_RUN]:
            seen[key] = now_ts
    embeds = []
    for key, it in ordered:
        if key not in seen and legacy_key(it["title"]) in seen:
            seen[key] = now_ts  # remembered under the pre-v1.12 key shape
        if key in seen:
            seen[key] = now_ts  # still in the feed: keep it remembered so it cannot come back as new
            continue
        body, author = strip_author(it["description"])
        reward = is_reward(it["title"], body)
        if is_promo(it["title"]) and not reward:
            seen[key] = now_ts
            continue
        # The EU forum often reposts a US notice a day later with its own date in the title
        # ("... November 14" vs "... 15 November"). Same title without the date, the other
        # region, within 36 hours: treat it as the same notice.
        twin = recent.get(legacy_key(it["title"]))
        if twin and twin["region"] != it["region"] and now_ts - twin["ts"] < 36 * 3600:
            seen[key] = now_ts
            continue
        forum = forum_bodies.get(it["bid"] or "")
        if forum and "forums.blizzard.com" in it["url"]:
            body = html_to_text(forum["description"]) or body
            author = re.sub(r"^@\S+\s*", "", forum["creator"]) or author
        kind, label, color = classify(it["title"], body)
        if reward:
            kind, label, color = "reward", "Free reward", REWARD_COLOR
        if kind == "news" and "forums.blizzard.com" in it["url"] and len(body) < 200:
            seen[key] = now_ts
            continue
        # One blue reply often lands in two threads on the same subject. Same opening text
        # within three days: the guild has already read it.
        bkey = "body:" + re.sub(r"[^a-z0-9]+", " ", (body or "").lower()).strip()[:160]
        if len(bkey) > 85 and bkey in recent:
            seen[key] = now_ts
            continue
        if len(bkey) > 85:
            recent[bkey] = {"region": it["region"], "ts": now_ts}
        seen[key] = now_ts
        recent[legacy_key(it["title"])] = {"region": it["region"], "ts": now_ts}
        source = "Blizzard News" if "news.blizzard.com" in it["url"] else f"{it['region'].upper()} forums"
        embeds.append({
            "title": (("Free reward: " if reward else "") + clean_title(it["title"]))[:256],
            "url": it["url"],
            "description": trim(body) if body else None,
            "color": color,
            "footer": {"text": " · ".join(x for x in [label, author, source] if x)},
        })
        if len(embeds) >= MAX_PER_RUN:
            break
    state["news_started"] = True
    return embeds, state
