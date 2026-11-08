# Member-facing strings

89 strings from `tracker.py`. Regenerate with `python3 tools/extract_strings.py`.

Rules: one verb per line, no tool names (Jeeves, Blizzard, GitHub, tracker), no AI or admin wording, 'about every 15 minutes' not 'every 15 minutes'.

| Line | Text |
| --- | --- |
| 215 | `name` |
| 289 | `name \| name` |
| 359 | `name \| name \| an item` |
| 542 | `{faction name: { \| : n,  \| }}. Higher tier = better standing.` |
| 550 | `tier \| tier \| name \| name` |
| 637 | `First in the guild to **{max_level}**` |
| 640 | `Reached **{max_level}**` |
| 646 | `Reached **{big}** \|  (now {level})` |
| 659 | `Epic riding ({skill})` |
| 662 | `Learned riding ({skill})` |
| 665 | `📜 Learned **{prof}**` |
| 668 | `Epic riding ({skill})` |
| 673 | `Learned riding ({skill})` |
| 678 | `🛠️ **{prof}** reached {max(crossed)} skill` |
| 685 | `Item level **{max(crossed)}**` |
| 692 | `🗝️ Cleared **{inst}** for the first time` |
| 701 | `🐉 Full clear of **{inst}**!` |
| 706 | `⚔️ First kill: **{boss}** ({inst})` |
| 721 | `🗝️ Cleared **{dungeon}** for the first time` |
| 725 | `⚔️ First kill: **{new_k[sid]['boss']}** ({new_k[sid]['instance']})` |
| 738 | `{icon} Reached **{now['name']}** with {faction}` |
| 745 | `🎖️ {name}` |
| 759 | `{icon} Equipped **{it['name']}**{slot}` |
| 761 | `🔵 First blue: **{it['name']}**{slot}` |
| 776 | `name \| name \| quality \| quality` |
| 816 | `name \| url` |
| 822 | `description` |
| 824 | `footer \| text` |
| 837 | `name \| value \| inline` |
| 841 | `title \| Progress` |
| 844 | `footer \| text \| {n} update{'s' if n != 1 else ''} · {len(items)} character{'s' if len(items) != 1 else ''}{extra}` |
| 871 | `**{name}** reached level **{level}**.` |
| 872 | `name \| Guild \| value \| {ordinal(place)} to get there \| inline` |
| 884 | `name \| Time \| value \| {human_duration(now_ts - since_ts)} {since_label} \| inline` |
| 888 | `**{name}** has an epic mount. \|  {detail['mount']}. \| mount` |
| 890 | `name \| Riding \| value \| riding \| inline` |
| 891 | `name \| Level \| value \| level \| inline` |
| 894 | `**{name}** learned to ride.` |
| 899 | `name \| Guild \| value \| {ordinal(order.index(key) + 1)} to get there \| inline` |
| 900 | `name \| Level \| value \| level \| inline` |
| 906 | `**{name}** is the first in the guild recorded to have {verb} **{detail['what']}**.` |
| 907 | `name \| Level \| value \| level \| inline` |
| 909 | `Milestone \| **{name}**: {detail}` |
| 911 | `title` |
| 912 | `description` |
| 915 | `footer \| text` |
| 995 | ` · ` |
| 997 | `name \| {emoji} {cls} · {len(rows)} \| value \| inline` |
| 999 | `title \| Roster` |
| 1000 | `description` |
| 1003 | `footer \| text \| 🟢 last 2 days · 🟡 last week · ⚫ longer · updates about every 15 min` |
| 1031 | `name \| {PROF_ICON.get(prof, '')} {prof} · {len(rows)}` |
| 1032 | `value \| inline` |
| 1039 | `Need something made? Ask in #general and ping the crafter.` |
| 1042 | `title \| Crafting \| description \| color` |
| 1043 | `fields \| name \| Nothing yet \| value \| Crafting professions appear here as people learn them. \| inline` |
| 1045 | `title \| Gathering \| color \| fields` |
| 1054 | `title \| Secondary \| description \| color` |
| 1055 | `footer \| text \| 🟢 last 2 days · 🟡 last week · ⚫ longer · 300 is max skill · updates about every 15 min` |
| 1203 | `The guild gained **{plural(total('levels'), 'level')}**, cleared **{plural(total('clears'), 'dungeon')}**, ` |
| 1215 | `{mark} {a[1]}**[{a[0]}]({a[5]})** Lv {a[3]['level']}{gain} \|  · {spec}` |
| 1217 | `…and {len(leveling) - 15} more` |
| 1219 | `⭐ **At {max_level}:**  \|  ·  \| {a[1]}[{a[0]}]({a[5]})` |
| 1222 | `title \| 📅 Weekly Recap · {week_start.strftime('%b %-d')} – {week_end.strftime('%b %-d')}` |
| 1223 | `description \| {headline}\n\n**🏆 Leaderboard**\n` |
| 1240 | `name \| 🗝️ Dungeons this week \| value \| inline` |
| 1243 | `name \| 🟣 Epics this week` |
| 1244 | `value \| **{name}** · {a[0]} \| inline` |
| 1252 | `name \| 🛠️ Professions this week \| value \| inline` |
| 1254 | `title \| ✨ Highlights \| color \| fields` |
| 1261 | `name \| inline \| value` |
| 1264 | `title \| 📊 Scoreboard \| color \| fields` |
| 1281 | `title \| 🏅 Awards \| color \| fields` |
| 1282 | `name \| value \| {who(winner)}\n{top:,} {unit[0] if top == 1 else unit[1]} \| inline` |
| 1287 | `footer \| text \| Launch week · counted from level 1` |
| 1324 | `title \| Quiet for {days}+ days` |
| 1325 | `description` |
| 1327 | `footer \| text \| Officers only · based on last login · posted with the weekly recap` |
| 1379 | `friends \| name \| Tim \| characters \| name \| ... \| surname \| ...` |
| 1381 | `characters \| owner \| Tim \| name \| ... \| surname \| ...` |
| 1405 | `title \| Guild Bot connected` |
| 1406 | `description \| Milestones and progress will post here.` |
| 1460 | `🛡️ **{name}** joined the guild` |
| 1463 | `👋 **{name}** left the guild` |
| 1466 | `title \| Guild roster \| description \| 🛡️ ` |
| 1500 | `Now tracked at level **{snap.get('level') or '?'}**` |
| 1504 | ` · ` |
| 1526 | `Epic mount: **{mname}**` |
| 1528 | `New mount: **{mname}**` |
