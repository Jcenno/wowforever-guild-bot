#!/usr/bin/env python3
"""
WoW: Forever guild bot v1.11 (fork of tsc862-prog/wow-forever-tracker, MIT-style use).

Guild additions over the upstream tracker:
  - the character list comes from the in-game guild roster
    (/data/wow/guild/{slug}/roster in profile-forever-{region}); members who
    join or leave the guild are announced, and characters.json "friends" is
    still honored for non-guild alts
  - big-ding milestones (30/40/50/60 by default) and the epic mount
    (Riding skill crossing epic_riding_skill, or a mount on the epic list)
    post as hype cards and can ping a Discord role; everything else stays
    silent as upstream
  - a living roster board: one webhook message, edited every run, that lists
    every tracked character by class with level, spec, professions and rank

Every run checks each character against Blizzard's Profile API, compares
with the last check (state.json), and posts one Discord message with
everything that changed since then:

  - level-ups (and who was first to max level)
  - professions learned, and profession skill milestones
  - dungeons cleared for the first time
  - dungeons cleared for the first time (final boss killed, see dungeons.json)
  - raid bosses killed for the first time (from boss-kill statistics)
  - achievements earned
  - reputation milestones (Honored, Revered, Exalted)
  - gear: every new epic/legendary equipped, and a character's first blue
  - mounts: new mounts (mounts are account-wide, so posted once per friend)

Once a week (Sunday evening by default) the first run after the recap time
also posts a weekly recap as its own message: a leaderboard of characters who
played, highlights (dungeon clears, epics, profession gains), a top-3
scoreboard (mobs, quests, deaths) and six rotating awards.

Anything a character already had when it was first tracked is recorded
quietly, so only new progress gets posted. All posts are silent (no
notifications). Uses only the Python standard library.

Environment variables:
  BLIZZARD_CLIENT_ID      Battle.net API client ID
  BLIZZARD_CLIENT_SECRET  Battle.net API client secret
  DISCORD_WEBHOOK_URL         Discord webhook for the #dings channel
  DISCORD_ROSTER_WEBHOOK_URL  optional second webhook for the roster board (#roster);
                              defaults to DISCORD_WEBHOOK_URL
  DISCORD_NEWS_WEBHOOK_URL    optional webhook for #announcements; official Forever posts only
  DISCORD_STAFF_WEBHOOK_URL   optional webhook for the officers-only channel
  PROFILE_NAMESPACE           optional override, default profile-forever-{region}

Usage:
  python3 tracker.py                 normal run
  python3 tracker.py --dry-run       print what would be posted, save nothing
  python3 tracker.py --test-webhook  send a test message to Discord and exit
  python3 tracker.py --recap-now     post the weekly recap now (from saved data)
"""

import argparse
import base64
import json
import time
import os
import re
import sys
import urllib.error
import urllib.parse
import urllib.request
from concurrent.futures import ThreadPoolExecutor
from datetime import datetime, timedelta, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parent
CONFIG_PATH = ROOT / "characters.json"
STATE_PATH = ROOT / "state.json"
DUNGEONS_PATH = ROOT / "dungeons.json"
USER_AGENT = "WoWForeverGuildBot/1.0"
DEFAULT_COLOR = 0x5865F2
RECAP_COLOR = 0xF1C40F
HYPE_COLOR = 0xFFD700
ROSTER_COLOR = 0x2ECC71

CLASS_COLORS = {
    "Druid": 0xFF7C0A,
    "Hunter": 0xAAD372,
    "Mage": 0x3FC7EB,
    "Paladin": 0xF48CBA,
    "Priest": 0xFFFFFF,
    "Rogue": 0xFFF468,
    "Shaman": 0x0070DD,
    "Warlock": 0x8788EE,
    "Warrior": 0xC69B6D,
}

QUALITY_RANK = {"POOR": 0, "COMMON": 1, "UNCOMMON": 2, "RARE": 3, "EPIC": 4, "LEGENDARY": 5, "ARTIFACT": 6}
DAYS = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]

DEFAULT_SETTINGS = {
    "news_feed": True,  # official Blizzard posts about Forever to DISCORD_NEWS_WEBHOOK_URL
    "max_level": 60,
    "track_levels": True,
    "track_professions": True,
    "profession_milestones": [75, 150, 225, 300],
    "track_dungeons": True,
    "track_raids": True,
    "track_achievements": True,
    "track_gear": True,
    "track_mounts": True,
    "track_reputation": True,
    "reputation_milestones": ["Honored", "Revered", "Exalted"],
    "weekly_recap": True,
    "recap_day": "sunday",
    "recap_hour": 19,
    "timezone": "America/Los_Angeles",
    "class_emojis": {},
    # --- guild bot additions
    "milestone_levels": [30, 40, 50, 60],
    "epic_riding_skill": 150,          # Classic: 75 = 60% mount, 150 = epic (100%) mount
    "first_riding_skill": 75,          # first mount
    "ilvl_milestones": [40, 50, 60, 70],
    "inactive_days": 7,                # officers-only nudge list threshold
    "epic_mount_names": ["Swift "],    # substrings that mark a mount as epic, in addition to Riding
    "hype_ping_role_id": "",           # Discord role id to ping on hype posts; blank = no ping
    "hype_events": ["milestone", "max_level", "epic_mount", "first_mount", "guild_first", "guild_join"],
    "guild_first_min_tracked": 3,
    "roster_board": True,
    "announce_guild_changes": True,
}

GUILD_DEFAULTS = {"slug": "", "region": "us", "min_level": 1, "ranks": None}


# ---------------------------------------------------------------- HTTP

def http(method, url, headers=None, data=None, timeout=20):
    """Return (status, parsed JSON or None). Network failures raise."""
    req = urllib.request.Request(
        url,
        data=data,
        method=method,
        headers={"User-Agent": USER_AGENT, **(headers or {})},
    )
    try:
        with urllib.request.urlopen(req, timeout=timeout) as resp:
            body = resp.read()
            return resp.status, (json.loads(body) if body else None)
    except urllib.error.HTTPError as err:
        body = err.read()
        try:
            parsed = json.loads(body) if body else None
        except ValueError:
            parsed = None
        return err.code, parsed


# ---------------------------------------------------------------- Blizzard

def get_token(client_id, client_secret):
    auth = base64.b64encode(f"{client_id}:{client_secret}".encode()).decode()
    status, body = http(
        "POST",
        "https://oauth.battle.net/token",
        {
            "Authorization": f"Basic {auth}",
            "Content-Type": "application/x-www-form-urlencoded",
        },
        b"grant_type=client_credentials",
    )
    if status != 200 or not body or "access_token" not in body:
        sys.exit(f"Could not get a Battle.net token (HTTP {status}). "
                 "Check BLIZZARD_CLIENT_ID and BLIZZARD_CLIENT_SECRET.")
    return body["access_token"]


def api_get(region, path, token, namespace):
    query = urllib.parse.urlencode({"namespace": namespace, "locale": "en_US"})
    url = f"https://{region}.api.blizzard.com{path}?{query}"
    return http("GET", url, {"Authorization": f"Bearer {token}"})


def guild_slug(name):
    """'WoW Forever' -> 'wow-forever'. A ready-made slug passes through unchanged."""
    s = re.sub(r"[^a-z0-9]+", "-", (name or "").strip().lower()).strip("-")
    return s


def fetch_guild_roster(guild, token):
    """
    Characters in the guild from Blizzard's roster endpoint, as
    [{"name", "surname", "rank", "level", "class", "guild": True}], or None
    if the roster isn't available (wrong slug, API down).
    Forever guilds are realmless: /data/wow/guild/{slug}/roster.
    """
    slug = guild_slug(guild.get("slug") or guild.get("name"))
    if not slug:
        return None
    region = (guild.get("region") or "us").lower()
    namespace = os.environ.get("PROFILE_NAMESPACE") or f"profile-forever-{region}"
    status, body = api_get(region, f"/data/wow/guild/{slug}/roster", token, namespace)
    if status != 200 or not isinstance(body, dict):
        print(f"[warn] guild roster {slug}: HTTP {status}")
        return None
    wanted_ranks = guild.get("ranks")
    min_level = int(guild.get("min_level") or 1)
    out = []
    for m in body.get("members") or []:
        ch = m.get("character") or {}
        name = ch.get("name")
        if not name:
            continue
        rank = m.get("rank")
        if wanted_ranks is not None and rank not in wanted_ranks:
            continue
        if (ch.get("level") or 0) < min_level:
            continue
        # Forever rosters carry "surname" (and sometimes a ready slug); keep both.
        surname = ch.get("surname")
        if not surname and ch.get("slug") and "-" in ch["slug"]:
            surname = ch["slug"].split("-", 1)[1].replace("-", " ").title()
        out.append({
            "name": name,
            "surname": surname,
            "rank": rank,
            "level": ch.get("level"),
            "class": name_of(ch.get("playable_class")),
            "region": region,
            "guild": True,
        })
    return out


def name_of(obj):
    """Blizzard objects carry a name that is a string, or a locale map."""
    if not isinstance(obj, dict):
        return None
    name = obj.get("name")
    if isinstance(name, dict):
        return name.get("en_US") or next(iter(name.values()), None)
    return name


def char_slug(c):
    parts = [c["name"]] + ([c["surname"]] if c.get("surname") else [])
    return "-".join(urllib.parse.quote(p.strip().lower(), safe="") for p in parts)


def candidate_paths(c):
    """Paths to try, most likely first. 'api_path' in the config overrides."""
    if c.get("api_path"):
        return [c["api_path"]]
    slug = char_slug(c)
    paths = [f"/profile/wow/character/{slug}"]  # Forever's realmless form
    if c.get("realm"):
        realm = c["realm"].strip().lower().replace("'", "").replace(" ", "-")
        paths.append(f"/profile/wow/character/{realm}/{slug}")
    return paths


