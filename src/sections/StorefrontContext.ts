import { createContext, useContext } from 'react';
import type { CatalogItem, TenantConfig } from '../domain/tenant.schema';

/** Everything a section needs from the storefront, without prop drilling. */
export interface StorefrontContextValue {
  tenant: TenantConfig;
  cartCount: number;
  cartSubtotal: number;
  onOpenCart: () => void;
  onSelectItem: (item: CatalogItem) => void;
  onQuickAdd: (item: CatalogItem) => void;
}

export const StorefrontContext = createContext<StorefrontContextValue | null>(null);

export function useStorefront(): StorefrontContextValue {
  const ctx = useContext(StorefrontContext);
  if (!ctx) throw new Error('useStorefront must be used inside <StorefrontContext.Provider>');
  return ctx;
}
