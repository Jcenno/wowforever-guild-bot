# Member-facing strings

89 strings from `tracker.py`. Regenerate with `python3 tools/extract_strings.py`.

Rules: one verb per line, no tool names (Jeeves, Blizzard, GitHub, tracker), no AI or admin wording, 'about every 15 minutes' not 'every 15 minutes'.

| Line | Text |
| --- | --- |
| 215 | `name` |
| 326 | `name \| name \| an item` |
| 509 | `{faction name: { \| : n,  \| }}. Higher tier = better standing.` |
| 517 | `tier \| tier \| name \| name` |
| 602 | `First in the guild to **{max_level}**` |
| 605 | `Reached **{max_level}**` |
| 611 | `Reached **{big}** \|  (now {level})` |
| 614 | `Level **{level}**` |
| 616 | `Level **{old_level} → {level}**` |
| 626 | `Epic riding ({skill})` |
| 629 | `Learned riding ({skill})` |
| 632 | `📜 Learned **{prof}**` |
| 635 | `Epic riding ({skill})` |
| 640 | `Learned riding ({skill})` |
| 645 | `🛠️ **{prof}** reached {max(crossed)} skill` |
| 652 | `Item level **{max(crossed)}**` |
| 659 | `🗝️ Cleared **{inst}** for the first time` |
| 668 | `🐉 Full clear of **{inst}**!` |
| 673 | `⚔️ First kill: **{boss}** ({inst})` |
| 688 | `🗝️ Cleared **{dungeon}** for the first time` |
| 692 | `⚔️ First kill: **{new_k[sid]['boss']}** ({new_k[sid]['instance']})` |
| 705 | `{icon} Reached **{now['name']}** with {faction}` |
| 712 | `🎖️ {name}` |
| 726 | `{icon} Equipped **{it['name']}**{slot}` |
| 728 | `🔵 First blue: **{it['name']}**{slot}` |
| 743 | `name \| name \| quality \| quality` |
| 783 | `name \| url` |
| 789 | `description` |
| 791 | `footer \| text` |
| 804 | `name \| value \| inline` |
| 808 | `title \| Progress` |
| 811 | `footer \| text \| {n} update{'s' if n != 1 else ''} · {len(items)} character{'s' if len(items) != 1 else ''}{extra}` |
| 838 | `**{name}** reached level **{level}**.` |
| 839 | `name \| Guild \| value \| {ordinal(place)} to get there \| inline` |
| 851 | `name \| Time \| value \| {human_duration(now_ts - since_ts)} {since_label} \| inline` |
| 855 | `**{name}** has an epic mount. \|  {detail['mount']}. \| mount` |
| 857 | `name \| Riding \| value \| riding \| inline` |
| 858 | `name \| Level \| value \| level \| inline` |
| 861 | `**{name}** learned to ride.` |
| 866 | `name \| Guild \| value \| {ordinal(order.index(key) + 1)} to get there \| inline` |
| 867 | `name \| Level \| value \| level \| inline` |
| 873 | `**{name}** is the first in the guild recorded to have {verb} **{detail['what']}**.` |
| 874 | `name \| Level \| value \| level \| inline` |
| 876 | `Milestone \| **{name}**: {detail}` |
| 878 | `title` |
| 879 | `description` |
| 882 | `footer \| text` |
| 962 | ` · ` |
| 964 | `name \| {emoji} {cls} · {len(rows)} \| value \| inline` |
| 966 | `title \| Roster` |
| 967 | `description` |
| 970 | `footer \| text \| 🟢 last 2 days · 🟡 last week · ⚫ longer · updates about every 15 min` |
| 991 | `name \| {prof} · {len(rows)} \| value \| inline` |
| 1001 | `name \| Secondary (best in guild) \| value \| inline` |
| 1004 | `Need something made? Ask in #general and ping the crafter. 300 is max skill.` |
| 1008 | `title \| Who crafts what` |
| 1009 | `description` |
| 1011 | `fields \| name \| Nothing yet \| value \| Professions appear here as people learn them. \| inline` |
| 1012 | `footer \| text \| Updates about every 15 min` |
| 1160 | `The guild gained **{plural(total('levels'), 'level')}**, cleared **{plural(total('clears'), 'dungeon')}**, ` |
| 1172 | `{mark} {a[1]}**[{a[0]}]({a[5]})** Lv {a[3]['level']}{gain} \|  · {spec}` |
| 1174 | `…and {len(leveling) - 15} more` |
| 1176 | `⭐ **At {max_level}:**  \|  ·  \| {a[1]}[{a[0]}]({a[5]})` |
| 1179 | `title \| 📅 Weekly Recap · {week_start.strftime('%b %-d')} – {week_end.strftime('%b %-d')}` |
| 1180 | `description \| {headline}\n\n**🏆 Leaderboard**\n` |
| 1197 | `name \| 🗝️ Dungeons this week \| value \| inline` |
| 1200 | `name \| 🟣 Epics this week` |
| 1201 | `value \| **{name}** · {a[0]} \| inline` |
| 1209 | `name \| 🛠️ Professions this week \| value \| inline` |
| 1211 | `title \| ✨ Highlights \| color \| fields` |
| 1218 | `name \| inline \| value` |
| 1221 | `title \| 📊 Scoreboard \| color \| fields` |
| 1238 | `title \| 🏅 Awards \| color \| fields` |
| 1239 | `name \| value \| {who(winner)}\n{top:,} {unit[0] if top == 1 else unit[1]} \| inline` |
| 1244 | `footer \| text \| Launch week · counted from level 1` |
| 1281 | `title \| Quiet for {days}+ days` |
| 1282 | `description` |
| 1284 | `footer \| text \| Officers only · based on last login · posted with the weekly recap` |
| 1336 | `friends \| name \| Tim \| characters \| name \| ... \| surname \| ...` |
| 1338 | `characters \| owner \| Tim \| name \| ... \| surname \| ...` |
| 1362 | `title \| Guild Bot connected` |
| 1363 | `description \| Milestones and progress will post here.` |
| 1417 | `🛡️ **{name}** joined the guild` |
| 1420 | `👋 **{name}** left the guild` |
| 1423 | `title \| Guild roster \| description \| 🛡️ ` |
| 1457 | `Now tracked at level **{snap.get('level') or '?'}**` |
| 1461 | ` · ` |
| 1483 | `Epic mount: **{mname}**` |
| 1485 | `New mount: **{mname}**` |