# ---------------------------------------------------------------- Parsing
# Each parser turns an API response into a plain dict that is saved in
# state.json and compared run to run. A parser returns None when the data
# isn't available, so that feature is skipped rather than misreported.

def parse_professions(body):
    """{profession name: highest skill} for primary and secondary professions."""
    if not isinstance(body, dict):
        return None
    out = {}
    for group in ("primaries", "secondaries"):
        for item in body.get(group) or []:
            name = name_of(item.get("profession"))
            if not name:
                continue
            skills = [item.get("skill_points")]  # flat (Classic-style) shape
            skills += [t.get("skill_points") for t in item.get("tiers") or []]  # tiered shape
            skills = [s for s in skills if isinstance(s, int)]
            out[name] = max(skills) if skills else 0
    return out


def parse_recipes(body):
    """{profession name: [{"id", "name"}, ...]} of known recipes, when the API lists them."""
    if not isinstance(body, dict):
        return None
    out = {}
    for group in ("primaries", "secondaries"):
        for item in body.get(group) or []:
            name = name_of(item.get("profession"))
            if not name:
                continue
            known = []
            for t in item.get("tiers") or []:
                for r in t.get("known_recipes") or []:
                    if r.get("id") and r.get("name"):
                        known.append({"id": r["id"], "name": r["name"]})
            out[name] = known
    return out


PROF_ICON = {"Alchemy": "⚗️", "Blacksmithing": "⚒️", "Enchanting": "🔮", "Engineering": "⚙️", "Leatherworking": "🧤",
             "Tailoring": "🧵", "Mining": "⛏️", "Herbalism": "🌿", "Skinning": "🔪", "Cooking": "🍖", "First Aid": "🩹", "Fishing": "🎣"}
GATHERING = {"mining", "herbalism", "skinning"}


def skill_tier(skill):
    return "Artisan" if skill >= 225 else "Expert" if skill >= 150 else "Journeyman" if skill >= 75 else "Apprentice"


def skill_bar(skill, cap=300, width=6):
    filled = max(0, min(width, round(skill / cap * width)))
    return "▰" * filled + "▱" * (width - filled)


def parse_encounters(body):
    """
    {instance name: {"cleared": bool, "bosses": [names killed]}} from an
    encounters response. Modes (normal/heroic) are merged: an instance counts
    as cleared if any mode is fully done, and a boss counts if killed in any mode.
    """
    if not isinstance(body, dict):
        return None
    out = {}
    for exp in body.get("expansions") or []:
        for inst in exp.get("instances") or []:
            name = name_of(inst.get("instance"))
            if not name:
                continue
            entry = out.setdefault(name, {"cleared": False, "bosses": set()})
            for mode in inst.get("modes") or []:
                progress = mode.get("progress") or {}
                done, total = progress.get("completed_count"), progress.get("total_count")
                status = ((mode.get("status") or {}).get("type") or "").upper()
                if status == "COMPLETE" or (isinstance(done, int) and isinstance(total, int) and total > 0 and done >= total):
                    entry["cleared"] = True
                for enc in progress.get("encounters") or []:
                    if (enc.get("completed_count") or 0) > 0:
                        boss = name_of(enc.get("encounter"))
                        if boss:
                            entry["bosses"].add(boss)
    return {k: {"cleared": v["cleared"], "bosses": sorted(v["bosses"])} for k, v in out.items()}


def parse_achievements(body):
    """{achievement id: name} for completed achievements."""
    if not isinstance(body, dict):
        return None
    done = {}
    for item in body.get("achievements") or []:
        if item.get("completed_timestamp"):
            done[str(item.get("id"))] = name_of(item.get("achievement")) or "an achievement"
    return done


def parse_equipment(body):
    """{item id: {"name", "quality", "slot"}} for blue-or-better items currently equipped."""
    if not isinstance(body, dict):
        return None
    out = {}
    for it in body.get("equipped_items") or []:
        quality = ((it.get("quality") or {}).get("type") or "").upper()
        if QUALITY_RANK.get(quality, 0) < QUALITY_RANK["RARE"]:
            continue
        item_id = str((it.get("item") or {}).get("id") or it.get("name"))
        out[item_id] = {
            "name": it.get("name") or name_of(it) or "an item",
            "quality": quality,
            "slot": (it.get("slot") or {}).get("name") or "",
        }
    return out


def parse_mounts(body):
    """{mount id: name} for mounts the account has collected."""
    if not isinstance(body, dict):
        return None
    out = {}
    for m in body.get("mounts") or []:
        mount = m.get("mount") or {}
        if mount.get("id") is not None:
            out[str(mount["id"])] = name_of(mount) or "a mount"
    return out


BOSS_KILL_STAT = re.compile(r"^(?P<boss>.+?)\s+kills\s*\((?P<instance>.+)\)\s*$", re.IGNORECASE)


def parse_boss_kills(body):
    """
    {statistic id: {"boss", "instance", "count"}} for every boss the character
    has killed at least once, read from the "Boss Kills" statistics
    (e.g. "Bazzalan kills (Ragefire Chasm)"). Forever doesn't fill in the
    dungeon/raid encounter data, but it does keep these kill counts.
    """
    if not isinstance(body, dict):
        return None
    out = {}

    def walk(categories, in_boss_kills=False):
        for cat in categories or []:
            boss_cat = in_boss_kills or "boss kills" in (name_of(cat) or "").lower()
            for stat in cat.get("statistics") or []:
                qty = stat.get("quantity") or 0
                match = BOSS_KILL_STAT.match(name_of(stat) or "")
                if qty > 0 and match and (boss_cat or "kills (" in (name_of(stat) or "").lower()):
                    out[str(stat.get("id"))] = {
                        "boss": match.group("boss").strip(),
                        "instance": match.group("instance").strip(),
                        "count": int(qty),
                    }
            walk(cat.get("sub_categories"), boss_cat)

    walk(body.get("categories"))
    return out


def norm(text):
    return re.sub(r"[^a-z0-9]", "", (text or "").lower())


class Dungeons:
    """Final bosses from dungeons.json: a final-boss kill counts as a dungeon clear."""

    def __init__(self, data=None):
        data = data or {}
        self.final = {}      # normalized final boss name -> dungeon name
        self.unknown = set()  # normalized dungeon names whose final boss isn't known yet
        self.known = set()   # normalized names of every listed dungeon
        for d in data.get("dungeons") or []:
            self.known.add(norm(d["name"]))
            if d.get("final_boss"):
                self.final[norm(d["final_boss"])] = d["name"]
            else:
                self.unknown.add(norm(d["name"]))
        self.ignore = {str(i) for i in data.get("ignore_stat_ids") or []}

    def classify(self, kill):
        """('clear', dungeon) | ('boss', None) to post a boss kill | (None, None) to stay quiet."""
        dungeon = self.final.get(norm(kill["boss"]))
        if dungeon:
            return "clear", dungeon
        instance = norm(kill["instance"])
        if instance in self.unknown or any(instance and (instance in k or k in instance) for k in self.unknown):
            return "boss", None   # new dungeon with an unknown final boss: show every boss
        if instance in self.known or any(instance and (instance in k or k in instance) for k in self.known):
            return None, None     # a known dungeon's earlier boss: not reliable in Forever, skip
        return "boss", None       # raids and anything unlisted


DUNGEONS = Dungeons()


def cleared_dungeons(snap):
    """Names of dungeons this character has cleared (killed the final boss)."""
    out = set()
    for sid, kill in (snap.get("boss_kills") or {}).items():
        kind, dungeon = DUNGEONS.classify(kill)
        if kind == "clear" and sid not in DUNGEONS.ignore:
            out.add(dungeon)
    return sorted(out)


# Statistics the weekly recap compares (Blizzard statistic id -> our name).
RECAP_STATS = {
    "60": "deaths", "98": "quests", "107": "mobs", "108": "critters",
    "1487": "killing_blows", "353": "hearths", "349": "flights",
    "345": "health_potions", "922": "mana_potions", "346": "drinks", "347": "food",
    "1044": "need_rolls", "588": "honorable_kills",
}


def parse_statistics(body):
    """
    ({recap stat name: value}, {boss kills}) from one statistics response.
    Blizzard leaves out statistics that are still zero.
    """
    if not isinstance(body, dict):
        return None, None
    stats = {}

    def walk(categories):
        for cat in categories or []:
            for stat in cat.get("statistics") or []:
                name = RECAP_STATS.get(str(stat.get("id")))
                if name and isinstance(stat.get("quantity"), (int, float)):
                    stats[name] = int(stat["quantity"])
            walk(cat.get("sub_categories"))

    walk(body.get("categories"))
    return stats, parse_boss_kills(body)


def parse_avatar(body):
    """Portrait URL from /character-media (assets key 'avatar', else the old avatar_url)."""
    if not isinstance(body, dict):
        return None
    for a in body.get("assets") or []:
        if a.get("key") == "avatar" and a.get("value"):
            return a["value"]
    return body.get("avatar_url")


# Classic spec -> raid role. Anything not listed is DPS.
TANK_SPECS = {("Warrior", "Protection"), ("Paladin", "Protection"), ("Druid", "Feral Combat"), ("Druid", "Feral"), ("Druid", "Guardian")}
HEAL_SPECS = {("Priest", "Holy"), ("Priest", "Discipline"), ("Paladin", "Holy"), ("Shaman", "Restoration"), ("Druid", "Restoration")}
CLASS_ICON = {"Warrior": "⚔️", "Paladin": "🛡️", "Hunter": "🏹", "Rogue": "🗡️", "Priest": "✨",
              "Shaman": "⚡", "Mage": "🔮", "Warlock": "💀", "Druid": "🐻"}


