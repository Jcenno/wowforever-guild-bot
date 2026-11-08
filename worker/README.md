# Guild Bot gifting Worker

`/give <item>` posts a card in #general with Need and Greed. 24 hours later (or on Close early) the bot names a winner, DMs both people, and the winner presses Received when the item arrives in game. Nothing moves in game automatically; Received is the only confirmation.

## Deploy (one time, about 10 minutes)
1. `npm i -g wrangler` and `wrangler login`.
2. `wrangler d1 create guild-bot` → paste the database_id into `wrangler.toml`.
3. `wrangler d1 execute guild-bot --remote --file=schema.sql`
4. Secrets, one at a time (each prompts for the value, nothing is echoed):
   `wrangler secret put DISCORD_PUBLIC_KEY` · `DISCORD_APP_ID` · `DISCORD_BOT_TOKEN` · `BLIZZARD_CLIENT_ID` · `BLIZZARD_CLIENT_SECRET`
5. `wrangler deploy` → copy the Worker URL.
6. Discord developer portal → General Information → Interactions Endpoint URL = that URL → Save (Discord sends a PING; the Worker answers it).
7. `node scripts/register-commands.mjs` with the three env vars set.
8. Invite the bot: OAuth2 → URL Generator → scopes `bot` + `applications.commands`, permissions Send Messages, Embed Links, Read Message History.

## Test
`npm test` runs the offline checks (signature verify, card shape, winner choice).
