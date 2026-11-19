const S = {
giveTitle: (item) => `**${item}**`,
giveMeta: (parts) => parts.filter(Boolean).join(" · "),
giveFrom: (giver, closes) => `From **${giver}** · closes <t:${closes}:R>`,
giveFromClosed: (giver) => `From **${giver}** · closed`,
counts: (need, greed) => `Need **${need}** · Greed **${greed}**`,
needBtn: "Need", greedBtn: "Greed", closeBtn: "Close early", receivedBtn: "Received",
notYours: "Only the giver can do that.",
closed: "This one is closed.",
ownGift: "That one is yours.",
wrongClass: (classes) => `That one is for ${classes.join(", ")}. Greed is fine.`,
linkFirst: "Run `/iam` once so the bot knows your class, then press Need.",
nudge: (item, winner) => `${winner}, did **${item}** arrive? Press Received on the card when it does.`,
youIn: (kind) => `You're in as ${kind === "need" ? "Need" : "Greed"}.`,
youSwitched: (kind) => `Switched to ${kind === "need" ? "Need" : "Greed"}.`,
alreadyIn: (kind) => `Already in as ${kind === "need" ? "Need" : "Greed"}. The card updates when it closes.`,
needExpired: "Nobody picked this up in a week. Post it again when you still need it.",
awarded: (item, winner) => `**${item}** → **${winner}**. Mail when you can.`,
noTakers: (item) => `**${item}** · no takers · stays with the giver`,
handoff: (item, winner, giver) => `**${item}** → ${winner}. ${giver}, mail or trade it when you're on. ${winner} presses *Received* on the card when it lands.`,
itemNotFound: "No item by that name. Pick one from the list.",
helpLine: "`/give` an item you don't need. `/need` something crafted; it pings the people who can make it. Press Need or Greed on a gift card; when it closes the bot names the winner under the card and the winner presses Received. `/iam` links your main so your name takes its class color. `/professions` and `/who-crafts` look things up.",
iamLinked: (name, cls) => `You are **${name}** (${cls}).`,
iamAlt: (name, cls) => ` Alt: **${name}** (${cls}).`,
iamTracked: "Now tracked: you'll show on the roster within about 15 minutes and on the AH tracker within the hour.",
linkFull: "The roster is full right now. Ask an officer to make room.",
iamFailed: "Something went wrong saving that. Try again in a minute.",
iamAltSame: "Your alt is the same character as your main. Pick a different alt, or leave it out.",
specOn: (role) => `${role} added.`,
specOff: (role) => `${role} removed.`,
specMissing: (role) => `The ${role} role does not exist on this server yet. Ask an officer.`,
iamRoleLater: "Class color comes once an officer lets the bot manage roles.",
iamNoClass: "Class not recorded yet; the color comes after the next roster check.",
notWinner: "Only the winner can do that.",
needClosed: "This request is closed.",
postFailed: "Couldn't post here. Check the bot can send messages in this channel.",
unknownCommand: "Unknown command.",
noSuchChar: "No tracked character by that name.",
needTitle: (who, recipe, prof) => `**${who}** needs **${recipe}**${prof ? ` · ${prof}` : ""}`,
needMats: (mats) => (mats.length ? `Mats: ${mats.map((m) => `${m.qty}× ${m.name}`).join(", ")}` : "Mats: not listed"),
needCrafters: (list) => `Can make it: ${list}`,
needOpen: "Bring the mats or ask the crafter what they need.",
needClaimed: (maker) => `**${maker}** is on it.`,
needDone: (maker) => `Made by **${maker}**.`,
needCancelled: "Cancelled.",
makeBtn: "I'll make it", doneBtn: "Done", cancelBtn: "Cancel",
needNotOpen: "Someone already took this one.",
needNotYours: "Only the requester or the crafter can do that.",
needNobody: (q) => `Nobody in the guild knows **${q}** yet. Ask in <#1560804753963745392> or try /who-crafts with part of the name.`,
noRecipes: "No recipes recorded yet. They appear after the next check.",
nobodyCrafts: (q) => `Nobody in the guild knows a recipe matching "${q}" yet.`,
whoCraftsTitle: (q) => `Who can make "${q}"`,
reportTitle: "This week in the Workshop",
pollHow: "Pick your top 4. 1st choice gets 4 points, 2nd gets 3, 3rd gets 2, 4th gets 1. You can vote again to change your picks.",
pollBallots: (n) => `**${n}** ballot${n === 1 ? "" : "s"} in. Results show when the poll closes.`,
pollVoteBtn: "Vote",
pollCloseBtn: "Close poll",
pollStep: (step, split) => `Pick your **${["1st", "2nd", "3rd", "4th"][step - 1]} choice** (${step} of 4).${split ? " The names are split across two menus, use either one." : ""}`,
pollPick: (step) => `${["1st", "2nd", "3rd", "4th"][step - 1]} choice`,
pollPickPart: (step, a, b) => `${["1st", "2nd", "3rd", "4th"][step - 1]} choice: ${a} to ${b}`.slice(0, 150),
pollSoFar: (names) => names.map((n, k) => `${k + 1}. ${n}`).join("\n"),
pollDone: (names) => `Your ballot:\n${names.map((n, k) => `${k + 1}. **${n}**`).join("\n")}\nPress Vote again any time to change it.`,
pollWinner: (name) => `🏆 **${name}** wins.`,
pollNoVotes: "No votes came in.",
pollClosed: (n) => `Closed · ${n} ballot${n === 1 ? "" : "s"}`,
pollNeedOptions: "Give at least 3 choices, separated by semicolons.",
pollGone: "That poll is gone.",
pollPosted: (ch) => `Poll posted in <#${ch}>.`,
pollIsClosed: "This poll is closed.",
linkBtn: "Link my character",
linkTitle: "Link your character",
linkLabel: "Character name (first and last)",
linkPlaceholder: "Steel Appeal",
linkDone: (name, cls, level) => `Linked **${name}**${cls ? ` (${level ? `level ${level} ` : ""}${cls})` : ""}. You'll show up on the roster within about 15 minutes.`,
linkNotFound: (name) => `Couldn't find **${name}**. Check the spelling, log in with that character once, then try again in a few minutes.`,
linkTaken: (name) => `**${name}** is already linked to someone else. Ask an officer if that's wrong.`,
welcome: [
"**Welcome to Short Shaft Mining Co**",
"",
"**New here?** Press *Link my character* below and type your character's name. That sets your class color and adds you to <#1568797253680767078>.",
"",
"<#1572971002214748210> is guild chat. It runs both ways with the game. To have your in-game messages show up, link your account once in game: Escape, Options, Social, Enable Discord Functionality.",
"<#1560804753963745392> gets a ding card every 10 levels. Skills, recipes and rep go to <#1569828382584082603>.",
"<#1568797253680767078> shows who plays what and who can craft what.",
"<#1568797262065311856> is for gifts and crafting requests. `/give` an item you don't need and others press Need or Greed. `/need` something crafted and whoever can make it gets a ping.",
"",
"**Tank, Healer, DPS:** press what you play. More than one is fine.",
"**Dings pings** are off unless you turn them on below.",
].join("\n"),
dingsBtn: "Dings pings: on / off",
dingsOn: "Dings pings on. You'll be pinged for the big milestones.",
dingsOff: "Dings pings off.",
dingsNoRole: "Ask an officer to let the bot manage roles first.",
dingsNotSet: "The Dings role isn't set up yet. Ask an officer.",
welcomePosted: "Posted. Pin it from the message menu.",
officersOnly: "Officers only.",
statusTitle: "The Canary status",
stockTitle: "Spare mats in the guild",
stockEmpty: "Nobody has listed spare mats yet. `/stock-set` adds yours.",
stockSet: (item, qty) => (qty > 0 ? `You have **${qty}× ${item}** spare. Listed.` : `**${item}** removed from your spares.`),
stockLine: (item, entries) => `**${item}** · ${entries.map((e) => `${e.qty} ${e.user_name}`).join(", ")}`,
workshopTitle: "Workshop · open right now",
workshopEmpty: "Nothing open. `/need` something or `/give` something.",
workshopGift: (item, giver, closes) => `🎁 **${item}** from ${giver} · closes <t:${closes}:R>`,
workshopReq: (recipe, who, maker) => `🔨 **${recipe}** for ${who}${maker ? ` · ${maker} is on it` : " · nobody yet"}`,
reportGifts: (n, top) => `**${n}** item${n === 1 ? "" : "s"} passed on${top ? ` · most from **${top}**` : ""}`,
reportCrafts: (n, top) => `**${n}** craft${n === 1 ? "" : "s"} made${top ? ` · most by **${top}**` : ""}`,
reportOpen: (gifts, reqs) => `Open now: ${gifts} gift${gifts === 1 ? "" : "s"}, ${reqs} request${reqs === 1 ? "" : "s"}`,
};
const API = "https://discord.com/api/v10";
const T = { PING: 1, COMMAND: 2, COMPONENT: 3, AUTOCOMPLETE: 4, MODAL_SUBMIT: 5 };
const R = { PONG: 1, MESSAGE: 4, DEFER: 5, UPDATE: 7, AUTOCOMPLETE: 8, MODAL: 9 };
const FLAGS = { EPHEMERAL: 1 << 6, V2: 1 << 15 };
const QUALITY_COLOR = { POOR: 0x9d9d9d, COMMON: 0xffffff, UNCOMMON: 0x1eff00, RARE: 0x0070dd, EPIC: 0xa335ee, LEGENDARY: 0xff8000 };
const SLOT = { HEAD: "Head", NECK: "Neck", SHOULDER: "Shoulder", CHEST: "Chest", ROBE: "Chest", WAIST: "Waist", LEGS: "Legs", FEET: "Feet", WRIST: "Wrist", HAND: "Hands",
FINGER: "Ring", TRINKET: "Trinket", CLOAK: "Back", WEAPON: "One-hand", SHIELD: "Shield", RANGED: "Ranged", RANGEDRIGHT: "Ranged", TWOHWEAPON: "Two-hand",
WEAPONMAINHAND: "Main hand", WEAPONOFFHAND: "Off hand", HOLDABLE: "Off hand", BAG: "Bag", NON_EQUIP: "" };
async function verify(req, body, publicKey) {
const sig = req.headers.get("x-signature-ed25519"), ts = req.headers.get("x-signature-timestamp");
if (!sig || !ts) return false;
const key = await crypto.subtle.importKey("raw", hex(publicKey), { name: "Ed25519" }, false, ["verify"]);
return crypto.subtle.verify("Ed25519", key, hex(sig), new TextEncoder().encode(ts + body));
}
const hex = (h) => new Uint8Array(h.match(/.{2}/g).map((b) => parseInt(b, 16)));
const json = (o, status = 200) => new Response(JSON.stringify(o), { status, headers: { "content-type": "application/json" } });
async function discord(env, method, path, body) {
const r = await fetch(API + path, { method, headers: { Authorization: `Bot ${env.DISCORD_BOT_TOKEN}`, "content-type": "application/json", "User-Agent": "GuildBot (gifting, 1.0)" },
body: body ? JSON.stringify(body) : undefined });
if (!r.ok) console.log(`[discord] ${method} ${path} -> ${r.status} ${await r.text()}`);
return r.ok ? (r.status === 204 ? null : r.json()) : null;
}
const who = (i) => (i.member?.user || i.user);
const display = (i) => i.member?.nick || who(i).global_name || who(i).username;
let tokenCache = { value: null, exp: 0 };
async function bnetToken(env) {
if (tokenCache.value && Date.now() < tokenCache.exp) return tokenCache.value;
const r = await fetch("https://oauth.battle.net/token", { method: "POST",
headers: { Authorization: "Basic " + btoa(`${env.BLIZZARD_CLIENT_ID}:${env.BLIZZARD_CLIENT_SECRET}`), "content-type": "application/x-www-form-urlencoded" },
body: "grant_type=client_credentials" });
const j = await r.json();
tokenCache = { value: j.access_token, exp: Date.now() + (j.expires_in - 60) * 1000 };
return j.access_token;
}
async function bnet(env, path, params = {}, namespace = env.BLIZZARD_STATIC_NS) {
const tok = await bnetToken(env);
const u = new URL(`https://${env.BLIZZARD_REGION}.api.blizzard.com${path}`);
u.searchParams.set("namespace", namespace);
u.searchParams.set("locale", "en_US");
for (const [k, v] of Object.entries(params)) u.searchParams.set(k, v);
const r = await fetch(u, { headers: { Authorization: `Bearer ${tok}` } });
return r.ok ? r.json() : null;
}
const JUNK = /^(\[PH\]|\[DEPRECATED\]|Monster - |OLD |QA |TEST |Deprecated|zz|AHNQIRAJ TEST|\[UNUSED\]|UNUSED|NYI)|\b(test item|Deprecated|Unused|DEBUG|PLACEHOLDER)\b/i;
async function searchItems(env, q) {
const j = await bnet(env, "/data/wow/search/item", { "name.en_US": q, orderby: "id", _pageSize: 100 });
const seen = new Set(), out = [], ql = q.toLowerCase();
for (const r of j?.results || []) {
const name = r.data?.name?.en_US || r.data?.name; const id = r.data?.id;
if (!name || !id || seen.has(name) || JUNK.test(name)) continue;
seen.add(name); out.push({ name: `${name}`.slice(0, 100), value: String(id) });
}
const rank = (n) => (n.toLowerCase() === ql ? 0 : n.toLowerCase().startsWith(ql) ? 1 : 2);
return out.sort((a, b) => rank(a.name) - rank(b.name) || a.name.localeCompare(b.name)).slice(0, 25);
}
async function itemDetails(env, id) {
const [it, media] = await Promise.all([bnet(env, `/data/wow/item/${id}`), bnet(env, `/data/wow/media/item/${id}`)]);
if (!it) return null;
const name = it.name?.en_US || it.name;
const classes = it.preview_item?.requirements?.playable_classes?.links?.map((c) => c.name?.en_US || c.name) || null;
return {
id, name, icon: media?.assets?.[0]?.value || null, level: it.level || null,
slot: SLOT[it.inventory_type?.type] ?? (it.inventory_type?.name?.en_US || it.inventory_type?.name || ""),
armor: it.item_class?.name?.en_US === "Armor" || it.item_class?.name === "Armor" ? (it.item_subclass?.name?.en_US || it.item_subclass?.name) : (it.item_subclass?.name?.en_US || it.item_subclass?.name || ""),
quality: (it.quality?.type || "COMMON"), req_level: it.required_level || null, classes,
};
}
let stateCache = { value: null, exp: 0 };
async function trackerState(env) {
if (stateCache.value && Date.now() < stateCache.exp) return stateCache.value;
try {
const r = await fetch(env.STATE_URL || "https://raw.githubusercontent.com/Jcenno/wowforever-guild-bot/main/state.json", { cf: { cacheTtl: 120 } });
if (!r.ok) throw new Error(`state ${r.status}`);
const j = await r.json();
stateCache = { value: j, exp: Date.now() + 2 * 60 * 1000 };
return j;
} catch (e) {
console.log(`[state] ${e}`);
return stateCache.value || { characters: {} }; // keep the last good copy, do not cache the failure
}
}
const dec = (w) => { try { return decodeURIComponent(w); } catch { return w; } };
const charName = (key) => key.split(":").pop().split("-").map(dec).filter(Boolean).map((w) => w[0].toUpperCase() + w.slice(1)).join(" ");
const tier = (sk) => (sk >= 225 ? "Artisan" : sk >= 150 ? "Expert" : sk >= 75 ? "Journeyman" : "Apprentice");
const bar = (sk, w = 6) => { const f = Math.max(0, Math.min(w, Math.round((sk / 300) * w))); return "▰".repeat(f) + "▱".repeat(w - f); };
const SECONDARY = new Set(["cooking", "first aid", "fishing", "riding"]);
const CLASS_COLOR = { Warrior: 0xc69b6d, Paladin: 0xf48cba, Hunter: 0xaad372, Rogue: 0xfff468, Priest: 0xffffff, Shaman: 0x0070dd, Mage: 0x3fc7eb, Warlock: 0x8788ee, Druid: 0xff7c0a };
function findChar(st, q) {
q = (q || "").trim().toLowerCase();
if (!q) return null;
const keys = Object.keys(st.characters || {});
return keys.find((k) => k.endsWith(":" + q)) || keys.find((k) => charName(k).toLowerCase() === q) || keys.find((k) => charName(k).toLowerCase().startsWith(q)) || null;
}
async function syncClassRole(env, userId, cls) {
if (!CLASS_COLOR[cls]) return false;
const roles = await discord(env, "GET", `/guilds/${env.GUILD_ID}/roles`);
if (!roles) return false;
let role = roles.find((r) => r.name === cls);
if (!role) {
role = await discord(env, "POST", `/guilds/${env.GUILD_ID}/roles`, { name: cls, color: CLASS_COLOR[cls], permissions: "0", hoist: false, mentionable: false });
if (!role) return false;
const officer = roles.find((r) => r.name === "Shaft Master" || r.name === "Officer");
if (officer) await discord(env, "PATCH", `/guilds/${env.GUILD_ID}/roles`, [{ id: role.id, position: officer.position }]);
}
const member = await discord(env, "GET", `/guilds/${env.GUILD_ID}/members/${userId}`);
if (!member) return false;
const others = roles.filter((r) => r.name !== cls && CLASS_COLOR[r.name] && member.roles.includes(r.id));
for (const o of others) await discord(env, "DELETE", `/guilds/${env.GUILD_ID}/members/${userId}/roles/${o.id}`);
if (member.roles.includes(role.id)) return true;
const r = await fetch(`${API}/guilds/${env.GUILD_ID}/members/${userId}/roles/${role.id}`, { method: "PUT", headers: { Authorization: `Bot ${env.DISCORD_BOT_TOKEN}`, "User-Agent": "GuildBot (gifting, 1.0)" } });
if (!r.ok) console.log(`[iam] role add -> ${r.status} ${await r.text()}`);
return r.ok;
}
export const LINK_MAX = 40;
export async function resolveChar(env, st, q, lookup = blizzChar) {
q = String(q || "").trim();
if (!q) return null;
const keys = Object.keys(st.characters || {}), ql = q.toLowerCase();
const exact = keys.find((k) => k.endsWith(":" + ql)) || keys.find((k) => charName(k).toLowerCase() === ql.replace(/\s+/g, " "));
if (exact) return { key: exact, name: charName(exact), cls: st.characters[exact].class || "", isNew: false };
const b = await lookup(env, q);
if (b) return { ...b, isNew: true };
const part = keys.find((k) => charName(k).toLowerCase().startsWith(ql));
if (part) return { key: part, name: charName(part), cls: st.characters[part].class || "", isNew: false };
return { miss: (parseCharName(q) || {}).display || q };
}
async function blizzChar(env, raw) {
const c = parseCharName(raw);
if (!c) return null;
const region = (env.BLIZZARD_REGION || "us").toLowerCase();
const prof = await bnet(env, `/profile/wow/character/${c.slug}`, {}, env.BLIZZARD_PROFILE_NS || `profile-forever-${region}`).catch(() => null);
if (!prof?.name) return null;
return { key: `${region}:${c.slug}`, name: [prof.name, prof.surname].filter(Boolean).join(" ") || c.display, cls: prof.character_class?.name || "", level: prof.level || null };
}
async function onIam(i, env, ctx) {
const q = i.data.options?.find((o) => o.name === "character")?.value || "";
const altQ = i.data.options?.find((o) => o.name === "alt")?.value || "";
const u = who(i), owner = display(i);
const reply = (content) => fetch(`${API}/webhooks/${env.DISCORD_APP_ID}/${i.token}/messages/@original`, { method: "PATCH",
headers: { "content-type": "application/json" }, body: JSON.stringify({ content, allowed_mentions: { parse: [] } }) }).catch((e) => console.log(`[iam] edit ${e}`));
ctx.waitUntil((async () => { try {
const st = await trackerState(env);
const main = await resolveChar(env, st, q);
if (!main) return reply(S.noSuchChar);
if (main.miss) return reply(S.linkNotFound(main.miss));
const alt = altQ ? await resolveChar(env, st, altQ) : null;
if (alt && alt.miss) return reply(S.linkNotFound(alt.miss));
if (alt && alt.key === main.key) return reply(S.iamAltSame);
await ensureOwnerColumn(env);
for (const c of [main, alt].filter(Boolean)) {
const taken = await env.DB.prepare("SELECT user_id FROM chars WHERE (surname=? OR alt=?) AND user_id<>?").bind(c.key, c.key, u.id).first();
if (taken) return reply(S.linkTaken(c.name));
}
const mine = await env.DB.prepare("SELECT user_id FROM chars WHERE user_id=?").bind(u.id).first();
if (!mine && (main.isNew || (alt && alt.isNew))) {
const n = await env.DB.prepare("SELECT COUNT(*) AS n FROM chars").first();
if ((n?.n || 0) >= LINK_MAX) return reply(S.linkFull);
}
await env.DB.prepare("INSERT INTO chars (user_id,name,surname,class,alt,alt_class,owner,updated_at) VALUES (?,?,?,?,?,?,?,?) ON CONFLICT(user_id) DO UPDATE SET name=excluded.name, surname=excluded.surname, class=excluded.class, alt=CASE WHEN excluded.alt IS NOT NULL THEN excluded.alt WHEN chars.alt=excluded.surname THEN NULL ELSE chars.alt END, alt_class=CASE WHEN excluded.alt IS NOT NULL THEN excluded.alt_class WHEN chars.alt=excluded.surname THEN NULL ELSE chars.alt_class END, owner=excluded.owner, updated_at=excluded.updated_at")
.bind(u.id, main.name, main.key, main.cls, alt ? alt.key : null, alt ? alt.cls : null, owner, now()).run();
let note = "";
if (!main.cls) note = S.iamNoClass;
else if (!(await syncClassRole(env, u.id, main.cls).catch((e) => (console.log(`[iam] ${e}`), false)))) note = S.iamRoleLater;
const text = S.iamLinked(main.name, main.cls || "class unknown") + (alt ? S.iamAlt(alt.name, alt.cls || "class unknown") : "")
+ ((main.isNew || (alt && alt.isNew)) ? "\n" + S.iamTracked : "") + (note ? "\n" + note : "");
return reply(text);
} catch (e) { console.log(`[iam] ${e}`); return reply(S.iamFailed); } })());
return json({ type: R.DEFER, data: { flags: FLAGS.EPHEMERAL } });
}
async function onProfessions(i, env) {
const q = (i.data.options?.find((o) => o.name === "character")?.value || "").trim().toLowerCase();
const st = await trackerState(env);
const key = findChar(st, q);
if (!key) return json({ type: R.MESSAGE, data: { content: S.noSuchChar, flags: FLAGS.EPHEMERAL } });
const c = st.characters[key], profs = c.professions || {}, recipes = c.recipes || {};
const lines = [];
for (const [prof, skill] of Object.entries(profs).sort((a, b) => b[1] - a[1])) {
if (prof.toLowerCase() === "riding" || !skill) continue;
const known = (recipes[prof] || []).filter((r) => r.name.toLowerCase() !== prof.toLowerCase());
lines.push(`**${prof}** ${bar(skill)} ${skill} ${tier(skill)}${known.length ? ` · ${known.length} recipes` : ""}`);
if (known.length) {
const names = known.map((r) => r.name).sort();
lines.push(names.slice(0, 20).join(", ") + (names.length > 20 ? `, +${names.length - 20} more` : ""));
}
}
const content = `**${charName(key)}** · level ${c.level || "?"} ${c.class || ""}\n\n` + (lines.join("\n") || S.noRecipes);
return json({ type: R.MESSAGE, data: { content: content.slice(0, 1900), flags: FLAGS.EPHEMERAL, allowed_mentions: { parse: [] } } });
}
async function onWhoCrafts(i, env) {
const q = (i.data.options?.find((o) => o.name === "recipe")?.value || "").trim();
const ql = q.toLowerCase();
const st = await trackerState(env);
const hits = [];
for (const [key, c] of Object.entries(st.characters || {})) {
for (const [prof, known] of Object.entries(c.recipes || {})) {
const match = (known || []).filter((r) => r.name.toLowerCase().includes(ql));
if (match.length) hits.push({ name: charName(key), prof, skill: (c.professions || {})[prof] || 0, recipes: match.map((r) => r.name).sort(), last: c.last_login || 0 });
}
}
if (!hits.length) return json({ type: R.MESSAGE, data: { content: S.nobodyCrafts(q), flags: FLAGS.EPHEMERAL } });
hits.sort((a, b) => b.last - a.last || b.skill - a.skill);
const two = 2 * 24 * 3600 * 1000, week = 7 * two / 2;
const dot = (ms) => (Date.now() - ms < two ? "🟢" : Date.now() - ms < week ? "🟡" : "⚫");
const lines = hits.slice(0, 12).map((h) => `${dot(h.last)} **${h.name}** · ${h.prof} ${h.skill} · ${h.recipes.slice(0, 4).join(", ")}${h.recipes.length > 4 ? ` +${h.recipes.length - 4}` : ""}`);
return json({ type: R.MESSAGE, data: { content: (`**${S.whoCraftsTitle(q)}**\n` + lines.join("\n")).slice(0, 1900), flags: FLAGS.EPHEMERAL, allowed_mentions: { parse: [] } } });
}
async function onCharAutocomplete(i, env) {
const q = (i.data.options?.find((o) => o.focused)?.value || "").trim().toLowerCase();
const st = await trackerState(env);
const names = Object.keys(st.characters || {}).map(charName).filter((n) => n.toLowerCase().includes(q)).sort().slice(0, 25);
return json({ type: R.AUTOCOMPLETE, data: { choices: names.map((n) => ({ name: n, value: n })) } });
}
async function recipeInfo(env, id) {
const r = await bnet(env, `/data/wow/recipe/${id}`);
if (!r) return { mats: [], icon: null };
const mats = (r.reagents || []).map((x) => ({ name: x.reagent?.name?.en_US || x.reagent?.name, qty: x.quantity || 1 })).filter((m) => m.name);
const itemId = r.crafted_item?.id || r.alliance_crafted_item?.id || r.horde_crafted_item?.id;
const media = itemId ? await bnet(env, `/data/wow/media/item/${itemId}`) : null;
return { mats, icon: media?.assets?.[0]?.value || null };
}
function guildRecipes(st) {
const out = {};
for (const [key, c] of Object.entries(st.characters || {})) {
for (const [prof, known] of Object.entries(c.recipes || {})) {
for (const r of known || []) {
if (!r.name || r.name.toLowerCase() === prof.toLowerCase()) continue;
const e = (out[r.name.toLowerCase()] ||= { name: r.name, id: r.id, prof, crafters: [] });
e.crafters.push({ key, name: charName(key), skill: (c.professions || {})[prof] || 0, last: c.last_login || 0 });
}
}
}
return out;
}
const textBlock = (content, icon) => (icon ? { type: 9, components: [{ type: 10, content }], accessory: { type: 11, media: { url: icon } } } : { type: 10, content });
const activityDot = (ms) => (Date.now() - ms < 2 * 86400000 ? "🟢" : Date.now() - ms < 7 * 86400000 ? "🟡" : "⚫");
export function requestCard(q, state = "open") {
const mats = q.mats ? JSON.parse(q.mats) : [];
const crafters = q.crafters ? JSON.parse(q.crafters) : [];
const lines = [S.needTitle(q.user_name, q.recipe_name, q.profession), S.needMats(mats)];
if (crafters.length) lines.push(S.needCrafters(crafters.map((c) => `${activityDot(c.last)} **${c.name}** (${c.skill})${c.user ? ` <@${c.user}>` : ""}`).join(" · ")));
if (state === "open") lines.push(S.needOpen);
if (state === "claimed") lines.push(S.needClaimed(q.maker_name));
if (state === "done") lines.push(S.needDone(q.maker_name));
if (state === "cancelled") lines.push(S.needCancelled);
if (state === "expired") lines.push(S.needExpired);
const section = textBlock(lines.join("\n"), q.icon);
const container = { type: 17, accent_color: 0x9b59b6, components: [section] };
const buttons = [];
if (state === "open") buttons.push({ type: 2, style: 1, label: S.makeBtn, custom_id: `make:${q.id}` });
if (state === "claimed") buttons.push({ type: 2, style: 3, label: S.doneBtn, custom_id: `done:${q.id}` });
if (state === "open" || state === "claimed") buttons.push({ type: 2, style: 2, label: S.cancelBtn, custom_id: `cancel:${q.id}` });
if (buttons.length) container.components.push({ type: 14, divider: true, spacing: 1 }, { type: 1, components: buttons });
const users = crafters.map((c) => c.user).filter(Boolean);
return { flags: FLAGS.V2, components: [container], allowed_mentions: { users } };
}
async function onNeed(i, env, ctx) {
const qtext = (i.data.options?.find((o) => o.name === "recipe")?.value || "").trim();
const st = await trackerState(env);
const all = guildRecipes(st);
const ql = qtext.toLowerCase();
const hit = ql ? all[ql] || Object.values(all).find((e) => e.name.toLowerCase().includes(ql)) : null;
if (!hit) return json({ type: R.MESSAGE, data: { content: S.needNobody(qtext), flags: FLAGS.EPHEMERAL } });
const top = hit.crafters.sort((a, b) => b.last - a.last || b.skill - a.skill).slice(0, 6);
const keys = top.map((c) => c.key);
const ph = keys.map(() => "?").join(",");
const linked = keys.length ? (await env.DB.prepare(`SELECT user_id, surname, alt FROM chars WHERE surname IN (${ph}) OR alt IN (${ph})`).bind(...keys, ...keys).all()).results : [];
const crafters = top.map((c) => ({ ...c, user: linked.find((l) => l.surname === c.key || l.alt === c.key)?.user_id || null }));
const info = await recipeInfo(env, hit.id);
const u = who(i), uname = display(i), t = now();
const row = await env.DB.prepare(`INSERT INTO requests (user_id,user_name,recipe_id,recipe_name,profession,icon,mats,crafters,channel_id,token,created_at)
VALUES (?,?,?,?,?,?,?,?,?,?,?) RETURNING id`).bind(u.id, uname, hit.id, hit.name, hit.prof, info.icon, JSON.stringify(info.mats), JSON.stringify(crafters), i.channel_id, i.token, t).first();
const q = { id: row.id, user_id: u.id, user_name: uname, recipe_name: hit.name, profession: hit.prof, icon: info.icon, mats: JSON.stringify(info.mats), crafters: JSON.stringify(crafters) };
ctx.waitUntil((async () => {
for (let attempt = 0; attempt < 4; attempt++) {
await new Promise((r) => setTimeout(r, 1500 * (attempt + 1)));
const m = await fetch(`${API}/webhooks/${env.DISCORD_APP_ID}/${i.token}/messages/@original`).then((r) => (r.ok ? r.json() : null)).catch(() => null);
if (m?.id) { await env.DB.prepare("UPDATE requests SET message_id=? WHERE id=?").bind(m.id, q.id).run(); return; }
}
})());
return json({ type: R.MESSAGE, data: requestCard(q) });
}
async function onRecipeAutocomplete(i, env) {
const ql = (i.data.options?.find((o) => o.focused)?.value || "").trim().toLowerCase();
const st = await trackerState(env);
const names = Object.values(guildRecipes(st)).map((e) => e.name).filter((n) => n.toLowerCase().includes(ql)).sort().slice(0, 25);
return json({ type: R.AUTOCOMPLETE, data: { choices: names.map((n) => ({ name: n, value: n })) } });
}
async function onRequestButton(i, env, action, id) {
const q = await env.DB.prepare("SELECT * FROM requests WHERE id=?").bind(id).first();
const u = who(i), uname = display(i);
const eph = (content) => json({ type: R.MESSAGE, data: { content, flags: FLAGS.EPHEMERAL } });
if (!q) return eph(S.needClosed);
if (action === "make") {
if (q.status !== "open") return eph(S.needNotOpen);
const res = await env.DB.prepare("UPDATE requests SET status='claimed', maker_id=?, maker_name=?, updated_at=? WHERE id=? AND status='open'").bind(u.id, uname, now(), id).run();
if (!res.meta.changes) return eph(S.needNotOpen);
return json({ type: R.UPDATE, data: requestCard({ ...q, maker_id: u.id, maker_name: uname }, "claimed") });
}
if (action === "done") {
if (q.status !== "claimed") return eph(S.needClosed);
if (u.id !== q.user_id && u.id !== q.maker_id && !isOfficer(i)) return eph(S.needNotYours);
const res = await env.DB.prepare("UPDATE requests SET status='done', updated_at=? WHERE id=? AND status='claimed'").bind(now(), id).run();
if (!res.meta.changes) return eph(S.needClosed);
return json({ type: R.UPDATE, data: requestCard(q, "done") });
}
if (action === "cancel") {
if (q.status === "done" || q.status === "cancelled") return eph(S.needClosed);
if (u.id !== q.user_id && u.id !== q.maker_id && !isOfficer(i)) return eph(S.needNotYours);
const res = await env.DB.prepare("UPDATE requests SET status='cancelled', updated_at=? WHERE id=? AND status IN ('open','claimed')").bind(now(), id).run();
if (!res.meta.changes) return eph(S.needClosed);
return json({ type: R.UPDATE, data: requestCard(q, "cancelled") });
}
return eph(S.needClosed);
}
export function card(g, counts, state = "open") {
const meta = S.giveMeta([g.item_level ? `ilvl ${g.item_level}` : null, g.slot, g.armor, g.quality ? g.quality[0] + g.quality.slice(1).toLowerCase() : null,
g.req_level ? `req ${g.req_level}` : null]);
const lines = [S.giveTitle(g.item_name), meta, state === "open" ? S.giveFrom(g.giver_name, g.expires_at) : S.giveFromClosed(g.giver_name)];
if (state === "open") lines.push(S.counts(counts.need, counts.greed));
if (state === "awarded") lines.push(S.awarded(g.item_name, g.winner_name));
if (state === "expired") lines.push(S.noTakers(g.item_name));
if (state === "received") lines.push(`**${g.item_name}** → **${g.winner_name}** · received`);
const section = textBlock(lines.join("\n"), g.item_icon);
const container = { type: 17, accent_color: QUALITY_COLOR[g.quality] ?? 0x5865f2, components: [section] };
if (state === "open") container.components.push({ type: 14, divider: true, spacing: 1 }, { type: 1, components: [
{ type: 2, style: 1, label: S.needBtn, custom_id: `need:${g.id}` },
{ type: 2, style: 2, label: S.greedBtn, custom_id: `greed:${g.id}` },
{ type: 2, style: 4, label: S.closeBtn, custom_id: `close:${g.id}` },
] });
if (state === "awarded") container.components.push({ type: 14, divider: true, spacing: 1 }, { type: 1, components: [
{ type: 2, style: 3, label: S.receivedBtn, custom_id: `got:${g.id}` },
] });
return { flags: FLAGS.V2, components: [container], allowed_mentions: { parse: [] } };
}
const now = () => Math.floor(Date.now() / 1000);
async function counts(env, giftId) {
const r = await env.DB.prepare("SELECT kind, COUNT(*) n FROM claims WHERE gift_id=? GROUP BY kind").bind(giftId).all();
const c = { need: 0, greed: 0 }; for (const row of r.results) c[row.kind] = row.n; return c;
}
async function pickWinner(env, giftId) {
const r = await env.DB.prepare("SELECT user_id, user_name FROM claims WHERE gift_id=? ORDER BY CASE kind WHEN 'need' THEN 0 ELSE 1 END, at ASC LIMIT 1").bind(giftId).first();
return r || null;
}
async function settle(env, g, { edit = true } = {}) {
const w = await pickWinner(env, g.id);
const next = w ? "awarded" : "expired";
const res = await env.DB.prepare("UPDATE gifts SET status=?, winner_id=?, winner_name=?, awarded_at=? WHERE id=? AND status='open'")
.bind(next, w?.user_id || null, w?.user_name || null, now(), g.id).run();
if (!res.meta.changes) return null;
const g2 = { ...g, status: next, winner_id: w?.user_id, winner_name: w?.user_name };
return { g2, notify: async () => {
if (edit && g.channel_id && g.message_id) await discord(env, "PATCH", `/channels/${g.channel_id}/messages/${g.message_id}`, card(g2, { need: 0, greed: 0 }, next));
await notifyWinner(env, g, w);
} };
}
async function settleNow(env, g) { const s = await settle(env, g); if (s) await s.notify(); }
async function notifyWinner(env, g, w) {
if (!w || !g.channel_id) return;
const body = { content: S.handoff(g.item_name, `<@${w.user_id}>`, `<@${g.giver_id}>`), allowed_mentions: { users: [w.user_id, g.giver_id] } };
if (g.message_id) body.message_reference = { message_id: g.message_id, fail_if_not_exists: false };
await discord(env, "POST", `/channels/${g.channel_id}/messages`, body);
}
async function onGive(i, env, ctx) {
const opt = i.data.options?.find((o) => o.name === "item");
const idOrName = opt?.value || "";
const giver = who(i), giverName = display(i);
let item = /^\d+$/.test(idOrName) ? await itemDetails(env, Number(idOrName)) : null;
if (!item) {
const hits = await searchItems(env, idOrName);
const exact = hits.find((h) => h.name.toLowerCase() === idOrName.toLowerCase()) || hits[0];
item = exact ? await itemDetails(env, Number(exact.value)) : null;
}
if (!item) return json({ type: R.MESSAGE, data: { content: S.itemNotFound, flags: FLAGS.EPHEMERAL } });
const hours = Number(i.data.options?.find((o) => o.name === "closes")?.value) || Number(env.CLAIM_HOURS || 3);
const t = now(), exp = t + hours * 3600;
const row = await env.DB.prepare(`INSERT INTO gifts (giver_id,giver_name,item_id,item_name,item_icon,item_level,slot,armor,quality,req_level,classes,channel_id,token,created_at,expires_at)
VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?) RETURNING id`).bind(giver.id, giverName, item.id, item.name, item.icon, item.level, item.slot, item.armor, item.quality, item.req_level,
item.classes ? JSON.stringify(item.classes) : null, i.channel_id, i.token, t, exp).first();
const g = { ...item, id: row.id, item_id: item.id, giver_id: giver.id, giver_name: giverName, item_name: item.name, item_icon: item.icon, item_level: item.level, expires_at: exp };
ctx.waitUntil((async () => {
for (let attempt = 0; attempt < 4; attempt++) {
await new Promise((r) => setTimeout(r, 1500 * (attempt + 1)));
const m = await fetch(`${API}/webhooks/${env.DISCORD_APP_ID}/${i.token}/messages/@original`).then((r) => (r.ok ? r.json() : null)).catch(() => null);
if (m?.id) { await env.DB.prepare("UPDATE gifts SET message_id=? WHERE id=?").bind(m.id, g.id).run(); return; }
}
console.log(`[give] no message id for gift ${g.id}`);
})());
return json({ type: R.MESSAGE, data: card(g, { need: 0, greed: 0 }) });
}
async function onAutocomplete(i, env) {
const q = (i.data.options?.find((o) => o.focused)?.value || "").trim();
const choices = q.length >= 2 ? await searchItems(env, q) : [];
return json({ type: R.AUTOCOMPLETE, data: { choices } });
}
async function onButton(i, env, ctx) {
const [action, idStr] = i.data.custom_id.split(":"); const id = Number(idStr);
console.log(`[button] ${i.data.custom_id} by ${who(i)?.id}`);
if (["make", "done", "cancel"].includes(action)) return onRequestButton(i, env, action, id);
if (action === "role") return onRoleToggle(i, env, idStr);
if (action === "spec") return onSpecToggle(i, env, idStr);
if (action === "link") return linkModal();
if (["pvote", "pclose", "pick"].includes(action)) return onPollComponent(i, env, ctx, action, i.data.custom_id.split(":"));
const g = await env.DB.prepare("SELECT * FROM gifts WHERE id=?").bind(id).first();
const u = who(i), uname = display(i);
const eph = (content) => json({ type: R.MESSAGE, data: { content, flags: FLAGS.EPHEMERAL } });
if (!g) return eph(S.closed);
if (action === "need" || action === "greed") {
if (g.status !== "open" || g.expires_at <= now()) return eph(S.closed);
if (u.id === g.giver_id) return eph(S.ownGift);
const allowed = needClasses(g);
if (action === "need" && allowed) {
const me = await env.DB.prepare("SELECT class, alt_class FROM chars WHERE user_id=?").bind(u.id).first();
if (!me?.class) return eph(S.linkFirst);
if (!allowed.includes(me.class) && !(me.alt_class && allowed.includes(me.alt_class))) return eph(S.wrongClass(allowed));
}
const before = await env.DB.prepare("SELECT kind FROM claims WHERE gift_id=? AND user_id=?").bind(id, u.id).first();
if (before?.kind === action) return eph(S.alreadyIn(action));
await env.DB.prepare("INSERT INTO claims (gift_id,user_id,user_name,kind,at) VALUES (?,?,?,?,?) ON CONFLICT(gift_id,user_id) DO UPDATE SET kind=excluded.kind, user_name=excluded.user_name")
.bind(id, u.id, uname, action, now()).run();
const still = await env.DB.prepare("SELECT status FROM gifts WHERE id=?").bind(id).first();
if (still?.status !== "open") return eph(S.closed);
const fresh = card(g, await counts(env, id));
if (g.channel_id && g.message_id) {
ctx.waitUntil(discord(env, "PATCH", `/channels/${g.channel_id}/messages/${g.message_id}`, fresh));
return eph(before ? S.youSwitched(action) : S.youIn(action));
}
return json({ type: R.UPDATE, data: fresh });
}
if (action === "close") {
if (u.id !== g.giver_id && !isOfficer(i)) return eph(S.notYours);
if (g.status !== "open") return eph(S.closed);
const s = await settle(env, g, { edit: false }); // this response is the edit; DMs go out after it
if (!s) return eph(S.closed);
ctx.waitUntil(s.notify());
return json({ type: R.UPDATE, data: card(s.g2, { need: 0, greed: 0 }, s.g2.status) });
}
if (action === "got") {
if (g.status !== "awarded") return eph(S.closed);
if (u.id !== g.winner_id && !isOfficer(i)) return eph(S.notWinner);
await env.DB.prepare("UPDATE gifts SET status='received', received_at=? WHERE id=? AND status='awarded'").bind(now(), id).run();
return json({ type: R.UPDATE, data: card({ ...g, status: "received" }, { need: 0, greed: 0 }, "received") });
}
return eph(S.closed);
}
const ARMOR_CLASSES = { Cloth: ["Mage", "Priest", "Warlock"], Leather: ["Rogue", "Druid"], Mail: ["Hunter", "Shaman"], Plate: ["Warrior", "Paladin"] };
export function needClasses(g) {
if (g.classes) return JSON.parse(g.classes);
if (["Back", "Neck", "Ring", "Trinket", "Shield", "Off hand", "Bag"].includes(g.slot)) return null; // cloaks are "Cloth" in the data but for everyone
const base = ARMOR_CLASSES[g.armor];
if (!base) return null; // weapons, trinkets, bags: anyone may Need
const low = (g.req_level || 0) < 40;
if (g.armor === "Leather" && low) return [...base, "Hunter", "Shaman"];
if (g.armor === "Mail" && low) return [...base, "Warrior", "Paladin"];
return base;
}
const isOfficer = (i) => (BigInt(i.member?.permissions || "0") & (1n << 13n)) !== 0n; // MANAGE_MESSAGES as the officer test
const COMMANDS = [
{ name: "give", description: "Offer an item you don't need to the guild", options: [
{ type: 3, name: "item", description: "Item name (pick from the list)", required: true, autocomplete: true },
{ type: 4, name: "closes", description: "How long people have to roll (default 3 hours)", required: false, choices: [
{ name: "1 hour", value: 1 }, { name: "3 hours", value: 3 }, { name: "6 hours", value: 6 }, { name: "12 hours", value: 12 }, { name: "1 day", value: 24 } ] } ] },
{ name: "help", description: "How giving works, in one line" },
{ name: "iam", description: "Link your main character so your name gets its class color", options: [
{ type: 3, name: "character", description: "Your main: full name as in game (first and last)", required: true, autocomplete: true },
{ type: 3, name: "alt", description: "An alt (optional), full name", required: false, autocomplete: true } ] },
{ name: "professions", description: "Someone's professions and known recipes", options: [
{ type: 3, name: "character", description: "Character name", required: true, autocomplete: true } ] },
{ name: "need", description: "Ask the guild to craft something; pings the people who can", options: [
{ type: 3, name: "recipe", description: "What you need made", required: true, autocomplete: true } ] },
{ name: "workshop", description: "Open gifts and craft requests right now" },
{ name: "post-welcome", description: "Officers: post the How this works card with the Dings button here", default_member_permissions: "8192" },
{ name: "status", description: "Officers: is everything running", default_member_permissions: "8192" },
{ name: "stock", description: "Spare mats people in the guild can hand over" },
{ name: "stock-set", description: "List spare mats you can hand over (qty 0 removes)", options: [
{ type: 3, name: "item", description: "Item name (pick from the list)", required: true, autocomplete: true },
{ type: 4, name: "qty", description: "How many you can spare", required: true, min_value: 0, max_value: 9999 } ] },
{ name: "who-crafts", description: "Who in the guild can make something", options: [
{ type: 3, name: "recipe", description: "Recipe or item name, or part of it", required: true } ] },
];
async function registerCommands(env) {
const r = await fetch(`${API}/applications/${env.DISCORD_APP_ID}/guilds/${env.GUILD_ID}/commands`, { method: "PUT",
headers: { Authorization: `Bot ${env.DISCORD_BOT_TOKEN}`, "content-type": "application/json", "User-Agent": "GuildBot (gifting, 1.0)" }, body: JSON.stringify(COMMANDS) });
const body = await r.text();
return new Response(r.ok ? `registered ${COMMANDS.length} commands` : `failed ${r.status}: ${body.slice(0, 300)}`, { status: r.ok ? 200 : 500 });
}
const rankKey = (m) => `${m.region || "us"}:` + [m.name, m.surname].filter(Boolean).map((p) => encodeURIComponent(String(p).trim().toLowerCase())).join("-");
export function rankPlan(members, rows, names) {
const rankOf = {};
for (const m of members || []) if (Number.isInteger(m.rank)) rankOf[rankKey(m)] = m.rank;
return (rows || []).map((r) => {
const rs = [rankOf[r.surname], rankOf[r.alt]].filter((x) => Number.isInteger(x));
const name = rs.length ? names[String(Math.min(...rs))] : null;
return [r.user_id, name || null];
}).sort((a, b) => (a[0] < b[0] ? -1 : 1));
}
async function syncRankRoles(env, t, force) {
const st = await trackerState(env);
const members = st.roster?.members_full || [];
if (!members.length) return "no roster";
const cfg = await fetch(env.CONFIG_URL || "https://raw.githubusercontent.com/Jcenno/wowforever-guild-bot/main/characters.json", { cf: { cacheTtl: 300 } }).then((r) => (r.ok ? r.json() : null)).catch(() => null);
const names = cfg?.guild?.rank_names || {};
const all = [...new Set(Object.values(names).filter(Boolean))];
if (!all.length) return "no rank names";
const rows = (await env.DB.prepare("SELECT user_id, surname, alt FROM chars").all()).results;
const plan = rankPlan(members, rows, names);
const sig = JSON.stringify([plan, all, Math.floor(t / 21600)]); // unchanged plan is re-checked every 6 h
const last = await env.DB.prepare("SELECT value FROM meta WHERE key='rank_sig'").first().catch(() => null);
if (!force && last?.value === sig) return "unchanged";
let roles = await discord(env, "GET", `/guilds/${env.GUILD_ID}/roles`);
if (!roles) return "no roles";
for (const n of all) {
if (roles.find((r) => r.name === n)) continue;
const made = await discord(env, "POST", `/guilds/${env.GUILD_ID}/roles`, { name: n, permissions: "0", hoist: true, mentionable: false });
if (!made) return "could not create role";
roles.push(made);
}
const rankIds = Object.fromEntries(all.map((n) => [n, roles.find((r) => r.name === n).id]));
let ok = true, changed = 0;
for (const [uid, name] of plan) {
const member = await discord(env, "GET", `/guilds/${env.GUILD_ID}/members/${uid}`);
if (!member) continue; // left the server
for (const [n, id] of Object.entries(rankIds)) {
const has = member.roles.includes(id);
if (n === name && !has) { const r = await fetch(`${API}/guilds/${env.GUILD_ID}/members/${uid}/roles/${id}`, { method: "PUT", headers: { Authorization: `Bot ${env.DISCORD_BOT_TOKEN}`, "User-Agent": "GuildBot (gifting, 1.0)" } }); ok = ok && r.ok; changed++; if (!r.ok) console.log(`[rank] add ${n} -> ${r.status}`); }
if (n !== name && has) { await discord(env, "DELETE", `/guilds/${env.GUILD_ID}/members/${uid}/roles/${id}`); changed++; }
}
}
if (ok) await env.DB.prepare("INSERT INTO meta (key,value) VALUES ('rank_sig',?) ON CONFLICT(key) DO UPDATE SET value=excluded.value").bind(sig).run();
const res = `${plan.filter((p) => p[1]).length} ranked, ${changed} change${changed === 1 ? "" : "s"}${ok ? "" : ", some failed"} · <t:${t}:R>`;
await env.DB.prepare("INSERT INTO meta (key,value) VALUES ('rank_last',?) ON CONFLICT(key) DO UPDATE SET value=excluded.value").bind(res).run();
return res;
}
const topOf = (rows, k) => { const c = {}; for (const r of rows) if (r[k]) c[r[k]] = (c[r[k]] || 0) + 1; return Object.entries(c).sort((a, b) => b[1] - a[1])[0]?.[0]; };
async function weeklyReport(env, t) {
const fmt = new Intl.DateTimeFormat("en-US", { timeZone: env.TIMEZONE || "America/Chicago", weekday: "short", hour: "numeric", minute: "numeric", hour12: false });
const p = Object.fromEntries(fmt.formatToParts(new Date(t * 1000)).map((x) => [x.type, x.value]));
if (p.weekday !== (env.REPORT_DAY || "Sun") || Number(p.hour) % 24 !== Number(env.REPORT_HOUR || 19) || Number(p.minute) >= 10) return;
const weekKey = String(Math.floor((t + 4 * 86400) / (7 * 86400)));
const last = await env.DB.prepare("SELECT value FROM meta WHERE key='last_report'").first().catch(() => null);
if (last?.value === weekKey) return;
await env.DB.prepare("INSERT INTO meta (key,value) VALUES ('last_report',?) ON CONFLICT(key) DO UPDATE SET value=excluded.value").bind(weekKey).run();
const since = t - 7 * 86400;
const gifts = (await env.DB.prepare("SELECT giver_name, winner_name, item_name FROM gifts WHERE created_at>=? AND status IN ('awarded','received')").bind(since).all()).results;
const made = (await env.DB.prepare("SELECT maker_name, user_name, recipe_name FROM requests WHERE created_at>=? AND status='done'").bind(since).all()).results;
if (!gifts.length && !made.length) return; // a quiet week gets no card
const openG = (await env.DB.prepare("SELECT COUNT(*) n FROM gifts WHERE status='open'").first())?.n || 0;
const openR = (await env.DB.prepare("SELECT COUNT(*) n FROM requests WHERE status IN ('open','claimed')").first())?.n || 0;
await discord(env, "POST", `/channels/${env.REPORT_CHANNEL_ID || env.GENERAL_CHANNEL_ID}/messages`, { embeds: [reportEmbed(gifts, made, openG, openR)], allowed_mentions: { parse: [] } });
}
export function reportEmbed(gifts, made, openG, openR) {
const lines = [S.reportGifts(gifts.length, topOf(gifts, "giver_name")), S.reportCrafts(made.length, topOf(made, "maker_name"))];
const items = [...gifts.map((g) => `${g.item_name} → ${g.winner_name}`), ...made.map((m) => `${m.recipe_name} for ${m.user_name}`)].slice(0, 8);
if (items.length) lines.push("", ...items.map((x) => `• ${x}`));
lines.push("", S.reportOpen(openG, openR));
return { title: S.reportTitle, description: lines.join("\n"), color: 0x9b59b6 };
}
async function onWorkshop(i, env) {
const gifts = (await env.DB.prepare("SELECT item_name, giver_name, expires_at FROM gifts WHERE status='open' ORDER BY expires_at LIMIT 10").all()).results;
const reqs = (await env.DB.prepare("SELECT recipe_name, user_name, maker_name FROM requests WHERE status IN ('open','claimed') ORDER BY created_at LIMIT 10").all()).results;
const lines = [...gifts.map((g) => S.workshopGift(g.item_name, g.giver_name, g.expires_at)), ...reqs.map((q) => S.workshopReq(q.recipe_name, q.user_name, q.maker_name))];
const content = `**${S.workshopTitle}**\n` + (lines.join("\n") || S.workshopEmpty);
return json({ type: R.MESSAGE, data: { content, flags: FLAGS.EPHEMERAL, allowed_mentions: { parse: [] } } });
}
const PICKS = 4; // choices per ballot; 1st gets PICKS points, last gets 1
let pollTablesReady = false;
async function ensurePollTables(env) {
if (pollTablesReady) return;
await env.DB.prepare("CREATE TABLE IF NOT EXISTS polls (id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT NOT NULL, options TEXT NOT NULL, channel_id TEXT, message_id TEXT, token TEXT, status TEXT NOT NULL DEFAULT 'open', created_by TEXT, created_at INTEGER, capped TEXT)").run();
try { await env.DB.prepare("ALTER TABLE polls ADD COLUMN capped TEXT").run(); } catch (e) { /* already there */ }
await env.DB.prepare("CREATE TABLE IF NOT EXISTS poll_votes (poll_id INTEGER NOT NULL, user_id TEXT NOT NULL, r1 INTEGER, r2 INTEGER, r3 INTEGER, r4 INTEGER, at INTEGER, PRIMARY KEY (poll_id, user_id))").run();
try { await env.DB.prepare("ALTER TABLE poll_votes ADD COLUMN r4 INTEGER").run(); } catch (e) { /* already there */ }
pollTablesReady = true;
}
export function parseOptions(raw) {
const seen = new Set(), opts = [], capped = [];
for (let s of String(raw || "").split(/[;\n|]+/)) {
s = s.trim();
const cap = s.startsWith("!");
if (cap) s = s.slice(1).trim();
if (!s || seen.has(s.toLowerCase()) || opts.length >= 50) continue;
seen.add(s.toLowerCase());
if (cap) capped.push(opts.length);
opts.push(s.slice(0, 80));
}
return { opts, capped };
}
export function tally(options, votes, capped = []) {
const rows = options.map((name, idx) => ({ name, idx, points: 0, firsts: 0, mentions: 0 }));
for (const v of votes) {
[v.r1, v.r2, v.r3, v.r4].forEach((o, k) => { if (o != null && rows[o]) { rows[o].points += PICKS - k; rows[o].mentions += 1; if (k === 0) rows[o].firsts += 1; } });
}
const order = (a, b) => b.points - a.points || b.firsts - a.firsts || a.name.localeCompare(b.name);
const ranked = rows.sort(order);
const cap = new Set(capped);
const best = ranked.find((r) => !cap.has(r.idx));
if (!best || !cap.size) return ranked;
const ahead = ranked.slice(0, ranked.indexOf(best));
return [best, ...ahead, ...ranked.slice(ranked.indexOf(best) + 1)];
}
function pollCard(p, ballots, results) {
const opts = JSON.parse(p.options);
const lines = [`**${p.title}**`, S.pollHow];
if (results) {
const top = results.filter((r, n) => r.points > 0 || (n === 0 && results.some((x) => x.points > 0))).slice(0, 5);
lines.push("", top.length ? S.pollWinner(top[0].name) : S.pollNoVotes);
top.forEach((r, n) => lines.push(`${n + 1}. **${r.name}**`));
lines.push("", S.pollClosed(ballots));
} else {
lines.push("", opts.map((o) => `• ${o}`).join("\n"), "", S.pollBallots(ballots));
}
const container = { type: 17, accent_color: 0x5865f2, components: [{ type: 10, content: lines.join("\n").slice(0, 3900) }] };
if (!results) container.components.push({ type: 14, divider: true, spacing: 1 }, { type: 1, components: [
{ type: 2, style: 1, label: S.pollVoteBtn, custom_id: `pvote:${p.id}` },
{ type: 2, style: 2, label: S.pollCloseBtn, custom_id: `pclose:${p.id}` },
] });
return { flags: FLAGS.V2, components: [container], allowed_mentions: { parse: [] } };
}
function ballotStep(p, step, picked) {
const opts = JSON.parse(p.options);
const avail = opts.map((name, idx) => ({ name, idx })).filter((o) => !picked.includes(o.idx));
const half = Math.ceil(avail.length / 2);
const groups = avail.length > 25 ? [avail.slice(0, half), avail.slice(half)] : [avail];
const so = (o) => ({ label: o.name.slice(0, 100), value: String(o.idx) });
const rows = groups.map((g, n) => ({ type: 1, components: [{ type: 3, custom_id: `pick:${p.id}:${step}:${n}`,
placeholder: groups.length > 1 ? S.pollPickPart(step, g[0].name, g[g.length - 1].name) : S.pollPick(step), options: g.map(so) }] }));
const head = picked.length ? S.pollSoFar(picked.map((x) => opts[x])) + "\n" : "";
return { content: head + S.pollStep(step, groups.length > 1), components: rows, flags: FLAGS.EPHEMERAL, allowed_mentions: { parse: [] } };
}
async function onPollCreate(i, env, ctx) {
if (!isOfficer(i)) return json({ type: R.MESSAGE, data: { content: S.officersOnly, flags: FLAGS.EPHEMERAL } });
await ensurePollTables(env);
const title = (i.data.options?.find((o) => o.name === "title")?.value || "").trim().slice(0, 150);
const { opts, capped } = parseOptions(i.data.options?.find((o) => o.name === "options")?.value);
if (opts.length < 3) return json({ type: R.MESSAGE, data: { content: S.pollNeedOptions, flags: FLAGS.EPHEMERAL } });
const target = i.data.options?.find((o) => o.name === "channel")?.value;
const row = await env.DB.prepare("INSERT INTO polls (title, options, capped, channel_id, token, created_by, created_at) VALUES (?,?,?,?,?,?,?) RETURNING id")
.bind(title, JSON.stringify(opts), JSON.stringify(capped), target || i.channel_id, i.token, who(i).id, now()).first();
const p = { id: row.id, title, options: JSON.stringify(opts) };
if (target) {
const m = await discord(env, "POST", `/channels/${target}/messages`, pollCard(p, 0, null));
if (m?.id) await env.DB.prepare("UPDATE polls SET message_id=? WHERE id=?").bind(m.id, p.id).run();
return json({ type: R.MESSAGE, data: { content: m?.id ? S.pollPosted(target) : S.postFailed, flags: FLAGS.EPHEMERAL } });
}
ctx.waitUntil((async () => {
for (let attempt = 0; attempt < 4; attempt++) {
await new Promise((r) => setTimeout(r, 1500 * (attempt + 1)));
const m = await fetch(`${API}/webhooks/${env.DISCORD_APP_ID}/${i.token}/messages/@original`).then((r) => (r.ok ? r.json() : null)).catch(() => null);
if (m?.id) { await env.DB.prepare("UPDATE polls SET message_id=? WHERE id=?").bind(m.id, p.id).run(); return; }
}
})());
return json({ type: R.MESSAGE, data: pollCard(p, 0, null) });
}
async function ballotCount(env, id) {
return (await env.DB.prepare("SELECT COUNT(*) n FROM poll_votes WHERE poll_id=? AND r1 IS NOT NULL").bind(id).first())?.n || 0;
}
async function onPollComponent(i, env, ctx, action, parts) {
await ensurePollTables(env);
const id = Number(parts[1]);
const p = await env.DB.prepare("SELECT * FROM polls WHERE id=?").bind(id).first();
const eph = (content) => json({ type: R.MESSAGE, data: { content, flags: FLAGS.EPHEMERAL } });
if (!p) return eph(S.pollGone);
if (p.status !== "open") return eph(S.pollIsClosed);
const u = who(i);
if (action === "pvote") return json({ type: R.MESSAGE, data: ballotStep(p, 1, []) });
if (action === "pclose") {
if (!isOfficer(i)) return eph(S.officersOnly);
const res = await env.DB.prepare("UPDATE polls SET status='closed' WHERE id=? AND status='open'").bind(id).run();
if (!res.meta.changes) return eph(S.pollIsClosed);
const votes = (await env.DB.prepare("SELECT r1, r2, r3, r4 FROM poll_votes WHERE poll_id=?").bind(id).all()).results;
return json({ type: R.UPDATE, data: pollCard(p, votes.filter((v) => v.r1 != null).length, tally(JSON.parse(p.options), votes, JSON.parse(p.capped || "[]"))) });
}
if (action === "pick") {
const step = Number(parts[2]), choice = Number(i.data.values?.[0]);
const opts = JSON.parse(p.options);
if (!(choice >= 0 && choice < opts.length)) return eph(S.pollGone);
const cur = await env.DB.prepare("SELECT r1, r2, r3, r4 FROM poll_votes WHERE poll_id=? AND user_id=?").bind(id, u.id).first();
const picked = [cur?.r1, cur?.r2, cur?.r3].slice(0, step - 1).filter((x) => x != null);
if (step === 1) await env.DB.prepare("INSERT INTO poll_votes (poll_id,user_id,r1,r2,r3,r4,at) VALUES (?,?,?,NULL,NULL,NULL,?) ON CONFLICT(poll_id,user_id) DO UPDATE SET r1=excluded.r1, r2=NULL, r3=NULL, r4=NULL, at=excluded.at").bind(id, u.id, choice, now()).run();
else await env.DB.prepare(`UPDATE poll_votes SET r${step}=?, at=? WHERE poll_id=? AND user_id=?`).bind(choice, now(), id, u.id).run();
const chosen = [...picked, choice];
if (step === 1 && p.channel_id && p.message_id) {
ctx.waitUntil((async () => discord(env, "PATCH", `/channels/${p.channel_id}/messages/${p.message_id}`, pollCard(p, await ballotCount(env, id), null)))());
}
if (step < PICKS && chosen.length < opts.length) return json({ type: R.UPDATE, data: ballotStep(p, step + 1, chosen) });
return json({ type: R.UPDATE, data: { content: S.pollDone(chosen.map((x) => opts[x])), components: [] } });
}
return eph(S.pollGone);
}
function linkModal() {
return json({ type: R.MODAL, data: { custom_id: "linkmodal", title: S.linkTitle, components: [{ type: 1, components: [
{ type: 4, custom_id: "name", label: S.linkLabel, style: 1, min_length: 2, max_length: 40, required: true, placeholder: S.linkPlaceholder },
] }] } });
}
export function parseCharName(raw) {
const words = String(raw || "").trim().replace(/\s+/g, " ").split(" ").filter(Boolean)
.map((w) => w[0].toUpperCase() + w.slice(1).toLowerCase());
if (!words.length) return null;
const slug = words.map((w) => encodeURIComponent(w.toLowerCase())).join("-");
return { display: words.join(" "), name: words[0], surname: words.slice(1).join(" ") || null, slug };
}
let ownerColumnReady = false;
async function ensureOwnerColumn(env) {
if (ownerColumnReady) return;
try { await env.DB.prepare("ALTER TABLE chars ADD COLUMN owner TEXT").run(); }
catch (e) { if (!/duplicate column/i.test(String(e))) console.log(`[link] owner column: ${e}`); }
ownerColumnReady = true;
}
async function onLinkSubmit(i, env, ctx) {
const raw = i.data.components?.[0]?.components?.[0]?.value || "";
const u = who(i), owner = display(i);
const reply = (content) => fetch(`${API}/webhooks/${env.DISCORD_APP_ID}/${i.token}/messages/@original`, { method: "PATCH",
headers: { "content-type": "application/json" }, body: JSON.stringify({ content, allowed_mentions: { parse: [] } }) }).catch((e) => console.log(`[link] edit ${e}`));
ctx.waitUntil((async () => {
const c = parseCharName(raw);
if (!c) return reply(S.linkNotFound(raw));
const region = (env.BLIZZARD_REGION || "us").toLowerCase();
const prof = await bnet(env, `/profile/wow/character/${c.slug}`, {}, env.BLIZZARD_PROFILE_NS || `profile-forever-${region}`).catch(() => null);
if (!prof?.name) return reply(S.linkNotFound(c.display));
const key = `${region}:${c.slug}`, cls = prof.character_class?.name || "", level = prof.level || null;
const name = [prof.name, prof.surname].filter(Boolean).join(" ") || c.display;
await ensureOwnerColumn(env);
const taken = await env.DB.prepare("SELECT user_id FROM chars WHERE surname=? AND user_id<>?").bind(key, u.id).first();
if (taken) return reply(S.linkTaken(name));
await env.DB.prepare("INSERT INTO chars (user_id,name,surname,class,owner,updated_at) VALUES (?,?,?,?,?,?) ON CONFLICT(user_id) DO UPDATE SET name=excluded.name, surname=excluded.surname, class=excluded.class, owner=excluded.owner, updated_at=excluded.updated_at")
.bind(u.id, name, key, cls, owner, now()).run();
const roleOk = cls ? await syncClassRole(env, u.id, cls).catch((e) => (console.log(`[link] ${e}`), false)) : false;
return reply(S.linkDone(name, cls, level) + (cls && !roleOk ? "\n" + S.iamRoleLater : ""));
})());
return json({ type: R.DEFER, data: { flags: FLAGS.EPHEMERAL } });
}
async function linkedList(env) {
await ensureOwnerColumn(env);
const rows = (await env.DB.prepare("SELECT name, surname, alt, owner FROM chars ORDER BY updated_at, user_id").all()).results;
const out = [];
const add = (key, owner) => {
if (!key || !key.includes(":")) return;
const [region, slug] = key.split(":");
const words = slug.split("-").map((w) => { try { return decodeURIComponent(w); } catch { return w; } });
out.push({ region, name: words[0], surname: words.slice(1).join(" ") || undefined, owner: owner || undefined });
};
for (const r of rows) { add(r.surname, r.owner); add(r.alt, r.owner); }
return out;
}
function welcomeCard(env) {
const container = { type: 17, accent_color: 0xf1c40f, components: [{ type: 10, content: S.welcome }, { type: 14, divider: true, spacing: 1 },
{ type: 1, components: [{ type: 2, style: 3, label: S.linkBtn, custom_id: "link" }] },
{ type: 1, components: [
...SPEC_ROLES.map((r) => ({ type: 2, style: 2, label: r, custom_id: `spec:${r}` })),
{ type: 2, style: 1, label: S.dingsBtn, custom_id: `role:${env.DINGS_ROLE_ID}` }] }] };
return { flags: FLAGS.V2, components: [container], allowed_mentions: { parse: [] } };
}
async function onPostWelcome(i, env) {
if (!isOfficer(i)) return json({ type: R.MESSAGE, data: { content: S.officersOnly, flags: FLAGS.EPHEMERAL } });
if (!env.DINGS_ROLE_ID) return json({ type: R.MESSAGE, data: { content: S.dingsNotSet, flags: FLAGS.EPHEMERAL } });
const ok = await discord(env, "POST", `/channels/${i.channel_id}/messages`, welcomeCard(env));
return json({ type: R.MESSAGE, data: { content: ok ? S.welcomePosted : S.postFailed, flags: FLAGS.EPHEMERAL } });
}
const SPEC_ROLES = ["Tank", "Healer", "DPS"];
let specRoleCache = { value: null, exp: 0 };
async function onSpecToggle(i, env, name) {
if (!SPEC_ROLES.includes(name)) return json({ type: R.MESSAGE, data: { content: S.unknownCommand, flags: FLAGS.EPHEMERAL } });
if (!specRoleCache.value || Date.now() > specRoleCache.exp) {
const roles = await discord(env, "GET", `/guilds/${env.GUILD_ID}/roles`);
if (roles) specRoleCache = { value: Object.fromEntries(roles.filter((r) => SPEC_ROLES.includes(r.name)).map((r) => [r.name, r.id])), exp: Date.now() + 10 * 60 * 1000 };
}
const roleId = specRoleCache.value?.[name];
if (!roleId) return json({ type: R.MESSAGE, data: { content: S.specMissing(name), flags: FLAGS.EPHEMERAL } });
const u = who(i), has = (i.member?.roles || []).includes(roleId);
const r = await fetch(`${API}/guilds/${env.GUILD_ID}/members/${u.id}/roles/${roleId}`, { method: has ? "DELETE" : "PUT", headers: { Authorization: `Bot ${env.DISCORD_BOT_TOKEN}`, "User-Agent": "GuildBot (roles)" } });
if (!r.ok) { console.log(`[spec] toggle -> ${r.status} ${await r.text()}`); return json({ type: R.MESSAGE, data: { content: S.dingsNoRole, flags: FLAGS.EPHEMERAL } }); }
return json({ type: R.MESSAGE, data: { content: has ? S.specOff(name) : S.specOn(name), flags: FLAGS.EPHEMERAL } });
}
async function onRoleToggle(i, env, roleId) {
const u = who(i);
if (!env.DINGS_ROLE_ID || roleId !== env.DINGS_ROLE_ID) return json({ type: R.MESSAGE, data: { content: S.dingsNotSet, flags: FLAGS.EPHEMERAL } });
const has = (i.member?.roles || []).includes(roleId);
const r = await fetch(`${API}/guilds/${env.GUILD_ID}/members/${u.id}/roles/${roleId}`, { method: has ? "DELETE" : "PUT", headers: { Authorization: `Bot ${env.DISCORD_BOT_TOKEN}`, "User-Agent": "GuildBot (roles)" } });
if (!r.ok) { console.log(`[role] toggle -> ${r.status} ${await r.text()}`); return json({ type: R.MESSAGE, data: { content: S.dingsNoRole, flags: FLAGS.EPHEMERAL } }); }
return json({ type: R.MESSAGE, data: { content: has ? S.dingsOff : S.dingsOn, flags: FLAGS.EPHEMERAL } });
}
async function onStockSet(i, env) {
const name = (i.data.options?.find((o) => o.name === "item")?.value || "").trim();
const qty = Math.max(0, Math.floor(Number(i.data.options?.find((o) => o.name === "qty")?.value || 0)));
let item = /^\d+$/.test(name) ? await itemDetails(env, Number(name)) : null;
if (!item) { const hits = await searchItems(env, name); const h = hits.find((x) => x.name.toLowerCase() === name.toLowerCase()) || hits[0]; item = h ? { id: Number(h.value), name: h.name } : null; }
if (!item) return json({ type: R.MESSAGE, data: { content: S.itemNotFound, flags: FLAGS.EPHEMERAL } });
const u = who(i);
if (qty > 0) await env.DB.prepare("INSERT INTO stock (user_id,user_name,item_id,item_name,qty,updated_at) VALUES (?,?,?,?,?,?) ON CONFLICT(user_id,item_id) DO UPDATE SET qty=excluded.qty, user_name=excluded.user_name, updated_at=excluded.updated_at")
.bind(u.id, display(i), item.id, item.name, qty, now()).run();
else await env.DB.prepare("DELETE FROM stock WHERE user_id=? AND item_id=?").bind(u.id, item.id).run();
return json({ type: R.MESSAGE, data: { content: S.stockSet(item.name, qty), flags: FLAGS.EPHEMERAL } });
}
async function onStock(i, env) {
const rows = (await env.DB.prepare("SELECT item_name, user_name, qty FROM stock WHERE qty>0 ORDER BY item_name, qty DESC LIMIT 60").all()).results;
const byItem = {};
for (const r of rows) (byItem[r.item_name] ||= []).push(r);
const lines = Object.entries(byItem).map(([item, entries]) => S.stockLine(item, entries));
return json({ type: R.MESSAGE, data: { content: (`**${S.stockTitle}**\n` + (lines.join("\n") || S.stockEmpty)).slice(0, 1900), flags: FLAGS.EPHEMERAL, allowed_mentions: { parse: [] } } });
}
async function onStatus(i, env) {
if (!isOfficer(i)) return json({ type: R.MESSAGE, data: { content: S.officersOnly, flags: FLAGS.EPHEMERAL } });
const repo = env.GITHUB_REPO || "Jcenno/wowforever-guild-bot";
const [st, commits, me, roles, openG, openR, linked, useG, useR, useS, rankRes] = await Promise.all([
trackerState(env),
fetch(`https://api.github.com/repos/${repo}/commits?path=state.json&per_page=1`, { headers: { "User-Agent": "GuildBot (status)", Accept: "application/vnd.github+json" } }).then((r) => (r.ok ? r.json() : null)).catch(() => null),
discord(env, "GET", `/guilds/${env.GUILD_ID}/members/${env.DISCORD_APP_ID}`),
discord(env, "GET", `/guilds/${env.GUILD_ID}/roles`),
env.DB.prepare("SELECT COUNT(*) n FROM gifts WHERE status='open'").first(),
env.DB.prepare("SELECT COUNT(*) n FROM requests WHERE status IN ('open','claimed')").first(),
env.DB.prepare("SELECT COUNT(*) n FROM chars").first(),
env.DB.prepare("SELECT COUNT(*) n, COUNT(DISTINCT giver_id) people, SUM(status='received') received, MIN(created_at) first FROM gifts").first().catch(() => null),
env.DB.prepare("SELECT COUNT(*) n, COUNT(DISTINCT user_id) people, SUM(status='done') done FROM requests").first().catch(() => null),
env.DB.prepare("SELECT COUNT(*) n, COUNT(DISTINCT user_id) people FROM stock WHERE qty>0").first().catch(() => null),
env.DB.prepare("SELECT value FROM meta WHERE key='rank_last'").first().then((r) => r?.value || "not run yet").catch(() => "unknown"),
]);
const lastRun = st.saved_at || (commits?.[0]?.commit?.committer?.date ? Math.floor(Date.parse(commits[0].commit.committer.date) / 1000) : null);
const myRoles = (roles || []).filter((r) => (me?.roles || []).includes(r.id));
const canManageRoles = myRoles.some((r) => (BigInt(r.permissions || "0") & ((1n << 28n) | (1n << 3n))) !== 0n); // Manage Roles or Administrator
const topClassPos = Math.max(0, ...(roles || []).filter((r) => CLASS_COLOR[r.name]).map((r) => r.position));
const myTopPos = Math.max(0, ...myRoles.map((r) => r.position));
const chars = Object.keys(st.characters || {}).length;
const lines = [
`Tracker last saved: ${lastRun ? `<t:${lastRun}:R>` : "unknown"} · ${chars} character${chars === 1 ? "" : "s"} tracked`,
`Heartbeat token: ${env.GITHUB_TOKEN ? "set" : "missing (tracker runs only when GitHub feels like it)"}`,
`Manage Roles: ${canManageRoles ? "yes" : "no (class colors and the Dings button are off)"} · bot role ${myTopPos > topClassPos ? "above" : "below"} the class roles`,
`Open: ${openG?.n || 0} gift${openG?.n === 1 ? "" : "s"}, ${openR?.n || 0} request${openR?.n === 1 ? "" : "s"} · ${linked?.n || 0} member${linked?.n === 1 ? "" : "s"} linked with /iam`,
`All time: ${useG?.n || 0} gifts from ${useG?.people || 0} people (${useG?.received || 0} received)${useG?.first ? `, first <t:${useG.first}:d>` : ""} · ${useR?.n || 0} craft requests from ${useR?.people || 0} people (${useR?.done || 0} done) · ${useS?.n || 0} stock lines from ${useS?.people || 0} people`,
`Rank roles: ${rankRes}`,
`Weekly report: ${env.REPORT_DAY || "Sun"} ${env.REPORT_HOUR || 19}:00 ${env.TIMEZONE || "America/Chicago"} → <#${env.REPORT_CHANNEL_ID || env.GENERAL_CHANNEL_ID}>`,
];
return json({ type: R.MESSAGE, data: { content: `**${S.statusTitle}**\n` + lines.join("\n"), flags: FLAGS.EPHEMERAL, allowed_mentions: { parse: [] } } });
}
async function kickTracker(env, t) {
if (!env.GITHUB_TOKEN) return;
if (Math.floor(t / 60) % 15 >= 5) return; // one tick per quarter hour (cron runs every 5 min)
const repo = env.GITHUB_REPO || "Jcenno/wowforever-guild-bot";
const r = await fetch(`https://api.github.com/repos/${repo}/actions/workflows/tracker.yml/dispatches`, {
method: "POST", headers: { Authorization: `Bearer ${env.GITHUB_TOKEN}`, Accept: "application/vnd.github+json", "User-Agent": "GuildBot (heartbeat)", "content-type": "application/json" },
body: JSON.stringify({ ref: "main" }) });
if (!r.ok) console.log(`[tracker] dispatch -> ${r.status} ${await r.text()}`);
}
export default {
async fetch(req, env, ctx) {
const url = new URL(req.url);
if (req.method === "GET" && url.pathname === "/linked") {
return json(await linkedList(env));
}
if (req.method === "GET" && url.pathname === "/register") {
if (env.REGISTER_KEY && url.searchParams.get("key") !== env.REGISTER_KEY) return new Response("forbidden", { status: 403 });
return registerCommands(env);
}
if (req.method !== "POST") return new Response("Guild Bot", { status: 200 });
const body = await req.text();
if (!(await verify(req, body, env.DISCORD_PUBLIC_KEY))) return new Response("bad signature", { status: 401 });
const i = JSON.parse(body);
if (i.type === T.PING) return json({ type: R.PONG });
if (i.type === T.AUTOCOMPLETE) return ["professions", "iam"].includes(i.data.name) ? onCharAutocomplete(i, env) : i.data.name === "need" ? onRecipeAutocomplete(i, env) : onAutocomplete(i, env);
if (i.type === T.COMMAND && i.data.name === "need") return onNeed(i, env, ctx);
if (i.type === T.COMMAND && i.data.name === "workshop") return onWorkshop(i, env);
if (i.type === T.COMMAND && i.data.name === "post-welcome") return onPostWelcome(i, env);
if (i.type === T.COMMAND && i.data.name === "status") return onStatus(i, env);
if (i.type === T.COMMAND && i.data.name === "poll-create") return onPollCreate(i, env, ctx);
if (i.type === T.COMMAND && i.data.name === "stock") return onStock(i, env);
if (i.type === T.COMMAND && i.data.name === "stock-set") return onStockSet(i, env);
if (i.type === T.COMMAND && i.data.name === "iam") return onIam(i, env, ctx);
if (i.type === T.COMMAND && i.data.name === "professions") return onProfessions(i, env);
if (i.type === T.COMMAND && i.data.name === "who-crafts") return onWhoCrafts(i, env);
if (i.type === T.COMMAND && i.data.name === "give") return onGive(i, env, ctx);
if (i.type === T.COMMAND && i.data.name === "help") return json({ type: R.MESSAGE, data: { content: S.helpLine, flags: FLAGS.EPHEMERAL } });
if (i.type === T.COMPONENT) return onButton(i, env, ctx);
if (i.type === T.MODAL_SUBMIT && i.data.custom_id === "linkmodal") return onLinkSubmit(i, env, ctx);
return json({ type: R.MESSAGE, data: { content: S.unknownCommand, flags: FLAGS.EPHEMERAL } });
},
async scheduled(_ev, env, ctx) {
const t = now();
ctx.waitUntil(weeklyReport(env, t).catch((e) => console.log(`[report] ${e}`)));
ctx.waitUntil(kickTracker(env, t).catch((e) => console.log(`[tracker] ${e}`)));
ctx.waitUntil(syncRankRoles(env, t).then((r) => r !== "unchanged" && console.log(`[rank] ${r}`)).catch((e) => console.log(`[rank] ${e}`)));
const due = await env.DB.prepare("SELECT * FROM gifts WHERE status='open' AND expires_at<=? LIMIT 20").bind(t).all();
for (const g of due.results) ctx.waitUntil(settleNow(env, g).catch((e) => console.log(`[settle] ${e}`)));
const quiet = await env.DB.prepare("SELECT * FROM gifts WHERE status='awarded' AND nudged_at IS NULL AND awarded_at<=? LIMIT 10").bind(t - 2 * 86400).all();
for (const g of quiet.results) ctx.waitUntil((async () => {
await env.DB.prepare("UPDATE gifts SET nudged_at=? WHERE id=?").bind(t, g.id).run();
if (!g.channel_id) return;
const body = { content: S.nudge(g.item_name, `<@${g.winner_id}>`), allowed_mentions: { users: [g.winner_id] } };
if (g.message_id) body.message_reference = { message_id: g.message_id, fail_if_not_exists: false };
await discord(env, "POST", `/channels/${g.channel_id}/messages`, body);
})());
const stale = await env.DB.prepare("SELECT * FROM requests WHERE status='open' AND created_at<=? LIMIT 10").bind(t - 7 * 86400).all();
for (const q of stale.results) ctx.waitUntil((async () => {
const res = await env.DB.prepare("UPDATE requests SET status='cancelled', updated_at=? WHERE id=? AND status='open'").bind(t, q.id).run();
if (res.meta.changes && q.channel_id && q.message_id) await discord(env, "PATCH", `/channels/${q.channel_id}/messages/${q.message_id}`, requestCard(q, "expired"));
})());
},
};