def raid_role(snap):
    key = (snap.get("class"), snap.get("spec"))
    if key in TANK_SPECS:
        return "Tank"
    if key in HEAL_SPECS:
        return "Healer"
    return "DPS"


def ordinal(n):
    return f"{n}{'th' if 10 <= n % 100 <= 20 else {1: 'st', 2: 'nd', 3: 'rd'}.get(n % 10, 'th')}"


def human_duration(seconds):
    seconds = int(seconds)
    d, rem = divmod(seconds, 86400)
    h, rem = divmod(rem, 3600)
    m = rem // 60
    if d:
        return f"{d}d {h}h"
    if h:
        return f"{h}h {m}m"
    return f"{m}m"


def parse_spec(body):
    """Name of the active talent specialization, e.g. "Protection"."""
    if not isinstance(body, dict):
        return None
    for group in body.get("specialization_groups") or []:
        if group.get("is_active"):
            for spec in group.get("specializations") or []:
                name = spec.get("specialization_name") or name_of(spec.get("specialization"))
                if name:
                    return name
    return None


def parse_reputations(body):
    """{faction name: {"tier": n, "name": "Honored"}}. Higher tier = better standing."""
    if not isinstance(body, dict):
        return None
    out = {}
    for r in body.get("reputations") or []:
        faction = name_of(r.get("faction"))
        standing = r.get("standing") or {}
        if faction and isinstance(standing.get("tier"), int):
            out[faction] = {"tier": standing["tier"], "name": standing.get("name") or "",
                            "raw": standing.get("raw") if isinstance(standing.get("raw"), int) else None}
    return out


def fetch_snapshot(c, region, token, namespace, settings):
    """Return the character's current snapshot, or None if Blizzard has no data."""
    for path in candidate_paths(c):
        status, body = api_get(region, path, token, namespace)
        if status in (401, 403):
            raise RuntimeError(
                f"Blizzard refused the request (HTTP {status}) for {path} in "
                f"namespace {namespace}. The namespace may be wrong or not public yet."
            )
        if status != 200 or not isinstance(body, dict):
            continue

        snap = {
            "level": body.get("level"),
            "class": name_of(body.get("character_class")),
            "race": name_of(body.get("race")),
            "xp": body.get("experience") if isinstance(body.get("experience"), int) else 0,
            "last_login": body.get("last_login_timestamp"),
            "ilvl": body.get("average_item_level") or body.get("equipped_item_level"),
        }

        def sub(suffix, parser):
            s, b = api_get(region, f"{path}{suffix}", token, namespace)
            return parser(b) if s == 200 else None

        snap["avatar"] = sub("/character-media", parse_avatar)

        if settings["track_professions"]:
            ps, pb = api_get(region, f"{path}/professions", token, namespace)
            snap["professions"] = parse_professions(pb) if ps == 200 else None
            snap["recipes"] = parse_recipes(pb) if ps == 200 else None
        if settings["track_dungeons"]:
            snap["dungeons"] = sub("/encounters/dungeons", parse_encounters)
        if settings["track_raids"]:
            snap["raids"] = sub("/encounters/raids", parse_encounters)
        if settings["track_achievements"]:
            snap["achievements"] = sub("/achievements", parse_achievements)
        s_status, s_body = api_get(region, f"{path}/achievements/statistics", token, namespace)
        stats, kills = parse_statistics(s_body) if s_status == 200 else (None, None)
        snap["stats"] = stats
        if settings["track_dungeons"] or settings["track_raids"]:
            snap["boss_kills"] = kills
        snap["spec"] = sub("/specializations", parse_spec)
        if settings["track_gear"]:
            snap["_equipped"] = sub("/equipment", parse_equipment)
        if settings["track_mounts"]:
            snap["_mounts"] = sub("/collections/mounts", parse_mounts)
        if settings["track_reputation"]:
            snap["reputations"] = sub("/reputations", parse_reputations)
        return snap
    return None


# ---------------------------------------------------------------- Changes

def armory_url(c, region="us"):
    """The character's page on Blizzard's WoW: Forever Armory."""
    region = (c.get("region") or region).lower()
    return f"https://worldofwarcraft.blizzard.com/en-us/forever/{region}/armory/character/{char_slug(c)}"


def display_name(c):
    """Full character name, e.g. "Hefe Weizenson"."""
    return " ".join(p for p in (c["name"], c.get("surname")) if p)


def find_changes(key, old, new, settings, group, hype=None):
    """
    Lines describing what changed between two snapshots. `hype`, if given,
    is a list that collects (event, text) for the big moments so the caller
    can post them loud (role ping, gold card) instead of silent.
    """
    lines = []
    hype = hype if hype is not None else []
    max_level = settings["max_level"]
    milestones = set(settings.get("milestone_levels") or [])

    # Levels
    level, old_level = new.get("level") or 0, old.get("level") or 0
    if settings["track_levels"] and level > old_level:
        if level >= max_level > old_level and not group.get("first_to_max"):
            group["first_to_max"] = key
            lines.append(f"First in the guild to **{max_level}**")
            hype.append(("max_level", {"level": max_level, "key": key, "first": True}))
        elif level >= max_level > old_level:
            lines.append(f"Reached **{max_level}**")
            hype.append(("max_level", {"level": max_level, "key": key}))
        else:
            crossed = sorted(m for m in milestones if old_level < m <= level and m < max_level)
            if crossed:
                big = crossed[-1]
                lines.append(f"Reached **{big}**" + (f" (now {level})" if level != big else ""))
                hype.append(("milestone", {"level": big, "key": key}))
            # Ordinary level-ups below the first milestone are not posted; the
            # roster board shows current levels, and the digest stays quiet.

    # Professions
    old_p, new_p = old.get("professions"), new.get("professions")
    if old_p is not None and new_p is not None:
        epic_riding = int(settings.get("epic_riding_skill") or 0)
        for prof, skill in sorted(new_p.items()):
            if prof not in old_p:
                first_riding = int(settings.get("first_riding_skill") or 0)
                if prof.lower() == "riding" and skill >= epic_riding > 0:
                    lines.append(f"Epic riding ({skill})")
                    hype.append(("epic_mount", {"riding": skill}))
                elif prof.lower() == "riding" and first_riding and skill >= first_riding:
                    lines.append(f"Learned riding ({skill})")
                    hype.append(("first_mount", {"riding": skill}))
                else:
                    lines.append(f"📜 Learned **{prof}**")
                continue
            if prof.lower() == "riding" and epic_riding and old_p[prof] < epic_riding <= skill:
                lines.append(f"Epic riding ({skill})")
                hype.append(("epic_mount", {"riding": skill}))
                continue
            first_riding = int(settings.get("first_riding_skill") or 0)
            if prof.lower() == "riding" and first_riding and old_p[prof] < first_riding <= skill:
                lines.append(f"Learned riding ({skill})")
                hype.append(("first_mount", {"riding": skill}))
                continue
            crossed = [m for m in settings["profession_milestones"] if old_p[prof] < m <= skill]
            if crossed:
                lines.append(f"🛠️ **{prof}** reached {max(crossed)} skill")

    # Item level
    old_i, new_i = old.get("ilvl") or 0, new.get("ilvl") or 0
    if new_i > old_i:
        crossed = [m for m in (settings.get("ilvl_milestones") or []) if old_i < m <= new_i]
        if crossed:
            lines.append(f"Item level **{max(crossed)}**")

    # Dungeons
    old_d, new_d = old.get("dungeons"), new.get("dungeons")
    if old_d is not None and new_d is not None:
        for inst, info in sorted(new_d.items()):
            if info["cleared"] and not (old_d.get(inst) or {}).get("cleared"):
                lines.append(f"🗝️ Cleared **{inst}** for the first time")
                hype.append(("clear", inst))

    # Raids
    old_r, new_r = old.get("raids"), new.get("raids")
    if old_r is not None and new_r is not None:
        for inst, info in sorted(new_r.items()):
            before = old_r.get(inst) or {"cleared": False, "bosses": []}
            if info["cleared"] and not before["cleared"]:
                lines.append(f"🐉 Full clear of **{inst}**!")
                hype.append(("raid_clear", inst))
            else:
                for boss in info["bosses"]:
                    if boss not in before["bosses"]:
                        lines.append(f"⚔️ First kill: **{boss}** ({inst})")
                        hype.append(("boss", f"{boss} ({inst})"))

    # Boss kills, from the boss-kill statistics. A dungeon's final boss posts
    # as a clear; raid bosses (and bosses in new dungeons whose final boss
    # isn't known yet) post as first kills. Mislabeled stats are skipped.
    new_k = new.get("boss_kills")
    if new_k is not None:
        old_k = old.get("boss_kills") or {}
        already = set(cleared_dungeons(old))
        for sid in sorted(new_k, key=lambda k: (new_k[k]["instance"], new_k[k]["boss"])):
            if sid in old_k or sid in DUNGEONS.ignore:
                continue
            kind, dungeon = DUNGEONS.classify(new_k[sid])
            if kind == "clear" and dungeon not in already:
                lines.append(f"🗝️ Cleared **{dungeon}** for the first time")
                hype.append(("clear", dungeon))
                already.add(dungeon)
            elif kind == "boss":
                lines.append(f"⚔️ First kill: **{new_k[sid]['boss']}** ({new_k[sid]['instance']})")
                hype.append(("boss", f"{new_k[sid]['boss']} ({new_k[sid]['instance']})"))

    # Reputation: post when a faction reaches a milestone standing (Honored,
    # Revered, Exalted by default). Characters tracked before this feature
    # existed record their current standings quietly.
    old_rep, new_rep = old.get("reputations"), new.get("reputations")
    if old_rep is not None and new_rep is not None:
        wanted = {m.lower() for m in settings["reputation_milestones"]}
        for faction, now in sorted(new_rep.items(), key=lambda kv: (-kv[1]["tier"], kv[0])):
            before = (old_rep.get(faction) or {}).get("tier", 3)  # unseen faction = Neutral
            if now["tier"] > before and now["name"].lower() in wanted:
                icon = "👑" if now["name"].lower() == "exalted" else "🤝"
                lines.append(f"{icon} Reached **{now['name']}** with {faction}")

    # Achievements
    old_a, new_a = old.get("achievements"), new.get("achievements")
    if old_a is not None and new_a is not None:
        for aid, name in sorted(new_a.items(), key=lambda kv: int(kv[0]) if kv[0].isdigit() else 0):
            if aid not in old_a:
                lines.append(f"🎖️ {name}")

    # Gear: every new epic/legendary, and the character's first blue.
    # "gear" in the snapshot is every blue+ item ever seen equipped, so
    # swapping an item off and back on doesn't post it twice.
    old_g, equipped = old.get("gear"), new.get("_equipped")
    if old_g is not None and equipped is not None:
        had_blue = bool(old_g)
        for item_id, it in sorted(equipped.items(), key=lambda kv: -QUALITY_RANK.get(kv[1]["quality"], 0)):
            if item_id in old_g:
                continue
            slot = f" ({it['slot']})" if it["slot"] else ""
            if QUALITY_RANK.get(it["quality"], 0) >= QUALITY_RANK["EPIC"]:
                icon = "🟠" if it["quality"] == "LEGENDARY" else "🟣"
                lines.append(f"{icon} Equipped **{it['name']}**{slot}")
            elif not had_blue:
                lines.append(f"🔵 First blue: **{it['name']}**{slot}")
                had_blue = True

    return lines


