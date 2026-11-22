import test from "node:test";
import assert from "node:assert/strict";
import { rankPlan, rankOrder } from "../src/index.js";
test("rank plan picks the higher rank across main and alt", () => {
  const members = [{ region: "us", name: "Steel", surname: "Appeal", rank: 0 }, { region: "us", name: "Teenie", surname: "Tinker", rank: 4 }, { region: "us", name: "Aeri", surname: "Moonglow", rank: 2 }];
  const rows = [{ user_id: "1", surname: "us:teenie-tinker", alt: "us:steel-appeal" }, { user_id: "2", surname: "us:aeri-moonglow", alt: null }, { user_id: "3", surname: "us:nobody-here", alt: null }];
  const names = { 0: "The Big Shaft", 2: "The Foreskinman", 4: "Spare Shaft" };
  assert.deepEqual(rankPlan(members, rows, names), [["1", "The Big Shaft"], ["2", "The Foreskinman"], ["3", null]]);
});

test("rank roles move above the class roles, in rank order, and stay put once right", () => {
  const roles = [{ id: "e", name: "@everyone", position: 0 }, { id: "bot", name: "Bot", position: 9 }, { id: "off", name: "Officer", position: 8 }, { id: "war", name: "Warrior", position: 7 },
    { id: "dru", name: "Druid", position: 6 }, { id: "dings", name: "Dings", position: 5 }, { id: "r0", name: "The Big Shaft", position: 3 }, { id: "r1", name: "Shaft Master", position: 4 }];
  const moves = rankOrder(roles, 9, ["The Big Shaft", "Shaft Master", "Deep Shaft"]);
  assert.deepEqual(moves.map((m) => m.id), ["off", "r0", "r1", "war", "dru", "dings"]);
  assert.deepEqual(moves.map((m) => m.position), [6, 5, 4, 3, 2, 1]);
  const after = roles.map((r) => ({ ...r, position: moves.find((m) => m.id === r.id)?.position ?? r.position }));
  assert.equal(rankOrder(after, 9, ["The Big Shaft", "Shaft Master", "Deep Shaft"]), null);
});
