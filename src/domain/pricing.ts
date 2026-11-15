import { CartLineItem, CatalogItem, CommerceConfigSchema } from './tenant.schema';
import { z } from 'zod';

type CommerceConfig = z.infer<typeof CommerceConfigSchema>;

export interface SavingsBreakdown {
  hasPlatformComparison: boolean;
  platformPrice: number;
  directPrice: number;
  amountSaved: number;
  percentSaved: number;
}

/**
 * Calculates how much a customer saves buying on the direct web store
 * compared to the marketplace price (e.g., Mercado Libre or PedidosYa).
 */
export function calculatePlatformSavings(item: CatalogItem): SavingsBreakdown {
  if (!item.compareAtPlatformPrice || item.compareAtPlatformPrice <= item.price) {
    return {
      hasPlatformComparison: false,
      platformPrice: item.price,
      directPrice: item.price,
      amountSaved: 0,
      percentSaved: 0,
    };
  }

  const amountSaved = item.compareAtPlatformPrice - item.price;
  const percentSaved = Math.round((amountSaved / item.compareAtPlatformPrice) * 100);

  return {
    hasPlatformComparison: true,
    platformPrice: item.compareAtPlatformPrice,
    directPrice: item.price,
    amountSaved,
    percentSaved,
  };
}

export function calculateUnitPriceWithVariants(line: CartLineItem): number {
  const variantsDelta = Object.values(line.selectedVariants).reduce(
    (acc, v) => acc + v.priceDelta,
    0
  );
  return line.item.price + variantsDelta;
}

export function calculateTransferPrice(amount: number, transferDiscountPercent: number): number {
  if (transferDiscountPercent <= 0) return amount;
  return Math.round(amount * (1 - transferDiscountPercent / 100));
}

export interface CartTotals {
  subtotal: number;
  platformEquivalentTotal: number;
  platformSavingsTotal: number;
  transferDiscountAmount: number;
  shippingCost: number;
  amountForFreeShipping: number;
  qualifiesForFreeShipping: boolean;
  finalTotalCardOrMP: number;
  finalTotalTransfer: number;
}

export function calculateCartTotals(
  lines: CartLineItem[],
  commerce: CommerceConfig,
  deliveryMethod: 'delivery' | 'pickup'
): CartTotals {
  const subtotal = lines.reduce(
    (sum, line) => sum + calculateUnitPriceWithVariants(line) * line.quantity,
    0
  );

  const platformEquivalentTotal = lines.reduce((sum, line) => {
    const variantsDelta = Object.values(line.selectedVariants).reduce(
      (acc, v) => acc + v.priceDelta,
      0
    );
    const basePlatform = line.item.compareAtPlatformPrice ?? line.item.price;
    return sum + (basePlatform + variantsDelta) * line.quantity;
  }, 0);

  const platformSavingsTotal = Math.max(0, platformEquivalentTotal - subtotal);

  const threshold = commerce.freeShippingThreshold ?? 0;
  const qualifiesForFreeShipping =
    deliveryMethod === 'pickup' || (threshold > 0 && subtotal >= threshold);
  const amountForFreeShipping =
    threshold > 0 ? Math.max(0, threshold - subtotal) : 0;

  const shippingCost =
    deliveryMethod === 'pickup' || qualifiesForFreeShipping || subtotal === 0
      ? 0
      : commerce.flatShippingCost;

  const transferDiscountAmount = Math.round(
    subtotal * (commerce.transferDiscountPercent / 100)
  );

  return {
    subtotal,
    platformEquivalentTotal,
    platformSavingsTotal,
    transferDiscountAmount,
    shippingCost,
    amountForFreeShipping,
    qualifiesForFreeShipping,
    finalTotalCardOrMP: subtotal + shippingCost,
    finalTotalTransfer: subtotal - transferDiscountAmount + shippingCost,
  };
}

export function formatARS(amount: number, symbol = '$'): string {
  return `${symbol}${amount.toLocaleString('es-AR')}`;
}
