from __future__ import annotations

from pathlib import Path
from automation.schema import TenantConfig


def generate_outreach_assets(
    tenant: TenantConfig,
    base_demo_url: str,
    output_dir: Path,
) -> tuple[Path, Path]:
    """
    Generates both plain-text and rich HTML cold email templates dynamically tailored
    to any Mercado Libre seller, specialty brand or restaurant.
    """
    output_dir.mkdir(parents=True, exist_ok=True)
    demo_url = f"{base_demo_url.rstrip('/')}/d/{tenant.slug}"
    clean_demo_url = f"{demo_url}?capture=1"

    sample_item = tenant.items[0]
    meli_price = sample_item.compare_at_platform_price or sample_item.price
    web_price = sample_item.price
    unit_saving = meli_price - web_price

    items_sample_titles = ", ".join(i.title.split("–")[0].strip() for i in tenant.items[:3])
    commission_pct = tenant.platform_comparison.commission_saved_percent
    transfer_pct = tenant.commerce.transfer_discount_percent
    platform_name = tenant.platform_comparison.platform_name
    location = tenant.brand.location_label or "su punto de retiro"

    subject = f"armé este catálogo web directo con los productos de {tenant.brand.name}"

    plain_text = f"""Asunto: {subject}

Hola equipo de {tenant.brand.name} ({tenant.brand.instagram_handle or tenant.slug}), ¿cómo están?

Vi su tienda en {platform_name} ({tenant.platform_comparison.external_profile_url or ''}) y las excelentes valoraciones que tienen con sus clientes ({tenant.brand.rating_score}★).

Sé que en {platform_name}, entre la comisión por venta del {commission_pct}% y los cargos fijos por unidad en productos de ${web_price:,}, se les va una parte enorme del margen. Además, para los clientes recurrentes o quienes retiran por {location}, siempre conviene un canal directo.

Me tomé 15 minutos e importé sus productos reales ({items_sample_titles}) en un prototipo de tienda propia que calcula el ahorro directo vs {platform_name} y les envía el pedido ya armado a su WhatsApp:

👉 Ver demo interactiva en vivo: {demo_url}
👉 Vista limpia de cliente: {clean_demo_url}

Por ejemplo, en el "{sample_item.title}", el cliente ve el precio en {platform_name} (${meli_price:,}) vs el precio directo web (${web_price:,}, ahorrando ${unit_saving:,}) + {transfer_pct}% OFF extra por transferencia, sin que ustedes tengan que cargar productos a mano.

Si les gusta cómo quedó, respóndanme este mail o avísenme por WhatsApp y la dejamos conectada con su propio dominio y su número real esta misma semana.

¡Un saludo grande!
Nico Torres — AventoTech
"""

    html_content = f"""<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <title>{subject}</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #18181b; line-height: 1.6; max-width: 620px; margin: 0 auto; padding: 24px;">
  <p>Hola equipo de <strong>{tenant.brand.name}</strong>, ¿cómo están?</p>

  <p>
    Vi su página en <strong>{platform_name}</strong>
    (<a href="{tenant.platform_comparison.external_profile_url}" style="color: {tenant.theme.primary_color};">ver perfil</a>)
    y la excelente reputación que tienen ({tenant.brand.rating_score}★).
  </p>

  <p>
    Sé que vendiendo por {platform_name}, entre la comisión del <strong>{commission_pct}%</strong> y los cargos por unidad, se pierde una parte importante de la ganancia. Para compras recurrentes de clientes que ya los conocen o retiran en <em>{location}</em>, un canal directo es mucho más rentable.
  </p>

  <p>
    Les armé un prototipo funcional con sus productos reales (<strong>{items_sample_titles}</strong>), selector de variantes y cálculo de ahorro automático:
  </p>

  <div style="background: #f4f4f5; border-radius: 12px; padding: 18px; margin: 20px 0; border: 1px solid #e4e4e7;">
    <p style="margin: 0 0 10px 0; font-size: 15px;">
      🛒 <strong>Ejemplo en "{sample_item.title}":</strong><br />
      Precio en {platform_name}: <del style="color: #71717a;">${meli_price:,}</del><br />
      <strong>Precio Web Directo: ${web_price:,}</strong> <span style="color: #16a34a; font-weight: 700;">(Ahorro directo: ${unit_saving:,})</span> + {transfer_pct}% OFF extra por transferencia.
    </p>

    <p style="margin: 12px 0 0 0;">
      <a href="{clean_demo_url}" style="display: inline-block; background: {tenant.theme.primary_color}; color: #ffffff; text-decoration: none; font-weight: 700; padding: 12px 20px; border-radius: 10px;">
        👉 Probar la Tienda Demo de {tenant.brand.name}
      </a>
    </p>
  </div>

  <p style="font-size: 14px; color: #52525b;">
    <em>Debajo les adjunto una captura de cómo se ve la tienda desde el celular (archivo <code>mobile_capture.png</code>).</em>
  </p>

  <p>
    Si les interesa sumarla para su Instagram <strong>{tenant.brand.instagram_handle}</strong> y clientes recurrentes, respóndanme este correo y la dejamos activa con su WhatsApp y alias reales.
  </p>

  <p style="margin-top: 24px;">
    ¡Saludos!<br />
    <strong>Nico Torres — AventoTech</strong>
  </p>
</body>
</html>
"""

    txt_path = output_dir / "email_copy.txt"
    html_path = output_dir / "email_preview.html"
    txt_path.write_text(plain_text, encoding="utf-8")
    html_path.write_text(html_content, encoding="utf-8")
    return txt_path, html_path
