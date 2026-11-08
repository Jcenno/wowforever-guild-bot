#!/usr/bin/env python3
"""Checks the Blizzard item endpoints the gifting Worker needs, across candidate namespaces. Never prints keys."""
import os, sys, json, urllib.parse
import tracker as t

q = sys.argv[1] if len(sys.argv) > 1 else "Linen Cloth"
token = t.get_token(os.environ["BLIZZARD_CLIENT_ID"], os.environ["BLIZZARD_CLIENT_SECRET"])
print("token ok")
for ns in ["static-forever-us", "static-classic-us", "static-classic1x-us", "static-us"]:
    s, b = t.api_get("us", f"/data/wow/search/item?name.en_US={urllib.parse.quote(q)}&orderby=id&_pageSize=5", token, ns)
    n = len((b or {}).get("results") or []) if isinstance(b, dict) else 0
    first = None
    if n:
        d = b["results"][0]["data"]; first = (d.get("id"), d.get("name", {}).get("en_US") if isinstance(d.get("name"), dict) else d.get("name"))
    print(f"{ns:22} search {s} results={n} first={first}")
    if n:
        iid = first[0]
        s2, it = t.api_get("us", f"/data/wow/item/{iid}", token, ns)
        s3, md = t.api_get("us", f"/data/wow/media/item/{iid}", token, ns)
        keys = sorted(k for k in (it or {}) if k != "_links") if isinstance(it, dict) else None
        icon = (md or {}).get("assets", [{}])[0].get("value") if isinstance(md, dict) else None
        print(f"{'':22} item {s2} keys={keys}")
        print(f"{'':22} media {s3} icon={icon}")
        if isinstance(it, dict):
            print(f"{'':22} inventory_type={it.get('inventory_type')} quality={it.get('quality')} level={it.get('level')} req={it.get('required_level')} class={it.get('item_class',{}).get('name')} sub={it.get('item_subclass',{}).get('name')}")
            pi = it.get("preview_item") or {}
            print(f"{'':22} preview requirements={json.dumps(pi.get('requirements'))[:300]}")
