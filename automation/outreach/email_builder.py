from __future__ import annotations

from pathlib import Path
from automation.schema import TenantConfig


def generate_outreach_assets(
    tenant: TenantConfig,
    base_demo_url: str,
    output_dir: Path,
) -> tuple[Path, Path]:
    """
    Generates both plain-text and rich HTML cold email templates tailored
    to the specific Mercado Libre seller or restaurant.
    """
    output_dir.mkdir(parents=True, exist_ok=True)
    demo_url = f"{base_demo_url.rstrip('/')}/d/{tenant.slug}"
    clean_demo_url = f"{demo_url}?capture=1"

    sample_item = tenant.items[0]
    meli_price = sample_item.compare_at_platform_price or sample_item.price
    web_price = sample_item.price
    unit_saving = meli_price - web_price

    subject = f"armé este catálogo web directo con los productos de {tenant.brand.name}"

    plain_text = f"""Asunto: {subject}

Hola equipo de {tenant.brand.name} ({tenant.brand.instagram_handle or tenant.slug}), ¿cómo están?

Vi su tienda en {tenant.platform_comparison.platform_name} ({tenant.platform_comparison.external_profile_url or ''}) y la excelente reputación que tienen con sus cultivos vivos y fermentos.

Sé que en Mercado Libre entre la comisión por venta y el cargo fijo por unidad en productos de $14.000 a $20.000 se les va una parte enorme del margen, y además para los clientes que retiran en Boedo o vuelven a comprar insumos siempre conviene un canal directo.

Me tomé 15 minutos e importé sus productos reales (Kombucha SCOBY, Kéfir de Agua/Leche y Combos) en un prototipo de tienda propia que calcula el ahorro directo vs MeLi y les envía el pedido ya armado a su WhatsApp:

👉 Ver demo interactiva en vivo: {demo_url}
👉 Vista limpia de cliente: {clean_demo_url}

Por ejemplo, en el "{sample_item.title}", el cliente ve el precio en MeLi (${meli_price:,}) vs el precio directo web (${web_price:,}, ahorrando ${unit_saving:,}) + descuento por transferencia, sin que ustedes tengan que cargar productos a mano.

Si les gusta cómo quedó, respóndanme este mail o avísenme por WhatsApp y la dejamos conectada con su propio dominio y su número real esta misma semana.

¡Un saludo grande!
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
    Vi su página de vendedor en <strong>{tenant.platform_comparison.platform_name}</strong>
    (<a href="{tenant.platform_comparison.external_profile_url}" style="color: {tenant.theme.primary_color};">ver perfil</a>)
    y la excelente reputación que tienen con sus cultivos de Kéfir y Kombucha.
  </p>

  <p>
    Sabemos que en productos de ticket de $14.000 a $25.000, el <strong>cargo fijo por unidad + la comisión de Mercado Libre</strong>
    se lleva una parte muy grande de la ganancia, especialmente cuando un cliente quiere llevar más de un cultivo o retirar por <strong>Boedo</strong>.
  </p>

  <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 16px; padding: 18px; margin: 20px 0;">
    <p style="margin: 0 0 8px 0; font-weight: 700; color: #166534;">
      🌱 Les armé un prototipo funcional con sus propios productos:
    </p>
    <p style="margin: 0 0 14px 0; font-size: 14px; color: #14532d;">
      Incluye comparador automático de <em>"Precio en MeLi vs Precio Directo Web"</em>, barra de envío gratis y carrito que envía el pedido detallado directo a su WhatsApp.
    </p>
    <p style="margin: 0;">
      <a href="{demo_url}" style="display: inline-block; background: {tenant.theme.primary_color}; color: #ffffff; text-decoration: none; font-weight: 700; padding: 12px 20px; border-radius: 10px;">
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
    <strong>Equipo DemoFactory</strong>
  </p>
</body>
</html>
"""

    txt_path = output_dir / "email_copy.txt"
    html_path = output_dir / "email_preview.html"
    txt_path.write_text(plain_text, encoding="utf-8")
    html_path.write_text(html_content, encoding="utf-8")
    return txt_path, html_path
