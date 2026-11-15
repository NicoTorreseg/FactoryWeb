""" CLI entrypoint to generate a validated tenant JSON + outreach email package."""
from __future__ import annotations

import argparse
import json
from pathlib import Path
from automation.extractors.mercadolibre import build_viothaniarg_tenant


PROJECT_ROOT = Path(__file__).resolve().parent.parent
TENANTS_DIR = PROJECT_ROOT / "src" / "data" / "tenants"
PUBLIC_TENANTS_DIR = PROJECT_ROOT / "public" / "tenants"
OUTREACH_DIR = PROJECT_ROOT / "outreach_output"


def save_tenant_json(slug: str) -> Path:
    if slug.lower() == "viothaniarg":
        tenant = build_viothaniarg_tenant()
    else:
        raise ValueError(f"Extractor profile for '{slug}' not registered yet.")

    TENANTS_DIR.mkdir(parents=True, exist_ok=True)
    PUBLIC_TENANTS_DIR.mkdir(parents=True, exist_ok=True)

    payload = tenant.model_dump(by_alias=True, exclude_none=True)
    json_str = json.dumps(payload, indent=2, ensure_ascii=False)

    # Save in both `src/data/tenants` (for Vite build) and `public/tenants` (for runtime edge loading)
    src_path = TENANTS_DIR / f"{tenant.slug}.json"
    pub_path = PUBLIC_TENANTS_DIR / f"{tenant.slug}.json"
    src_path.write_text(json_str + "\n", encoding="utf-8")
    pub_path.write_text(json_str + "\n", encoding="utf-8")

    from automation.outreach.email_builder import generate_outreach_assets

    seller_outreach_dir = OUTREACH_DIR / tenant.slug
    txt_path, html_path = generate_outreach_assets(
        tenant=tenant,
        base_demo_url="http://localhost:5173",
        output_dir=seller_outreach_dir,
    )

    print(f"[OK] Validated with Pydantic v2 and wrote tenant config:")
    print(f"  -> {src_path}")
    print(f"  -> {pub_path}")
    print(f"[OK] Generated cold outreach email templates:")
    print(f"  -> {txt_path}")
    print(f"  -> {html_path}")
    return src_path


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Generate a validated DemoFactory tenant JSON and cold email assets."
    )
    parser.add_argument(
        "--seller",
        default="viothaniarg",
        help="Mercado Libre seller slug (default: viothaniarg)",
    )
    args = parser.parse_args()
    save_tenant_json(args.seller)


if __name__ == "__main__":
    main()
