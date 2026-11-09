import { test } from "node:test"; import assert from "node:assert/strict";
import { requestCard } from "../src/index.js";
const q = { id: 7, user_id: "1", user_name: "Joe", recipe_name: "Copper Bracers", profession: "Blacksmithing", icon: "https://x/y.jpg",
  mats: JSON.stringify([{ name: "Copper Bar", qty: 2 }]), crafters: JSON.stringify([{ key: "us:steel-appeal", name: "Steel Appeal", skill: 66, last: Date.now(), user: "42" }]) };
test("open request pings crafters and offers I'll make it + Cancel", () => {
  const c = requestCard(q);
  const text = c.components[0].components[0].components[0].content;
  assert.match(text, /\*\*Joe\*\* needs \*\*Copper Bracers\*\* · Blacksmithing/);
  assert.match(text, /Mats: 2× Copper Bar/);
  assert.match(text, /<@42>/);
  assert.deepEqual(c.allowed_mentions.users, ["42"]);
  assert.deepEqual(c.components[0].components.at(-1).components.map((b) => b.custom_id), ["make:7", "cancel:7"]);
});
test("claimed shows maker and Done; done has no buttons", () => {
  const c = requestCard({ ...q, maker_name: "Lumi" }, "claimed");
  assert.match(c.components[0].components[0].components[0].content, /\*\*Lumi\*\* is on it/);
  assert.deepEqual(c.components[0].components.at(-1).components.map((b) => b.custom_id), ["done:7", "cancel:7"]);
  const d = requestCard({ ...q, maker_name: "Lumi" }, "done");
  assert.equal(d.components[0].components.length, 1);
});
