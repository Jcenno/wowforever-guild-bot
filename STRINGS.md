# Member-facing strings

87 strings from `tracker.py`. Regenerate with `python3 tools/extract_strings.py`.

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
| 624 | `Epic riding ({skill})` |
| 627 | `Learned riding ({skill})` |
| 630 | `📜 Learned **{prof}**` |
| 633 | `Epic riding ({skill})` |
| 638 | `Learned riding ({skill})` |
| 643 | `🛠️ **{prof}** reached {max(crossed)} skill` |
| 650 | `Item level **{max(crossed)}**` |
| 657 | `🗝️ Cleared **{inst}** for the first time` |
| 666 | `🐉 Full clear of **{inst}**!` |
| 671 | `⚔️ First kill: **{boss}** ({inst})` |
| 686 | `🗝️ Cleared **{dungeon}** for the first time` |
| 690 | `⚔️ First kill: **{new_k[sid]['boss']}** ({new_k[sid]['instance']})` |
| 703 | `{icon} Reached **{now['name']}** with {faction}` |
| 710 | `🎖️ {name}` |
| 724 | `{icon} Equipped **{it['name']}**{slot}` |
| 726 | `🔵 First blue: **{it['name']}**{slot}` |
| 741 | `name \| name \| quality \| quality` |
| 781 | `name \| url` |
| 787 | `description` |
| 789 | `footer \| text` |
| 802 | `name \| value \| inline` |
| 806 | `title \| Progress` |
| 809 | `footer \| text \| {n} update{'s' if n != 1 else ''} · {len(items)} character{'s' if len(items) != 1 else ''}{extra}` |
| 836 | `**{name}** reached level **{level}**.` |
| 837 | `name \| Guild \| value \| {ordinal(place)} to get there \| inline` |
| 849 | `name \| Time \| value \| {human_duration(now_ts - since_ts)} {since_label} \| inline` |
| 853 | `**{name}** has an epic mount. \|  {detail['mount']}. \| mount` |
| 855 | `name \| Riding \| value \| riding \| inline` |
| 856 | `name \| Level \| value \| level \| inline` |
| 859 | `**{name}** learned to ride.` |
| 864 | `name \| Guild \| value \| {ordinal(order.index(key) + 1)} to get there \| inline` |
| 865 | `name \| Level \| value \| level \| inline` |
| 871 | `**{name}** is the first in the guild recorded to have {verb} **{detail['what']}**.` |
| 872 | `name \| Level \| value \| level \| inline` |
| 874 | `Milestone \| **{name}**: {detail}` |
| 876 | `title` |
| 877 | `description` |
| 880 | `footer \| text` |
| 960 | ` · ` |
| 962 | `name \| {emoji} {cls} · {len(rows)} \| value \| inline` |
| 964 | `title \| Roster` |
| 965 | `description` |
| 968 | `footer \| text \| 🟢 last 2 days · 🟡 last week · ⚫ longer · updates about every 15 min` |
| 989 | `name \| {prof} · {len(rows)} \| value \| inline` |
| 999 | `name \| Secondary (best in guild) \| value \| inline` |
| 1002 | `Need something made? Ask in #general and ping the crafter. 300 is max skill.` |
| 1006 | `title \| Who crafts what` |
| 1007 | `description` |
| 1009 | `fields \| name \| Nothing yet \| value \| Professions appear here as people learn them. \| inline` |
| 1010 | `footer \| text \| Updates about every 15 min` |
| 1158 | `The guild gained **{plural(total('levels'), 'level')}**, cleared **{plural(total('clears'), 'dungeon')}**, ` |
| 1170 | `{mark} {a[1]}**[{a[0]}]({a[5]})** Lv {a[3]['level']}{gain} \|  · {spec}` |
| 1172 | `…and {len(leveling) - 15} more` |
| 1174 | `⭐ **At {max_level}:**  \|  ·  \| {a[1]}[{a[0]}]({a[5]})` |
| 1177 | `title \| 📅 Weekly Recap · {week_start.strftime('%b %-d')} – {week_end.strftime('%b %-d')}` |
| 1178 | `description \| {headline}\n\n**🏆 Leaderboard**\n` |
| 1195 | `name \| 🗝️ Dungeons this week \| value \| inline` |
| 1198 | `name \| 🟣 Epics this week` |
| 1199 | `value \| **{name}** · {a[0]} \| inline` |
| 1207 | `name \| 🛠️ Professions this week \| value \| inline` |
| 1209 | `title \| ✨ Highlights \| color \| fields` |
| 1216 | `name \| inline \| value` |
| 1219 | `title \| 📊 Scoreboard \| color \| fields` |
| 1236 | `title \| 🏅 Awards \| color \| fields` |
| 1237 | `name \| value \| {who(winner)}\n{top:,} {unit[0] if top == 1 else unit[1]} \| inline` |
| 1242 | `footer \| text \| Launch week · counted from level 1` |
| 1279 | `title \| Quiet for {days}+ days` |
| 1280 | `description` |
| 1282 | `footer \| text \| Officers only · based on last login · posted with the weekly recap` |
| 1334 | `friends \| name \| Tim \| characters \| name \| ... \| surname \| ...` |
| 1336 | `characters \| owner \| Tim \| name \| ... \| surname \| ...` |
| 1360 | `title \| Guild Bot connected` |
| 1361 | `description \| Milestones and progress will post here.` |
| 1415 | `🛡️ **{name}** joined the guild` |
| 1418 | `👋 **{name}** left the guild` |
| 1421 | `title \| Guild roster \| description \| 🛡️ ` |
| 1455 | `Now tracked at level **{snap.get('level') or '?'}**` |
| 1459 | ` · ` |
| 1481 | `Epic mount: **{mname}**` |
| 1483 | `New mount: **{mname}**` |
