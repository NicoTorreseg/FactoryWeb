import React, { useMemo, useState } from 'react';
import {
  Award,
  CheckCircle2,
  MapPin,
  MessageCircle,
  Search,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Star,
  Tag,
  Truck,
} from 'lucide-react';
import { ThemeToggle } from '../design/primitives/ThemeToggle';
import {
  calculatePlatformSavings,
  calculateTransferPrice,
  formatARS,
} from '../domain/pricing';
import { CatalogItem, TenantConfig } from '../domain/tenant.schema';

interface StoreTemplateProps {
  tenant: TenantConfig;
  cartCount: number;
  cartSubtotal: number;
  onOpenCart: () => void;
  onSelectItem: (item: CatalogItem) => void;
  onQuickAdd: (item: CatalogItem) => void;
}

export const EcommerceTemplate: React.FC<StoreTemplateProps> = ({
  tenant,
  cartCount,
  cartSubtotal,
  onOpenCart,
  onSelectItem,
  onQuickAdd,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'savings'>('featured');

  const isDark = tenant.theme.mode === 'dark';
  const sym = tenant.commerce.currencySymbol;

  const filteredItems = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const list = tenant.items.filter((item) => {
      const matchesCat =
        selectedCategory === 'all' || item.categoryId === selectedCategory;
      const matchesQuery =
        !q ||
        item.title.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q);
      return matchesCat && matchesQuery;
    });

    return [...list].sort((a, b) => {
      if (sortBy === 'price-asc') return a.price - b.price;
      if (sortBy === 'savings') {
        const savA = calculatePlatformSavings(a).amountSaved;
        const savB = calculatePlatformSavings(b).amountSaved;
        return savB - savA;
      }
      return Number(b.featured) - Number(a.featured);
    });
  }, [tenant.items, selectedCategory, searchQuery, sortBy]);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Top Announcement Bar */}
      <div
        style={{ backgroundColor: tenant.theme.primaryColor }}
        className="px-4 py-2 text-center text-xs font-semibold text-white"
      >
        <div className="mx-auto max-w-6xl flex flex-wrap items-center justify-center gap-x-6 gap-y-1">
          <span className="inline-flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5" />
            Tienda Oficial Directa: Ahorrá hasta{' '}
            {tenant.platformComparison.commissionSavedPercent}% vs{' '}
            {tenant.platformComparison.platformName}
          </span>
          {tenant.commerce.transferDiscountPercent > 0 && (
            <span className="hidden sm:inline-flex items-center gap-1 opacity-95">
              · +{tenant.commerce.transferDiscountPercent}% OFF extra por
              Transferencia Bancaria
            </span>
          )}
          {tenant.commerce.freeShippingThreshold && (
            <span className="hidden md:inline-flex items-center gap-1 opacity-95">
              · Envío Gratis desde{' '}
              {formatARS(tenant.commerce.freeShippingThreshold, sym)}
            </span>
          )}
        </div>
      </div>

      {/* Main Header */}
      <header
        className={`sticky top-0 z-30 border-b backdrop-blur-md ${
          isDark
            ? 'bg-zinc-950/85 border-zinc-800/80'
            : 'bg-white/85 border-zinc-200/80'
        }`}
      >
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3.5">
          {/* Brand Logo */}
          <div className="flex items-center gap-3">
            <span className="text-xl sm:text-2xl font-black tracking-tight">
              {tenant.brand.logoText}
            </span>
            <span
              className={`hidden lg:inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${
                isDark
                  ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400'
                  : 'border-emerald-600/25 bg-emerald-500/10 text-emerald-700'
              }`}
            >
              <Award className="h-3.5 w-3.5" />
              {tenant.platformComparison.sellerBadge}
            </span>
          </div>

          {/* Search Input */}
          <div className="relative flex-1 max-w-md hidden sm:block">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 opacity-45" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={`Buscar en ${tenant.brand.name}...`}
              className={`w-full rounded-full border pl-10 pr-4 py-2 text-xs outline-none transition ${
                isDark
                  ? 'bg-zinc-900 border-zinc-800 focus:border-zinc-600'
                  : 'bg-zinc-100 border-zinc-200 focus:border-zinc-400'
              }`}
            />
          </div>

          {/* Theme switch + Cart Button */}
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <button
              onClick={onOpenCart}
              style={{ backgroundColor: tenant.theme.primaryColor }}
              className="inline-flex items-center gap-2.5 rounded-full px-4 py-2.5 text-xs font-bold text-white shadow-md hover:opacity-95 transition"
            >
              <ShoppingBag className="h-4 w-4" />
              <span>Mi Carrito</span>
              <span className="rounded-full bg-white/20 px-2 py-0.5 text-[11px]">
                {cartCount}
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="mx-auto max-w-6xl px-4 pt-6 pb-8">
        <div
          className={`relative overflow-hidden rounded-3xl border ${
            isDark
              ? 'bg-zinc-900 border-zinc-800'
              : 'bg-white border-zinc-200 shadow-sm'
          }`}
        >
          <div className="grid grid-cols-1 lg:grid-cols-12 items-center">
            <div className="p-6 sm:p-10 lg:col-span-7 space-y-5">
              <div className="inline-flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/15 px-3 py-1 text-xs font-bold text-amber-500">
                  <Star className="h-3.5 w-3.5 fill-amber-500" />
                  {tenant.brand.ratingScore} ({tenant.brand.reviewsCount}+
                  clientes verificados)
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-bold text-emerald-500">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Tienda Directa Sin Comisiones
                </span>
              </div>

              <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight leading-tight">
                {tenant.brand.heroHeadline}
              </h1>

              <p className="text-sm sm:text-base opacity-80 leading-relaxed max-w-xl">
                {tenant.brand.heroSubheadline}
              </p>

              {/* Value Props Micro-Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                {tenant.trustHighlights.map((hl, idx) => (
                  <div
                    key={idx}
                    className={`rounded-2xl border p-3 ${
                      isDark
                        ? 'bg-zinc-950/60 border-zinc-800'
                        : 'bg-zinc-50 border-zinc-200/80'
                    }`}
                  >
                    <p className="text-xs font-bold">{hl.title}</p>
                    <p className="text-[11px] opacity-70 mt-0.5 leading-snug">
                      {hl.subtitle}
                    </p>
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap items-center gap-4 pt-1 text-xs opacity-75">
                <span className="inline-flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5" />
                  {tenant.brand.locationLabel}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Truck className="h-3.5 w-3.5" />
                  {tenant.commerce.deliveryTimeEstimate}
                </span>
              </div>
            </div>

            <div className="lg:col-span-5 h-64 sm:h-80 lg:h-full relative">
              <img
                src={tenant.brand.heroBannerUrl}
                alt={tenant.brand.name}
                className="h-full w-full object-cover"
              />
              <div className="absolute bottom-4 left-4 right-4 rounded-2xl bg-black/75 backdrop-blur-md p-3.5 text-white border border-white/15">
                <p className="text-xs font-bold flex items-center gap-1.5 text-emerald-400">
                  <Sparkles className="h-4 w-4" />
                  ¿Por qué es más barato acá que en{' '}
                  {tenant.platformComparison.platformName}?
                </p>
                <p className="text-[11px] text-zinc-200 mt-1 leading-snug">
                  En {tenant.platformComparison.platformName} pagamos hasta{' '}
                  {tenant.platformComparison.commissionSavedPercent}% de
                  comisión por venta. Comprando directo en nuestra web te
                  descontamos esa comisión a vos.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Catalog Controls: Categories & Sorting */}
      <section className="mx-auto max-w-6xl w-full px-4 pb-12 flex-1">
        {/* Mobile Search */}
        <div className="relative mb-4 sm:hidden">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 opacity-45" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={`Buscar producto...`}
            className={`w-full rounded-2xl border pl-10 pr-4 py-2.5 text-xs outline-none ${
              isDark
                ? 'bg-zinc-900 border-zinc-800'
                : 'bg-white border-zinc-200'
            }`}
          />
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          {/* Category Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
            <button
              onClick={() => setSelectedCategory('all')}
              style={
                selectedCategory === 'all'
                  ? { backgroundColor: tenant.theme.primaryColor, color: '#fff' }
                  : undefined
              }
              className={`shrink-0 rounded-full px-4 py-2 text-xs font-bold transition border ${
                selectedCategory === 'all'
                  ? 'border-transparent shadow-sm'
                  : isDark
                  ? 'border-zinc-800 bg-zinc-900 hover:border-zinc-700'
                  : 'border-zinc-200 bg-white hover:border-zinc-300'
              }`}
            >
              Todos ({tenant.items.length})
            </button>
            {tenant.categories.map((cat) => {
              const active = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  style={
                    active
                      ? {
                          backgroundColor: tenant.theme.primaryColor,
                          color: '#fff',
                        }
                      : undefined
                  }
                  className={`shrink-0 inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-bold transition border ${
                    active
                      ? 'border-transparent shadow-sm'
                      : isDark
                      ? 'border-zinc-800 bg-zinc-900 hover:border-zinc-700'
                      : 'border-zinc-200 bg-white hover:border-zinc-300'
                  }`}
                >
                  <span>{cat.name}</span>
                  {cat.badge && (
                    <span className="rounded-full bg-amber-500/20 text-amber-500 px-1.5 py-0.2 text-[10px]">
                      {cat.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-2 self-end sm:self-auto">
            <span className="text-xs opacity-65">Ordenar:</span>
            <select
              value={sortBy}
              onChange={(e) =>
                setSortBy(e.target.value as 'featured' | 'price-asc' | 'savings')
              }
              className={`rounded-xl border px-3 py-1.5 text-xs font-semibold outline-none ${
                isDark
                  ? 'bg-zinc-900 border-zinc-800 text-zinc-100'
                  : 'bg-white border-zinc-200 text-zinc-900'
              }`}
            >
              <option value="featured">Más relevantes</option>
              <option value="savings">Mayor ahorro vs MeLi</option>
              <option value="price-asc">Menor precio</option>
            </select>
          </div>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredItems.map((item) => {
            const savings = calculatePlatformSavings(item);
            const transferPrice = calculateTransferPrice(
              item.price,
              tenant.commerce.transferDiscountPercent
            );

            return (
              <div
                key={item.id}
                onClick={() => onSelectItem(item)}
                className={`group cursor-pointer flex flex-col justify-between rounded-3xl border overflow-hidden transition duration-200 hover:-translate-y-0.5 hover:shadow-xl ${
                  isDark
                    ? 'bg-zinc-900 border-zinc-800 hover:border-zinc-700'
                    : 'bg-white border-zinc-200 hover:border-zinc-300'
                }`}
              >
                <div>
                  {/* Image Container */}
                  <div className="relative aspect-[4/3] overflow-hidden bg-zinc-800/10">
                    <img
                      src={item.images[0]}
                      alt={item.title}
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                    />
                    {item.badge && (
                      <span
                        style={{ backgroundColor: tenant.theme.primaryColor }}
                        className="absolute left-3 top-3 rounded-full px-3 py-1 text-[11px] font-bold text-white shadow-md"
                      >
                        {item.badge}
                      </span>
                    )}
                    {savings.hasPlatformComparison && (
                      <span className="absolute right-3 top-3 rounded-full bg-emerald-600 px-2.5 py-1 text-[11px] font-extrabold text-white shadow-md">
                        -{savings.percentSaved}% vs MeLi
                      </span>
                    )}
                  </div>

                  {/* Card Body */}
                  <div className="p-4 sm:p-5 space-y-2.5">
                    <div className="flex items-center justify-between text-[11px] opacity-65">
                      <span>{item.stockLabel ?? 'Stock disponible'}</span>
                      {item.sku && <span className="font-mono">{item.sku}</span>}
                    </div>

                    <h3 className="text-base font-bold leading-snug line-clamp-2">
                      {item.title}
                    </h3>

                    <p className="text-xs opacity-70 line-clamp-2 leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </div>

                {/* Pricing & CTA Footer */}
                <div className="px-4 pb-4 sm:px-5 sm:pb-5 pt-1 space-y-3">
                  <div
                    className={`rounded-2xl p-3 border ${
                      isDark
                        ? 'bg-zinc-950/70 border-zinc-800/80'
                        : 'bg-zinc-50 border-zinc-200/70'
                    }`}
                  >
                    {savings.hasPlatformComparison && (
                      <div className="flex items-center justify-between text-[11px] mb-0.5">
                        <span className="opacity-65">
                          En {tenant.platformComparison.platformName}:{' '}
                          <span className="line-through">
                            {formatARS(savings.platformPrice, sym)}
                          </span>
                        </span>
                        <span className="font-bold text-emerald-500">
                          Ahorrás {formatARS(savings.amountSaved, sym)}
                        </span>
                      </div>
                    )}

                    <div className="flex items-baseline justify-between">
                      <span className="text-xl font-extrabold">
                        {formatARS(item.price, sym)}
                      </span>
                      <span className="text-[11px] opacity-60 font-medium">
                        Precio Web Directo
                      </span>
                    </div>

                    {tenant.commerce.transferDiscountPercent > 0 && (
                      <div className="mt-1.5 pt-1.5 border-t border-zinc-500/15 flex items-center justify-between text-xs font-bold text-emerald-500">
                        <span className="inline-flex items-center gap-1">
                          <Tag className="h-3 w-3" />
                          Transferencia ({tenant.commerce.transferDiscountPercent}% OFF):
                        </span>
                        <span>{formatARS(transferPrice, sym)}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (item.variants.length > 0) {
                          onSelectItem(item);
                        } else {
                          onQuickAdd(item);
                        }
                      }}
                      style={{ backgroundColor: tenant.theme.primaryColor }}
                      className="w-full rounded-xl py-2.5 px-4 text-xs font-bold text-white shadow hover:opacity-95 transition"
                    >
                      {item.variants.length > 0
                        ? 'Elegir Opciones · Agregar'
                        : '+ Agregar al Carrito'}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Verified Reviews Section */}
        <div className="mt-14 pt-10 border-t border-zinc-500/20">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
            <div>
              <h2 className="text-xl font-extrabold">
                Opiniones verificadas de clientes
              </h2>
              <p className="text-xs opacity-70">
                Calificaciones reales en {tenant.platformComparison.platformName},
                Google Maps y compras directas
              </p>
            </div>
            <div className="inline-flex items-center gap-2 rounded-2xl border border-amber-500/30 bg-amber-500/10 px-4 py-2 text-xs font-bold text-amber-500">
              <Star className="h-4 w-4 fill-amber-500" />
              <span>
                {tenant.brand.ratingScore} / 5.0 · {tenant.brand.reviewsCount}{' '}
                reseñas
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {tenant.reviews.map((rev) => (
              <div
                key={rev.id}
                className={`rounded-2xl border p-4 space-y-2.5 ${
                  isDark
                    ? 'bg-zinc-900 border-zinc-800'
                    : 'bg-white border-zinc-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-0.5 text-amber-400">
                    {Array.from({ length: rev.rating }).map((_, i) => (
                      <Star key={i} className="h-3.5 w-3.5 fill-amber-400" />
                    ))}
                  </div>
                  <span className="rounded-full bg-zinc-500/15 px-2.5 py-0.5 text-[10px] font-semibold opacity-80">
                    {rev.source}
                  </span>
                </div>
                <p className="text-xs leading-relaxed opacity-85">"{rev.text}"</p>
                <div className="flex items-center justify-between text-[11px] opacity-60 pt-1">
                  <span className="font-bold">{rev.author}</span>
                  <span>{rev.dateLabel}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Floating Bottom Cart Summary on Mobile */}
      {cartCount > 0 && (
        <div className="fixed bottom-4 left-4 right-4 z-30 sm:hidden">
          <button
            onClick={onOpenCart}
            style={{ backgroundColor: tenant.theme.primaryColor }}
            className="flex w-full items-center justify-between rounded-2xl px-5 py-3.5 text-sm font-bold text-white shadow-2xl"
          >
            <span className="inline-flex items-center gap-2">
              <ShoppingBag className="h-4 w-4" />
              Ver Carrito ({cartCount})
            </span>
            <span>{formatARS(cartSubtotal, sym)}</span>
          </button>
        </div>
      )}

      {/* Footer */}
      <footer
        className={`border-t py-8 px-4 text-xs opacity-75 ${
          isDark ? 'border-zinc-800 bg-zinc-950' : 'border-zinc-200 bg-zinc-100'
        }`}
      >
        <div className="mx-auto max-w-6xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <p className="font-bold text-sm">{tenant.brand.name}</p>
            <p className="mt-0.5">
              {tenant.brand.locationLabel} · {tenant.brand.scheduleLabel}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <span className="inline-flex items-center gap-1">
              <ShieldCheck className="h-4 w-4 text-emerald-500" />
              Catálogo Oficial Directo
            </span>
            <a
              href={`https://wa.me/${tenant.commerce.whatsappPhone}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 font-bold text-emerald-500 hover:underline"
            >
              <MessageCircle className="h-4 w-4" />
              Atención por WhatsApp
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};
