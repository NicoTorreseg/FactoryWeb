import { useCallback } from 'react';
import type { SectionCta } from '../domain/tenant.schema';
import { useStorefront } from './StorefrontContext';

export const CATALOG_ANCHOR_ID = 'catalog';

export function buildWhatsAppGreetingUrl(phone: string, brandName: string): string {
  const text = encodeURIComponent(`Hola ${brandName}! Tengo una consulta.`);
  return `https://wa.me/${phone}?text=${text}`;
}

/** Resolves a declarative CTA action from the tenant JSON into behavior. */
export function useCtaAction(): (action: SectionCta['action']) => void {
  const { tenant, onOpenCart } = useStorefront();

  return useCallback(
    (action) => {
      switch (action) {
        case 'catalog':
          document
            .getElementById(CATALOG_ANCHOR_ID)
            ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
          break;
        case 'cart':
          onOpenCart();
          break;
        case 'whatsapp':
          window.open(
            buildWhatsAppGreetingUrl(tenant.commerce.whatsappPhone, tenant.brand.name),
            '_blank',
            'noopener,noreferrer'
          );
          break;
      }
    },
    [tenant, onOpenCart]
  );
}
