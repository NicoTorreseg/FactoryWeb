import React, { useState } from 'react';
import { useAdmin } from '../AdminContext';
import { MessageCircle, CreditCard, Truck, Percent, CheckCircle2 } from 'lucide-react';

export const CommercialTab: React.FC = () => {
  const { tenant, updateTenant } = useAdmin();
  const [savedNotice, setSavedNotice] = useState(false);

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

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateTenant((prev) => ({
      ...prev,
      commerce: {
        ...prev.commerce,
        whatsappPhone: whatsapp.replace(/[^0-9]/g, ''),
        transferDiscountPercent: parseInt(transferDiscount, 10) || 0,
        mercadoPagoAlias: alias.trim() || undefined,
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
          Configurá el número que recibe los pedidos ya calculados y tus medios de pago directo.
        </p>
      </div>

      {savedNotice && (
        <div className="flex items-center gap-2 p-3.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-bold">
          <CheckCircle2 className="h-4 w-4" />
          <span>¡Datos comerciales actualizados con éxito!</span>
        </div>
      )}

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
            Los clientes enviarán el pedido estructurado con un solo clic a este número.
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
              Alias de Mercado Pago / CVU (Opcional)
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

      <button
        type="submit"
        className="w-full sm:w-auto px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 font-bold text-zinc-950 text-xs transition shadow-lg"
      >
        Guardar Configuración Comercial
      </button>
    </form>
  );
};
