// Guild Bot gifting Worker (C1): /give with item autocomplete, Need/Greed card, expiry, winner DMs.
// ---- strings.js (inlined)
// Every member-facing string in one place. One verb per line. No tool names.
const S = {
giveTitle: (item) => `**${item}**`,
giveMeta: (parts) => parts.filter(Boolean).join(" · "),
giveFrom: (giver, closes) => `From **${giver}** · closes <t:${closes}:R>`,
giveFromClosed: (giver) => `From **${giver}** · closed`,
counts: (need, greed) => `Need **${need}** · Greed **${greed}**`,
needBtn: "Need", greedBtn: "Greed", closeBtn: "Close early", receivedBtn: "Received",
youNeed: "You pressed Need.", youGreed: "You pressed Greed.", youSwitched: (k) => `Switched to ${k}.`,
notYours: "Only the giver can do that.",
closed: "This one is closed.",
ownGift: "That one is yours.",
awarded: (item, winner) => `**${item}** → **${winner}**. Mail when you can.`,
noTakers: (item) => `**${item}** · no takers · ${"stays with the giver"}`,
dmWinner: (item, giver) => `You won **${item}** from **${giver}**. Watch your mailbox, then press Received on the card.`,
dmGiver: (item, winner) => `**${item}** goes to **${winner}**. Mail or trade it when you're on.`,
giveAck: "Posted in #general.",
itemNotFound: "No item by that name. Pick one from the list.",
helpLine: "`/give` an item you don't need. `/need` something crafted; it pings the people who can make it. Press Need or Greed on a gift card; the winner presses Received. `/iam` links your main so your name takes its class color. `/professions` and `/who-crafts` look things up.",
iamLinked: (name, cls) => `You are **${name}** (${cls}).`,
iamRoleLater: "Class color comes once an officer lets the bot manage roles.",
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
needNobody: (q) => `Nobody in the guild knows **${q}** yet. Ask in #general or try /who-crafts with part of the name.`,
noRecipes: "No recipes recorded yet. They appear after the next check.",
nobodyCrafts: (q) => `Nobody in the guild knows a recipe matching "${q}" yet.`,
whoCraftsTitle: (q) => `Who can make "${q}"`,
};

// ---- index.js

const API = "https://discord.com/api/v10";
const T = { PING: 1, COMMAND: 2, COMPONENT: 3, AUTOCOMPLETE: 4 };
const R = { PONG: 1, MESSAGE: 4, DEFER: 5, UPDATE: 7, AUTOCOMPLETE: 8 };
const FLAGS = { EPHEMERAL: 1 << 6, V2: 1 << 15 };
const QUALITY_COLOR = { POOR: 0x9d9d9d, COMMON: 0xffffff, UNCOMMON: 0x1eff00, RARE: 0x0070dd, EPIC: 0xa335ee, LEGENDARY: 0xff8000 };
const SLOT = { HEAD: "Head", NECK: "Neck", SHOULDER: "Shoulder", CHEST: "Chest", ROBE: "Chest", WAIST: "Waist", LEGS: "Legs", FEET: "Feet", WRIST: "Wrist", HAND: "Hands",
FINGER: "Ring", TRINKET: "Trinket", CLOAK: "Back", WEAPON: "One-hand", SHIELD: "Shield", RANGED: "Ranged", RANGEDRIGHT: "Ranged", TWOHWEAPON: "Two-hand",
WEAPONMAINHAND: "Main hand", WEAPONOFFHAND: "Off hand", HOLDABLE: "Off hand", BAG: "Bag", NON_EQUIP: "" };

// ---------------------------------------------------------------- Discord plumbing
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
async function dm(env, userId, content) {
const ch = await discord(env, "POST", "/users/@me/channels", { recipient_id: userId });
if (!ch) return false;
return !!(await discord(env, "POST", `/channels/${ch.id}/messages`, { content, allowed_mentions: { parse: [] } }));
}
const who = (i) => (i.member?.user || i.user);
const display = (i) => i.member?.nick || who(i).global_name || who(i).username;