def merge_gear(old, new):
    """Fold this run's equipped blue+ items into the character's 'ever seen' list."""
    seen = dict((old or {}).get("gear") or {})
    equipped = new.pop("_equipped", None)
    if equipped is None:
        if old and old.get("gear") is not None:
            new["gear"] = old["gear"]
        return
    for item_id, it in equipped.items():
        seen.setdefault(item_id, {"name": it["name"], "quality": it["quality"]})
    new["gear"] = seen


def keep_baselines(old, new):
    """If a feature failed to load this run, keep last run's data for it."""
    for field in ("professions", "recipes", "dungeons", "raids", "achievements", "boss_kills", "reputations",
                  "stats", "spec", "avatar", "last_login", "ilvl", "level_at", "first_seen"):
        if new.get(field) is None and old and old.get(field) is not None:
            new[field] = old[field]
    # Levels never go down. A lower or missing level is a bad read; keeping the
    # old one stops the next good read from announcing the same ding twice.
    if old and (new.get("level") or 0) < (old.get("level") or 0):
        new["level"] = old["level"]
        new["xp"] = old.get("xp", new.get("xp"))
    return new


def emoji_image_url(snap, settings):
    """Image address of the character's class emoji, e.g. for a card's author icon."""
    code = (settings.get("class_emojis") or {}).get((snap.get("class") or "").lower()) or ""
    match = re.match(r"<a?:\w+:(\d+)>", code)
    return f"https://cdn.discordapp.com/emojis/{match.group(1)}.png" if match else None


def describe_char(c, snap):
    """'Level 41 Night Elf Arms Warrior · Officer'."""
    bits = " ".join(str(x) for x in (snap.get("race"), snap.get("spec"), snap.get("class")) if x)
    text = f"Level {snap.get('level') or '?'} {bits}".strip()
    if c.get("owner"):
        text += f" · {c['owner']}"
    elif c.get("rank_name"):
        text += f" · {c['rank_name']}"
    return text


def character_embed(c, snap, lines, settings=None, hype=False):
    """Quiet per-character card (used for catch-up posts and the 'now tracked' card)."""
    if len(lines) > 25:  # keep long catch-up posts readable
        lines = lines[:24] + [f"…and {len(lines) - 24} more"]
    author = {"name": display_name(c), "url": armory_url(c)}
    icon = snap.get("avatar") or emoji_image_url(snap, settings or {})
    if icon:
        author["icon_url"] = icon
    return {
        "author": author,
        "description": "\n".join(lines),
        "color": CLASS_COLORS.get(snap.get("class"), DEFAULT_COLOR),
        "footer": {"text": describe_char(c, snap)},
    }


def digest_embed(items, settings):
    """
    One card per run for everything that is not a milestone. items =
    [(c, snap, lines)]. Each character is a field; the footer counts updates.
    """
    fields = []
    for c, snap, lines in items[:25]:
        icon = CLASS_ICON.get(snap.get("class") or "", "")
        name = f"{icon} {display_name(c)} · {snap.get('level') or '?'}".strip()
        fields.append({"name": name[:256], "value": "\n".join(lines)[:1024], "inline": False})
    n = sum(len(l) for _, _, l in items)
    extra = f" · {len(items) - 25} more characters not shown" if len(items) > 25 else ""
    return {
        "title": "Progress",
        "color": DEFAULT_COLOR,
        "fields": fields,
        "footer": {"text": f"{n} update{'s' if n != 1 else ''} · {len(items)} character{'s' if len(items) != 1 else ''}{extra}"},
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }


def milestone_embed(c, snap, event, detail, group, state_char, settings, now_ts):
    """
    A single milestone card: Level 40 / Level 60 / First to 60 / Epic Mount.
    Looks like an app notification: portrait, one headline, two facts.
    """
    name = display_name(c)
    cls = snap.get("class") or ""
    color = CLASS_COLORS.get(cls, DEFAULT_COLOR)
    fields = []
    if event in ("milestone", "max_level"):
        level = detail["level"]
        order = group.setdefault("milestone_order", {}).setdefault(str(level), [])
        key = detail["key"]
        if key not in order:
            order.append(key)
        place = order.index(key) + 1
        title = f"Level {level}"
        if detail.get("first"):
            title = f"First to {level}"
            color = HYPE_COLOR
        elif level >= settings["max_level"]:
            color = HYPE_COLOR
        headline = f"**{name}** reached level **{level}**."
        fields.append({"name": "Guild", "value": f"{ordinal(place)} to get there", "inline": True})
        # time since the previous milestone we saw, else since first tracked
        level_at = state_char.get("level_at") or {}
        prev_levels = sorted(int(k) for k in level_at if int(k) < level)
        since_label, since_ts = None, None
        for pl in reversed(prev_levels):
            if pl in (settings.get("milestone_levels") or []):
                since_label, since_ts = f"since {pl}", level_at[str(pl)]
                break
        if since_ts is None and state_char.get("first_seen"):
            since_label, since_ts = "since first tracked", state_char["first_seen"]
        if since_ts:
            fields.append({"name": "Time", "value": f"{human_duration(now_ts - since_ts)} {since_label}", "inline": True})
    elif event == "epic_mount":
        title = "Epic Mount"
        color = HYPE_COLOR
        headline = f"**{name}** has an epic mount." + (f" {detail['mount']}." if detail.get("mount") else "")
        if detail.get("riding"):
            fields.append({"name": "Riding", "value": str(detail["riding"]), "inline": True})
        fields.append({"name": "Level", "value": str(snap.get("level") or "?"), "inline": True})
    elif event == "first_mount":
        title = "First Mount"
        headline = f"**{name}** learned to ride."
        order = group.setdefault("milestone_order", {}).setdefault("mount", [])
        key = f"{cls}:{name}"
        if key not in order:
            order.append(key)
        fields.append({"name": "Guild", "value": f"{ordinal(order.index(key) + 1)} to get there", "inline": True})
        fields.append({"name": "Level", "value": str(snap.get("level") or "?"), "inline": True})
    elif event == "guild_first":
        kind = detail.get("kind", "dungeon")
        title = {"dungeon": "Guild First: Dungeon", "boss": "Guild First: Boss Kill", "raid": "Guild First: Raid Clear"}.get(kind, "Guild First")
        color = HYPE_COLOR
        verb = {"dungeon": "cleared", "boss": "killed", "raid": "cleared"}.get(kind, "did")
        names = detail.get("names") or [name]
        who = ("**" + "**, **".join(names[:-1]) + "** and **" + names[-1] + "**") if len(names) > 1 else f"**{names[0]}**"
        headline = f"{who} {'are' if len(names) > 1 else 'is'} the first in the guild recorded to have {verb} **{detail['what']}**."
    else:
        title, headline = "Milestone", f"**{name}**: {detail}"
    embed = {
        "title": title,
        "description": headline,
        "color": color,
        "fields": fields,
        "footer": {"text": describe_char(c, snap)},
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "url": armory_url(c),
    }
    if snap.get("avatar"):
        embed["thumbnail"] = {"url": snap["avatar"]}
    return embed


# ---------------------------------------------------------------- Roster board

ROSTER_CLASS_ORDER = ["Warrior", "Paladin", "Hunter", "Rogue", "Priest", "Shaman", "Mage", "Warlock", "Druid"]


SECONDARY_PROFS = {"riding", "first aid", "cooking", "fishing"}


def activity_dot(last_login_ms, now_ts):
    """Green: played in the last 2 days. Yellow: last week. Grey: longer or unknown."""
    if not last_login_ms:
        return "⚪"
    age = now_ts - last_login_ms / 1000
    return "🟢" if age < 2 * 86400 else "🟡" if age < 7 * 86400 else "⚫"


def level_bar(levels, max_level):
    """'1-29 ▇▇ 2 · 30-49 ▇▇▇▇ 4 · 50-59 ▇ 1 · 60 ▇▇▇ 3'."""
    bands = [("1-29", lambda l: l < 30), ("30-49", lambda l: 30 <= l < 50),
             ("50-59", lambda l: 50 <= l < max_level), (str(max_level), lambda l: l >= max_level)]
    parts = []
    for label, test in bands:
        n = sum(1 for l in levels if test(l))
        parts.append(f"{label} {'▇' * n if n else '·'} {n}")
    return "  ".join(parts)


