# Member-facing strings

87 strings from `tracker.py`. Regenerate with `python3 tools/extract_strings.py`.

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
| 844 | `name \| {name} ({i + 1}) \| value \| inline` |
| 862 | `name \| value \| inline` |
| 871 | `title \| Progress \| Progress ({i + 1} of {len(cards)})` |
| 874 | `footer \| text \| {n} update{'s' if n != 1 else ''} · {len(items)} character{'s' if len(items) != 1 else ''}` |
| 902 | `**{name}** reached level **{level}**.` |
| 903 | `name \| Guild \| value \| {ordinal(place)} to get there \| inline` |
| 915 | `name \| Time \| value \| {human_duration(now_ts - since_ts)} {since_label} \| inline` |
| 919 | `**{name}** has an epic mount. \|  {detail['mount']}. \| mount` |
| 921 | `name \| Riding \| value \| riding \| inline` |
| 922 | `name \| Level \| value \| level \| inline` |
| 925 | `**{name}** learned to ride.` |
| 930 | `name \| Guild \| value \| {ordinal(order.index(key) + 1)} to get there \| inline` |
| 931 | `name \| Level \| value \| level \| inline` |
| 939 | `{who} {'are' if len(names) > 1 else 'is'} the first in the guild recorded to have {verb} **{detail['what']}**.` |
| 941 | `Milestone \| **{name}**: {detail}` |
| 943 | `title` |
| 944 | `description` |
| 947 | `footer \| text` |
| 1027 | ` · ` |
| 1031 | `title \| Roster` |
| 1032 | `description` |
| 1035 | `footer \| text \| 🟢 last 2 days · 🟡 last week · ⚫ longer · ⚪ not seen yet · updates about every 15 min` |
| 1070 | `Need something made? Type /need and the crafters who know it get a ping.` |
| 1073 | `title \| Crafting \| description \| color` |
| 1074 | `fields \| name \| Nothing yet \| value \| Crafting professions appear here as people learn them. \| inline` |
| 1075 | `title \| Gathering \| color` |
| 1076 | `fields \| name \| Nothing yet \| value \| Mining, Herbalism and Skinning appear here as people learn them. \| inline` |
| 1083 | `title \| Secondary \| description \| Cooking, First Aid and Fishing appear here as people learn them. \| color` |
| 1084 | `footer \| text \| 🟢 last 2 days · 🟡 last week · ⚫ longer · ⚪ not seen yet · 300 is max skill · updates about every 15 min` |
| 1248 | `The guild gained **{plural(total('levels'), 'level')}**, cleared **{plural(total('clears'), 'dungeon')}**, ` |
| 1260 | `{mark} {a[1]}**[{a[0]}]({a[5]})** Lv {a[3]['level']}{gain} \|  · {spec}` |
| 1262 | `…and {len(leveling) - 15} more` |
| 1265 | `⭐ **At {max_level}:** {shown}` |
| 1268 | `title \| 📅 Weekly Recap · {week_start.strftime('%b %-d')} to {week_end.strftime('%b %-d')}` |
| 1269 | `description \| {headline}\n\n**🏆 Leaderboard**\n` |
| 1286 | `name \| 🗝️ Dungeons this week \| value \| inline` |
| 1289 | `name \| 🟣 Epics this week` |
| 1290 | `value \| **{name}** · {a[0]} \| inline` |
| 1298 | `name \| 🛠️ Professions this week \| value \| inline` |
| 1300 | `title \| ✨ Highlights \| color \| fields` |
| 1307 | `name \| inline \| value` |
| 1310 | `title \| 📊 Scoreboard \| color \| fields` |
| 1327 | `title \| 🏅 Awards \| color \| fields` |
| 1328 | `name \| value \| {who(winner)}\n{top:,} {unit[0] if top == 1 else unit[1]} \| inline` |
| 1333 | `footer \| text \| Launch week · counted from level 1` |
| 1370 | `title \| Quiet for {days}+ days` |
| 1371 | `description` |
| 1373 | `footer \| text \| Officers only · based on last login · posted with the weekly recap` |
| 1478 | `friends \| owner \| Tim \| characters \| name \| ... \| surname \| ...` |
| 1480 | `characters \| owner \| Tim \| name \| ... \| surname \| ...` |
| 1504 | `title \| Guild Bot connected` |
| 1505 | `description \| Milestones and progress will post here.` |
| 1569 | `🛡️ **{name}** joined the guild` |
| 1572 | `👋 **{name}** left the guild` |
| 1575 | `title \| Guild roster \| description \| 🛡️ ` |
| 1609 | `Now tracked at level **{snap.get('level') or '?'}**` |
| 1613 | ` · ` |
| 1635 | `Epic mount: **{mname}**` |
| 1637 | `New mount: **{mname}**` |
