import { z } from 'zod';

/**
 * Schema-Driven Multi-Tenant Contract.
 * This contract is shared between the Frontend Storefront Engine (TypeScript/Zod)
 * and the future Automated Scraper/Ingestion Pipeline (Python/Pydantic).
 */

export const VariantGroupSchema = z.object({
  id: z.string(),
  name: z.string(), // e.g., "Color", "Talle", "Punto de cocción", "Extras"
  options: z.array(
    z.object({
      label: z.string(),
      priceDelta: z.number().default(0),
    })
  ),
});

export const CatalogItemSchema = z.object({
  id: z.string(),
  sku: z.string().optional(),
  title: z.string(),
  description: z.string(),
  categoryId: z.string(),
  price: z.number().positive(),
  /**
   * Price of the exact same product on Mercado Libre / PedidosYa.
   * Used to automatically display the "Ahorro Directo Sin Comisión" badge.
   */
  compareAtPlatformPrice: z.number().positive().optional(),
  images: z.array(z.string().url()),
  badge: z.string().optional(), // e.g. "Más vendido en MeLi", "Envío Full Hoy", "Nuevo"
  featured: z.boolean().default(false),
  inStock: z.boolean().default(true),
  stockLabel: z.string().optional(), // e.g. "Últimas 3 unidades", "Stock inmediato"
  variants: z.array(VariantGroupSchema).default([]),
});

export const CategorySchema = z.object({
  id: z.string(),
  name: z.string(),
  badge: z.string().optional(),
});

export const ReviewSchema = z.object({
  id: z.string(),
  author: z.string(),
  rating: z.number().min(1).max(5),
  text: z.string(),
  dateLabel: z.string(),
  source: z.enum(['Mercado Libre', 'Google Maps', 'Instagram', 'Web Directa']),
});

