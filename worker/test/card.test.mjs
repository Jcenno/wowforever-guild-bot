import { test } from "node:test"; import assert from "node:assert/strict";
import { card } from "../src/index.js";
const g = { id: 14, giver_id: "1", giver_name: "Joe", item_name: "Robes of Arcana", item_icon: "https://x/y.jpg", item_level: 20, slot: "Chest", armor: "Cloth", quality: "RARE", req_level: 15, expires_at: 1800000000 };
test("open card has Need/Greed/Close and V2 flag", () => {
  const c = card(g, { need: 2, greed: 1 });
  assert.equal(c.flags & (1 << 15), 1 << 15);
  const row = c.components[0].components.at(-1);
  assert.deepEqual(row.components.map((b) => b.custom_id), ["need:14", "greed:14", "close:14"]);
  assert.match(c.components[0].components[0].components[0].content, /Need \*\*2\*\* · Greed \*\*1\*\*/);
  assert.equal(c.components[0].accent_color, 0x0070dd);
});
test("awarded card has only Received", () => {
  const c = card({ ...g, winner_name: "Lumi" }, { need: 0, greed: 0 }, "awarded");
  assert.deepEqual(c.components[0].components.at(-1).components.map((b) => b.custom_id), ["got:14"]);
  assert.match(c.components[0].components[0].components[0].content, /→ \*\*Lumi\*\*/);
});
test("expired card has no buttons and no shame", () => {
  const c = card(g, { need: 0, greed: 0 }, "expired");
  assert.equal(c.components[0].components.length, 1);
  assert.match(c.components[0].components[0].components[0].content, /no takers/);
});
test("ed25519 verify path works with webcrypto", async () => {
  const kp = await crypto.subtle.generateKey("Ed25519", true, ["sign", "verify"]);
  const raw = new Uint8Array(await crypto.subtle.exportKey("raw", kp.publicKey));
  const hexKey = [...raw].map((b) => b.toString(16).padStart(2, "0")).join("");
  const ts = "123", body = '{"type":1}';
  const sig = new Uint8Array(await crypto.subtle.sign("Ed25519", kp.privateKey, new TextEncoder().encode(ts + body)));
  const key = await crypto.subtle.importKey("raw", new Uint8Array(hexKey.match(/.{2}/g).map((h) => parseInt(h, 16))), { name: "Ed25519" }, false, ["verify"]);
  assert.equal(await crypto.subtle.verify("Ed25519", key, sig, new TextEncoder().encode(ts + body)), true);
  assert.equal(await crypto.subtle.verify("Ed25519", key, sig, new TextEncoder().encode("x" + body)), false);
});
import { needClasses } from "../src/index.js";
test("Need is gated by armor type, with low-level leather and mail wider", () => {
  assert.deepEqual(needClasses({ armor: "Plate", req_level: 45 }), ["Warrior", "Paladin"]);
  assert.deepEqual(needClasses({ armor: "Mail", req_level: 22 }), ["Hunter", "Shaman", "Warrior", "Paladin"]);
  assert.deepEqual(needClasses({ armor: "Cloth", req_level: 10 }), ["Mage", "Priest", "Warlock"]);
  assert.equal(needClasses({ armor: "Sword", req_level: 30 }), null);
  assert.equal(needClasses({ armor: "Cloth", slot: "Back", req_level: 30 }), null);
  assert.deepEqual(needClasses({ armor: "Plate", classes: JSON.stringify(["Paladin"]) }), ["Paladin"]);
});
