# WoW: Forever guild bot

Fork of [tsc862-prog/wow-forever-tracker](https://github.com/tsc862-prog/wow-forever-tracker) with guild features added.

Every 15 minutes it reads the guild roster from Blizzard's API, checks each character, and posts to Discord:

**Milestone cards (one per event, optional role ping)**
- Level 30 / 40 / 50 / 60, and first in the guild to 60. Card shows the character portrait, "Nth to get there" and time since the previous milestone.
- Epic mount (Riding 150, or a "Swift" mount in the collection)
- New member joined the guild

**Progress digest (one card per run, silent)**
- Other level-ups, professions learned and 75/150/225/300 skill marks
- First clear of each dungeon, first kill of each raid boss, achievements
- Every epic equipped, each character's first blue, reputation milestones, new mounts
- Member left the guild
- Weekly recap on Sunday evening: leaderboard, dungeon clears, epics, professions, scoreboard, awards

**Roster board (two embeds in one message, edited every run)**
- Roster: character count, average level, how many at 60, how many played in the last 2 days, raid composition from specs, a level-spread bar, then every character by class with activity dot, level, spec, item level, guild rank, armory link.
- Who crafts what: every primary profession with the crafters and their skill, highest first; best-in-guild for cooking/first aid/fishing; who has no profession yet.

Runs free on GitHub Actions. No server.

## Setup (15 minutes)

### 1. Discord webhooks
Channel settings → Integrations → Webhooks → New Webhook. Make two (webhooks must be created by a person, not a bot, or Discord hides the URL):
- `#general` → copy the URL → this is `DISCORD_WEBHOOK_URL`
- `#roster` → copy the URL → this is `DISCORD_ROSTER_WEBHOOK_URL` (optional; without it the board goes in the same channel)

Optional: make a role like `@Dings` that people can self-assign. Copy its ID (Server Settings → Roles → right-click → Copy Role ID, with Developer Mode on) and put it in `hype_ping_role_id` in `characters.json`. Only big milestones ping it.

### 2. Blizzard API keys
develop.battle.net → API Access → Create Client. Any name, redirect URL `http://localhost`. Copy Client ID and Client Secret.

### 3. GitHub repo
1. New repository (public is simplest), upload this folder including `.github/`.
2. Settings → Secrets and variables → Actions → New repository secret:
   - `BLIZZARD_CLIENT_ID`
   - `BLIZZARD_CLIENT_SECRET`
   - `DISCORD_WEBHOOK_URL`
   - `DISCORD_ROSTER_WEBHOOK_URL` (optional)
3. Settings → Actions → General → Workflow permissions → Read and write.

### 4. Guild name
Edit `characters.json`:
```json
"guild": { "slug": "your-guild-name", "region": "us" }
```
The slug is the guild name lowercased with spaces as hyphens. `rank_names` maps rank index to a label for the cards; adjust to match your in-game ranks (0 is always Guild Master).

Non-guild alts can still be listed under `"friends"` as in the upstream project.

### 5. Test
Actions → WoW Forever guild bot → Run workflow → tick "Only send a test message". A "connected" card should appear.

Run it again unticked. The first run posts "Now tracked" for everyone and records what they already have. From then on only new progress posts.

## Settings (characters.json → settings)

| Setting | What it does |
|---|---|
| `milestone_levels` | Levels that get their own milestone card (default 30, 40, 50, 60) |
| `epic_riding_skill` | Riding skill that counts as the epic mount (150) |
| `epic_mount_names` | Name fragments that mark a mount as epic |
| `hype_ping_role_id` | Role to ping on hype cards; blank = no ping |
| `hype_events` | Which events are loud: `milestone`, `max_level`, `epic_mount`, `guild_join` |
| `roster_board` | Keep the roster message updated |
| `announce_guild_changes` | Post joins and leaves |
| `recap_day`, `recap_hour`, `timezone` | When the weekly recap posts |
| `class_emojis` | Optional server emoji per class |

Everything else is as upstream.

## Notes
- Blizzard only lists a character from level 10, and only after they log out once. The guild roster endpoint shows everyone, so low-level members appear on the board once their profile exists.
- Blizzard's Forever API is undocumented. If the roster endpoint stops answering, the bot logs a warning and keeps working from `friends` plus whatever it already tracks.
- GitHub can delay scheduled runs by a few minutes when busy.
- Public repos get their schedules disabled after 60 days without a commit. The bot's own state commits normally keep it alive.

## Local run
```
BLIZZARD_CLIENT_ID=... BLIZZARD_CLIENT_SECRET=... DISCORD_WEBHOOK_URL=... python3 tracker.py --dry-run
```
Prints the hype cards, updates, recap and roster board without posting or saving.
