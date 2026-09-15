#!/usr/bin/env python3
"""
Printify print-provider audit.

For every product in the shop, shows which print provider fulfills it and
where that provider is based. For any product whose provider is NOT in
Europe/UK, looks up whether an EU/UK alternative exists for that same
blueprint (the underlying blank product) — so you can decide whether to
switch providers for faster/cheaper shipping to your mostly-EU/UK customers.

This is a read-only diagnostic — it doesn't change anything in Printify.
Safe to re-run any time, and safe to delete afterwards if you don't want to
keep it around.

Usage (from the project root, where .env.local lives):
    python3 scripts/printify-provider-audit.py
"""

import json
import os
import time
import urllib.request
import urllib.error

API_BASE = "https://api.printify.com/v1"

# ISO country codes we currently ship to / consider "close enough" for EU+UK
# customers — kept in sync with the checkout's country list.
EU_UK_COUNTRIES = {
    "GB", "IE", "FR", "DE", "ES", "IT", "NL", "BE", "PT", "AT", "SE", "DK", "FI", "PL",
}

COUNTRY_NAMES = {
    "US": "United States", "GB": "United Kingdom", "IE": "Ireland", "FR": "France",
    "DE": "Germany", "ES": "Spain", "IT": "Italy", "NL": "Netherlands", "BE": "Belgium",
    "PT": "Portugal", "AT": "Austria", "SE": "Sweden", "DK": "Denmark", "FI": "Finland",
    "PL": "Poland", "LV": "Latvia", "LT": "Lithuania", "CZ": "Czechia", "CN": "China",
    "AU": "Australia", "CA": "Canada", "MX": "Mexico",
}


def load_env_local(path=".env.local"):
    values = {}
    with open(path, "r") as f:
        for line in f:
            line = line.strip()
            if not line or line.startswith("#") or "=" not in line:
                continue
            key, _, value = line.partition("=")
            key = key.strip()
            value = value.strip().strip('"').strip("'")
            values[key] = value
    return values


def api_get(path, api_key):
    # Printify's edge (Cloudflare) returns a bare 403 for requests with
    # Python's default "Python-urllib/x.y" User-Agent — curl and browsers
    # aren't blocked, so a normal-looking UA + Accept header is enough to
    # get through.
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
        data = body.get("data", [])
        products.extend(data)
        last_page = body.get("last_page", 1)
        if page >= last_page:
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

    provider_cache = {}  # provider_id -> {"title":..., "country":...}
    blueprint_providers_cache = {}  # blueprint_id -> list of provider ids

    def get_provider(provider_id):
        if provider_id in provider_cache:
            return provider_cache[provider_id]
        data = api_get(f"/catalog/print_providers/{provider_id}.json", api_key)
        info = {
            "title": data.get("title", f"Provider {provider_id}"),
            "country": (data.get("location") or {}).get("country", "??"),
        }
        provider_cache[provider_id] = info
        time.sleep(0.12)
        return info

    def get_blueprint_providers(blueprint_id):
        if blueprint_id in blueprint_providers_cache:
            return blueprint_providers_cache[blueprint_id]
        data = api_get(f"/catalog/blueprints/{blueprint_id}/print_providers.json", api_key)
        ids = [p["id"] for p in data if "id" in p]
        blueprint_providers_cache[blueprint_id] = ids
        time.sleep(0.12)
        return ids

    needs_review = []
    ok_count = 0

    for p in products:
        title = p.get("title", "(untitled)")
        blueprint_id = p.get("blueprint_id")
        provider_id = p.get("print_provider_id")

        if not blueprint_id or not provider_id:
            print(f"[SKIP] {title} — missing blueprint_id/print_provider_id in product data")
            continue

        provider = get_provider(provider_id)
        country = provider["country"]
        country_label = COUNTRY_NAMES.get(country, country)

        if country in EU_UK_COUNTRIES:
            ok_count += 1
            print(f"[OK]     {title}  —  {provider['title']} ({country_label})")
            continue

        # Not EU/UK — look for an alternative provider offering the same blueprint.
        alt_ids = [pid for pid in get_blueprint_providers(blueprint_id) if pid != provider_id]
        eu_uk_alts = []
        for pid in alt_ids:
            alt = get_provider(pid)
            if alt["country"] in EU_UK_COUNTRIES:
                eu_uk_alts.append(f"{alt['title']} ({COUNTRY_NAMES.get(alt['country'], alt['country'])})")

        print(f"[REVIEW] {title}  —  {provider['title']} ({country_label})")
        if eu_uk_alts:
            print(f"         EU/UK alternatives for this blueprint: {', '.join(eu_uk_alts)}")
        else:
            print("         No EU/UK provider found for this blueprint.")

        needs_review.append(title)

    print("\n" + "=" * 60)
    print(f"{ok_count} product(s) already fulfilled from EU/UK.")
    print(f"{len(needs_review)} product(s) fulfilled from outside EU/UK — see [REVIEW] above.")


if __name__ == "__main__":
    main()
