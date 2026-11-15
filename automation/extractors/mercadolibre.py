from __future__ import annotations

import math
from automation.schema import (
    BrandConfig,
    CatalogItem,
    Category,
    CommerceConfig,
    CtaBandSection,
    HeroSection,
    LocationSection,
    PlatformComparison,
    ProductGridSection,
    Review,
    ReviewsSection,
    Section,
    SectionCta,
    StepItem,
    StepsSection,
    StorySection,
    TenantConfig,
    ThemeConfig,
    TrustHighlight,
    VariantGroup,
    VariantOption,
)


def compute_direct_web_price(meli_price: int, commission_saved_percent: int = 18) -> int:
    """
    Calculates an attractive direct-store price by discounting the marketplace commission
    and rounding cleanly to the nearest 100 ARS.
    """
    raw = meli_price * (1.0 - (commission_saved_percent / 100.0))
    return int(math.floor(raw / 100.0) * 100)


def build_viothaniarg_tenant() -> TenantConfig:
    """
    Builds the validated TenantConfig for VIOTHANIARG (Viothani Fermentos)
    based on https://www.mercadolibre.com.ar/pagina/viothaniarg.
    """
    commission_pct = 18

    return TenantConfig(
        slug="viothaniarg",
        template_type="ecommerce",
        brand=BrandConfig(
            name="Viothani Fermentos",
            tagline="Cultivos vivos, probióticos naturales, Kéfir y Kombucha con asesoramiento personalizado",
            hero_headline="Tus cultivos vivos de siempre en Mercado Libre, ahora a precio directo de productor.",
            hero_subheadline=(
                "Nódulos de Kéfir y SCOBY de Kombucha 100% frescos (nunca deshidratados), "
                "con guía paso a paso y soporte directo por WhatsApp. Comprando en nuestra web oficial "
                "ahorrás el 18% de comisión de plataforma + 10% OFF extra por transferencia."
            ),
            hero_banner_url="https://images.unsplash.com/photo-1556881286-fc6915169721?auto=format&fit=crop&w=1400&q=80",
            logo_text="VIOTHANI🌱",
            location_label="Retiro Pick-Up en Boedo, CABA · Envíos a todo el país",
            schedule_label="Lun a Sáb 10:00 a 19:00 hs",
            is_open_now=True,
            instagram_handle="@viothaniarg",
            rating_score=4.9,
            reviews_count=850,
        ),
        theme=ThemeConfig(
            mode="light",
            preset="editorial",
            allow_mode_toggle=True,
            primary_color="#3f5d3a",
            accent_color="#b9692a",
            border_radius="sharp",
        ),
        platform_comparison=PlatformComparison(
            enabled=True,
            platform_name="Mercado Libre",
            seller_badge="Tienda Oficial VIOTHANIARG · +850 ventas de cultivos vivos",
            commission_saved_percent=commission_pct,
            external_profile_url="https://www.mercadolibre.com.ar/pagina/viothaniarg",
        ),
        commerce=CommerceConfig(
            currency_symbol="$",
            whatsapp_phone="5491123456789",
            transfer_discount_percent=10,
            mercado_pago_alias="viothani.fermentos.mp",
            free_shipping_threshold=38000,
            flat_shipping_cost=4900,
            installments_text="10% OFF extra por Transferencia o Efectivo al retirar en Boedo",
            delivery_time_estimate="Retiro hoy en Boedo (CABA) o Despacho en 24hs a todo el país",
        ),
        trust_highlights=[
            TrustHighlight(
                title="100% Cultivos Frescos Vivos",
                subtitle="Alimentados con azúcar mascabo orgánico, nunca disecados ni congelados",
            ),
            TrustHighlight(
                title="Ahorro Directo vs MeLi (-18%)",
                subtitle="Sin los costos fijos ni comisiones por unidad de Mercado Libre",
            ),
            TrustHighlight(
                title="Guía + Soporte por WhatsApp",
                subtitle="Te acompañamos paso a paso en tu primera fermentación en casa",
            ),
        ],
        categories=[
            Category(id="combos", name="Kits & Combos Iniciadores", badge="Ahorro"),
            Category(id="kefir", name="Nódulos de Kéfir (Agua y Leche)", badge="Top"),
            Category(id="kombucha", name="SCOBY de Kombucha"),
            Category(id="insumos", name="Frascos & Insumos Orgánicos"),
        ],
        items=[
            CatalogItem(
                id="vio-01",
                sku="VIO-KOM-STARTER",
                title="Kit Starter Kombucha SCOBY Vivo + Té Iniciador Activo + Instructivo",
                description=(
                    "Disco de SCOBY fresco y vigoroso en su líquido iniciador ácido óptimo para "
                    "evitar contaminaciones. Rinde hasta 3 litros por tanda y se reproduce en cada fermentación. "
                    "Incluye manual PDF ilustrado y asesoramiento directo por WhatsApp."
                ),
                category_id="kombucha",
                price=compute_direct_web_price(15900, commission_pct),
                compare_at_platform_price=15900,
                images=[
                    "https://images.unsplash.com/photo-1556881286-fc6915169721?auto=format&fit=crop&w=900&q=80"
                ],
                badge="Más vendido en MeLi",
                featured=True,
                in_stock=True,
                stock_label="Cultivo fresco · Despacho hoy",
                variants=[
                    VariantGroup(
                        id="presentacion",
                        name="Tamaño de Cultivo",
                        options=[
                            VariantOption(label="Estándar (Para frasco de 1.5L a 3L)", price_delta=0),
                            VariantOption(label="Doble SCOBY (Para 5L o 2 frascos)", price_delta=5200),
                        ],
                    )
                ],
            ),
            CatalogItem(
                id="vio-02",
                sku="VIO-KEF-AGUA-30G",
                title="Nódulos de Kéfir de Agua (Tíbicos Frescos) en Doypack Sellado + Guía",
                description=(
                    "Porción activa de nódulos de kéfir de agua cultivados con azúcar mascabo orgánico. "
                    "Listos para preparar 1 litro diario de bebida probiótica gasificada natural libre de lácteos."
                ),
                category_id="kefir",
                price=compute_direct_web_price(14800, commission_pct),
                compare_at_platform_price=14800,
                images=[
                    "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=900&q=80"
                ],
                badge="#1 en Probióticos",
                featured=True,
                in_stock=True,
                stock_label="Stock fresco en Boedo",
                variants=[
                    VariantGroup(
                        id="gramaje",
                        name="Rendimiento",
                        options=[
                            VariantOption(label="Porción para 1 Litro diario (30g)", price_delta=0),
                            VariantOption(label="Porción Familiar para 2 Litros (60g)", price_delta=4500),
                        ],
                    )
                ],
            ),
            CatalogItem(
                id="vio-03",
                sku="VIO-KEF-LECHE",
                title="Nódulos de Kéfir de Leche (Búlgaros Vivos) + Recetario Yogur & Queso Untable",
                description=(
                    "Cultivo vivo de alta actividad para fermentar leche entera o vegetal en 24 hs. "
                    "Incluye guía para preparar kéfir cremoso tipo yogur griego y queso crema probiótico."
                ),
                category_id="kefir",
                price=compute_direct_web_price(15500, commission_pct),
                compare_at_platform_price=15500,
                images=[
                    "https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=900&q=80"
                ],
                badge="Con Guía Paso a Paso",
                featured=True,
                in_stock=True,
                stock_label="Disponible hoy",
                variants=[],
            ),
            CatalogItem(
                id="vio-04",
                sku="VIO-COMBO-DUO",
                title="Combo Dúo Probiótico: SCOBY de Kombucha + Nódulos de Kéfir de Agua + Mascabo",
                description=(
                    "El pack más elegido para empezar en el mundo de la fermentación casera. "
                    "Llevás ambos cultivos vivos en envases termosellados independientes + 500g de azúcar mascabo."
                ),
                category_id="combos",
                price=compute_direct_web_price(28900, commission_pct),
                compare_at_platform_price=28900,
                images=[
                    "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=900&q=80"
                ],
                badge="Ahorrás $5.300 vs MeLi",
                featured=True,
                in_stock=True,
                stock_label="Envío en el día",
                variants=[
                    VariantGroup(
                        id="tipo-kefir",
                        name="Elegí tu variedad de Kéfir",
                        options=[
                            VariantOption(label="Con Kéfir de Agua", price_delta=0),
                            VariantOption(label="Con Kéfir de Leche", price_delta=500),
                        ],
                    )
                ],
            ),
            CatalogItem(
                id="vio-05",
                sku="VIO-KIT-FRASCO-3L",
                title="Kit Fermentación Continua: Frasco Vidrio 3L + Lienzo Respirable + Cultivo a Elección",
                description=(
                    "Todo listo para fermentar desde el primer día: frasco de vidrio ancho esterilizable, "
                    "tela de lienzo con banda elástica, colador plástico (no oxida los nódulos) y cultivo vivo."
                ),
                category_id="combos",
                price=compute_direct_web_price(41900, commission_pct),
                compare_at_platform_price=41900,
                images=[
                    "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=900&q=80"
                ],
                badge="Envío Gratis",
                featured=False,
                in_stock=True,
                stock_label="Últimos 4 kits",
                variants=[
                    VariantGroup(
                        id="cultivo-kit",
                        name="Cultivo Incluido",
                        options=[
                            VariantOption(label="Incluir SCOBY Kombucha", price_delta=0),
                            VariantOption(label="Incluir Kéfir de Agua", price_delta=0),
                            VariantOption(label="Incluir Ambos Cultivos", price_delta=7500),
                        ],
                    )
                ],
            ),
            CatalogItem(
                id="vio-06",
                sku="VIO-INS-NUTRI",
                title="Pack Nutrición de Cultivos: Azúcar Mascabo Orgánico 1kg + Té Negro en Hebras",
                description=(
                    "Alimento puro sin refinar y rico en minerales para que tus nódulos de kéfir y tu SCOBY "
                    "se reproduzcan rápido y con máxima efervescencia."
                ),
                category_id="insumos",
                price=compute_direct_web_price(13500, commission_pct),
                compare_at_platform_price=13500,
                images=[
                    "https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=900&q=80"
                ],
                featured=False,
                in_stock=True,
                stock_label="Stock inmediato",
                variants=[],
            ),
        ],
        reviews=[
            Review(
                id="v-rev-1",
                author="Valeria M.",
                rating=5,
                text=(
                    "Les compré primero por Mercado Libre y después descubrí su tienda web directa. "
                    "Los nódulos de kéfir vienen súper vivos y se duplicaron en la primera semana. "
                    "La guía que te mandan por WhatsApp es clarísima."
                ),
                date_label="Hace 2 días",
                source="Mercado Libre",
            ),
            Review(
                id="v-rev-2",
                author="Hernán D.",
                rating=5,
                text=(
                    "Retiré el kit de Kombucha por Boedo y me ahorré un montón pagando por transferencia. "
                    "El SCOBY es enorme, nada que ver con los deshidratados que venden otros."
                ),
                date_label="Hace 5 días",
                source="Web Directa",
            ),
            Review(
                id="v-rev-3",
                author="Florencia S.",
                rating=5,
                text=(
                    "Llegó perfecto al interior (Córdoba) en el doypack sellado. Al segundo día ya estaba "
                    "fermentando a pleno. Súper recomendables por la paciencia para explicar."
                ),
                date_label="Hace 1 semana",
                source="Mercado Libre",
            ),
        ],
        sections=build_viothaniarg_sections(),
    )


