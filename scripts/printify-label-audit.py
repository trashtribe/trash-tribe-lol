#!/usr/bin/env python3
"""
Checks every product in the shop for a custom neck-label / tag print area
(an image placed on a "label"-type placeholder — e.g. "neck", "label",
"neck_label_outside", "neck_label_inside", "inside_label", "tag").

This fixes a bug in the first version of this check (scripts/printify-cost-
preview.py): it only looked for the literal substring "label" in the
placeholder's position name, so it missed positions just called "neck" —
which is exactly the trashtribe neck tag seen in the product photos.

Read-only — doesn't change anything in Printify.

Usage (from the project root, where .env.local lives):
    python3 scripts/printify-label-audit.py
"""

import json
import time
import urllib.request
import urllib.error

API_BASE = "https://api.printify.com/v1"

# Position names treated as "this is a label/tag", not the main print design.
LABEL_POSITION_NAMES = {
    "neck", "label", "tag", "neck_label", "neck_label_outside",
    "neck_label_inside", "inside_label", "outside_label", "brand_label",
}


def load_env_local(path=".env.local"):
    values = {}
    with open(path, "r") as f:
        for line in f:
            line = line.strip()
            if not line or line.startswith("#") or "=" not in line:
                continue
            key, _, value = line.partition("=")
            values[key.strip()] = value.strip().strip('"').strip("'")
    return values


def api_get(path, api_key):
    req = urllib.request.Request(
        f"{API_BASE}{path}",
        headers={
            "Authorization": f"Bearer {api_key}",
            "User-Agent": "curl/8.4.0",
            "Accept": "application/json",
        },
    )
    try:
        with urllib.request.urlopen(req, timeout=30) as res:
            return json.loads(res.read().decode("utf-8"))
    except urllib.error.HTTPError as e:
        details = e.read().decode("utf-8", errors="replace")
        print(f"HTTP {e.code} on {path}: {details[:500]}")
        raise


def fetch_all_products(shop_id, api_key):
    products = []
    page = 1
    while True:
        body = api_get(f"/shops/{shop_id}/products.json?limit=50&page={page}", api_key)
        products.extend(body.get("data", []))
        if page >= body.get("last_page", 1):
            break
        page += 1
    return products


def main():
    env = load_env_local()
    shop_id = env.get("PRINTIFY_SHOP_ID", "").strip()
    api_key = env.get("PRINTIFY_API_KEY", "").strip()
    if not shop_id or not api_key:
        print("Missing PRINTIFY_SHOP_ID or PRINTIFY_API_KEY in .env.local")
        return

    print("Fetching products...")
    products = fetch_all_products(shop_id, api_key)
    print(f"Found {len(products)} products.\n")

    with_label = []
    without_label = []

    for p in products:
        detail = api_get(f"/shops/{shop_id}/products/{p['id']}.json", api_key)
        time.sleep(0.1)

        label_positions = []
        design_positions = []
        for area in detail.get("print_areas", []):
            for ph in area.get("placeholders", []):
                pos = (ph.get("position") or "").strip()
                if not ph.get("images"):
                    continue
                if pos.lower() in LABEL_POSITION_NAMES:
                    label_positions.append(pos)
                else:
                    design_positions.append(pos)

        title = p.get("title", "(untitled)")
        if label_positions:
            print(f"[LABEL]    {title}  —  label art on: {', '.join(sorted(set(label_positions)))}")
            with_label.append(title)
        else:
            print(f"[NO LABEL] {title}  —  design on: {', '.join(sorted(set(design_positions))) or 'n/a'}")
            without_label.append(title)

    print("\n" + "=" * 60)
    print(f"{len(with_label)} product(s) WITH a custom trashtribe label/tag.")
    print(f"{len(without_label)} product(s) WITHOUT one (ship with the manufacturer's stock tag, or the blueprint has no label position at all).")


if __name__ == "__main__":
    main()
