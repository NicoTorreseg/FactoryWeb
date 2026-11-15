# AventoTech — Motor Multi-Tenant de Tiendas & Catálogos con IA

Arquitectura *Schema-Driven* pensada para generar y servir decenas o cientos de **demos web profesionales** para:
1. **Vendedores de Mercado Libre / Emprendedores (`templateType: "ecommerce"`):** Catálogo con comparador automático de ahorro directo (*"Precio Web vs Mercado Libre"*), descuento por transferencia, variantes y carrito a WhatsApp / Mercado Pago.
2. **Restaurantes / Bares / Cafeterías (`templateType: "gastro"`):** Carta digital interactiva con estado Abierto/Cerrado, comparativa vs PedidosYa/Rappi, adicionales de cocina y pedido formateado al WhatsApp del mostrador.

---

## Arquitectura de Ingeniería de Software

```text
aventotech/
├── public/
│   └── _redirects                  # Regla SPA para Cloudflare Pages (Costo $0)
├── src/
│   ├── domain/                     # Capa de Dominio Pura (Sin dependencias de UI)
│   │   ├── tenant.schema.ts        # Contrato Único validado con Zod (Equivalente a Pydantic)
│   │   ├── pricing.ts              # Motor matemático de ahorros vs MeLi, envíos y descuentos
│   │   └── whatsapp.ts             # Formateador estructurado de pedidos para WhatsApp
│   ├── data/
│   │   └── tenants/                # Archivos JSON de cada cliente (Auto-descubiertos)
│   │       ├── aurum-deco.json     # Demo E-commerce (Modo Claro Editorial)
│   │       ├── krono-tech.json     # Demo E-commerce (Modo Oscuro Tech)
│   │       └── brasa-hermanos.json # Demo Gastronomía (Smash Burgers)
│   ├── engine/
│   │   ├── tenant-registry.ts      # Auto-Discovery + Validación Zod en tiempo de carga
│   │   └── ThemeProvider.tsx       # Inyector de Design Tokens CSS por cliente
│   ├── components/
│   │   ├── CartDrawer.tsx          # Carrito reactivo con barra de envío gratis y ahorro total
│   │   └── ItemDetailModal.tsx     # Modal de variantes, talles, adicionales y notas
│   └── templates/
│       ├── EcommerceTemplate.tsx   # Plantilla para vendedores de Mercado Libre / Tiendas
│       └── GastroTemplate.tsx      # Plantilla para restaurantes y cafeterías
```

---

## Cómo agregar una nueva Demo (Manual o con Script Python)

No hace falta tocar ni una línea de código en React o TypeScript:
1. El script de Python genera un archivo `src/data/tenants/{slug-del-cliente}.json` respetando el contrato de `src/domain/tenant.schema.ts`.
2. El motor lo detecta automáticamente mediante `import.meta.glob`, lo valida con `Zod` y habilita la ruta:
   * **Para ver en el panel:** `http://localhost:5173/d/{slug-del-cliente}`
   * **Para mandar al cliente o capturar con Playwright (sin barra superior):** `https://tu-dominio.pages.dev/d/{slug-del-cliente}?capture=1`

---

## Comandos

```bash
# Instalar dependencias
npm install

# Levantar servidor de desarrollo
npm run dev

# Verificar tipos TypeScript y compilar para producción (Cloudflare Pages)
npm run build
```

---

## Deploy Gratuito en Cloudflare Pages

1. Subí esta carpeta a un repositorio de GitHub.
2. En **Cloudflare Dashboard -> Workers & Pages -> Create -> Pages -> Connect to Git**:
   * **Build command:** `npm run build`
   * **Build output directory:** `dist`
3. Listo: cada `git push` (o cada vez que tu script agregue un `.json` nuevo) publica todas las demos en la red global de Cloudflare con costo **$0**.
