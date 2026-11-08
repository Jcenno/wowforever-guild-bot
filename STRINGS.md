# Member-facing strings

88 strings from `tracker.py`. Regenerate with `python3 tools/extract_strings.py`.

Rules: one verb per line, no tool names (Jeeves, Blizzard, GitHub, tracker), no AI or admin wording, 'about every 15 minutes' not 'every 15 minutes'.

| Line | Text |
| --- | --- |
| 216 | `name` |
| 290 | `name \| name` |
| 360 | `name \| name \| an item` |
| 543 | `{faction name: { \| : n,  \| }}. Higher tier = better standing.` |
| 551 | `tier \| tier \| name \| name` |
| 638 | `First in the guild to **{max_level}**` |
| 641 | `Reached **{max_level}**` |
| 647 | `Reached **{big}** \|  (now {level})` |
| 660 | `Epic riding ({skill})` |
| 663 | `Learned riding ({skill})` |
| 666 | `📜 Learned **{prof}**` |
| 669 | `Epic riding ({skill})` |
| 674 | `Learned riding ({skill})` |
| 679 | `🛠️ **{prof}** reached {max(crossed)} skill` |
| 686 | `Item level **{max(crossed)}**` |
| 693 | `🗝️ Cleared **{inst}** for the first time` |
| 702 | `🐉 Full clear of **{inst}**!` |
| 707 | `⚔️ First kill: **{boss}** ({inst})` |
| 722 | `🗝️ Cleared **{dungeon}** for the first time` |
| 726 | `⚔️ First kill: **{new_k[sid]['boss']}** ({new_k[sid]['instance']})` |
| 739 | `{icon} Reached **{now['name']}** with {faction}` |
| 746 | `🎖️ {name}` |
| 760 | `{icon} Equipped **{it['name']}**{slot}` |
| 762 | `🔵 First blue: **{it['name']}**{slot}` |
| 777 | `name \| name \| quality \| quality` |
| 817 | `name \| url` |
| 823 | `description` |
| 825 | `footer \| text` |
| 838 | `name \| value \| inline` |
| 842 | `title \| Progress` |
| 845 | `footer \| text \| {n} update{'s' if n != 1 else ''} · {len(items)} character{'s' if len(items) != 1 else ''}{extra}` |
| 872 | `**{name}** reached level **{level}**.` |
| 873 | `name \| Guild \| value \| {ordinal(place)} to get there \| inline` |
| 885 | `name \| Time \| value \| {human_duration(now_ts - since_ts)} {since_label} \| inline` |
| 889 | `**{name}** has an epic mount. \|  {detail['mount']}. \| mount` |
| 891 | `name \| Riding \| value \| riding \| inline` |
| 892 | `name \| Level \| value \| level \| inline` |
| 895 | `**{name}** learned to ride.` |
| 900 | `name \| Guild \| value \| {ordinal(order.index(key) + 1)} to get there \| inline` |
| 901 | `name \| Level \| value \| level \| inline` |
| 909 | `{who} {'are' if len(names) > 1 else 'is'} the first in the guild recorded to have {verb} **{detail['what']}**.` |
| 911 | `Milestone \| **{name}**: {detail}` |
| 913 | `title` |
| 914 | `description` |
| 917 | `footer \| text` |
| 997 | ` · ` |
| 999 | `name \| {emoji} {cls} · {len(rows)} \| value \| inline` |
| 1001 | `title \| Roster` |
| 1002 | `description` |
| 1005 | `footer \| text \| 🟢 last 2 days · 🟡 last week · ⚫ longer · updates about every 15 min` |
| 1033 | `name \| {PROF_ICON.get(prof, '')} {prof} · {len(rows)}` |
| 1034 | `value \| inline` |
| 1041 | `Need something made? Ask in #general and ping the crafter.` |
| 1044 | `title \| Crafting \| description \| color` |
| 1045 | `fields \| name \| Nothing yet \| value \| Crafting professions appear here as people learn them. \| inline` |
| 1047 | `title \| Gathering \| color \| fields` |
| 1056 | `title \| Secondary \| description \| color` |
| 1057 | `footer \| text \| 🟢 last 2 days · 🟡 last week · ⚫ longer · 300 is max skill · updates about every 15 min` |
| 1205 | `The guild gained **{plural(total('levels'), 'level')}**, cleared **{plural(total('clears'), 'dungeon')}**, ` |
| 1217 | `{mark} {a[1]}**[{a[0]}]({a[5]})** Lv {a[3]['level']}{gain} \|  · {spec}` |
| 1219 | `…and {len(leveling) - 15} more` |
| 1221 | `⭐ **At {max_level}:**  \|  ·  \| {a[1]}[{a[0]}]({a[5]})` |
| 1224 | `title \| 📅 Weekly Recap · {week_start.strftime('%b %-d')} – {week_end.strftime('%b %-d')}` |
| 1225 | `description \| {headline}\n\n**🏆 Leaderboard**\n` |
| 1242 | `name \| 🗝️ Dungeons this week \| value \| inline` |
| 1245 | `name \| 🟣 Epics this week` |
| 1246 | `value \| **{name}** · {a[0]} \| inline` |
| 1254 | `name \| 🛠️ Professions this week \| value \| inline` |
| 1256 | `title \| ✨ Highlights \| color \| fields` |
| 1263 | `name \| inline \| value` |
| 1266 | `title \| 📊 Scoreboard \| color \| fields` |
| 1283 | `title \| 🏅 Awards \| color \| fields` |
| 1284 | `name \| value \| {who(winner)}\n{top:,} {unit[0] if top == 1 else unit[1]} \| inline` |
| 1289 | `footer \| text \| Launch week · counted from level 1` |
| 1326 | `title \| Quiet for {days}+ days` |
| 1327 | `description` |
| 1329 | `footer \| text \| Officers only · based on last login · posted with the weekly recap` |
| 1381 | `friends \| name \| Tim \| characters \| name \| ... \| surname \| ...` |
| 1383 | `characters \| owner \| Tim \| name \| ... \| surname \| ...` |
| 1407 | `title \| Guild Bot connected` |
| 1408 | `description \| Milestones and progress will post here.` |
| 1463 | `🛡️ **{name}** joined the guild` |
| 1466 | `👋 **{name}** left the guild` |
| 1469 | `title \| Guild roster \| description \| 🛡️ ` |
| 1503 | `Now tracked at level **{snap.get('level') or '?'}**` |
| 1507 | ` · ` |
| 1529 | `Epic mount: **{mname}**` |
| 1531 | `New mount: **{mname}**` |
