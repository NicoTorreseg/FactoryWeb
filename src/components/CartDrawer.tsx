import React, { useState } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  Copy,
  CreditCard,
  Loader2,
  Lock,
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

  const [isMpLoading, setIsMpLoading] = useState(false);
  const [mpError, setMpError] = useState<string | null>(null);
  const [aliasCopied, setAliasCopied] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

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

  const copyAlias = () => {
    if (tenant.commerce.mercadoPagoAlias) {
      navigator.clipboard.writeText(tenant.commerce.mercadoPagoAlias);
      setAliasCopied(true);
      setTimeout(() => setAliasCopied(false), 2500);
    }
  };

  const handleMercadoPagoCheckout = async () => {
    setValidationError(null);
    setMpError(null);

    if (!customer.customerName.trim()) {
      setValidationError('Por favor ingresá tu nombre antes de continuar.');
      return;
    }

    if (customer.deliveryMethod === 'delivery' && !customer.address.trim()) {
      setValidationError('Por favor ingresá tu dirección para el envío.');
      return;
    }

    setIsMpLoading(true);

    try {
      const itemsPayload = lines.map((line) => {
        const unitPrice = calculateUnitPriceWithVariants(line);
        const variantText = Object.entries(line.selectedVariants)
          .map(([k, v]) => `${k}: ${v.label}`)
          .join(' · ');
        return {
          id: line.item.id,
          title: `${line.item.title}${variantText ? ` (${variantText})` : ''}`,
          description: line.item.description || line.item.title,
          quantity: line.quantity,
          unit_price: unitPrice,
          picture_url: line.item.images?.[0],
        };
      });

      const body = {
        items: itemsPayload,
        payer: {
          name: customer.customerName.trim(),
          address:
            customer.deliveryMethod === 'delivery'
              ? customer.address.trim()
              : 'Retiro en punto de venta',
        },
        tenantSlug: tenant.slug,
        accessToken: tenant.commerce.mercadoPagoAccessToken,
        shippingCost: totals.shippingCost,
      };

      const res = await fetch('/api/create-preference', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(
          errorData.error || `Error del servidor (${res.status})`
        );
      }

      const data = await res.json();
      if (data.init_point) {
        window.location.href = data.init_point;
        return;
      }

      throw new Error('No se recibió la URL de pago de Mercado Pago.');
    } catch (err: any) {
      console.warn('Mercado Pago preference creation notice:', err.message);

      // Graceful Fallback Strategy:
      // 1. If merchant provided direct payment link, redirect there
      if (tenant.commerce.mercadoPagoDirectLink) {
        window.open(tenant.commerce.mercadoPagoDirectLink, '_blank');
        setIsMpLoading(false);
        return;
      }

      // 2. If merchant has alias, instruct customer to transfer via MP and notify WhatsApp
      if (tenant.commerce.mercadoPagoAlias) {
        setMpError(
          `Podés transferir directamente con Mercado Pago al Alias "${tenant.commerce.mercadoPagoAlias}". Hacé clic en "Confirmar por WhatsApp" para enviar tu comprobante.`
        );
        setIsMpLoading(false);
        return;
      }

      // 3. Fallback to WhatsApp order
      setMpError(
        'La tienda está terminando de conectar su cuenta de Mercado Pago. Te abrimos el pedido pre-cargado en WhatsApp para coordinar tu pago.'
      );
      setTimeout(() => {
        window.open(whatsappUrl, '_blank');
      }, 1800);
    } finally {
      setIsMpLoading(false);
    }
  };

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
            <ShoppingBag
              className="h-5 w-5"
              style={{ color: tenant.theme.primaryColor }}
            />
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
              <span className="font-mono opacity-70">
                {freeShippingProgress}%
              </span>
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

            {/* Customer & Checkout Form */}
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
                  placeholder="Tu nombre completo *"
                  value={customer.customerName}
                  onChange={(e) => {
                    setValidationError(null);
                    setCustomer((c) => ({
                      ...c,
                      customerName: e.target.value,
                    }));
                  }}
                  className={`w-full rounded-xl border px-3 py-2 text-xs outline-none ${
                    validationError && !customer.customerName
                      ? 'border-red-500'
                      : ''
                  } ${
                    isDark
                      ? 'bg-zinc-950 border-zinc-800'
                      : 'bg-zinc-50 border-zinc-200'
                  }`}
                />
                {customer.deliveryMethod === 'delivery' && (
                  <input
                    type="text"
                    placeholder="Dirección de entrega y localidad / CP *"
                    value={customer.address}
                    onChange={(e) => {
                      setValidationError(null);
                      setCustomer((c) => ({
                        ...c,
                        address: e.target.value,
                      }));
                    }}
                    className={`w-full rounded-xl border px-3 py-2 text-xs outline-none ${
                      validationError && !customer.address
                        ? 'border-red-500'
                        : ''
                    } ${
                      isDark
                        ? 'bg-zinc-950 border-zinc-800'
                        : 'bg-zinc-50 border-zinc-200'
                    }`}
                  />
                )}
              </div>

              {validationError && (
                <div className="flex items-center gap-1.5 text-xs text-red-500 font-medium">
                  <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                  <span>{validationError}</span>
                </div>
              )}

              <h3 className="text-xs font-bold uppercase tracking-wider opacity-70 pt-2">
                2. Medio de Pago
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
                      ? 'border-blue-500 bg-blue-500/10 text-blue-400'
                      : 'border-zinc-500/20 opacity-75'
                  }`}
                >
                  <CreditCard className="h-4 w-4 shrink-0" />
                  <div className="text-left">
                    <div>Mercado Pago</div>
                    <div className="text-[10px] opacity-75">
                      Tarjetas / Cuotas
                    </div>
                  </div>
                </button>
              </div>

              {/* Informative details based on payment method */}
              {customer.paymentMethod === 'transfer' &&
                tenant.commerce.mercadoPagoAlias && (
                  <div className="rounded-xl bg-zinc-800/40 border border-zinc-700/50 p-2.5 text-xs flex items-center justify-between">
                    <div>
                      <span className="opacity-60 text-[10px] block">
                        Alias para transferir:
                      </span>
                      <span className="font-mono font-bold text-emerald-400">
                        {tenant.commerce.mercadoPagoAlias}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={copyAlias}
                      className="flex items-center gap-1 rounded-lg bg-zinc-700 hover:bg-zinc-600 px-2.5 py-1 text-[11px] font-semibold transition"
                    >
                      {aliasCopied ? (
                        <>
                          <CheckCircle2 className="h-3 w-3 text-emerald-400" />
                          <span>¡Copiado!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="h-3 w-3" />
                          <span>Copiar</span>
                        </>
                      )}
                    </button>
                  </div>
                )}

              {customer.paymentMethod === 'mercadopago' && (
                <div className="rounded-xl bg-blue-950/20 border border-blue-500/20 p-2.5 text-xs space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-blue-400 flex items-center gap-1">
                      <Lock className="h-3 w-3" /> Checkout Pro Oficial
                    </span>
                    <span className="text-[10px] opacity-70">
                      Hasta 12 cuotas
                    </span>
                  </div>
                  <p className="text-[11px] opacity-75 leading-tight">
                    Aboná de forma segura con Tarjeta de Crédito, Débito,
                    Mercado Crédito o dinero disponible en cuenta.
                  </p>
                  <div className="flex flex-wrap gap-1 pt-0.5 text-[9px] font-semibold opacity-80">
                    <span className="px-1.5 py-0.5 rounded bg-zinc-800">
                      Visa
                    </span>
                    <span className="px-1.5 py-0.5 rounded bg-zinc-800">
                      Mastercard
                    </span>
                    <span className="px-1.5 py-0.5 rounded bg-zinc-800">
                      Mercado Crédito
                    </span>
                    <span className="px-1.5 py-0.5 rounded bg-zinc-800">
                      Dinero en MP
                    </span>
                  </div>
                </div>
              )}

              {mpError && (
                <div className="rounded-xl bg-amber-500/10 border border-amber-500/30 p-3 text-xs text-amber-300 space-y-2">
                  <div className="flex items-start gap-1.5">
                    <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                    <span>{mpError}</span>
                  </div>
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 font-bold text-emerald-400 hover:text-emerald-300 underline"
                  >
                    <MessageCircle className="h-3.5 w-3.5" />
                    Confirmar pedido por WhatsApp ahora
                  </a>
                </div>
              )}
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

            {/* Action CTA depending on Payment Method */}
            {customer.paymentMethod === 'mercadopago' ? (
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={handleMercadoPagoCheckout}
                  disabled={isMpLoading}
                  className="flex w-full items-center justify-center gap-2 rounded-2xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 py-3.5 px-4 text-sm font-bold text-white shadow-lg transition"
                >
                  {isMpLoading ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      <span>Iniciando Checkout Seguro...</span>
                    </>
                  ) : (
                    <>
                      <CreditCard className="h-5 w-5" />
                      <span>
                        Pagar con Mercado Pago ({formatARS(finalAmount, sym)})
                      </span>
                    </>
                  )}
                </button>

                <div className="flex items-center justify-between text-[11px] opacity-70 px-1">
                  <span className="flex items-center gap-1">
                    <Lock className="h-3 w-3 text-emerald-400" />
                    Pasarela oficial y cifrada
                  </span>
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:underline text-zinc-400 hover:text-white"
                  >
                    ¿Preferís WhatsApp?
                  </a>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-600 hover:bg-emerald-500 py-3.5 px-4 text-sm font-bold text-white shadow-lg transition"
                >
                  <MessageCircle className="h-5 w-5" />
                  <span>
                    Enviar Pedido por WhatsApp ({formatARS(finalAmount, sym)})
                  </span>
                </a>
                <p className="text-[11px] text-center opacity-60 flex items-center justify-center gap-1">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                  El pedido se abre pre-cargado en el WhatsApp oficial de{' '}
                  {tenant.brand.name}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
