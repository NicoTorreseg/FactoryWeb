from __future__ import annotations

from typing import Annotated, Literal, Union
from pydantic import BaseModel, ConfigDict, Field, StringConstraints


def to_camel(string: str) -> str:
    parts = string.split("_")
    return parts[0] + "".join(word.capitalize() for word in parts[1:])


class CamelModel(BaseModel):
    """Base Pydantic model that serializes to camelCase to match TypeScript/Zod."""

    model_config = ConfigDict(
        alias_generator=to_camel,
        populate_by_name=True,
        extra="forbid",
    )


class VariantOption(CamelModel):
    label: str
    price_delta: int = 0


class VariantGroup(CamelModel):
    id: str
    name: str
    options: list[VariantOption]


class CatalogItem(CamelModel):
    id: str
    sku: str | None = None
    title: str
    description: str
    category_id: str
    price: int = Field(gt=0)
    compare_at_platform_price: int | None = Field(default=None, gt=0)
    images: list[str]
    badge: str | None = None
    featured: bool = False
    in_stock: bool = True
    stock_label: str | None = None
    variants: list[VariantGroup] = Field(default_factory=list)


class Category(CamelModel):
    id: str
    name: str
    badge: str | None = None


class Review(CamelModel):
    id: str
    author: str
    rating: int = Field(ge=1, le=5)
    text: str
    date_label: str
    source: Literal["Mercado Libre", "Google Maps", "Instagram", "Web Directa"]


HexColor = Annotated[str, StringConstraints(pattern=r"^#[0-9a-fA-F]{6}$")]


class ThemeConfig(CamelModel):
    mode: Literal["light", "dark"] = "light"
    preset: Literal["modern", "editorial"] = "modern"
    allow_mode_toggle: bool = True
    primary_color: HexColor
    accent_color: HexColor
    border_radius: Literal["sharp", "rounded", "pill"] = "rounded"


# --------------------------------------------------------------------------- #
# Sections (mirror of SectionSchema in src/domain/tenant.schema.ts)
# --------------------------------------------------------------------------- #


class SectionCta(CamelModel):
    label: str
    action: Literal["catalog", "whatsapp", "cart"]
    variant: Literal["primary", "outline"] = "primary"


class HeroSection(CamelModel):
    type: Literal["hero"] = "hero"
    id: str | None = None
    eyebrow: str | None = None
    headline: str
    tagline: str | None = None
    image_url: str | None = None
    ctas: list[SectionCta] = Field(default_factory=list)


class StorySection(CamelModel):
    type: Literal["story"] = "story"
    id: str | None = None
    variant: Literal["framed", "plain"] = "framed"
    eyebrow: str | None = None
    headline: str
    body: list[str] = Field(min_length=1)
    image_url: str
    signature: str | None = None


class ProductGridSection(CamelModel):
    type: Literal["productGrid"] = "productGrid"
    id: str | None = None
    eyebrow: str | None = None
    title: str | None = None
    category_ids: list[str] | None = None


class MenuListSection(CamelModel):
    type: Literal["menuList"] = "menuList"
    id: str | None = None
    eyebrow: str | None = None
    title: str | None = None
    category_ids: list[str] | None = None


class StepItem(CamelModel):
    title: str
    text: str


class StepsSection(CamelModel):
    type: Literal["steps"] = "steps"
    id: str | None = None
    eyebrow: str | None = None
    title: str
    steps: list[StepItem] = Field(min_length=1)


class ReviewsSection(CamelModel):
    type: Literal["reviews"] = "reviews"
    id: str | None = None
    eyebrow: str | None = None
    title: str | None = None


class LocationSection(CamelModel):
    type: Literal["location"] = "location"
    id: str | None = None
    eyebrow: str | None = None
    title: str | None = None


class CtaBandSection(CamelModel):
    type: Literal["ctaBand"] = "ctaBand"
    id: str | None = None
    headline: str
    cta_label: str


Section = Annotated[
    Union[
        HeroSection,
        StorySection,
        ProductGridSection,
        MenuListSection,
        StepsSection,
        ReviewsSection,
        LocationSection,
        CtaBandSection,
    ],
    Field(discriminator="type"),
]


class PlatformComparison(CamelModel):
    enabled: bool = True
    platform_name: Literal["Mercado Libre", "PedidosYa / Rappi"] = "Mercado Libre"
    seller_badge: str
    commission_saved_percent: int = Field(ge=0, le=50)
    external_profile_url: str | None = None


class CommerceConfig(CamelModel):
    currency_symbol: str = "$"
    whatsapp_phone: str
    transfer_discount_percent: int = Field(default=10, ge=0, le=50)
    mercado_pago_alias: str | None = None
    free_shipping_threshold: int | None = None
    flat_shipping_cost: int = 0
    installments_text: str | None = None
    delivery_time_estimate: str


class TrustHighlight(CamelModel):
    title: str
    subtitle: str


class BrandConfig(CamelModel):
    name: str
    tagline: str
    hero_headline: str
    hero_subheadline: str
    hero_banner_url: str
    logo_text: str
    location_label: str
    schedule_label: str
    is_open_now: bool = True
    instagram_handle: str | None = None
    rating_score: float = Field(ge=1.0, le=5.0)
    reviews_count: int = Field(ge=0)


class TenantConfig(CamelModel):
    """
    Root Pydantic contract mirroring `src/domain/tenant.schema.ts` (Zod).
    Guarantees 100% schema compatibility between Python scraping and React rendering.
    """

    slug: str
    template_type: Literal["ecommerce", "gastro"]
    brand: BrandConfig
    theme: ThemeConfig
    platform_comparison: PlatformComparison
    commerce: CommerceConfig
    trust_highlights: list[TrustHighlight]
    categories: list[Category]
    items: list[CatalogItem]
    reviews: list[Review]
    sections: list[Section] | None = None
