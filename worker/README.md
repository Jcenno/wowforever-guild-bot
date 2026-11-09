# Guild Bot Worker

Slash commands for the WoW Forever Discord, running on a Cloudflare Worker with a D1 database. Nothing moves in game automatically.

| Command | What it does |
|---|---|
| `/give <item>` | Posts a card with Need and Greed. After 24 hours (or Close early) the bot names a winner, DMs both people, and the winner presses Received when the item arrives in game. |
| `/iam <character>` | Links your Discord account to your main. Your name takes the class color (needs the bot to have Manage Roles, see below). |
| `/professions <character>` | Skill bars and known recipes for a tracked character. |
| `/who-crafts <recipe>` | Who in the guild knows a matching recipe, most recently online first. |
| `/help` | One line on how giving works. |

Character data comes from the tracker's `state.json` on GitHub (refreshed about every 15 minutes, cached 2 minutes in the Worker).

## Layout
- `src/index.js` handlers, `src/strings.js` every member-facing string.
- `scripts/build.mjs` inlines the two files into `dist/worker.js` (readable) and `dist/worker.flat.js` (for pasting into the Cloudflare editor). Run it after any change to `src/`.
- `schema.sql` tables: `gifts`, `claims`, `chars`.
- `test/` offline checks: `npm test`.

## Deploy
Live Worker: `guild-bot` on Cloudflare, database `guild-bot` (D1). Two ways to ship a change:
1. Cloudflare dashboard → Workers → guild-bot → Edit code → replace with `dist/worker.flat.js` → Deploy. Then open `https://guild-bot.jcenno.workers.dev/register` once so Discord sees any new commands.
2. Cloudflare Builds (once connected: Settings → Build → repo `Jcenno/wowforever-guild-bot`, root `worker`, deploy command `npx wrangler deploy`). Every push to `main` deploys itself.

### First-time setup (already done)
1. `wrangler d1 create guild-bot` → database_id into `wrangler.toml`; `wrangler d1 execute guild-bot --remote --file=schema.sql`.
2. Variables: `DISCORD_APP_ID`, `DISCORD_PUBLIC_KEY`, `GUILD_ID`, `GENERAL_CHANNEL_ID`, `BLIZZARD_REGION`, `BLIZZARD_STATIC_NS`, `CLAIM_HOURS`. Secrets: `DISCORD_BOT_TOKEN`, `BLIZZARD_CLIENT_ID`, `BLIZZARD_CLIENT_SECRET`.
3. Discord developer portal → General Information → Interactions Endpoint URL = the Worker URL.
4. Invite with scopes `bot` + `applications.commands`.

### Class colors (for `/iam`)
The bot creates one role per class (Warrior, Mage, ...) with the standard class colors the first time someone links that class. For that it needs:
- Server Settings → Roles → Guild Bot → Manage Roles on.
- The Guild Bot role dragged above the class roles, and the class roles above any other colored role (Officer), since Discord shows the highest colored role.
Until then `/iam` still saves the link and says the color comes later.
