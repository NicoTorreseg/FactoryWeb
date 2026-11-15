import {
  calculateCartTotals,
  calculateUnitPriceWithVariants,
  formatARS,
} from './pricing';
import { CartLineItem, TenantConfig } from './tenant.schema';

export interface CheckoutCustomerData {
  customerName: string;
  deliveryMethod: 'delivery' | 'pickup';
  address: string;
  paymentMethod: 'transfer' | 'mercadopago' | 'cash';
  notes: string;
}

/**
 * Generates a clean, structured WhatsApp message ready to be received
 * by the store owner or automated WhatsApp AI bot.
 */
export function buildWhatsAppOrderUrl(
  tenant: TenantConfig,
  lines: CartLineItem[],
  customer: CheckoutCustomerData
): string {
  const { commerce, brand, platformComparison } = tenant;
  const totals = calculateCartTotals(lines, commerce, customer.deliveryMethod);
  const sym = commerce.currencySymbol;

  const isTransfer =
    customer.paymentMethod === 'transfer' || customer.paymentMethod === 'cash';
  const finalAmount = isTransfer
    ? totals.finalTotalTransfer
    : totals.finalTotalCardOrMP;

  const itemLines = lines.map((line) => {
    const unitPrice = calculateUnitPriceWithVariants(line);
    const variantTags = Object.entries(line.selectedVariants)
      .map(([group, val]) => `${group}: ${val.label}`)
      .join(', ');
    const variantSuffix = variantTags ? ` _(${variantTags})_` : '';
    const noteSuffix = line.notes ? `\n   Nota: ${line.notes}` : '';
    return `• *${line.quantity}x ${line.item.title}*${variantSuffix} — ${formatARS(
      unitPrice * line.quantity,
      sym
    )}${noteSuffix}`;
  });

  const paymentLabels: Record<CheckoutCustomerData['paymentMethod'], string> = {
    transfer: `Transferencia Bancaria (${commerce.transferDiscountPercent}% OFF aplicado)`,
    cash: `Efectivo (${commerce.transferDiscountPercent}% OFF aplicado)`,
    mercadopago: 'Mercado Pago / Tarjeta',
  };

  const messageParts: string[] = [
    `Hola *${brand.name}*! Quiero realizar el siguiente pedido desde la web oficial:`,
    '',
    ...itemLines,
    '',
    `Subtotal Web Directa: ${formatARS(totals.subtotal, sym)}`,
  ];

  if (totals.platformSavingsTotal > 0) {
    messageParts.push(
      `Ahorro vs ${platformComparison.platformName}: -${formatARS(
        totals.platformSavingsTotal,
        sym
      )}`
    );
  }

  if (isTransfer && totals.transferDiscountAmount > 0) {
    messageParts.push(
      `Descuento Pago Directo (${commerce.transferDiscountPercent}%): -${formatARS(
        totals.transferDiscountAmount,
        sym
      )}`
    );
  }

  messageParts.push(
    `Envío / Entrega: ${
      customer.deliveryMethod === 'pickup'
        ? 'Retiro en el local ($0)'
        : totals.shippingCost === 0
        ? 'Envío Gratis ($0)'
        : formatARS(totals.shippingCost, sym)
    }`,
    `*TOTAL A PAGAR: ${formatARS(finalAmount, sym)}*`,
    '',
    `*Datos de entrega:*`,
    `• Nombre: ${customer.customerName || 'Cliente Web'}`,
    `• Modalidad: ${
      customer.deliveryMethod === 'pickup'
        ? `Retiro en local (${brand.locationLabel})`
        : `Envío a domicilio (${customer.address || 'A coordinar'})`
    }`,
    `• Medio de pago: ${paymentLabels[customer.paymentMethod]}`
  );

  if (commerce.mercadoPagoAlias && isTransfer) {
    messageParts.push(`• Alias para transferir: *${commerce.mercadoPagoAlias}*`);
  }

  if (customer.notes.trim()) {
    messageParts.push(`• Aclaraciones: ${customer.notes.trim()}`);
  }

  const encoded = encodeURIComponent(messageParts.join('\n'));
  return `https://wa.me/${commerce.whatsappPhone}?text=${encoded}`;
}
