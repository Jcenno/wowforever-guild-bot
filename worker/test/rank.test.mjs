import test from "node:test";
import assert from "node:assert/strict";
import { rankPlan } from "../src/index.js";
test("rank plan picks the higher rank across main and alt", () => {
  const members = [{ region: "us", name: "Steel", surname: "Appeal", rank: 0 }, { region: "us", name: "Teenie", surname: "Tinker", rank: 4 }, { region: "us", name: "Aeri", surname: "Moonglow", rank: 2 }];
  const rows = [{ user_id: "1", surname: "us:teenie-tinker", alt: "us:steel-appeal" }, { user_id: "2", surname: "us:aeri-moonglow", alt: null }, { user_id: "3", surname: "us:nobody-here", alt: null }];
  const names = { 0: "The Big Shaft", 2: "The Foreskinman", 4: "Spare Shaft" };
  assert.deepEqual(rankPlan(members, rows, names), [["1", "The Big Shaft"], ["2", "The Foreskinman"], ["3", null]]);
});
