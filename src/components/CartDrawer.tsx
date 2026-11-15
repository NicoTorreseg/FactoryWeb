import React, { useState } from 'react';
import {
  CheckCircle2,
  CreditCard,
  MessageCircle,
  ShoppingBag,
  Sparkles,
  Store,
  Trash2,
  Truck,
  Wallet,
  X,
} from 'lucide-react';
import {
  calculateCartTotals,
  calculateUnitPriceWithVariants,
  formatARS,
} from '../domain/pricing';
import { CartLineItem, TenantConfig } from '../domain/tenant.schema';
import { buildWhatsAppOrderUrl, CheckoutCustomerData } from '../domain/whatsapp';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  tenant: TenantConfig;
  lines: CartLineItem[];
  onUpdateQuantity: (lineId: string, delta: number) => void;
  onRemoveLine: (lineId: string) => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  tenant,
  lines,
  onUpdateQuantity,
  onRemoveLine,
}) => {
  const [customer, setCustomer] = useState<CheckoutCustomerData>({
    customerName: '',
    deliveryMethod: 'delivery',
    address: '',
    paymentMethod: 'transfer',
    notes: '',
  });

  if (!isOpen) return null;

  const isDark = tenant.theme.mode === 'dark';
  const sym = tenant.commerce.currencySymbol;
  const totals = calculateCartTotals(
    lines,
    tenant.commerce,
    customer.deliveryMethod
  );

  const isDirectPayment =
    customer.paymentMethod === 'transfer' || customer.paymentMethod === 'cash';
  const finalAmount = isDirectPayment
    ? totals.finalTotalTransfer
    : totals.finalTotalCardOrMP;

  const totalCombinedSavings =
    totals.platformSavingsTotal +
    (isDirectPayment ? totals.transferDiscountAmount : 0);

  const whatsappUrl = buildWhatsAppOrderUrl(tenant, lines, customer);

  const freeShippingProgress =
    tenant.commerce.freeShippingThreshold &&
    tenant.commerce.freeShippingThreshold > 0
      ? Math.min(
          100,
          Math.round(
            (totals.subtotal / tenant.commerce.freeShippingThreshold) * 100
          )
        )
      : 100;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/70 backdrop-blur-sm">
      <div
        className={`flex h-full w-full max-w-md flex-col border-l shadow-2xl ${
          isDark
            ? 'bg-zinc-900 border-zinc-800 text-zinc-100'
            : 'bg-white border-zinc-200 text-zinc-900'
        }`}
      >
        {/* Drawer Header */}
        <div className="flex items-center justify-between border-b border-zinc-500/20 px-5 py-4">
          <div className="flex items-center gap-2.5">
            <ShoppingBag className="h-5 w-5" style={{ color: tenant.theme.primaryColor }} />
            <div>
              <h2 className="text-base font-bold">Tu Pedido Directo</h2>
              <p className="text-xs opacity-65">
                {tenant.brand.name} · Sin intermediarios
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-2 hover:bg-zinc-500/15 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Free Shipping Progress Bar */}
        {tenant.commerce.freeShippingThreshold && lines.length > 0 && (
          <div
            className={`px-5 py-3 border-b border-zinc-500/15 text-xs ${
              isDark ? 'bg-zinc-950/60' : 'bg-zinc-50'
            }`}
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="font-semibold flex items-center gap-1.5">
                <Truck className="h-3.5 w-3.5 text-emerald-500" />
                {totals.qualifiesForFreeShipping ? (
                  <span className="text-emerald-500 font-bold">
                    ¡Tenés Envío Gratis bonificado!
                  </span>
                ) : (
                  <span>
                    Sumá{' '}
                    <strong>
                      {formatARS(totals.amountForFreeShipping, sym)}
                    </strong>{' '}
                    más para tener <strong>Envío Gratis</strong>
                  </span>
                )}
              </span>
              <span className="font-mono opacity-70">{freeShippingProgress}%</span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-zinc-500/20 overflow-hidden">
              <div
                className="h-full bg-emerald-500 transition-all duration-300"
                style={{ width: `${freeShippingProgress}%` }}
              />
            </div>
          </div>
        )}

        {/* Drawer Body */}
        {lines.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center p-8 text-center">
            <ShoppingBag className="h-12 w-12 opacity-25 mb-3" />
            <p className="text-base font-semibold">Tu carrito está vacío</p>
            <p className="text-xs opacity-65 mt-1 max-w-xs">
              Agregá productos del catálogo para calcular tu ahorro directo sin
              comisiones de plataforma.
            </p>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
            {/* Savings Banner */}
            {totalCombinedSavings > 0 && (
              <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-3.5 text-xs">
                <div className="flex items-center gap-2 font-bold text-emerald-500 text-sm">
                  <Sparkles className="h-4 w-4 shrink-0" />
                  <span>
                    Estás ahorrando {formatARS(totalCombinedSavings, sym)} en
                    este pedido
                  </span>
                </div>
                <p className="mt-1 opacity-80 leading-relaxed">
                  En {tenant.platformComparison.platformName} estos mismos
                  productos cuestan{' '}
                  <span className="line-through font-semibold">
                    {formatARS(totals.platformEquivalentTotal, sym)}
                  </span>
                  . Comprando directo acá pagás mucho menos.
                </p>
              </div>
            )}

            {/* Line Items */}
            <div className="space-y-3">
              {lines.map((line) => {
                const unitPrice = calculateUnitPriceWithVariants(line);
                const variantText = Object.entries(line.selectedVariants)
                  .map(([k, v]) => `${k}: ${v.label}`)
                  .join(' · ');

                return (
                  <div
                    key={line.lineId}
                    className={`flex gap-3 rounded-2xl border p-3 ${
                      isDark
                        ? 'bg-zinc-950/60 border-zinc-800'
                        : 'bg-zinc-50 border-zinc-200'
                    }`}
                  >
                    <img
                      src={line.item.images[0]}
                      alt={line.item.title}
                      className="h-16 w-16 rounded-xl object-cover shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="text-xs font-bold leading-snug line-clamp-2">
                          {line.item.title}
                        </h4>
                        <button
                          onClick={() => onRemoveLine(line.lineId)}
                          className="opacity-50 hover:opacity-100 hover:text-red-500 p-0.5"
                          title="Quitar"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      {variantText && (
                        <p className="text-[11px] opacity-65 mt-0.5">
                          {variantText}
                        </p>
                      )}
                      {line.notes && (
                        <p className="text-[11px] italic opacity-65">
                          "{line.notes}"
                        </p>
                      )}
                      <div className="mt-2 flex items-center justify-between">
                        <div className="inline-flex items-center rounded-lg border border-zinc-500/25 text-xs">
                          <button
                            onClick={() => onUpdateQuantity(line.lineId, -1)}
                            className="px-2 py-0.5 font-bold"
                          >
                            −
                          </button>
                          <span className="px-2 font-semibold">
                            {line.quantity}
                          </span>
                          <button
                            onClick={() => onUpdateQuantity(line.lineId, 1)}
                            className="px-2 py-0.5 font-bold"
                          >
                            +
                          </button>
                        </div>
                        <span className="text-sm font-bold">
                          {formatARS(unitPrice * line.quantity, sym)}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Delivery & Payment Configuration */}
            <div className="space-y-3 pt-2 border-t border-zinc-500/20">
              <h3 className="text-xs font-bold uppercase tracking-wider opacity-70">
                1. Modalidad de Entrega
              </h3>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() =>
                    setCustomer((c) => ({ ...c, deliveryMethod: 'delivery' }))
                  }
                  className={`flex items-center gap-2 rounded-xl border p-2.5 text-xs font-semibold transition ${
                    customer.deliveryMethod === 'delivery'
                      ? 'border-emerald-500 bg-emerald-500/10 text-emerald-500'
                      : 'border-zinc-500/20 opacity-75'
                  }`}
                >
                  <Truck className="h-4 w-4 shrink-0" />
                  <div className="text-left">
                    <div>Envío a Domicilio</div>
                    <div className="text-[10px] opacity-75">
                      {totals.qualifiesForFreeShipping
                        ? 'Gratis'
                        : formatARS(tenant.commerce.flatShippingCost, sym)}
                    </div>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setCustomer((c) => ({ ...c, deliveryMethod: 'pickup' }))
                  }
                  className={`flex items-center gap-2 rounded-xl border p-2.5 text-xs font-semibold transition ${
                    customer.deliveryMethod === 'pickup'
                      ? 'border-emerald-500 bg-emerald-500/10 text-emerald-500'
                      : 'border-zinc-500/20 opacity-75'
                  }`}
                >
                  <Store className="h-4 w-4 shrink-0" />
                  <div className="text-left">
                    <div>Retiro Pick-Up</div>
                    <div className="text-[10px] opacity-75">Sin cargo ($0)</div>
                  </div>
                </button>
              </div>

              <div className="grid grid-cols-1 gap-2.5 pt-1">
                <input
                  type="text"
                  placeholder="Tu nombre completo"
                  value={customer.customerName}
                  onChange={(e) =>
                    setCustomer((c) => ({ ...c, customerName: e.target.value }))
                  }
                  className={`w-full rounded-xl border px-3 py-2 text-xs outline-none ${
                    isDark
                      ? 'bg-zinc-950 border-zinc-800'
                      : 'bg-zinc-50 border-zinc-200'
                  }`}
                />
                {customer.deliveryMethod === 'delivery' && (
                  <input
                    type="text"
                    placeholder="Dirección de entrega y localidad / CP"
                    value={customer.address}
                    onChange={(e) =>
                      setCustomer((c) => ({ ...c, address: e.target.value }))
                    }
                    className={`w-full rounded-xl border px-3 py-2 text-xs outline-none ${
                      isDark
                        ? 'bg-zinc-950 border-zinc-800'
                        : 'bg-zinc-50 border-zinc-200'
                    }`}
                  />
                )}
              </div>

              <h3 className="text-xs font-bold uppercase tracking-wider opacity-70 pt-2">
                2. Medio de Pago Preferido
              </h3>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() =>
                    setCustomer((c) => ({ ...c, paymentMethod: 'transfer' }))
                  }
                  className={`flex items-center gap-2 rounded-xl border p-2.5 text-xs font-semibold transition ${
                    customer.paymentMethod === 'transfer'
                      ? 'border-emerald-500 bg-emerald-500/10 text-emerald-500'
                      : 'border-zinc-500/20 opacity-75'
                  }`}
                >
                  <Wallet className="h-4 w-4 shrink-0" />
                  <div className="text-left">
                    <div>Transferencia</div>
                    <div className="text-[10px] font-bold">
                      -{tenant.commerce.transferDiscountPercent}% OFF Extra
                    </div>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setCustomer((c) => ({
                      ...c,
                      paymentMethod: 'mercadopago',
                    }))
                  }
                  className={`flex items-center gap-2 rounded-xl border p-2.5 text-xs font-semibold transition ${
                    customer.paymentMethod === 'mercadopago'
                      ? 'border-emerald-500 bg-emerald-500/10 text-emerald-500'
                      : 'border-zinc-500/20 opacity-75'
                  }`}
                >
                  <CreditCard className="h-4 w-4 shrink-0" />
                  <div className="text-left">
                    <div>Mercado Pago</div>
                    <div className="text-[10px] opacity-75">
                      Tarjetas / Dinero en cuenta
                    </div>
                  </div>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Drawer Footer */}
        {lines.length > 0 && (
          <div
            className={`border-t border-zinc-500/20 p-5 space-y-3 ${
              isDark ? 'bg-zinc-950' : 'bg-zinc-50'
            }`}
          >
            <div className="space-y-1 text-xs">
              <div className="flex justify-between opacity-75">
                <span>Subtotal Web Directa</span>
                <span>{formatARS(totals.subtotal, sym)}</span>
              </div>
              {isDirectPayment && totals.transferDiscountAmount > 0 && (
                <div className="flex justify-between text-emerald-500 font-semibold">
                  <span>
                    Descuento Transferencia (
                    {tenant.commerce.transferDiscountPercent}% OFF)
                  </span>
                  <span>-{formatARS(totals.transferDiscountAmount, sym)}</span>
                </div>
              )}
              <div className="flex justify-between opacity-75">
                <span>Costo de envío</span>
                <span>
                  {totals.shippingCost === 0
                    ? 'Gratis ($0)'
                    : formatARS(totals.shippingCost, sym)}
                </span>
              </div>
              <div className="flex justify-between text-base font-extrabold pt-1.5 border-t border-zinc-500/15">
                <span>Total a Pagar</span>
                <span>{formatARS(finalAmount, sym)}</span>
              </div>
            </div>

            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-600 hover:bg-emerald-500 py-3.5 px-4 text-sm font-bold text-white shadow-lg transition"
            >
              <MessageCircle className="h-5 w-5" />
              <span>Enviar Pedido por WhatsApp ({formatARS(finalAmount, sym)})</span>
            </a>
            <p className="text-[11px] text-center opacity-60 flex items-center justify-center gap-1">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
              El pedido se abre pre-cargado en el WhatsApp oficial de{' '}
              {tenant.brand.name}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
