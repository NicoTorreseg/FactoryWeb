import React, { useState } from 'react';
import { useAdmin } from '../AdminContext';
import {
  MessageCircle,
  CreditCard,
  Truck,
  Percent,
  CheckCircle2,
  Key,
  ExternalLink,
  ShieldCheck,
  Eye,
  EyeOff,
  Sparkles,
} from 'lucide-react';

export const CommercialTab: React.FC = () => {
  const { tenant, updateTenant } = useAdmin();
  const [savedNotice, setSavedNotice] = useState(false);
  const [showToken, setShowToken] = useState(false);

  // Standard Commercial State
  const [whatsapp, setWhatsapp] = useState(tenant.commerce.whatsappPhone);
  const [transferDiscount, setTransferDiscount] = useState(
    tenant.commerce.transferDiscountPercent.toString()
  );
  const [alias, setAlias] = useState(tenant.commerce.mercadoPagoAlias || '');
  const [shippingCost, setShippingCost] = useState(
    tenant.commerce.flatShippingCost.toString()
  );
  const [freeShippingThreshold, setFreeShippingThreshold] = useState(
    tenant.commerce.freeShippingThreshold?.toString() || ''
  );
  const [deliveryTime, setDeliveryTime] = useState(
    tenant.commerce.deliveryTimeEstimate
  );

  // Mercado Pago Checkout Pro State
  const [mpEnabled, setMpEnabled] = useState(
    tenant.commerce.mercadoPagoCheckoutProEnabled ?? true
  );
  const [mpAccessToken, setMpAccessToken] = useState(
    tenant.commerce.mercadoPagoAccessToken || ''
  );
  const [mpPublicKey, setMpPublicKey] = useState(
    tenant.commerce.mercadoPagoPublicKey || ''
  );
  const [mpDirectLink, setMpDirectLink] = useState(
    tenant.commerce.mercadoPagoDirectLink || ''
  );

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateTenant((prev) => ({
      ...prev,
      commerce: {
        ...prev.commerce,
        whatsappPhone: whatsapp.replace(/[^0-9]/g, ''),
        transferDiscountPercent: parseInt(transferDiscount, 10) || 0,
        mercadoPagoAlias: alias.trim() || undefined,
        mercadoPagoAccessToken: mpAccessToken.trim() || undefined,
        mercadoPagoPublicKey: mpPublicKey.trim() || undefined,
        mercadoPagoDirectLink: mpDirectLink.trim() || undefined,
        mercadoPagoCheckoutProEnabled: mpEnabled,
        flatShippingCost: parseInt(shippingCost, 10) || 0,
        freeShippingThreshold: freeShippingThreshold
          ? parseInt(freeShippingThreshold, 10)
          : undefined,
        deliveryTimeEstimate: deliveryTime.trim() || 'Despacho rápido',
      },
    }));
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 3000);
  };

  return (
    <form onSubmit={handleSave} className="space-y-6 max-w-2xl">
      <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-2xl">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <MessageCircle className="h-5 w-5 text-emerald-400" />
          WhatsApp & Checkout de Pedidos
        </h2>
        <p className="text-xs text-zinc-400 mt-0.5">
          Configurá el número que recibe los pedidos y tu pasarela oficial de
          pagos directos.
        </p>
      </div>

      {savedNotice && (
        <div className="flex items-center gap-2 p-3.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-bold">
          <CheckCircle2 className="h-4 w-4" />
          <span>¡Datos comerciales y pasarela actualizados con éxito!</span>
        </div>
      )}

      {/* Mercado Pago Checkout Pro Section */}
      <div className="space-y-4 bg-gradient-to-br from-blue-950/30 via-zinc-900/60 to-zinc-900/60 border border-blue-500/30 p-5 rounded-2xl text-xs">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-500/20 text-blue-400">
              <CreditCard className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white">
                  Mercado Pago Checkout Pro (Pasarela Oficial)
                </h3>
                <span className="rounded-full bg-blue-500/20 px-2 py-0.5 text-[10px] font-bold text-blue-400">
                  $0 Fijo Mensual
                </span>
              </div>
              <p className="text-[11px] text-zinc-400 mt-0.5">
                Tus clientes pagan con Tarjeta de Crédito, Débito, Mercado
                Crédito en cuotas o dinero en cuenta. El dinero ingresa directo
                a tu cuenta.
              </p>
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer shrink-0">
            <input
              type="checkbox"
              checked={mpEnabled}
              onChange={(e) => setMpEnabled(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>

        {mpEnabled && (
          <div className="space-y-3 pt-3 border-t border-blue-500/20">
            {/* Accepted payment pills */}
            <div className="flex flex-wrap items-center gap-1.5 pb-1">
              <span className="px-2 py-0.5 rounded-md bg-zinc-800/90 text-[10px] font-semibold text-zinc-300">
                💳 Visa / Mastercard / Cabal
              </span>
              <span className="px-2 py-0.5 rounded-md bg-zinc-800/90 text-[10px] font-semibold text-zinc-300">
                ✨ Mercado Crédito (Cuotas)
              </span>
              <span className="px-2 py-0.5 rounded-md bg-zinc-800/90 text-[10px] font-semibold text-zinc-300">
                ⚡ Saldo en cuenta MP
              </span>
              <span className="px-2 py-0.5 rounded-md bg-zinc-800/90 text-[10px] font-semibold text-zinc-300">
                🏪 Pago Fácil / Rapipago
              </span>
            </div>

            <div>
              <label className="block font-semibold mb-1 text-zinc-200 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Key className="h-3.5 w-3.5 text-blue-400" />
                  Access Token de Mercado Pago (Producción)
                </span>
                <button
                  type="button"
                  onClick={() => setShowToken(!showToken)}
                  className="text-zinc-400 hover:text-white flex items-center gap-1 text-[11px]"
                >
                  {showToken ? (
                    <>
                      <EyeOff className="h-3 w-3" /> Ocultar
                    </>
                  ) : (
                    <>
                      <Eye className="h-3 w-3" /> Mostrar
                    </>
                  )}
                </button>
              </label>
              <input
                type={showToken ? 'text' : 'password'}
                value={mpAccessToken}
                onChange={(e) => setMpAccessToken(e.target.value)}
                placeholder="APP_USR-xxxxxxxxxxxxxxxxxxxx-xxxxxx-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx-xxxxxxxxx"
                className="w-full rounded-xl bg-zinc-950 border border-zinc-800 px-3.5 py-2.5 text-xs font-mono text-blue-400 outline-none focus:border-blue-500"
              />
              <p className="text-[11px] text-zinc-400 mt-1">
                Genera el cobro automático al instante sin intermediarios ni
                comisiones de software.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold mb-1 text-zinc-300">
                  Public Key (Opcional)
                </label>
                <input
                  type="text"
                  value={mpPublicKey}
                  onChange={(e) => setMpPublicKey(e.target.value)}
                  placeholder="APP_USR-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                  className="w-full rounded-xl bg-zinc-950 border border-zinc-800 px-3.5 py-2 text-xs font-mono text-zinc-300 outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1 text-zinc-300">
                  Link de Pago directo (Opcional fallback)
                </label>
                <input
                  type="text"
                  value={mpDirectLink}
                  onChange={(e) => setMpDirectLink(e.target.value)}
                  placeholder="https://mpago.la/..."
                  className="w-full rounded-xl bg-zinc-950 border border-zinc-800 px-3.5 py-2 text-xs text-zinc-300 outline-none focus:border-blue-500"
                />
              </div>
            </div>

            {/* Instruction Callout */}
            <div className="rounded-xl bg-zinc-950/80 border border-zinc-800 p-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-zinc-200 flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-amber-400" />
                  ¿Cómo obtener tu Access Token en 2 minutos gratis?
                </span>
                <a
                  href="https://www.mercadopago.com.ar/developers/panel/app"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:text-blue-300 flex items-center gap-1 font-semibold"
                >
                  Panel Developers MP <ExternalLink className="h-3 w-3" />
                </a>
              </div>
              <ol className="list-decimal list-inside space-y-1 text-zinc-400 text-[11px] leading-relaxed">
                <li>
                  Ingresá a{' '}
                  <strong className="text-zinc-300">
                    Mercado Pago Developers
                  </strong>{' '}
                  con tu cuenta habitual de Mercado Libre o Mercado Pago.
                </li>
                <li>
                  Hacé clic en{' '}
                  <strong className="text-zinc-300">
                    "Crear aplicación"
                  </strong>{' '}
                  (Nombre: <em>Tu Marca</em>, Tipo:{' '}
                  <em>Checkout de pagos en sitio web</em>).
                </li>
                <li>
                  En el menú lateral hacé clic en{' '}
                  <strong className="text-zinc-300">
                    "Credenciales de producción"
                  </strong>
                  , copiá el <strong className="text-blue-400">Access Token</strong>{' '}
                  y pegalo en el campo de arriba. ¡Listo!
                </li>
              </ol>
            </div>
          </div>
        )}
      </div>

      {/* Commercial & WhatsApp Section */}
      <div className="space-y-4 bg-zinc-900/60 border border-zinc-800 p-5 rounded-2xl text-xs">
        <div>
          <label className="block font-semibold mb-1 text-zinc-300">
            Teléfono de WhatsApp receptor (Código de país + número, sin +) *
          </label>
          <input
            type="text"
            required
            value={whatsapp}
            onChange={(e) => setWhatsapp(e.target.value)}
            placeholder="Ej: 5491122334455"
            className="w-full rounded-xl bg-zinc-950 border border-zinc-800 px-3.5 py-2.5 text-sm font-mono text-emerald-400 outline-none focus:border-emerald-500"
          />
          <p className="text-[11px] text-zinc-500 mt-1">
            Los clientes enviarán el pedido estructurado con un solo clic a este
            número.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          <div>
            <label className="block font-semibold mb-1 text-zinc-300 flex items-center gap-1.5">
              <Percent className="h-3.5 w-3.5 text-amber-400" />
              Descuento por Transferencia / Efectivo (%)
            </label>
            <input
              type="number"
              min="0"
              max="50"
              value={transferDiscount}
              onChange={(e) => setTransferDiscount(e.target.value)}
              className="w-full rounded-xl bg-zinc-950 border border-zinc-800 px-3.5 py-2.5 text-sm font-bold text-amber-400 outline-none"
            />
          </div>

          <div>
            <label className="block font-semibold mb-1 text-zinc-300 flex items-center gap-1.5">
              <CreditCard className="h-3.5 w-3.5 text-blue-400" />
              Alias de Mercado Pago / CVU (Transferencias)
            </label>
            <input
              type="text"
              value={alias}
              onChange={(e) => setAlias(e.target.value)}
              placeholder="Ej: viothani.mp"
              className="w-full rounded-xl bg-zinc-950 border border-zinc-800 px-3.5 py-2.5 text-sm text-zinc-200 outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          <div>
            <label className="block font-semibold mb-1 text-zinc-300 flex items-center gap-1.5">
              <Truck className="h-3.5 w-3.5 text-zinc-400" />
              Costo de Envío Fijo ($)
            </label>
            <input
              type="number"
              value={shippingCost}
              onChange={(e) => setShippingCost(e.target.value)}
              placeholder="0 para gratis o moto propia"
              className="w-full rounded-xl bg-zinc-950 border border-zinc-800 px-3.5 py-2.5 text-sm text-zinc-200 outline-none"
            />
          </div>

          <div>
            <label className="block font-semibold mb-1 text-zinc-300">
              Monto para Envío Gratis ($)
            </label>
            <input
              type="number"
              value={freeShippingThreshold}
              onChange={(e) => setFreeShippingThreshold(e.target.value)}
              placeholder="Ej: 35000 (Dejar vacío si no aplica)"
              className="w-full rounded-xl bg-zinc-950 border border-zinc-800 px-3.5 py-2.5 text-sm text-zinc-200 outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block font-semibold mb-1 text-zinc-300">
            Estimación de Entrega (Texto visible para el cliente)
          </label>
          <input
            type="text"
            value={deliveryTime}
            onChange={(e) => setDeliveryTime(e.target.value)}
            placeholder="Ej: Retiro hoy en Boedo (CABA) o Despacho en 24hs a todo el país"
            className="w-full rounded-xl bg-zinc-950 border border-zinc-800 px-3.5 py-2.5 text-xs text-zinc-200 outline-none"
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="submit"
          className="w-full sm:w-auto px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 font-bold text-zinc-950 text-xs transition shadow-lg"
        >
          Guardar Configuración Comercial
        </button>
        <span className="text-[11px] text-zinc-500 flex items-center gap-1">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
          Cambios reflejados al instante en tu tienda
        </span>
      </div>
    </form>
  );
};