/** Hex color `#rrggbb`. Required so the theme engine can derive RGB channels (alpha-aware tokens). */
const HexColorSchema = z.string().regex(/^#[0-9a-fA-F]{6}$/, 'Expected #rrggbb hex color');

export const DESIGN_PRESETS = ['modern', 'editorial'] as const;
export type DesignPreset = (typeof DESIGN_PRESETS)[number];

export const ThemeConfigSchema = z.object({
  /** Default color mode. The end user can override it when `allowModeToggle` is true. */
  mode: z.enum(['light', 'dark']),
  /** Design preset: typography, surfaces and rhythm. Extend `DESIGN_PRESETS` to add new looks. */
  preset: z.enum(DESIGN_PRESETS).default('modern'),
  /** Shows the light/dark switch to the end user. */
  allowModeToggle: z.boolean().default(true),
  primaryColor: HexColorSchema,
  accentColor: HexColorSchema,
  borderRadius: z.enum(['sharp', 'rounded', 'pill']).default('rounded'),
  /** Secret PIN for `/admin` access. Defaults to "1234". */
  adminPin: z.string().default('1234'),
});

/* ------------------------------------------------------------------ */
/* Sections (Shopify-style section engine)                             */
/* ------------------------------------------------------------------ */

export const SectionCtaSchema = z.object({
  label: z.string(),
  /** `catalog` scrolls to the section with `id: "catalog"`. */
  action: z.enum(['catalog', 'whatsapp', 'cart']),
  variant: z.enum(['primary', 'outline']).default('primary'),
});

const sectionBase = { id: z.string().optional() };

export const HeroSectionSchema = z.object({
  type: z.literal('hero'),
  ...sectionBase,
  eyebrow: z.string().optional(),
  /** Supports `*accent*` markup, rendered as italic accent-colored text. */
  headline: z.string(),
  /** Handwritten tagline (script font on presets that provide one). */
  tagline: z.string().optional(),
  imageUrl: z.string().url().optional(),
  ctas: z.array(SectionCtaSchema).default([]),
});

export const StorySectionSchema = z.object({
  type: z.literal('story'),
  ...sectionBase,
  variant: z.enum(['framed', 'plain']).default('framed'),
  eyebrow: z.string().optional(),
  headline: z.string(),
  body: z.array(z.string()).min(1),
  imageUrl: z.string().url(),
  signature: z.string().optional(),
});

export const ProductGridSectionSchema = z.object({
  type: z.literal('productGrid'),
  ...sectionBase,
  eyebrow: z.string().optional(),
  title: z.string().optional(),
  categoryIds: z.array(z.string()).optional(),
});

export const MenuListSectionSchema = z.object({
  type: z.literal('menuList'),
  ...sectionBase,
  eyebrow: z.string().optional(),
  title: z.string().optional(),
  categoryIds: z.array(z.string()).optional(),
});

export const StepsSectionSchema = z.object({
  type: z.literal('steps'),
  ...sectionBase,
  eyebrow: z.string().optional(),
  title: z.string(),
  steps: z.array(z.object({ title: z.string(), text: z.string() })).min(1),
});

export const ReviewsSectionSchema = z.object({
  type: z.literal('reviews'),
  ...sectionBase,
  eyebrow: z.string().optional(),
  title: z.string().optional(),
});

export const LocationSectionSchema = z.object({
  type: z.literal('location'),
  ...sectionBase,
  eyebrow: z.string().optional(),
  title: z.string().optional(),
});

export const CtaBandSectionSchema = z.object({
  type: z.literal('ctaBand'),
  ...sectionBase,
  headline: z.string(),
  ctaLabel: z.string(),
});

export const SectionSchema = z.discriminatedUnion('type', [
  HeroSectionSchema,
  StorySectionSchema,
  ProductGridSectionSchema,
  MenuListSectionSchema,
  StepsSectionSchema,
  ReviewsSectionSchema,
  LocationSectionSchema,
  CtaBandSectionSchema,
]);

export const PlatformComparisonSchema = z.object({
  enabled: z.boolean().default(true),
  platformName: z.enum(['Mercado Libre', 'PedidosYa / Rappi']),
  sellerBadge: z.string(), // e.g. "MercadoLíder Platinum +1.000 ventas" or "4.9★ en Google Maps"
  commissionSavedPercent: z.number().min(0).max(50),
  externalProfileUrl: z.string().url().optional(),
});

export const CommerceConfigSchema = z.object({
  currencySymbol: z.string().default('$'),
  whatsappPhone: z.string(), // E.164 digits without +
  transferDiscountPercent: z.number().min(0).max(50).default(10),
  mercadoPagoAlias: z.string().optional(),
  freeShippingThreshold: z.number().optional(),
  flatShippingCost: z.number().default(0),
  installmentsText: z.string().optional(), // e.g. "3 y 6 cuotas sin interés con todas las tarjetas"
  deliveryTimeEstimate: z.string(), // e.g. "Despacho en el día por Moto / Correo" or "30-45 min"
});

export const TenantConfigSchema = z.object({
  slug: z.string(),
  templateType: z.enum(['ecommerce', 'gastro']),
  brand: z.object({
    name: z.string(),
    tagline: z.string(),
    heroHeadline: z.string(),
    heroSubheadline: z.string(),
    heroBannerUrl: z.string().url(),
    logoText: z.string(),
    locationLabel: z.string(),
    scheduleLabel: z.string(),
    isOpenNow: z.boolean().default(true),
    instagramHandle: z.string().optional(),
    ratingScore: z.number().min(1).max(5),
    reviewsCount: z.number().int().nonnegative(),
  }),
  theme: ThemeConfigSchema,
  platformComparison: PlatformComparisonSchema,
  commerce: CommerceConfigSchema,
  trustHighlights: z.array(
    z.object({
      title: z.string(),
      subtitle: z.string(),
    })
  ),
  categories: z.array(CategorySchema),
  items: z.array(CatalogItemSchema),
  reviews: z.array(ReviewSchema),
  /** Optional. When omitted the tenant renders with the legacy `templateType` layout. */
  sections: z.array(SectionSchema).optional(),
});

export type VariantGroup = z.infer<typeof VariantGroupSchema>;
export type CatalogItem = z.infer<typeof CatalogItemSchema>;
export type Category = z.infer<typeof CategorySchema>;
export type Review = z.infer<typeof ReviewSchema>;
export type ThemeConfig = z.infer<typeof ThemeConfigSchema>;
export type TenantConfig = z.infer<typeof TenantConfigSchema>;
export type Section = z.infer<typeof SectionSchema>;
export type SectionType = Section['type'];
export type SectionOf<T extends SectionType> = Extract<Section, { type: T }>;
export type SectionCta = z.infer<typeof SectionCtaSchema>;

export interface CartLineItem {
  lineId: string;
  item: CatalogItem;
  quantity: number;
  selectedVariants: Record<string, { label: string; priceDelta: number }>;
  notes?: string;
}
