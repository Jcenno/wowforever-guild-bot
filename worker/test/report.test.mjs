import { test } from "node:test"; import assert from "node:assert/strict";
import { reportEmbed } from "../src/index.js";
test("weekly report names the top giver and crafter and lists items", () => {
  const e = reportEmbed(
    [{ giver_name: "Joe", winner_name: "Tanner", item_name: "Silk Cloth" }, { giver_name: "Joe", winner_name: "Quinn", item_name: "Wool Cloth" }],
    [{ maker_name: "Steel Appeal", user_name: "Quinn", recipe_name: "Copper Bracers" }], 1, 2);
  assert.equal(e.title, "This week in the Workshop");
  assert.match(e.description, /\*\*2\*\* items passed on · most from \*\*Joe\*\*/);
  assert.match(e.description, /\*\*1\*\* craft made · most by \*\*Steel Appeal\*\*/);
  assert.match(e.description, /• Silk Cloth → Tanner/);
  assert.match(e.description, /Open now: 1 gift, 2 requests/);
});
