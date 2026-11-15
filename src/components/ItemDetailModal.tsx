import React, { useState } from 'react';
import {
  Check,
  ShieldCheck,
  Sparkles,
  Tag,
  Truck,
  X,
} from 'lucide-react';
import {
  calculatePlatformSavings,
  calculateTransferPrice,
  formatARS,
} from '../domain/pricing';
import { CatalogItem, TenantConfig } from '../domain/tenant.schema';

interface ItemDetailModalProps {
  item: CatalogItem | null;
  tenant: TenantConfig;
  onClose: () => void;
  onAddToCart: (
    item: CatalogItem,
    quantity: number,
    selectedVariants: Record<string, { label: string; priceDelta: number }>,
    notes: string
  ) => void;
}

interface ItemDetailContentProps extends Omit<ItemDetailModalProps, 'item'> {
  item: CatalogItem;
}

/**
 * Wrapper: renders nothing without an item, and remounts the content per product
 * (`key`) so variant/quantity/notes state never leaks between items.
 * Hooks live in the inner component to keep hook order stable.
 */
export const ItemDetailModal: React.FC<ItemDetailModalProps> = ({ item, ...rest }) => {
  if (!item) return null;
  return <ItemDetailContent key={item.id} item={item} {...rest} />;
};

const ItemDetailContent: React.FC<ItemDetailContentProps> = ({
  item,
  tenant,
  onClose,
  onAddToCart,
}) => {
  const isDark = tenant.theme.mode === 'dark';
  const sym = tenant.commerce.currencySymbol;

  const initialVariants: Record<string, { label: string; priceDelta: number }> = {};
  for (const group of item.variants) {
    if (group.options.length > 0) {
      initialVariants[group.name] = group.options[0];
    }
  }

  const [selectedVariants, setSelectedVariants] = useState(initialVariants);
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState('');

  const variantsDelta = Object.values(selectedVariants).reduce(
    (acc, opt) => acc + opt.priceDelta,
    0
  );
  const unitPrice = item.price + variantsDelta;
  const savings = calculatePlatformSavings(item);
  const transferUnitPrice = calculateTransferPrice(
    unitPrice,
    tenant.commerce.transferDiscountPercent
  );

  const handleConfirm = () => {
    onAddToCart(item, quantity, selectedVariants, notes);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm p-0 sm:p-4">
      <div
        className={`relative w-full max-w-2xl max-h-[92vh] overflow-y-auto rounded-t-3xl sm:rounded-3xl border shadow-2xl ${
          isDark
            ? 'bg-zinc-900 border-zinc-800 text-zinc-100'
            : 'bg-white border-zinc-200 text-zinc-900'
        }`}
      >
        <button
          onClick={onClose}
          className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/80 transition"
          aria-label="Cerrar"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Product Image */}
          <div className="relative aspect-square md:aspect-auto md:h-full bg-zinc-800/20">
            <img
              src={item.images[0]}
              alt={item.title}
              className="h-full w-full object-cover"
            />
            {item.badge && (
              <span
                style={{ backgroundColor: tenant.theme.primaryColor }}
                className="absolute left-3 top-3 rounded-full px-3 py-1 text-xs font-bold text-white shadow-md"
              >
                {item.badge}
              </span>
            )}
          </div>

          {/* Product Details */}
          <div className="flex flex-col justify-between p-5 sm:p-6 space-y-5">
            <div className="space-y-3">
              {item.sku && (
                <p className="text-xs font-mono uppercase tracking-wider opacity-60">
                  SKU: {item.sku}
                </p>
              )}
              <h3 className="text-xl font-bold leading-snug">{item.title}</h3>
              <p className="text-sm leading-relaxed opacity-80">
                {item.description}
              </p>

              {/* Price & Platform Comparison Box */}
              <div
                className={`rounded-2xl p-3.5 border ${
                  isDark
                    ? 'bg-zinc-950/70 border-zinc-800'
                    : 'bg-zinc-50 border-zinc-200'
                }`}
              >
                {savings.hasPlatformComparison && (
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="opacity-70">
                      En {tenant.platformComparison.platformName}:{' '}
                      <span className="line-through font-medium">
                        {formatARS(savings.platformPrice + variantsDelta, sym)}
                      </span>
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-emerald-500 font-semibold">
                      <Sparkles className="h-3 w-3" />
                      Ahorrás {formatARS(savings.amountSaved, sym)} (-
                      {savings.percentSaved}%)
                    </span>
                  </div>
                )}

                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-extrabold">
                    {formatARS(unitPrice, sym)}
                  </span>
                  <span className="text-xs opacity-60">Precio Web Directo</span>
                </div>

                {tenant.commerce.transferDiscountPercent > 0 && (
                  <div className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-emerald-500">
                    <Tag className="h-3.5 w-3.5" />
                    <span>
                      {formatARS(transferUnitPrice, sym)} abonando por
                      Transferencia / Efectivo (
                      {tenant.commerce.transferDiscountPercent}% OFF extra)
                    </span>
                  </div>
                )}
              </div>

              {/* Dynamic Variants Selector */}
              {item.variants.map((group) => (
                <div key={group.id} className="space-y-2 pt-1">
                  <label className="block text-xs font-bold uppercase tracking-wider opacity-75">
                    {group.name}
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {group.options.map((opt) => {
                      const isSelected =
                        selectedVariants[group.name]?.label === opt.label;
                      return (
                        <button
                          key={opt.label}
                          type="button"
                          onClick={() =>
                            setSelectedVariants((prev) => ({
                              ...prev,
                              [group.name]: opt,
                            }))
                          }
                          style={
                            isSelected
                              ? {
                                  borderColor: tenant.theme.primaryColor,
                                  backgroundColor: `${tenant.theme.primaryColor}18`,
                                }
                              : undefined
                          }
                          className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-semibold transition ${
                            isSelected
                              ? 'ring-1 ring-current'
                              : isDark
                              ? 'border-zinc-800 hover:border-zinc-700'
                              : 'border-zinc-200 hover:border-zinc-300'
                          }`}
                        >
                          {isSelected && <Check className="h-3.5 w-3.5" />}
                          <span>{opt.label}</span>
                          {opt.priceDelta > 0 && (
                            <span className="opacity-75">
                              (+{formatARS(opt.priceDelta, sym)})
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}

              {/* Optional Note */}
              <div className="pt-1">
                <label className="block text-xs font-semibold opacity-75 mb-1">
                  {tenant.templateType === 'gastro'
                    ? '¿Alguna aclaración para la cocina? (Opcional)'
                    : 'Nota sobre el producto / talle / envío (Opcional)'}
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder={
                    tenant.templateType === 'gastro'
                      ? 'Ej: Sin cebolla, bien cocido...'
                      : 'Ej: Es para regalo, coordinar horario...'
                  }
                  className={`w-full rounded-xl border px-3 py-2 text-sm outline-none transition ${
                    isDark
                      ? 'bg-zinc-950 border-zinc-800 focus:border-zinc-600'
                      : 'bg-zinc-50 border-zinc-200 focus:border-zinc-400'
                  }`}
                />
              </div>

              {/* Trust Micro-bar */}
              <div className="flex flex-wrap items-center gap-4 pt-1 text-xs opacity-75">
                <span className="inline-flex items-center gap-1">
                  <Truck className="h-3.5 w-3.5" />
                  {tenant.commerce.deliveryTimeEstimate}
                </span>
                <span className="inline-flex items-center gap-1">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  Compra directa verificada
                </span>
              </div>
            </div>

            {/* Footer Controls */}
            <div className="flex items-center gap-3 pt-3 border-t border-zinc-500/20">
              <div
                className={`flex items-center rounded-xl border ${
                  isDark ? 'border-zinc-800 bg-zinc-950' : 'border-zinc-200 bg-zinc-50'
                }`}
              >
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="px-3.5 py-2.5 text-sm font-bold hover:opacity-75"
                >
                  −
                </button>
                <span className="px-3 text-sm font-bold">{quantity}</span>
                <button
                  type="button"
                  onClick={() => setQuantity((q) => q + 1)}
                  className="px-3.5 py-2.5 text-sm font-bold hover:opacity-75"
                >
                  +
                </button>
              </div>

              <button
                type="button"
                onClick={handleConfirm}
                style={{ backgroundColor: tenant.theme.primaryColor }}
                className="flex-1 rounded-xl py-3 px-4 text-sm font-bold text-white shadow-lg hover:opacity-95 transition flex items-center justify-between"
              >
                <span>Agregar al pedido</span>
                <span>{formatARS(unitPrice * quantity, sym)}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
