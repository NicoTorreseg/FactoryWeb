import React, { useMemo, useState } from 'react';
import {
  Clock,
  Flame,
  MapPin,
  Plus,
  Search,
  ShoppingBag,
  Sparkles,
  Star,
  Truck,
} from 'lucide-react';
import { ThemeToggle } from '../design/primitives/ThemeToggle';
import {
  calculatePlatformSavings,
  formatARS,
} from '../domain/pricing';
import { CatalogItem, TenantConfig } from '../domain/tenant.schema';

interface GastroTemplateProps {
  tenant: TenantConfig;
  cartCount: number;
  cartSubtotal: number;
  onOpenCart: () => void;
  onSelectItem: (item: CatalogItem) => void;
  onQuickAdd: (item: CatalogItem) => void;
}

export const GastroTemplate: React.FC<GastroTemplateProps> = ({
  tenant,
  cartCount,
  cartSubtotal,
  onOpenCart,
  onSelectItem,
  onQuickAdd,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const isDark = tenant.theme.mode === 'dark';
  const sym = tenant.commerce.currencySymbol;

  const filteredItems = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return tenant.items.filter((item) => {
      const matchesCat =
        selectedCategory === 'all' || item.categoryId === selectedCategory;
      const matchesQuery =
        !q ||
        item.title.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q);
      return matchesCat && matchesQuery;
    });
  }, [tenant.items, selectedCategory, searchQuery]);

  return (
    <div className="min-h-screen flex flex-col pb-20">
      {/* Hero Banner with Overlay */}
      <div className="relative h-64 sm:h-80 w-full overflow-hidden">
        <img
          src={tenant.brand.heroBannerUrl}
          alt={tenant.brand.name}
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/65 to-black/30" />

        {/* Top Bar inside Hero */}
        <div className="absolute top-4 left-4 right-4 mx-auto max-w-5xl flex items-center justify-between">
          <div className="inline-flex items-center gap-2 rounded-full bg-black/70 backdrop-blur-md px-3.5 py-1.5 text-xs font-bold text-white border border-white/15">
            <span
              className={`h-2.5 w-2.5 rounded-full ${
                tenant.brand.isOpenNow ? 'bg-emerald-400 animate-pulse' : 'bg-red-500'
              }`}
            />
            <span>
              {tenant.brand.isOpenNow ? 'Abierto ahora · Cocina activa' : 'Cerrado'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <ThemeToggle tone="onDark" className="bg-black/50 backdrop-blur-md" />
            <button
              onClick={onOpenCart}
              style={{ backgroundColor: tenant.theme.primaryColor }}
              className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-bold text-white shadow-lg"
            >
              <ShoppingBag className="h-4 w-4" />
              <span>Pedido ({cartCount})</span>
            </button>
          </div>
        </div>

        {/* Hero Title Content */}
        <div className="absolute bottom-5 left-4 right-4 mx-auto max-w-5xl text-white space-y-2">
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="rounded-full bg-amber-500 px-2.5 py-0.5 font-extrabold text-black inline-flex items-center gap-1">
              <Star className="h-3 w-3 fill-black" />
              {tenant.brand.ratingScore} ({tenant.brand.reviewsCount})
            </span>
            <span className="rounded-full bg-emerald-500/25 border border-emerald-400/40 px-3 py-0.5 font-bold text-emerald-300">
              Precios de Mostrador (-{tenant.platformComparison.commissionSavedPercent}% vs{' '}
              {tenant.platformComparison.platformName})
            </span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-black tracking-tight">
            {tenant.brand.name}
          </h1>
          <p className="text-xs sm:text-sm text-zinc-200 max-w-2xl">
            {tenant.brand.heroHeadline}
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-1 text-xs text-zinc-300">
            <span className="inline-flex items-center gap-1">
              <Clock className="h-3.5 w-3.5 text-amber-400" />
              {tenant.commerce.deliveryTimeEstimate}
            </span>
            <span className="inline-flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5 text-amber-400" />
              {tenant.brand.locationLabel}
            </span>
          </div>
        </div>
      </div>

      {/* Savings Callout Bar */}
      <div className="mx-auto max-w-5xl w-full px-4 -mt-3 relative z-10">
        <div
          className={`rounded-2xl border p-3.5 shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs ${
            isDark
              ? 'bg-zinc-900 border-zinc-800'
              : 'bg-white border-zinc-200'
          }`}
        >
          <div className="flex items-center gap-2 font-bold text-emerald-500">
            <Sparkles className="h-4 w-4 shrink-0" />
            <span>
              Pedís directo al WhatsApp del local: sin costo de servicio de apps y con{' '}
              {tenant.commerce.transferDiscountPercent}% OFF extra en Efectivo /
              Transferencia.
            </span>
          </div>
          {tenant.commerce.freeShippingThreshold && (
            <span className="inline-flex items-center gap-1 font-semibold opacity-80 shrink-0">
              <Truck className="h-3.5 w-3.5" />
              Envío gratis desde{' '}
              {formatARS(tenant.commerce.freeShippingThreshold, sym)}
            </span>
          )}
        </div>
      </div>

      {/* Sticky Category Bar & Search */}
      <div
        className={`sticky top-0 z-20 mt-4 border-b backdrop-blur-md ${
          isDark
            ? 'bg-zinc-950/90 border-zinc-800'
            : 'bg-white/90 border-zinc-200'
        }`}
      >
        <div className="mx-auto max-w-5xl px-4 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
            <button
              onClick={() => setSelectedCategory('all')}
              style={
                selectedCategory === 'all'
                  ? { backgroundColor: tenant.theme.primaryColor, color: '#fff' }
                  : undefined
              }
              className={`shrink-0 rounded-full px-4 py-1.5 text-xs font-bold transition border ${
                selectedCategory === 'all'
                  ? 'border-transparent'
                  : isDark
                  ? 'border-zinc-800 bg-zinc-900'
                  : 'border-zinc-200 bg-zinc-100'
              }`}
            >
              Menú Completo
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
                  className={`shrink-0 inline-flex items-center gap-1 rounded-full px-4 py-1.5 text-xs font-bold transition border ${
                    active
                      ? 'border-transparent'
                      : isDark
                      ? 'border-zinc-800 bg-zinc-900'
                      : 'border-zinc-200 bg-zinc-100'
                  }`}
                >
                  <span>{cat.name}</span>
                </button>
              );
            })}
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 opacity-50" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar burger, combo, bebida..."
              className={`w-full rounded-full border pl-8 pr-3 py-1.5 text-xs outline-none ${
                isDark
                  ? 'bg-zinc-900 border-zinc-800'
                  : 'bg-zinc-100 border-zinc-200'
              }`}
            />
          </div>
        </div>
      </div>

      {/* Menu Grid */}
      <main className="mx-auto max-w-5xl w-full px-4 py-6 flex-1">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredItems.map((item) => {
            const savings = calculatePlatformSavings(item);

            return (
              <div
                key={item.id}
                onClick={() => onSelectItem(item)}
                className={`group cursor-pointer flex gap-4 rounded-3xl border p-3.5 transition hover:shadow-lg ${
                  isDark
                    ? 'bg-zinc-900 border-zinc-800 hover:border-zinc-700'
                    : 'bg-white border-zinc-200 hover:border-zinc-300'
                }`}
              >
                <div className="relative h-28 w-28 sm:h-32 sm:w-32 shrink-0 overflow-hidden rounded-2xl bg-zinc-800/20">
                  <img
                    src={item.images[0]}
                    alt={item.title}
                    className="h-full w-full object-cover group-hover:scale-105 transition duration-300"
                  />
                  {item.badge && (
                    <span
                      style={{ backgroundColor: tenant.theme.primaryColor }}
                      className="absolute left-2 top-2 rounded-full px-2 py-0.5 text-[10px] font-bold text-white shadow"
                    >
                      {item.badge}
                    </span>
                  )}
                </div>

                <div className="flex flex-1 flex-col justify-between min-w-0">
                  <div>
                    <h3 className="text-sm sm:text-base font-bold leading-snug line-clamp-2">
                      {item.title}
                    </h3>
                    <p className="text-xs opacity-70 line-clamp-2 mt-1 leading-relaxed">
                      {item.description}
                    </p>
                  </div>

                  <div className="mt-3 flex items-end justify-between gap-2">
                    <div>
                      {savings.hasPlatformComparison && (
                        <div className="text-[11px] opacity-65">
                          En apps:{' '}
                          <span className="line-through">
                            {formatARS(savings.platformPrice, sym)}
                          </span>{' '}
                          <span className="text-emerald-500 font-bold">
                            (-{savings.percentSaved}%)
                          </span>
                        </div>
                      )}
                      <div className="text-lg font-extrabold">
                        {formatARS(item.price, sym)}
                      </div>
                    </div>

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
                      className="inline-flex items-center gap-1 rounded-xl px-3.5 py-2 text-xs font-bold text-white shadow hover:opacity-95 transition"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      <span>Sumar</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Reviews */}
        <div className="mt-10 pt-8 border-t border-zinc-500/20">
          <h2 className="text-base font-extrabold mb-4 flex items-center gap-2">
            <Flame className="h-4 w-4 text-orange-500" />
            Lo que dicen los clientes del barrio
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {tenant.reviews.map((rev) => (
              <div
                key={rev.id}
                className={`rounded-2xl border p-3.5 text-xs space-y-1.5 ${
                  isDark
                    ? 'bg-zinc-900 border-zinc-800'
                    : 'bg-white border-zinc-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold">{rev.author}</span>
                  <span className="text-amber-400 font-bold">
                    ★ {rev.rating}.0 · {rev.source}
                  </span>
                </div>
                <p className="opacity-80 leading-relaxed">"{rev.text}"</p>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Sticky Bottom Checkout Bar */}
      {cartCount > 0 && (
        <div className="fixed bottom-4 left-4 right-4 z-30 mx-auto max-w-xl">
          <button
            onClick={onOpenCart}
            style={{ backgroundColor: tenant.theme.primaryColor }}
            className="flex w-full items-center justify-between rounded-2xl px-5 py-4 text-sm font-extrabold text-white shadow-2xl"
          >
            <span className="inline-flex items-center gap-2">
              <ShoppingBag className="h-4 w-4" />
              Ver mi pedido ({cartCount}{' '}
              {cartCount === 1 ? 'producto' : 'productos'})
            </span>
            <span>{formatARS(cartSubtotal, sym)} →</span>
          </button>
        </div>
      )}
    </div>
  );
};
