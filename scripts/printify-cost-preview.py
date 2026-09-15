#!/usr/bin/env python3
"""
Printify cost preview for a specific cart — no order is created.

Answers, for a hard-coded list of products/sizes below:
  1. Production cost Printify charges you per item (their "cost" field —
     different from your store's retail price).
  2. Real shipping cost Printify would charge, via their own
     "Calculate the shipping cost of an order" endpoint, for the address set
     below.
  3. The total that would be charged to your card on file in Printify.
  4. Whether each product has a custom label/neck-tag print area (an image
     placed on a "label" position) — if not, it ships with the manufacturer's
     stock tag, not a trashtribe-branded one.

Read-only — doesn't create, submit, or modify anything in Printify.

Usage (from the project root, where .env.local lives):
    python3 scripts/printify-cost-preview.py
"""

import json
import time
import urllib.request
import urllib.error

API_BASE = "https://api.printify.com/v1"

# (title substring to match, size to look for in the variant title — None
# for single-size products like the socks).
TARGET_ITEMS = [
    ("Scissor Socks", None),
    ("CheR Guevara Tee", "L"),
    ("Lesbians eat what", "L"),
    ("Lesbian Avengers recruitment", "M"),
    ("Protect the Dolls Baby Tank Top", "S"),
    ("Bunny F", "M"),
]

# Just enough for Printify's shipping calculator — this call doesn't create
# anything, so it doesn't need to be your real name/phone.
ADDRESS_TO = {
    "first_name": "Test",
    "last_name": "Customer",
    "email": "test@example.com",
    "phone": "07000000000",
    "country": "GB",
    "region": "",
    "address1": "1 Test Street",
    "address2": "",
    "city": "Shepton Mallet",
    "zip": "BA4 4SS",
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


def api_request(path, api_key, method="GET", payload=None):
    data = json.dumps(payload).encode("utf-8") if payload is not None else None
    req = urllib.request.Request(
        f"{API_BASE}{path}",
        data=data,
        method=method,
        headers={
            "Authorization": f"Bearer {api_key}",
            "User-Agent": "curl/8.4.0",
            "Accept": "application/json",
            "Content-Type": "application/json",
        },
    )
    try:
        with urllib.request.urlopen(req, timeout=30) as res:
            return json.loads(res.read().decode("utf-8"))
    except urllib.error.HTTPError as e:
        details = e.read().decode("utf-8", errors="replace")
        print(f"HTTP {e.code} on {path}: {details[:800]}")
        raise


def fetch_all_products(shop_id, api_key):
    products = []
    page = 1
    while True:
        body = api_request(f"/shops/{shop_id}/products.json?limit=50&page={page}", api_key)
        products.extend(body.get("data", []))
        if page >= body.get("last_page", 1):
            break
        page += 1
    return products


def variant_matches_size(variant_title, size):
    if size is None:
        return True
    parts = [p.strip().lower() for p in variant_title.split("/")]
    return size.strip().lower() in parts or variant_title.strip().lower() == size.strip().lower()


def main():
    env = load_env_local()
    shop_id = env.get("PRINTIFY_SHOP_ID", "").strip()
    api_key = env.get("PRINTIFY_API_KEY", "").strip()
    if not shop_id or not api_key:
        print("Missing PRINTIFY_SHOP_ID or PRINTIFY_API_KEY in .env.local")
        return

    print("Fetching product list...")
    all_products = fetch_all_products(shop_id, api_key)

    line_items = []
    total_cost_cents = 0
    resolved = []

    for title_substr, size in TARGET_ITEMS:
        matches = [p for p in all_products if title_substr.lower() in p.get("title", "").lower()]
        if not matches:
            print(f"[NOT FOUND] No product title contains '{title_substr}'")
            continue
        if len(matches) > 1:
            print(f"[AMBIGUOUS] '{title_substr}' matched {len(matches)} products — using the first: {matches[0]['title']}")
        product = matches[0]

        # Fetch the full product to get per-variant fulfillment cost + print areas
        # (the list endpoint above doesn't reliably include "cost").
        detail = api_request(f"/shops/{shop_id}/products/{product['id']}.json", api_key)
        time.sleep(0.1)

        variants = detail.get("variants", [])
        candidates = [v for v in variants if variant_matches_size(v.get("title", ""), size)]
        available = [v for v in candidates if v.get("is_available")]
        chosen = (available or candidates or variants or [None])[0]

        if chosen is None:
            print(f"[NO VARIANT] Could not resolve a variant for '{product['title']}' (size={size})")
            continue

        cost = chosen.get("cost")
        print(f"[MATCHED] {product['title']}  ->  variant '{chosen.get('title')}'  ->  fulfillment cost: {cost} cents" if cost is not None else
              f"[MATCHED] {product['title']}  ->  variant '{chosen.get('title')}'  ->  fulfillment cost: NOT PROVIDED by API")

        if isinstance(cost, int):
            total_cost_cents += cost

        line_items.append({
            "product_id": product["id"],
            "variant_id": chosen["id"],
            "quantity": 1,
            "external_id": f"preview-{product['id']}",
        })

        # Custom label / neck tag check.
        label_positions = []
        other_positions = []
        for area in detail.get("print_areas", []):
            for ph in area.get("placeholders", []):
                pos = ph.get("position", "")
                has_images = bool(ph.get("images"))
                if has_images:
                    (label_positions if "label" in pos.lower() else other_positions).append(pos)

        if label_positions:
            print(f"          Custom label/tag artwork found on: {', '.join(sorted(set(label_positions)))}")
        else:
            print(f"          No custom label/tag print area — ships with the manufacturer's stock tag (design on: {', '.join(sorted(set(other_positions))) or 'n/a'})")

        resolved.append(product["title"])

    if not line_items:
        print("\nNo items resolved — nothing to price.")
        return

    print("\nCalculating real shipping cost from Printify...")
    shipping = api_request(
        f"/shops/{shop_id}/orders/shipping.json",
        api_key,
        method="POST",
        payload={"line_items": line_items, "address_to": ADDRESS_TO},
    )

    standard_cents = shipping.get("standard")

    print("\n" + "=" * 60)
    print(f"Items resolved: {len(resolved)}/{len(TARGET_ITEMS)}")
    print(f"Total production cost (Printify's cost, not your retail price): {total_cost_cents / 100:.2f}")
    print(f"Shipping cost quote to {ADDRESS_TO['country']} {ADDRESS_TO['zip']} (all options, in your Printify account currency):")
    for method, cents in shipping.items():
        print(f"  {method}: {cents / 100:.2f}")
    if isinstance(standard_cents, int):
        print(f"\nEstimated TOTAL charged to your card (production + standard shipping): {(total_cost_cents + standard_cents) / 100:.2f}")


if __name__ == "__main__":
    main()