def build_roster_board(entries, settings, max_level):
    """
    The roster embed: headline numbers, raid composition, level spread, then
    one field per class. `entries` is [(character config, snapshot)].
    Edited in place in Discord so #roster always shows the current guild.
    """
    now_ts = time.time()
    by_class = {}
    for c, snap in entries:
        by_class.setdefault(snap.get("class") or "Unknown", []).append((c, snap))
    snaps = [s for _, s in entries]
    levels = [s.get("level") or 0 for s in snaps]
    total = len(entries)
    capped = sum(1 for l in levels if l >= max_level)
    avg = round(sum(levels) / total) if total else 0
    roles = {"Tank": 0, "Healer": 0, "DPS": 0}
    for s in snaps:
        roles[raid_role(s)] += 1
    active = sum(1 for s in snaps if activity_dot(s.get("last_login"), now_ts) == "🟢")

    desc = [
        f"**{total}** {'character' if total == 1 else 'characters'} · average level **{avg}** · **{capped}** at {max_level} · **{active}** played in the last 2 days",
        f"Raid comp: **{roles['Tank']}** tank{'s' if roles['Tank'] != 1 else ''} · **{roles['Healer']}** healer{'s' if roles['Healer'] != 1 else ''} · **{roles['DPS']}** dps",
        f"`{level_bar(levels, max_level)}`",
    ]

    fields = []
    order = ROSTER_CLASS_ORDER + sorted(k for k in by_class if k not in ROSTER_CLASS_ORDER)
    for cls in order:
        rows = by_class.get(cls)
        if not rows:
            continue
        rows.sort(key=lambda cs: (-(cs[1].get("level") or 0), display_name(cs[0])))
        lines = []
        for c, s in rows:
            dot = activity_dot(s.get("last_login"), now_ts)
            lvl = s.get("level") or "?"
            bits = [f"{dot} **{lvl}** [{display_name(c)}]({armory_url(c)})"]
            if s.get("spec"):
                bits.append(s["spec"])
            if s.get("ilvl"):
                bits.append(f"ilvl {s['ilvl']}")
            if c.get("rank_name"):
                bits.append(c["rank_name"])
            lines.append(" · ".join(bits))
        emoji = (settings.get("class_emojis") or {}).get(cls.lower()) or CLASS_ICON.get(cls, "")
        fields.append({"name": f"{emoji} {cls} · {len(rows)}".strip(), "value": "\n".join(lines)[:1024], "inline": False})
    return {
        "title": "Roster",
        "description": "\n".join(desc),
        "color": ROSTER_COLOR,
        "fields": fields[:25],
        "footer": {"text": "🟢 last 2 days · 🟡 last week · ⚫ longer · updates about every 15 min"},
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }


def build_professions_board(entries, settings):
    """
    Who crafts what, as up to three embeds: Crafting, Gathering, Secondary.
    Each crafter line: activity dot, name (armory link), skill bar, skill, tier, recipe count.
    """
    now_ts = int(time.time())
    crafting, gathering, secondary = {}, {}, {}
    for c, snap in entries:
        for prof, skill in (snap.get("professions") or {}).items():
            if not skill or skill < 1 or prof.lower() == "riding":
                continue
            bucket = secondary if prof.lower() in SECONDARY_PROFS else gathering if prof.lower() in GATHERING else crafting
            n_recipes = len(((snap.get("recipes") or {}).get(prof)) or [])
            bucket.setdefault(prof, []).append((skill, display_name(c), c, activity_dot(snap.get("last_login"), now_ts), n_recipes))

    def line(skill, name, c, dot, n):
        tail = f" · {n} recipes" if n else ""
        return f"{dot} **[{name}]({armory_url(c)})** {skill_bar(skill)} {skill} {skill_tier(skill)}{tail}"

    def fields_for(bucket):
        out = []
        for prof in sorted(bucket):
            rows = sorted(bucket[prof], key=lambda r: -r[0])
            out.append({"name": f"{PROF_ICON.get(prof, '')} {prof} · {len(rows)}".strip(),
                        "value": "\n".join(line(*r) for r in rows)[:1024], "inline": False})
        return out[:25]

    stamp = datetime.now(timezone.utc).isoformat()
    embeds = []
    missing = [display_name(c) for c, s in entries if not any(
        p.lower() not in SECONDARY_PROFS and v for p, v in (s.get("professions") or {}).items())]
    desc = "Need something made? Type /need and the crafters who know it get a ping."
    if missing:
        desc += f"\nNo primary profession yet: {', '.join(missing[:15])}" + (" …" if len(missing) > 15 else "")
    embeds.append({"title": "Crafting", "description": desc, "color": 0x9B59B6,
                   "fields": fields_for(crafting) or [{"name": "Nothing yet", "value": "Crafting professions appear here as people learn them.", "inline": False}]})
    if gathering:
        embeds.append({"title": "Gathering", "color": 0x2ECC71, "fields": fields_for(gathering)})
    if secondary:
        parts = []
        for prof in sorted(secondary):
            rows = sorted(secondary[prof], key=lambda r: -r[0])
            best = rows[0]
            others = " · ".join(f"{r[1]} {r[0]}" for r in rows[1:4])
            parts.append(f"{PROF_ICON.get(prof, '')} **{prof}** {best[3]} [{best[1]}]({armory_url(best[2])}) {best[0]} {skill_tier(best[0])}"
                         + (f"\n{'':6}{others}" if others else ""))
        embeds.append({"title": "Secondary", "description": "\n".join(parts)[:4000], "color": 0x95A5A6})
    embeds[-1]["footer"] = {"text": "🟢 last 2 days · 🟡 last week · ⚫ longer · 300 is max skill · updates about every 15 min"}
    embeds[-1]["timestamp"] = stamp
    return embeds


def upsert_roster_board(webhook, embeds_list, state):
    """Edit the saved roster message if it still exists, else post a fresh one."""
    base = webhook.split("?")[0]
    msg_id = (state.get("roster") or {}).get("message_id")
    payload = json.dumps({"embeds": embeds_list, "allowed_mentions": {"parse": []}}).encode()
    if msg_id:
        status, _ = http("PATCH", f"{base}/messages/{msg_id}", {"Content-Type": "application/json"}, payload)
        if status in (200, 204):
            return msg_id
        print(f"[info] roster message {msg_id} not editable (HTTP {status}); posting a new one")
    status, body = http("POST", f"{base}?wait=true", {"Content-Type": "application/json"},
                        json.dumps({"username": "Guild Bot", "embeds": embeds_list,
                                    "flags": 4096, "allowed_mentions": {"parse": []}}).encode())
    if status not in (200, 204) or not isinstance(body, dict):
        raise RuntimeError(f"Roster board post failed (HTTP {status}): {body}")
    state.setdefault("roster", {})["message_id"] = body.get("id")
    return body.get("id")


# ---------------------------------------------------------------- Weekly recap

def local_zone(settings):
    try:
        from zoneinfo import ZoneInfo
        return ZoneInfo(settings["timezone"])
    except Exception:
        return timezone(timedelta(hours=-8))


def last_recap_time(now, settings):
    """The most recent recap moment (e.g. last Sunday 7 pm local) at or before now."""
    zone = local_zone(settings)
    local = now.astimezone(zone)
    target_day = DAYS.index(settings["recap_day"].strip().lower())
    days_back = (local.weekday() - target_day) % 7
    moment = (local - timedelta(days=days_back)).replace(
        hour=int(settings["recap_hour"]), minute=0, second=0, microsecond=0)
    if moment > local:
        moment -= timedelta(days=7)
    return moment


def recap_summary(snap):
    """The numbers a weekly recap compares, saved as last week's baseline."""
    kills = {}
    for sid, kill in (snap.get("boss_kills") or {}).items():
        if sid in DUNGEONS.ignore:
            continue
        kind, dungeon = DUNGEONS.classify(kill)
        if kind == "clear":
            kills[dungeon] = kills.get(dungeon, 0) + int(kill.get("count") or 0)
    return {
        "level": snap.get("level") or 0,
        "xp": snap.get("xp") or 0,
        "stats": dict(snap.get("stats") or {}),
        "professions": dict(snap.get("professions") or {}),
        "clears": kills,
        "epics": sorted(k for k, v in (snap.get("gear") or {}).items()
                        if QUALITY_RANK.get(v.get("quality"), 0) >= QUALITY_RANK["EPIC"]),
        "rep": {f: r.get("raw") or 0 for f, r in (snap.get("reputations") or {}).items()},
        "achievements": len(snap.get("achievements") or {}),
    }


NEW_CHARACTER_MAX_LEVEL = 12

LAUNCH_BASELINE = {"level": 1, "xp": 0, "stats": {}, "professions": {}, "clears": {},
                   "epics": [], "rep": {}, "achievements": 0}

# Rotating awards: (key, title, unit, how to compute the week's number from now/base summaries)
AWARDS = [
    ("killing_blows", "🗡️ Most Dangerous", ("killing blow", "killing blows"), None),
    ("crafter", "⚒️ Master Crafter", ("profession skill", "profession skill"), None),
    ("hearths", "🏠 Homebody", ("hearth", "hearths"), None),
    ("potions", "🧪 Potion Addict", ("potion", "potions"), None),
    ("need_rolls", "🎲 Need-Roll Ninja", ("need roll", "need rolls"), None),
    ("flights", "✈️ Frequent Flyer", ("flight", "flights"), None),
    ("snacks", "🍖 Snack Break", ("food & drink", "food & drinks"), None),
    ("critters", "🐿️ Critter Menace", ("critter", "critters"), None),
    ("honorable_kills", "⚔️ Gladiator", ("honorable kill", "honorable kills"), None),
    ("rep", "🤝 Diplomat", ("reputation", "reputation"), None),
    ("achievements", "🎖️ Achiever", ("achievement", "achievements"), None),
    ("clears", "🏰 Dungeon Crawler", ("dungeon clear", "dungeon clears"), None),
]