// ---------------------------------------------------------------- Blizzard
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
async function bnet(env, path, params = {}) {
const tok = await bnetToken(env);
const u = new URL(`https://${env.BLIZZARD_REGION}.api.blizzard.com${path}`);
u.searchParams.set("namespace", env.BLIZZARD_STATIC_NS);
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
// Blizzard returns by id; put the exact name first, then names that start with the query.
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

// ---------------------------------------------------------------- Tracker state (roster, professions, recipes)
let stateCache = { value: null, exp: 0 };
async function trackerState(env) {
if (stateCache.value && Date.now() < stateCache.exp) return stateCache.value;
const r = await fetch(env.STATE_URL || "https://raw.githubusercontent.com/Jcenno/wowforever-guild-bot/main/state.json", { cf: { cacheTtl: 120 } });
const j = r.ok ? await r.json() : { characters: {} };
stateCache = { value: j, exp: Date.now() + 2 * 60 * 1000 };
return j;
}
const charName = (key) => key.split(":").pop().split("-").map((w) => w[0].toUpperCase() + w.slice(1)).join(" ");
const tier = (sk) => (sk >= 225 ? "Artisan" : sk >= 150 ? "Expert" : sk >= 75 ? "Journeyman" : "Apprentice");
const bar = (sk, w = 6) => { const f = Math.max(0, Math.min(w, Math.round((sk / 300) * w))); return "▰".repeat(f) + "▱".repeat(w - f); };
const SECONDARY = new Set(["cooking", "first aid", "fishing", "riding"]);
const CLASS_COLOR = { Warrior: 0xc69b6d, Paladin: 0xf48cba, Hunter: 0xaad372, Rogue: 0xfff468, Priest: 0xffffff, Shaman: 0x0070dd, Mage: 0x3fc7eb, Warlock: 0x8788ee, Druid: 0xff7c0a };
function findChar(st, q) {
q = (q || "").trim().toLowerCase();
const keys = Object.keys(st.characters || {});
return keys.find((k) => k.endsWith(":" + q)) || keys.find((k) => charName(k).toLowerCase() === q) || keys.find((k) => charName(k).toLowerCase().startsWith(q)) || null;
}

// ---------------------------------------------------------------- /iam: link a Discord user to their main, give them the class role
async function syncClassRole(env, userId, cls) {
// Needs Manage Roles on the bot and the bot's role above the class roles. Returns true when the role is on.
if (!CLASS_COLOR[cls]) return false;
const roles = await discord(env, "GET", `/guilds/${env.GUILD_ID}/roles`);
if (!roles) return false;
let role = roles.find((r) => r.name === cls);
if (!role) {
role = await discord(env, "POST", `/guilds/${env.GUILD_ID}/roles`, { name: cls, color: CLASS_COLOR[cls], permissions: "0", hoist: false, mentionable: false });
if (!role) return false;
// Discord shows the highest colored role, so new class roles go just above Officer (needs the bot's role above that spot).
const officer = roles.find((r) => r.name === "Officer");
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
async function onIam(i, env, ctx) {
const q = i.data.options?.find((o) => o.name === "character")?.value || "";
const st = await trackerState(env);
const key = findChar(st, q);
if (!key) return json({ type: R.MESSAGE, data: { content: S.noSuchChar, flags: FLAGS.EPHEMERAL } });
const c = st.characters[key], u = who(i), name = charName(key), cls = c.class || "";
await env.DB.prepare("INSERT INTO chars (user_id,name,surname,class,updated_at) VALUES (?,?,?,?,?) ON CONFLICT(user_id) DO UPDATE SET name=excluded.name, surname=excluded.surname, class=excluded.class, updated_at=excluded.updated_at")
.bind(u.id, name, key, cls, now()).run();
const ok = await syncClassRole(env, u.id, cls);
return json({ type: R.MESSAGE, data: { content: S.iamLinked(name, cls) + (ok ? "" : "\n" + S.iamRoleLater), flags: FLAGS.EPHEMERAL, allowed_mentions: { parse: [] } } });
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
return json({ type: R.MESSAGE, data: { content: `**${S.whoCraftsTitle(q)}**\n` + lines.join("\n"), flags: FLAGS.EPHEMERAL, allowed_mentions: { parse: [] } } });
}

async function onCharAutocomplete(i, env) {
const q = (i.data.options?.find((o) => o.focused)?.value || "").trim().toLowerCase();
const st = await trackerState(env);
const names = Object.keys(st.characters || {}).map(charName).filter((n) => n.toLowerCase().includes(q)).sort().slice(0, 25);
return json({ type: R.AUTOCOMPLETE, data: { choices: names.map((n) => ({ name: n, value: n })) } });
}

// ---------------------------------------------------------------- /need: a craft request card that pings the people who can make it
async function recipeInfo(env, id) {
const r = await bnet(env, `/data/wow/recipe/${id}`);
if (!r) return { mats: [], icon: null };
const mats = (r.reagents || []).map((x) => ({ name: x.reagent?.name?.en_US || x.reagent?.name, qty: x.quantity || 1 })).filter((m) => m.name);
const itemId = r.crafted_item?.id || r.alliance_crafted_item?.id || r.horde_crafted_item?.id;
const media = itemId ? await bnet(env, `/data/wow/media/item/${itemId}`) : null;
return { mats, icon: media?.assets?.[0]?.value || null };
}
function guildRecipes(st) {
// { lower name: { name, id, prof, crafters: [{ key, name, skill, last }] } }
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
const section = { type: 9, components: [{ type: 10, content: lines.join("\n") }] };
if (q.icon) section.accessory = { type: 11, media: { url: q.icon } };
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
const hit = all[ql] || Object.values(all).find((e) => e.name.toLowerCase().includes(ql));
if (!hit) return json({ type: R.MESSAGE, data: { content: S.needNobody(qtext), flags: FLAGS.EPHEMERAL } });
const keys = hit.crafters.map((c) => c.key);
const linked = keys.length ? (await env.DB.prepare(`SELECT user_id, surname FROM chars WHERE surname IN (${keys.map(() => "?").join(",")})`).bind(...keys).all()).results : [];
const crafters = hit.crafters.sort((a, b) => b.last - a.last || b.skill - a.skill).slice(0, 6)
.map((c) => ({ ...c, user: linked.find((l) => l.surname === c.key)?.user_id || null }));
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
if (!q) return eph(S.needNotOpen);
if (action === "make") {
if (q.status !== "open") return eph(S.needNotOpen);
const res = await env.DB.prepare("UPDATE requests SET status='claimed', maker_id=?, maker_name=?, updated_at=? WHERE id=? AND status='open'").bind(u.id, uname, now(), id).run();
if (!res.meta.changes) return eph(S.needNotOpen);
return json({ type: R.UPDATE, data: requestCard({ ...q, maker_id: u.id, maker_name: uname }, "claimed") });
}
if (action === "done") {
if (q.status !== "claimed") return eph(S.needNotOpen);
if (u.id !== q.user_id && u.id !== q.maker_id && !isOfficer(i)) return eph(S.needNotYours);
await env.DB.prepare("UPDATE requests SET status='done', updated_at=? WHERE id=?").bind(now(), id).run();
return json({ type: R.UPDATE, data: requestCard(q, "done") });
}
if (action === "cancel") {
if (q.status === "done" || q.status === "cancelled") return eph(S.needNotOpen);
if (u.id !== q.user_id && u.id !== q.maker_id && !isOfficer(i)) return eph(S.needNotYours);
await env.DB.prepare("UPDATE requests SET status='cancelled', updated_at=? WHERE id=?").bind(now(), id).run();
return json({ type: R.UPDATE, data: requestCard(q, "cancelled") });
}
return eph(S.needNotOpen);
}

// ---------------------------------------------------------------- Card (Components V2)
export function card(g, counts, state = "open") {
const meta = S.giveMeta([g.item_level ? `ilvl ${g.item_level}` : null, g.slot, g.armor, g.quality ? g.quality[0] + g.quality.slice(1).toLowerCase() : null,
g.req_level ? `req ${g.req_level}` : null]);
const lines = [S.giveTitle(g.item_name), meta, state === "open" ? S.giveFrom(g.giver_name, g.expires_at) : S.giveFromClosed(g.giver_name)];
if (state === "open") lines.push(S.counts(counts.need, counts.greed));
if (state === "awarded") lines.push(S.awarded(g.item_name, g.winner_name));
if (state === "expired") lines.push(S.noTakers(g.item_name));
if (state === "received") lines.push(`**${g.item_name}** → **${g.winner_name}** · received`);
const section = { type: 9, components: [{ type: 10, content: lines.join("\n") }] };
if (g.item_icon) section.accessory = { type: 11, media: { url: g.item_icon } };
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

// ---------------------------------------------------------------- DB helpers
const now = () => Math.floor(Date.now() / 1000);
async function counts(env, giftId) {
const r = await env.DB.prepare("SELECT kind, COUNT(*) n FROM claims WHERE gift_id=? GROUP BY kind").bind(giftId).all();
const c = { need: 0, greed: 0 }; for (const row of r.results) c[row.kind] = row.n; return c;
}
async function pickWinner(env, giftId) {
const r = await env.DB.prepare("SELECT user_id, user_name FROM claims WHERE gift_id=? ORDER BY CASE kind WHEN 'need' THEN 0 ELSE 1 END, at ASC LIMIT 1").bind(giftId).first();
return r || null;
}
async function settle(env, g) {
// Atomic: only the row still 'open' moves on; a second runner sees 0 changes and stops.
const w = await pickWinner(env, g.id);
const next = w ? "awarded" : "expired";
const res = await env.DB.prepare("UPDATE gifts SET status=?, winner_id=?, winner_name=?, awarded_at=? WHERE id=? AND status='open'")
.bind(next, w?.user_id || null, w?.user_name || null, now(), g.id).run();
if (!res.meta.changes) return;
const g2 = { ...g, status: next, winner_id: w?.user_id, winner_name: w?.user_name };
if (g.channel_id && g.message_id) await discord(env, "PATCH", `/channels/${g.channel_id}/messages/${g.message_id}`, card(g2, { need: 0, greed: 0 }, next));
if (w) {
const okW = await dm(env, w.user_id, S.dmWinner(g.item_name, g.giver_name));
const okG = await dm(env, g.giver_id, S.dmGiver(g.item_name, w.user_name));
if (!okW || !okG) await discord(env, "POST", `/channels/${g.channel_id}/messages`, { content: S.awarded(g.item_name, `<@${w.user_id}>`) + ` <@${g.giver_id}>`, allowed_mentions: { users: [w.user_id, g.giver_id] } });
}
}

// ---------------------------------------------------------------- Handlers
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
const t = now(), exp = t + Number(env.CLAIM_HOURS || 24) * 3600;
const row = await env.DB.prepare(`INSERT INTO gifts (giver_id,giver_name,item_id,item_name,item_icon,item_level,slot,armor,quality,req_level,classes,channel_id,token,created_at,expires_at)
VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?) RETURNING id`).bind(giver.id, giverName, item.id, item.name, item.icon, item.level, item.slot, item.armor, item.quality, item.req_level,
item.classes ? JSON.stringify(item.classes) : null, i.channel_id, i.token, t, exp).first();
const g = { ...item, id: row.id, item_id: item.id, giver_id: giver.id, giver_name: giverName, item_name: item.name, item_icon: item.icon, item_level: item.level, expires_at: exp };
// After we answer, fetch the id of the message we just posted so expiry can edit it. Discord needs a moment.
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

async function onButton(i, env) {
const [action, idStr] = i.data.custom_id.split(":"); const id = Number(idStr);
console.log(`[button] ${i.data.custom_id} by ${who(i)?.id}`);
if (["make", "done", "cancel"].includes(action)) return onRequestButton(i, env, action, id);
const g = await env.DB.prepare("SELECT * FROM gifts WHERE id=?").bind(id).first();
const u = who(i), uname = display(i);
const eph = (content) => json({ type: R.MESSAGE, data: { content, flags: FLAGS.EPHEMERAL } });
if (!g) return eph(S.closed);
if (action === "need" || action === "greed") {
if (g.status !== "open" || g.expires_at <= now()) return eph(S.closed);
if (u.id === g.giver_id) return eph(S.ownGift);
await env.DB.prepare("INSERT INTO claims (gift_id,user_id,user_name,kind,at) VALUES (?,?,?,?,?) ON CONFLICT(gift_id,user_id) DO UPDATE SET kind=excluded.kind, user_name=excluded.user_name")
.bind(id, u.id, uname, action, now()).run();
return json({ type: R.UPDATE, data: card(g, await counts(env, id)) });
}
if (action === "close") {
if (u.id !== g.giver_id && !isOfficer(i)) return eph(S.notYours);
if (g.status !== "open") return eph(S.closed);
await settle(env, g);
const g2 = await env.DB.prepare("SELECT * FROM gifts WHERE id=?").bind(id).first();
return json({ type: R.UPDATE, data: card(g2, { need: 0, greed: 0 }, g2.status) });
}
if (action === "got") {
if (g.status !== "awarded") return eph(S.closed);
if (u.id !== g.winner_id && !isOfficer(i)) return eph(S.notYours);
await env.DB.prepare("UPDATE gifts SET status='received', received_at=? WHERE id=? AND status='awarded'").bind(now(), id).run();
return json({ type: R.UPDATE, data: card({ ...g, status: "received" }, { need: 0, greed: 0 }, "received") });
}
return eph(S.closed);
}
const isOfficer = (i) => (BigInt(i.member?.permissions || "0") & (1n << 13n)) !== 0n; // MANAGE_MESSAGES as the officer test

const COMMANDS = [
{ name: "give", description: "Offer an item you don't need to the guild", options: [
{ type: 3, name: "item", description: "Item name (pick from the list)", required: true, autocomplete: true } ] },
{ name: "help", description: "How giving works, in one line" },
{ name: "iam", description: "Link your main character so your name gets its class color", options: [
{ type: 3, name: "character", description: "Your character", required: true, autocomplete: true } ] },
{ name: "professions", description: "Someone's professions and known recipes", options: [
{ type: 3, name: "character", description: "Character name", required: true, autocomplete: true } ] },
{ name: "need", description: "Ask the guild to craft something; pings the people who can", options: [
{ type: 3, name: "recipe", description: "What you need made", required: true, autocomplete: true } ] },
{ name: "who-crafts", description: "Who in the guild can make something", options: [
{ type: 3, name: "recipe", description: "Recipe or item name, or part of it", required: true } ] },
];
async function registerCommands(env) {
const r = await fetch(`${API}/applications/${env.DISCORD_APP_ID}/guilds/${env.GUILD_ID}/commands`, { method: "PUT",
headers: { Authorization: `Bot ${env.DISCORD_BOT_TOKEN}`, "content-type": "application/json", "User-Agent": "GuildBot (gifting, 1.0)" }, body: JSON.stringify(COMMANDS) });
const body = await r.text();
return new Response(r.ok ? `registered ${COMMANDS.length} commands` : `failed ${r.status}: ${body.slice(0, 300)}`, { status: r.ok ? 200 : 500 });
}

export default {
async fetch(req, env, ctx) {
const url = new URL(req.url);
if (req.method === "GET" && url.pathname === "/register") return registerCommands(env);
if (req.method !== "POST") return new Response("Guild Bot", { status: 200 });
const body = await req.text();
if (!(await verify(req, body, env.DISCORD_PUBLIC_KEY))) return new Response("bad signature", { status: 401 });
const i = JSON.parse(body);
if (i.type === T.PING) return json({ type: R.PONG });
if (i.type === T.AUTOCOMPLETE) return ["professions", "iam"].includes(i.data.name) ? onCharAutocomplete(i, env) : i.data.name === "need" ? onRecipeAutocomplete(i, env) : onAutocomplete(i, env);
if (i.type === T.COMMAND && i.data.name === "need") return onNeed(i, env, ctx);
if (i.type === T.COMMAND && i.data.name === "iam") return onIam(i, env, ctx);
if (i.type === T.COMMAND && i.data.name === "professions") return onProfessions(i, env);
if (i.type === T.COMMAND && i.data.name === "who-crafts") return onWhoCrafts(i, env);
if (i.type === T.COMMAND && i.data.name === "give") return onGive(i, env, ctx);
if (i.type === T.COMMAND && i.data.name === "help") return json({ type: R.MESSAGE, data: { content: S.helpLine, flags: FLAGS.EPHEMERAL } });
if (i.type === T.COMPONENT) return onButton(i, env);
return json({ type: R.MESSAGE, data: { content: S.closed, flags: FLAGS.EPHEMERAL } });
},
async scheduled(_ev, env, ctx) {
const due = await env.DB.prepare("SELECT * FROM gifts WHERE status='open' AND expires_at<=? LIMIT 20").bind(now()).all();
for (const g of due.results) ctx.waitUntil(settle(env, g));
},
};
