# Guild Bot Worker

Slash commands for the WoW Forever Discord, running on a Cloudflare Worker with a D1 database. Nothing moves in game automatically.

| Command | What it does |
|---|---|
| `/give <item> [closes]` | Posts a card with Need and Greed. Need is for the classes the item is made for (armor type, or Blizzard's class list); anyone can Greed. When the timer runs out (`closes`: 1 h, 3 h, 6 h, 12 h or 1 day; default `CLAIM_HOURS`, 3) or on Close early the bot names a winner in a reply under the card (pinging winner and giver), and the winner presses Received when the item arrives in game. One reminder reply after 2 days without Received. Each Need or Greed press gets a private confirmation (in, switched, or already in). No DMs. |
| `/need <recipe>` | Craft request card: mats from Blizzard, item icon, who in the guild knows the recipe (pinged if they ran /iam). I'll make it → Done, or Cancel. Untaken requests close after 7 days. |
| `/iam <character> [alt]` | Links your Discord account to your main, plus one optional alt. Your name takes the main's class color; Need on a gift is allowed for either class; crafter pings reach you for either character. |
| `/professions <character>` | Skill bars and known recipes for a tracked character. |
| `/who-crafts <recipe>` | Who in the guild knows a matching recipe, most recently online first. |
| `/workshop` | What is open right now: gifts and craft requests. |
| `/post-welcome` | Officers only. Posts the "How this works" card with Tank / Healer / DPS toggles (roles found by name, more than one allowed) and a Dings on/off button in the current channel; pin it. Needs Manage Roles. |
| `/stock`, `/stock-set <item> <qty>` | Spare mats people are willing to hand over, grouped by item. Manual, because the API has no bag data. qty 0 removes your line. |
| `/status` | Officers only. Tracker last save, heartbeat token, Manage Roles and role order, open counts, report schedule. |
| `/help` | One line on how giving works. |

Character data comes from the tracker's `state.json` on GitHub (refreshed about every 15 minutes, cached 2 minutes in the Worker).

Cron (every 5 minutes): settles expired gifts, sends the Received reminder, closes stale requests, and on Sunday at 19:00 (`REPORT_DAY`, `REPORT_HOUR`, `TIMEZONE`) posts "This week in the Workshop" to `REPORT_CHANNEL_ID` (falls back to `GENERAL_CHANNEL_ID`). Quiet weeks post nothing. With secret `GITHUB_TOKEN` set (fine-grained token, this repo only, Actions: read and write), the cron also triggers the tracker workflow every 15 minutes, because GitHub's own schedule has been firing only every few hours.

## Layout
- `src/index.js` handlers, `src/strings.js` every member-facing string.
- `scripts/build.mjs` inlines the two files into `dist/worker.js` (readable) and `dist/worker.flat.js` and `dist/worker.paste.js` (comment-free, for pasting into the Cloudflare editor). Run it after any change to `src/`.
- `schema.sql` tables: `gifts`, `claims`, `chars`, `requests`, `stock`, `meta`. Schema changes are applied by hand in the D1 console (`ALTER TABLE` / `CREATE TABLE IF NOT EXISTS`).
- `test/` offline checks: `npm test`.

## Deploy
Live Worker: `guild-bot` on Cloudflare, database `guild-bot` (D1). Two ways to ship a change:
1. Cloudflare dashboard → Workers → guild-bot → Edit code → replace with `dist/worker.paste.js` → Deploy. Then open `https://guild-bot.jcenno.workers.dev/register` once so Discord sees any new commands (add `?key=...` if the optional `REGISTER_KEY` variable is set; Discord rate-limits repeated registrations for about 30 s).
2. Cloudflare Builds (once connected: Settings → Build → repo `Jcenno/wowforever-guild-bot`, root `worker`, deploy command `npx wrangler deploy`). Every push to `main` deploys itself.

### First-time setup (already done)
1. `wrangler d1 create guild-bot` → database_id into `wrangler.toml`; `wrangler d1 execute guild-bot --remote --file=schema.sql`.
2. Variables: `DISCORD_APP_ID`, `DISCORD_PUBLIC_KEY`, `GUILD_ID`, `GENERAL_CHANNEL_ID`, `REPORT_CHANNEL_ID`, `DINGS_ROLE_ID`, `BLIZZARD_REGION`, `BLIZZARD_STATIC_NS`, `CLAIM_HOURS`; optional `REGISTER_KEY`, `REPORT_DAY`, `REPORT_HOUR`, `TIMEZONE`, `GITHUB_REPO`, `STATE_URL`. Secrets (`GITHUB_TOKEN` too): `DISCORD_BOT_TOKEN`, `BLIZZARD_CLIENT_ID`, `BLIZZARD_CLIENT_SECRET`.
3. Discord developer portal → General Information → Interactions Endpoint URL = the Worker URL.
4. Invite with scopes `bot` + `applications.commands`.

### Class colors (for `/iam`)
The bot creates one role per class (Warrior, Mage, ...) with the standard class colors the first time someone links that class. For that it needs:
- Server Settings → Roles → Guild Bot → Manage Roles on.
- The Guild Bot role dragged above the class roles, and the class roles above any other colored role (Officer), since Discord shows the highest colored role.
Until then `/iam` still saves the link and says the color comes later.
