# Member-facing strings

88 strings from `tracker.py`. Regenerate with `python3 tools/extract_strings.py`.

Rules: one verb per line, no tool names (Jeeves, Blizzard, GitHub, tracker), no AI or admin wording, 'about every 15 minutes' not 'every 15 minutes'.

| Line | Text |
| --- | --- |
| 219 | `name` |
| 293 | `name \| name` |
| 363 | `name \| name \| an item` |
| 546 | `{faction name: { \| : n,  \| }}. Higher tier = better standing.` |
| 554 | `tier \| tier \| name \| name` |
| 641 | `First in the guild to **{max_level}**` |
| 644 | `Reached **{max_level}**` |
| 650 | `Reached **{big}** \|  (now {level})` |
| 663 | `Epic riding ({skill})` |
| 666 | `Learned riding ({skill})` |
| 669 | `📜 Learned **{prof}**` |
| 672 | `Epic riding ({skill})` |
| 677 | `Learned riding ({skill})` |
| 682 | `🛠️ **{prof}** reached {max(crossed)} skill` |
| 689 | `Item level **{max(crossed)}**` |
| 696 | `🗝️ Cleared **{inst}** for the first time` |
| 705 | `🐉 Full clear of **{inst}**!` |
| 710 | `⚔️ First kill: **{boss}** ({inst})` |
| 725 | `🗝️ Cleared **{dungeon}** for the first time` |
| 729 | `⚔️ First kill: **{new_k[sid]['boss']}** ({new_k[sid]['instance']})` |
| 742 | `{icon} Reached **{now['name']}** with {faction}` |
| 749 | `🎖️ {name}` |
| 763 | `{icon} Equipped **{it['name']}**{slot}` |
| 765 | `🔵 First blue: **{it['name']}**{slot}` |
| 780 | `name \| name \| quality \| quality` |
| 820 | `name \| url` |
| 826 | `description` |
| 828 | `footer \| text` |
| 841 | `name \| value \| inline` |
| 845 | `title \| Progress` |
| 848 | `footer \| text \| {n} update{'s' if n != 1 else ''} · {len(items)} character{'s' if len(items) != 1 else ''}{extra}` |
| 875 | `**{name}** reached level **{level}**.` |
| 876 | `name \| Guild \| value \| {ordinal(place)} to get there \| inline` |
| 888 | `name \| Time \| value \| {human_duration(now_ts - since_ts)} {since_label} \| inline` |
| 892 | `**{name}** has an epic mount. \|  {detail['mount']}. \| mount` |
| 894 | `name \| Riding \| value \| riding \| inline` |
| 895 | `name \| Level \| value \| level \| inline` |
| 898 | `**{name}** learned to ride.` |
| 903 | `name \| Guild \| value \| {ordinal(order.index(key) + 1)} to get there \| inline` |
| 904 | `name \| Level \| value \| level \| inline` |
| 912 | `{who} {'are' if len(names) > 1 else 'is'} the first in the guild recorded to have {verb} **{detail['what']}**.` |
| 914 | `Milestone \| **{name}**: {detail}` |
| 916 | `title` |
| 917 | `description` |
| 920 | `footer \| text` |
| 1000 | ` · ` |
| 1002 | `name \| {emoji} {cls} · {len(rows)} \| value \| inline` |
| 1004 | `title \| Roster` |
| 1005 | `description` |
| 1008 | `footer \| text \| 🟢 last 2 days · 🟡 last week · ⚫ longer · updates about every 15 min` |
| 1036 | `name \| {PROF_ICON.get(prof, '')} {prof} · {len(rows)}` |
| 1037 | `value \| inline` |
| 1044 | `Need something made? Type /need and the crafters who know it get a ping.` |
| 1047 | `title \| Crafting \| description \| color` |
| 1048 | `fields \| name \| Nothing yet \| value \| Crafting professions appear here as people learn them. \| inline` |
| 1050 | `title \| Gathering \| color \| fields` |
| 1059 | `title \| Secondary \| description \| color` |
| 1060 | `footer \| text \| 🟢 last 2 days · 🟡 last week · ⚫ longer · 300 is max skill · updates about every 15 min` |
| 1208 | `The guild gained **{plural(total('levels'), 'level')}**, cleared **{plural(total('clears'), 'dungeon')}**, ` |
| 1220 | `{mark} {a[1]}**[{a[0]}]({a[5]})** Lv {a[3]['level']}{gain} \|  · {spec}` |
| 1222 | `…and {len(leveling) - 15} more` |
| 1224 | `⭐ **At {max_level}:**  \|  ·  \| {a[1]}[{a[0]}]({a[5]})` |
| 1227 | `title \| 📅 Weekly Recap · {week_start.strftime('%b %-d')} – {week_end.strftime('%b %-d')}` |
| 1228 | `description \| {headline}\n\n**🏆 Leaderboard**\n` |
| 1245 | `name \| 🗝️ Dungeons this week \| value \| inline` |
| 1248 | `name \| 🟣 Epics this week` |
| 1249 | `value \| **{name}** · {a[0]} \| inline` |
| 1257 | `name \| 🛠️ Professions this week \| value \| inline` |
| 1259 | `title \| ✨ Highlights \| color \| fields` |
| 1266 | `name \| inline \| value` |
| 1269 | `title \| 📊 Scoreboard \| color \| fields` |
| 1286 | `title \| 🏅 Awards \| color \| fields` |
| 1287 | `name \| value \| {who(winner)}\n{top:,} {unit[0] if top == 1 else unit[1]} \| inline` |
| 1292 | `footer \| text \| Launch week · counted from level 1` |
| 1329 | `title \| Quiet for {days}+ days` |
| 1330 | `description` |
| 1332 | `footer \| text \| Officers only · based on last login · posted with the weekly recap` |
| 1385 | `friends \| name \| Tim \| characters \| name \| ... \| surname \| ...` |
| 1387 | `characters \| owner \| Tim \| name \| ... \| surname \| ...` |
| 1411 | `title \| Guild Bot connected` |
| 1412 | `description \| Milestones and progress will post here.` |
| 1467 | `🛡️ **{name}** joined the guild` |
| 1470 | `👋 **{name}** left the guild` |
| 1473 | `title \| Guild roster \| description \| 🛡️ ` |
| 1507 | `Now tracked at level **{snap.get('level') or '?'}**` |
| 1511 | ` · ` |
| 1533 | `Epic mount: **{mname}**` |
| 1535 | `New mount: **{mname}**` |
