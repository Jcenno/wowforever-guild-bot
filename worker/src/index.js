// Guild Bot gifting Worker (C1): /give with item autocomplete, Need/Greed card, expiry, winner DMs.
import { S } from "./strings.js";

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
async function searchItems(env, q) {
  const j = await bnet(env, "/data/wow/search/item", { "name.en_US": q, orderby: "id", _pageSize: 25 });
  const seen = new Set(), out = [], ql = q.toLowerCase();
  for (const r of j?.results || []) {
    const name = r.data?.name?.en_US || r.data?.name; const id = r.data?.id;
    if (!name || !id || seen.has(name)) continue;
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

// ---------------------------------------------------------------- Card (Components V2)
export function card(g, counts, state = "open") {
  const meta = S.giveMeta([g.item_level ? `ilvl ${g.item_level}` : null, g.slot, g.armor, g.quality ? g.quality[0] + g.quality.slice(1).toLowerCase() : null,
    g.req_level ? `req ${g.req_level}` : null]);
  const lines = [S.giveTitle(g.item_name), meta, S.giveFrom(g.giver_name, g.expires_at)];
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
  const ins = await env.DB.prepare(`INSERT INTO gifts (giver_id,giver_name,item_id,item_name,item_icon,item_level,slot,armor,quality,req_level,classes,channel_id,token,created_at,expires_at)
    VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`).bind(giver.id, giverName, item.id, item.name, item.icon, item.level, item.slot, item.armor, item.quality, item.req_level,
    item.classes ? JSON.stringify(item.classes) : null, i.channel_id, i.token, t, exp).run();
  const g = { id: ins.meta.last_row_id, giver_id: giver.id, giver_name: giverName, ...item, item_name: item.name, item_icon: item.icon, item_level: item.level, expires_at: exp };
  // After we answer, fetch the message id of what we just posted so expiry can edit it.
  ctx.waitUntil((async () => {
    const m = await fetch(`${API}/webhooks/${env.DISCORD_APP_ID}/${i.token}/messages/@original`).then((r) => (r.ok ? r.json() : null));
    if (m?.id) await env.DB.prepare("UPDATE gifts SET message_id=? WHERE id=?").bind(m.id, g.id).run();
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
    if (i.type === T.AUTOCOMPLETE) return onAutocomplete(i, env);
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