def week_numbers(now_s, base):
    """Everything this character did this week, as {name: amount}."""
    def stat(name):
        return max(0, (now_s["stats"].get(name) or 0) - (base["stats"].get(name) or 0))
    prof_gains = {p: v - (base["professions"].get(p) or 0) for p, v in now_s["professions"].items()}
    clears = {d: n - (base["clears"].get(d) or 0) for d, n in now_s["clears"].items()}
    out = {name: stat(name) for name in RECAP_STATS.values()}
    out.update({
        "levels": max(0, now_s["level"] - base["level"]),
        "potions": stat("health_potions") + stat("mana_potions"),
        "snacks": stat("food") + stat("drinks"),
        "crafter": sum(g for g in prof_gains.values() if g > 0),
        "rep": sum(max(0, raw - (base["rep"].get(f) or 0)) for f, raw in now_s["rep"].items()),
        "achievements": max(0, now_s["achievements"] - base["achievements"]),
        "clears": sum(n for n in clears.values() if n > 0),
        "_prof_gains": {p: g for p, g in prof_gains.items() if g > 0},
        "_clears": {d: n for d, n in clears.items() if n > 0},
        "_new_epics": [e for e in now_s["epics"] if e not in set(base["epics"])],
    })
    return out


def emoji_for(snap, settings):
    code = (settings.get("class_emojis") or {}).get((snap.get("class") or "").lower())
    return f"{code} " if code else ""


def build_recap(characters, state, settings, week_end, launch_week):
    """The weekly recap as a list of Discord embeds, or None if nobody played."""
    weekly = state.setdefault("weekly", {})
    baseline = weekly.setdefault("baseline", {})
    max_level = settings["max_level"]

    active = []  # (name, icon, snap, now_s, week)
    for c, key in characters:
        snap = state["characters"].get(key)
        if not snap:
            continue
        now_s = recap_summary(snap)
        base = LAUNCH_BASELINE if launch_week else {**LAUNCH_BASELINE, **(baseline.get(key) or now_s)}
        week = week_numbers(now_s, base)
        played = (week["levels"] or now_s["xp"] != base.get("xp", now_s["xp"]) or week["mobs"]
                  or week["quests"] or week["deaths"] or week["crafter"] or week["clears"])
        if played:
            active.append((display_name(c), emoji_for(snap, settings), snap, now_s, week, armory_url(c)))
    if not active:
        return None

    def who(a):  # class icon + name (scoreboard, awards)
        return f"{a[1]}{a[0]}"

    # 1. Headline + leaderboard
    total = lambda k: sum(a[4][k] for a in active)
    plural = lambda n, word: f"{n:,} {word}{'' if n == 1 else 's'}"
    mounts_now = sum(len((o or {}).get("mounts") or {}) for o in (state.get("owners") or {}).values())
    mounts_base = weekly.get("mounts_baseline")
    mounts_gained = max(0, mounts_now - mounts_base) if mounts_base is not None and not launch_week else mounts_now if launch_week else 0
    headline = (f"The guild gained **{plural(total('levels'), 'level')}**, cleared **{plural(total('clears'), 'dungeon')}**, "
                f"earned **{plural(mounts_gained, 'mount')}**, killed **{plural(total('mobs'), 'mob')}**, "
                f"finished **{plural(total('quests'), 'quest')}**, and died **{plural(total('deaths'), 'time')}**.")
    leveling = [a for a in active if a[3]["level"] < max_level or a[4]["levels"] > 0]
    capped = [a for a in active if a not in leveling]
    leveling.sort(key=lambda a: (-a[4]["levels"], -a[3]["level"], -a[3]["xp"]))
    medals = ["🥇", "🥈", "🥉"]
    lines = []
    for i, a in enumerate(leveling[:15]):
        mark = medals[i] if i < 3 else f"`{i + 1}.`"
        spec = " ".join(x for x in (a[2].get("spec"), a[2].get("class")) if x)
        gain = f" **+{a[4]['levels']}**" if a[4]["levels"] else ""
        lines.append(f"{mark} {a[1]}**[{a[0]}]({a[5]})** Lv {a[3]['level']}{gain}" + (f" · {spec}" if spec else ""))
    if len(leveling) > 15:
        lines.append(f"…and {len(leveling) - 15} more")
    if capped:
        lines.append(f"⭐ **At {max_level}:** " + " · ".join(f"{a[1]}[{a[0]}]({a[5]})" for a in capped))
    week_start = week_end - timedelta(days=6)
    embeds = [{
        "title": f"📅 Weekly Recap · {week_start.strftime('%b %-d')} – {week_end.strftime('%b %-d')}",
        "description": f"{headline}\n\n**🏆 Leaderboard**\n" + "\n".join(lines),
        "color": RECAP_COLOR,
    }]

    # 2. Highlights
    fields = []
    by_dungeon = {}
    for a in active:
        for d, n in a[4]["_clears"].items():
            by_dungeon.setdefault(d, []).append((a, n))
    if by_dungeon:
        order = sorted(by_dungeon, key=lambda d: (-sum(n for _, n in by_dungeon[d]), d))
        rows = [f"**{d}** · " + ", ".join(a[0] + (f" ×{n}" if n > 1 else "")
                                          for a, n in sorted(by_dungeon[d], key=lambda x: -x[1]))
                for d in order[:6]]
        if len(order) > 6:
            rows.append(f"+{len(order) - 6} more dungeons")
        fields.append({"name": "🗝️ Dungeons this week", "value": "\n".join(rows)[:1024], "inline": False})
    epics = [(a, a[2]["gear"][e]["name"]) for a in active for e in a[4]["_new_epics"] if e in (a[2].get("gear") or {})]
    if epics:
        fields.append({"name": "🟣 Epics this week",
                       "value": "\n".join(f"**{name}** · {a[0]}" for a, name in epics[:8])[:1024], "inline": False})
    prof_rows = []
    for a in sorted(active, key=lambda a: -a[4]["crafter"]):
        gains = sorted(a[4]["_prof_gains"].items(), key=lambda kv: -kv[1])[:3]
        if gains:
            prof_rows.append(f"**{a[0]}**: " + " · ".join(
                f"{p} {a[3]['professions'][p]} **+{g}**" for p, g in gains))
    if prof_rows:
        fields.append({"name": "🛠️ Professions this week", "value": "\n".join(prof_rows[:10])[:1024], "inline": False})
    if fields:
        embeds.append({"title": "✨ Highlights", "color": 0x3498DB, "fields": fields})

    # 3. Scoreboard: top 3 for mobs, quests, deaths
    score_fields = []
    for key, title in (("mobs", "⚔️ Mobs killed"), ("quests", "📜 Quests completed"), ("deaths", "💀 Deaths")):
        ranked = sorted((a for a in active if a[4][key] > 0), key=lambda a: -a[4][key])[:3]
        if ranked:
            score_fields.append({"name": title, "inline": False, "value": "\n".join(
                f"{medals[i]} {who(a)} · **{a[4][key]:,}**" for i, a in enumerate(ranked))})
    if score_fields:
        embeds.append({"title": "📊 Scoreboard", "color": 0xE67E22, "fields": score_fields})

    # 4. Awards: the six most lopsided, skipping ties, zeros and last week's picks.
    # Only when at least two characters played; one player winning everything isn't fun.
    last_awards = set(weekly.get("last_awards") or [])
    candidates = []
    for key, title, unit, _ in (AWARDS if len(active) > 1 else []):
        ranked = sorted(active, key=lambda a: -a[4][key])
        top = ranked[0][4][key]
        second = ranked[1][4][key] if len(ranked) > 1 else 0
        if top <= 0 or top == second or (key == "rep" and launch_week):
            continue
        margin = (top - second) / top
        candidates.append((margin - (0.5 if key in last_awards else 0), key, title, unit, ranked[0], top))
    candidates.sort(key=lambda x: -x[0])
    picks = candidates[:6]
    if picks:
        embeds.append({"title": "🏅 Awards", "color": 0x9B59B6, "fields": [
            {"name": title, "value": f"{who(winner)}\n{top:,} {unit[0] if top == 1 else unit[1]}", "inline": True}
            for _, _, title, unit, winner, top in picks]})
    weekly["pending_awards"] = [p[1] for p in picks]

    if launch_week:
        embeds[-1]["footer"] = {"text": "Launch week · counted from level 1"}
    return embeds


def reset_recap_baseline(characters, state, when):
    weekly = state.setdefault("weekly", {})
    weekly["baseline"] = {key: recap_summary(state["characters"][key])
                          for _, key in characters if key in state["characters"]}
    weekly["last_recap"] = when.astimezone(timezone.utc).isoformat()
    weekly["recaps_posted"] = (weekly.get("recaps_posted") or 0) + 1
    weekly["last_awards"] = weekly.pop("pending_awards", [])
    weekly["mounts_baseline"] = sum(len((o or {}).get("mounts") or {}) for o in (state.get("owners") or {}).values())


