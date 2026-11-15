"""
CLI entrypoint to generate a validated AventoTech tenant JSON + cold outreach email package.
Supports scraping live Mercado Libre URLs or loading existing registered profiles.
"""
from __future__ import annotations

import argparse
import asyncio
import json
import sys
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parent.parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))
from automation.extractors.meli_scraper import (
    build_scraped_tenant,
    scrape_meli_product,
)
from automation.extractors.mercadolibre import build_viothaniarg_tenant
from automation.outreach.email_builder import generate_outreach_assets
from automation.schema import TenantConfig

PROJECT_ROOT = Path(__file__).resolve().parent.parent
TENANTS_DIR = PROJECT_ROOT / "src" / "data" / "tenants"
PUBLIC_TENANTS_DIR = PROJECT_ROOT / "public" / "tenants"
OUTREACH_DIR = PROJECT_ROOT / "outreach_output"


def save_tenant(tenant: TenantConfig, base_demo_url: str = "https://aventotech.pages.dev") -> Path:
    TENANTS_DIR.mkdir(parents=True, exist_ok=True)
    PUBLIC_TENANTS_DIR.mkdir(parents=True, exist_ok=True)

    payload = tenant.model_dump(by_alias=True, exclude_none=True)
    json_str = json.dumps(payload, indent=2, ensure_ascii=False)

    src_path = TENANTS_DIR / f"{tenant.slug}.json"
    pub_path = PUBLIC_TENANTS_DIR / f"{tenant.slug}.json"
    src_path.write_text(json_str + "\n", encoding="utf-8")
    pub_path.write_text(json_str + "\n", encoding="utf-8")

    seller_outreach_dir = OUTREACH_DIR / tenant.slug
    txt_path, html_path = generate_outreach_assets(
        tenant=tenant,
        base_demo_url=base_demo_url,
        output_dir=seller_outreach_dir,
    )

    print(f"\n[OK] Generada tienda validada (Pydantic v2 + Zod):")
    print(f"  -> {src_path}")
    print(f"  -> {pub_path}")
    print(f"[OK] Generado paquete de correo de prospección:")
    print(f"  -> {txt_path}")
    print(f"  -> {html_path}")
    print(f"\n👉 URL limpia en Cloudflare: {base_demo_url.rstrip('/')}/d/{tenant.slug}?capture=1")
    return src_path


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Generador automático de tiendas AventoTech a partir de Mercado Libre."
    )
    parser.add_argument(
        "--url",
        help="URL directa de la publicación o tienda de Mercado Libre (ej: https://articulo.mercadolibre.com.ar/MLA-...)",
    )
    parser.add_argument(
        "--seller",
        default="viothaniarg",
        help="Slug del vendedor registrado (default: viothaniarg)",
    )
    parser.add_argument(
        "--slug",
        help="Slug personalizado para la URL (opcional, ej: mi-tienda)",
    )
    parser.add_argument(
        "--base-url",
        default="https://aventotech.pages.dev",
        help="URL base de Cloudflare Pages (default: https://aventotech.pages.dev)",
    )
    parser.add_argument(
        "--visible",
        action="store_true",
        help="Abre el navegador de forma visible en pantalla (útil si MeLi pide confirmación)",
    )

    args = parser.parse_args()

    if args.url:
        print(f"\n[*] Iniciando extracción automática de: {args.url}")
        scraped_data = asyncio.run(scrape_meli_product(args.url, headless=not args.visible))
        tenant = build_scraped_tenant(scraped_data, slug=args.slug)
        save_tenant(tenant, base_demo_url=args.base_url)
    elif args.seller.lower() == "viothaniarg":
        tenant = build_viothaniarg_tenant()
        save_tenant(tenant, base_demo_url=args.base_url)
    else:
        # Check if json already exists in src/data/tenants
        existing = TENANTS_DIR / f"{args.seller}.json"
        if existing.exists():
            data = json.loads(existing.read_text(encoding="utf-8"))
            tenant = TenantConfig.model_validate(data)
            save_tenant(tenant, base_demo_url=args.base_url)
        else:
            raise ValueError(f"No se encontró perfil ni archivo para '{args.seller}'. Usá --url para extraer un link nuevo.")


if __name__ == "__main__":
    main()
