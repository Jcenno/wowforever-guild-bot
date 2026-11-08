// Registers the slash commands on the guild. Run once, and again whenever a command changes:
//   DISCORD_APP_ID=... DISCORD_BOT_TOKEN=... GUILD_ID=1560804753267761233 node scripts/register-commands.mjs
const { DISCORD_APP_ID, DISCORD_BOT_TOKEN, GUILD_ID } = process.env;
const commands = [
  { name: "give", description: "Offer an item you don't need to the guild", options: [
    { type: 3, name: "item", description: "Item name (pick from the list)", required: true, autocomplete: true } ] },
  { name: "help", description: "How giving works, in one line" },
];
const r = await fetch(`https://discord.com/api/v10/applications/${DISCORD_APP_ID}/guilds/${GUILD_ID}/commands`, {
  method: "PUT", headers: { Authorization: `Bot ${DISCORD_BOT_TOKEN}`, "content-type": "application/json" }, body: JSON.stringify(commands) });
console.log(r.status, (await r.json()).map?.((c) => c.name));