def build_inactive_report(characters, state, settings):
    """
    Officers-only list of characters not seen in `inactive_days`, with the
    last-login date. None when everyone is active or no login data exists.
    """
    days = int(settings.get("inactive_days") or 7)
    cutoff = time.time() - days * 86400
    rows, unknown = [], 0
    for c, key in characters:
        snap = state["characters"].get(key)
        if not snap:
            continue
        ll = snap.get("last_login")
        if not ll:
            unknown += 1
            continue
        if ll / 1000 < cutoff:
            ago = int((time.time() - ll / 1000) // 86400)
            rows.append((ago, f"**{display_name(c)}** · Lv {snap.get('level') or '?'} {snap.get('class') or ''} · {ago}d"))
    if not rows:
        return None
    rows.sort(key=lambda r: -r[0])
    return {
        "title": f"Quiet for {days}+ days",
        "description": "\n".join(r[1] for r in rows[:30]) + (f"\n…and {len(rows) - 30} more" if len(rows) > 30 else ""),
        "color": 0x95A5A6,
        "footer": {"text": "Officers only · based on last login · posted with the weekly recap"},
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }


# ---------------------------------------------------------------- Discord

def post_to_discord(webhook, embeds, content=None, ping_role=None):
    """
    Post embeds through the webhook. Silent by default. With ping_role set,
    the first message mentions that role (and only that role) and is not
    silent, so a big ding reaches phones.
    """
    for i in range(0, len(embeds), 10):  # Discord allows 10 embeds per message
        payload = {
            "username": "Guild Bot",
            "embeds": embeds[i:i + 10],
            "flags": 4096,                      # @silent: no push/desktop alerts for anyone
            "allowed_mentions": {"parse": []},  # never ping users, roles or @everyone
        }
        if ping_role and i == 0:
            payload["content"] = f"<@&{ping_role}> " + (content or "")
            payload["allowed_mentions"] = {"roles": [str(ping_role)]}
            payload.pop("flags")
        elif content and i == 0:
            payload["content"] = content
        status, body = http("POST", webhook, {"Content-Type": "application/json"},
                            json.dumps(payload).encode())
        if status not in (200, 204):
            raise RuntimeError(f"Discord webhook failed (HTTP {status}): {body}")


# ---------------------------------------------------------------- Main

def save_state(state):
    """Write state now. Called after every successful Discord post so a crash
    later in the run can't repeat an announcement on the next run."""
    with open(STATE_PATH, "w", encoding="utf-8") as f:
        json.dump(state, f, indent=2, sort_keys=True, ensure_ascii=False)
        f.write("\n")


def load_json(path, default):
    if path.exists():
        with open(path, encoding="utf-8") as f:
            return json.load(f)
    return default


def load_characters(config):
    """
    Characters can be listed grouped by friend:
      "friends": [{"name": "Tim", "characters": [{"name": "...", "surname": "..."}]}]
    or as a flat list with an "owner" on each:
      "characters": [{"owner": "Tim", "name": "...", "surname": "..."}]
    Both can be used together.
    """
    chars = []
    for friend in config.get("friends") or []:
        for c in friend.get("characters") or []:
            chars.append({"owner": friend.get("name"), **c})
    chars += config.get("characters") or []
    return [c for c in chars if c.get("name")]


def main():
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("--dry-run", action="store_true", help="print messages instead of posting; save nothing")
    parser.add_argument("--test-webhook", action="store_true", help="send a test message to Discord and exit")
    parser.add_argument("--recap-now", action="store_true", help="also post the weekly recap on this run")
    args = parser.parse_args()

    webhook = os.environ.get("DISCORD_WEBHOOK_URL", "").strip()

    if args.test_webhook:
        if not webhook:
            sys.exit("DISCORD_WEBHOOK_URL is not set.")
        post_to_discord(webhook, [{
            "title": "Guild Bot connected",
            "description": "Milestones and progress will post here.",
            "color": DEFAULT_COLOR,
        }])
        print("Test message sent.")
        return

    client_id = os.environ.get("BLIZZARD_CLIENT_ID", "").strip()
    client_secret = os.environ.get("BLIZZARD_CLIENT_SECRET", "").strip()
    if not client_id or not client_secret:
        sys.exit("BLIZZARD_CLIENT_ID and BLIZZARD_CLIENT_SECRET must be set.")
    if not webhook and not args.dry_run:
        sys.exit("DISCORD_WEBHOOK_URL must be set (or use --dry-run).")

    config = load_json(CONFIG_PATH, None) or {}
    characters = load_characters(config)
    settings = {**DEFAULT_SETTINGS, **config.get("settings", {})}
    guild = {**GUILD_DEFAULTS, **(config.get("guild") or {})}
    global DUNGEONS
    DUNGEONS = Dungeons(load_json(DUNGEONS_PATH, {}))
    default_region = config.get("region", "us").lower()

    state = load_json(STATE_PATH, {"characters": {}, "group": {}})
    state.setdefault("characters", {})
    state.setdefault("group", {})
    owners = state.setdefault("owners", {})
    weekly = state.setdefault("weekly", {})
    weekly.setdefault("baseline", {})

    token = get_token(client_id, client_secret)
    embeds, hype_embeds, digest_items, unavailable = [], [], [], []
    pending_firsts = {}  # (kind, what) -> [(character, snapshot, key)] achieved this run
    hype_events = set(settings.get("hype_events") or [])
    ping_role = str(settings.get("hype_ping_role_id") or "").strip() or None

    # --- Guild roster: auto-discover members, announce joins and leaves.
    guild_members = fetch_guild_roster(guild, token) if (guild.get("slug") or guild.get("name")) else None
    if guild_members is not None:
        rank_names = {str(k): v for k, v in (guild.get("rank_names") or {}).items()}
        for m in guild_members:
            m["rank_name"] = rank_names.get(str(m.get("rank")), "")
        manual = {char_slug(c) for c in characters}
        characters += [m for m in guild_members if char_slug(m) not in manual]
        roster_state = state.setdefault("roster", {})
        seen_before = roster_state.get("members")  # {slug: display name}
        now_members = {char_slug(m): display_name(m) for m in guild_members}
        if seen_before and not now_members:
            # An empty roster from a guild that had members is an API hiccup,
            # not a mass exodus. Keep last run's roster and say nothing.
            print("[warn] guild roster came back empty; keeping the last known roster")
            guild_members = None
            now_members = seen_before
        if guild_members is not None and seen_before is not None and settings.get("announce_guild_changes"):
            lines = []
            for slug, name in sorted(now_members.items(), key=lambda kv: kv[1]):
                if slug not in seen_before:
                    lines.append(f"🛡️ **{name}** joined the guild")
            for slug, name in sorted(seen_before.items(), key=lambda kv: kv[1]):
                if slug not in now_members:
                    lines.append(f"👋 **{name}** left the guild")
            if lines:
                joined = [l for l in lines if l.startswith("🛡️")]
                card = {"title": "Guild roster", "description": "\n".join(l.replace("🛡️ ", "").replace("👋 ", "") for l in lines[:40]),
                        "color": ROSTER_COLOR, "timestamp": datetime.now(timezone.utc).isoformat()}
                (hype_embeds if "guild_join" in hype_events and joined else embeds).append(card)
        roster_state["members"] = now_members
        print(f"[info] guild roster: {len(now_members)} members")
    if not characters:
        sys.exit("No characters: set guild.slug in characters.json or list friends/characters.")

    def check(c):
        region = c.get("region", default_region).lower()
        namespace = os.environ.get("PROFILE_NAMESPACE") or f"profile-forever-{region}"
        try:
            return fetch_snapshot(c, region, token, namespace, settings), None
        except Exception as err:  # one bad character shouldn't stop the rest
            return None, err

    # Fetch in parallel so a run stays well under a minute; results keep config order.
    with ThreadPoolExecutor(max_workers=8) as pool:
        results = list(pool.map(check, characters))

    keyed = []
    for c, (snap, err) in zip(characters, results):
        key = f"{c.get('region', default_region).lower()}:{char_slug(c)}"
        keyed.append((c, key))
        if err:
            print(f"[warn] {display_name(c)}: {err}")
            continue
        if snap is None:
            unavailable.append(display_name(c))
            continue

        old = state["characters"].get(key)
        lines, hype = [], []
        if old is None:
            lines.append(f"Now tracked at level **{snap.get('level') or '?'}**")
            profs = sorted((snap.get("professions") or {}).items(), key=lambda kv: -kv[1])
            profs = [f"{p} {v}" for p, v in profs if v > 1][:4]
            if profs:
                lines.append(" · ".join(profs))
        else:
            lines = find_changes(key, old, snap, settings, state["group"], hype)

        # Mounts are account-wide: track them per friend, so a new mount is
        # posted once (on whichever character saw it first), not once per alt.
        mounts = snap.pop("_mounts", None)
        if mounts is not None:
            owner_key = (c.get("owner") or key).lower()
            known = owners.setdefault(owner_key, {}).get("mounts")
            if known is None or old is None:
                owners[owner_key]["mounts"] = {**(known or {}), **mounts}
            else:
                epic_marks = [s.lower() for s in (settings.get("epic_mount_names") or [])]
                for mid, mname in sorted(mounts.items(), key=lambda kv: kv[1]):
                    if mid not in known:
                        epic_hit = next((d for ev, d in hype if ev == "epic_mount"), None)
                        if any(mark in mname.lower() for mark in epic_marks):
                            if epic_hit is not None:
                                epic_hit["mount"] = mname
                            else:
                                hype.append(("epic_mount", {"mount": mname}))
                            lines.append(f"Epic mount: **{mname}**")
                        else:
                            lines.append(f"New mount: **{mname}**")
                        known[mid] = mname

        # Level timeline for "time since 30" on milestone cards.
        now_ts = int(time.time())
        level_at = dict((old or {}).get("level_at") or {})
        if old is None:
            snap["first_seen"] = now_ts
        else:
            snap["first_seen"] = old.get("first_seen") or now_ts
        if snap.get("level") and (old is None or (old.get("level") or 0) != snap["level"]):
            level_at.setdefault(str(snap["level"]), now_ts)
        snap["level_at"] = level_at

        # Guild firsts: the first character anywhere in the guild to clear a
        # dungeon, kill a raid boss or clear a raid. Characters seen for the
        # first time seed the record quietly so old clears never fire.
        firsts = state["group"].setdefault("firsts", {"dungeon": {}, "boss": {}, "raid": {}})
        if old is None:
            for d in cleared_dungeons(snap):
                firsts["dungeon"].setdefault(d, key)
            for inst, info in (snap.get("dungeons") or {}).items():
                if info.get("cleared"):
                    firsts["dungeon"].setdefault(inst, key)
            for inst, info in (snap.get("raids") or {}).items():
                if info.get("cleared"):
                    firsts["raid"].setdefault(inst, key)
                for boss in info.get("bosses") or []:
                    firsts["boss"].setdefault(f"{boss} ({inst})", key)
        else:
            mine = set()
            for ev, what in list(hype):
                kind = {"clear": "dungeon", "boss": "boss", "raid_clear": "raid"}.get(ev)
                if not kind:
                    continue
                if what not in firsts[kind]:
                    firsts[kind][what] = key
                    pending_firsts[(kind, what)] = [(c, snap, key)]
                    mine.add(what)
                elif (kind, what) in pending_firsts:
                    # Someone else got the same first in this very run: a tie, one card for all.
                    pending_firsts[(kind, what)].append((c, snap, key))
                    firsts[kind][what] = (firsts[kind][what] if isinstance(firsts[kind][what], list) else [firsts[kind][what]]) + [key]
                    mine.add(what)
            # Lines that will become a guild-first card stay out of this character's digest.
            lines = [l for l in lines if not any(f"**{w}**" in l or f"**{w.split(' (')[0]}**" in l for w in mine)]

        loud = [(ev, d) for ev, d in hype if ev in hype_events]
        if old is None:
            embeds.append(character_embed(c, snap, lines, settings))
        elif loud:
            for ev, d in loud:
                hype_embeds.append(milestone_embed(c, snap, ev, d, state["group"], snap, settings, now_ts))
            announced = {d["what"] for ev, d in loud if ev == "guild_first"}
            quiet = [l for l in lines
                     if not l.startswith(("Reached", "First in the guild", "Epic", "Learned riding"))
                     and not any(f"**{w}**" in l or f"**{w.split(' (')[0]}**" in l for w in announced)]
            if quiet:
                digest_items.append((c, snap, quiet))
        elif lines:
            digest_items.append((c, snap, lines))
        merge_gear(old, snap)
        state["characters"][key] = keep_baselines(old, snap)
        if key not in weekly["baseline"]:
            # A character first seen at a low level (Blizzard only lists level 10+)
            # is brand new, so the week counts from level 1. Anyone higher, like a
            # friend added later, counts from when the tracker first saw them.
            fresh = (snap.get("level") or 0) <= NEW_CHARACTER_MAX_LEVEL
            weekly["baseline"][key] = dict(LAUNCH_BASELINE) if fresh else recap_summary(state["characters"][key])

    # Guild-first cards: one per achievement, naming everyone who got it this run.
    # Held back until enough characters are tracked for "first" to mean something.
    tracked = len(state["characters"])
    if pending_firsts and "guild_first" in hype_events and tracked >= int(settings.get("guild_first_min_tracked") or 0):
        for (kind, what), members in pending_firsts.items():
            c0, snap0, _ = members[0]
            detail = {"kind": kind, "what": what, "names": [display_name(cc) for cc, _, _ in members]}
            hype_embeds.append(milestone_embed(c0, snap0, "guild_first", detail, state["group"], snap0, settings, int(time.time())))
    elif pending_firsts:
        print(f"[info] {len(pending_firsts)} guild first(s) recorded quietly; {tracked} tracked, need {settings.get('guild_first_min_tracked')}")

    if unavailable:
        print("[info] No Blizzard data yet for: " + ", ".join(unavailable))
        print("       (They show up after the character logs into the world once.)")

    # Weekly recap: posted by the first run after the recap time, as its own message.
    now = datetime.now(timezone.utc)
    recap_due_at = last_recap_time(now, settings)
    last = weekly.get("last_recap")
    recap, inactive = None, None
    if last is None and not args.recap_now:
        # First run with recaps enabled: start counting from now, recap next week.
        weekly["last_recap"] = now.isoformat()
    elif settings["weekly_recap"] and (args.recap_now or datetime.fromisoformat(last) < recap_due_at):
        week_end = recap_due_at if not args.recap_now else now.astimezone(local_zone(settings))
        recap = build_recap(keyed, state, settings, week_end, launch_week=not weekly.get("recaps_posted"))
        inactive = build_inactive_report(keyed, state, settings)
        reset_recap_baseline(keyed, state, now)
    if weekly.get("mounts_baseline") is None:
        weekly["mounts_baseline"] = sum(len((o or {}).get("mounts") or {}) for o in owners.values())

    if digest_items:
        embeds.append(digest_embed(digest_items, settings))

    roster_embed = None
    if settings.get("roster_board"):
        entries = [(c, state["characters"][key]) for c, key in keyed if key in state["characters"]]
        if entries:
            roster_embed = [build_roster_board(entries, settings, settings["max_level"])] + build_professions_board(entries, settings)

    if args.dry_run:
        print("== hype ==")
        print(json.dumps(hype_embeds, indent=2, ensure_ascii=False) if hype_embeds else "[dry run] No hype.")
        print("== updates ==")
        print(json.dumps(embeds, indent=2, ensure_ascii=False) if embeds else "[dry run] No updates.")
        print("== recap ==")
        print(json.dumps(recap, indent=2, ensure_ascii=False) if recap else "[dry run] No recap.")
        print("== officers: inactive ==")
        print(json.dumps(inactive, indent=2, ensure_ascii=False) if inactive else "[dry run] Nobody inactive / no recap this run.")
        print("== roster board ==")
        print(json.dumps(roster_embed, indent=2, ensure_ascii=False) if roster_embed else "[dry run] No roster.")
        return

    # Everything to post goes into state["pending"] and is saved to disk
    # BEFORE the first post. Each group is removed and saved again as soon as
    # Discord accepts it. A crash at any point leaves the queue on disk, so
    # the next run posts what is left and never recomputes or repeats what
    # already went out. Webhook URLs are never stored; only the kind is.
    queue = list(state.get("pending") or [])  # anything a failed run left behind
    if queue:
        print(f"[info] {len(queue)} post(s) left over from an earlier run")
    if hype_embeds:
        queue.append({"kind": "hype", "embeds": hype_embeds, "ping": ping_role})
    if embeds:
        queue.append({"kind": "updates", "embeds": embeds})
    if recap:
        # Discord caps a message at 6,000 characters across its embeds; split if needed.
        size = len(json.dumps(recap, ensure_ascii=False))
        for part in ([recap] if size < 5500 else [[e] for e in recap]):
            queue.append({"kind": "recap", "embeds": part})
    if inactive:
        queue.append({"kind": "inactive", "embeds": [inactive]})
    news_hook = os.environ.get("DISCORD_NEWS_WEBHOOK_URL", "").strip()
    if settings.get("news_feed") and news_hook:
        try:
            import news as news_mod
            news_embeds, _ = news_mod.build_news(state)
            for e in news_embeds:  # one card per message so each has its own link preview
                queue.append({"kind": "news", "embeds": [e]})
        except Exception as err:  # news is a nicety; never block guild posts
            print(f"[warn] news: {err}")
    elif settings.get("news_feed"):
        print("[info] DISCORD_NEWS_WEBHOOK_URL not set; skipped the news feed.")
    state["pending"] = queue
    save_state(state)

    staff_hook = os.environ.get("DISCORD_STAFF_WEBHOOK_URL", "").strip()
    posted = {"hype": 0, "updates": 0, "recap": 0, "inactive": 0, "news": 0}
    while state["pending"]:
        item = state["pending"][0]
        kind = item.get("kind")
        if kind == "hype":
            post_to_discord(webhook, item["embeds"], ping_role=item.get("ping"))
        elif kind == "inactive":
            if staff_hook:
                post_to_discord(staff_hook, item["embeds"])
            else:
                print("[info] DISCORD_STAFF_WEBHOOK_URL not set; skipped the officers-only inactive list.")
        elif kind == "updates":
            # Quiet digest goes to the roster channel when one exists; #general keeps milestones and the recap.
            post_to_discord(os.environ.get("DISCORD_ROSTER_WEBHOOK_URL", "").strip() or webhook, item["embeds"])
        elif kind == "recap":
            post_to_discord(webhook, item["embeds"])
        elif kind == "news":
            if news_hook:
                post_to_discord(news_hook, item["embeds"])
        posted[kind] = posted.get(kind, 0) + len(item.get("embeds") or [])
        state["pending"].pop(0)
        save_state(state)
    if posted["hype"]:
        print(f"Posted {posted['hype']} milestone card(s)" + (" with role ping." if ping_role else "."))
    if posted["updates"]:
        print(f"Posted {posted['updates']} update(s).")
    if posted["recap"]:
        print("Posted the weekly recap.")
    if posted["inactive"] and staff_hook:
        print("Posted the officers-only inactive list.")
    if posted["news"]:
        print(f"Posted {posted['news']} news card(s).")
    if not posted["hype"] and not posted["updates"]:
        print("No changes since the last check.")

    if roster_embed:
        roster_hook = os.environ.get("DISCORD_ROSTER_WEBHOOK_URL", "").strip() or webhook
        try:
            upsert_roster_board(roster_hook, roster_embed, state)
            print("Roster board refreshed.")
        except Exception as err:  # the board is rebuilt every run; never block the rest
            print(f"[warn] roster board: {err}")
        save_state(state)


if __name__ == "__main__":
    main()
