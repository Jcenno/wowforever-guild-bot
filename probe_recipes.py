#!/usr/bin/env python3
"""Does Forever's API expose known recipes per character, and recipe reagents? Never prints keys."""
import os, sys, json, urllib.parse
import tracker as t
token = t.get_token(os.environ["BLIZZARD_CLIENT_ID"], os.environ["BLIZZARD_CLIENT_SECRET"])
def get(path, ns, **params):
    qs = urllib.parse.urlencode({"namespace": ns, "locale": "en_US", **params})
    return t.http("GET", f"https://us.api.blizzard.com{path}?{qs}", {"Authorization": f"Bearer {token}"})
slug = sys.argv[1] if len(sys.argv) > 1 else "steel-appeal"
s, b = get(f"/profile/wow/character/{slug}/professions", "profile-forever-us")
print("character professions", s)
if isinstance(b, dict):
    for group in ("primaries", "secondaries"):
        for p in b.get(group) or []:
            name = p.get("profession", {}).get("name"); print(" ", group, name, "skill", p.get("skill_points"), "max", p.get("max_skill_points"), "keys", sorted(p.keys()))
            for tier in p.get("tiers") or []:
                kr = tier.get("known_recipes") or []
                print("    tier", tier.get("tier", {}).get("name"), "skill", tier.get("skill_points"), "known_recipes", len(kr), [r.get("name") for r in kr[:6]])
s, idx = get("/data/wow/profession/index", "static-forever-us")
print("profession index", s, [p.get("name") for p in (idx or {}).get("professions", [])][:20] if isinstance(idx, dict) else None)
alch = next((p for p in (idx or {}).get("professions", []) if p.get("name") == "Alchemy"), None) if isinstance(idx, dict) else None
if alch:
    s, prof = get(f"/data/wow/profession/{alch['id']}", "static-forever-us")
    tiers = (prof or {}).get("skill_tiers") or []
    print("alchemy", s, "tiers", [(x.get("name"), x.get("id")) for x in tiers])
    if tiers:
        s, tier = get(f"/data/wow/profession/{alch['id']}/skill-tier/{tiers[0]['id']}", "static-forever-us")
        cats = (tier or {}).get("categories") or []
        print("tier", s, "categories", [(c.get("name"), len(c.get("recipes") or [])) for c in cats][:8])
        first = next((r for c in cats for r in (c.get("recipes") or [])), None)
        if first:
            s, rec = get(f"/data/wow/recipe/{first['id']}", "static-forever-us")
            print("recipe", s, first.get("name"), json.dumps({k: rec.get(k) for k in ("crafted_item", "reagents", "crafted_quantity", "rank")}, default=str)[:600] if isinstance(rec, dict) else None)
            s, rmedia = get(f"/data/wow/media/recipe/{first['id']}", "static-forever-us")
            print("recipe media", s, (rmedia or {}).get("assets", [{}])[0].get("value") if isinstance(rmedia, dict) else None)