def build_viothaniarg_sections() -> list[Section]:
    """
    Editorial layout for Viothani. Copy is deliberately grounded in facts from the seller
    page (fresh cultures, guide included, WhatsApp support, Boedo pick-up).
    A future copywriter step (LLM) will generate this block per seller.
    """
    return [
        HeroSection(
            eyebrow="Fermentos vivos · Boedo, CABA",
            headline="Cultivos vivos para fermentar *en casa*, sin vueltas.",
            tagline="Frescos, nunca deshidratados.",
            image_url="https://images.unsplash.com/photo-1556881286-fc6915169721?auto=format&fit=crop&w=1600&q=80",
            ctas=[
                SectionCta(label="Ver cultivos", action="catalog", variant="primary"),
                SectionCta(label="Escribinos", action="whatsapp", variant="outline"),
            ],
        ),
        StorySection(
            variant="framed",
            eyebrow="Cómo trabajamos",
            headline="Fermentos que pasan *de mano en mano*, con guía incluida.",
            body=[
                "Cada cultivo sale fresco y activo, en envase sellado y con instructivo. "
                "No vendemos discos deshidratados: preferimos que empieces con algo vivo.",
                "Si en algún paso te trabás, nos escribís por WhatsApp y te acompañamos "
                "hasta que tu primera tanda salga bien.",
            ],
            image_url="https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=900&q=80",
            signature="— Equipo Viothani, Boedo",
        ),
        ProductGridSection(
            id="catalog",
            eyebrow="Cultivos y kits",
            title="Elegí tu *primer fermento*",
        ),
        StepsSection(
            eyebrow="Para empezar",
            title="Tu primera tanda en *tres pasos*",
            steps=[
                StepItem(
                    title="Recibís tu cultivo vivo",
                    text="Llega en envase sellado, con instructivo para activarlo desde el primer día.",
                ),
                StepItem(
                    title="Preparás tu primera tanda",
                    text="Con ingredientes simples y la guía paso a paso, sin equipamiento especial.",
                ),
                StepItem(
                    title="Fermentás y consultás",
                    text="Cualquier duda la resolvemos por WhatsApp mientras tu cultivo se activa.",
                ),
            ],
        ),
        ReviewsSection(
            eyebrow="Opiniones",
            title="Lo que cuentan quienes ya *fermentan*",
        ),
        LocationSection(
            eyebrow="Retiro y envíos",
            title="Pasá por *Boedo* o te lo enviamos",
        ),
        CtaBandSection(
            headline="¿Dudas con tu primer cultivo? *Escribinos*.",
            cta_label="Hablar por WhatsApp",
        ),
    ]
