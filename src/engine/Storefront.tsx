import React, { useMemo } from 'react';
import { CartDrawer } from '../components/CartDrawer';
import { ItemDetailModal } from '../components/ItemDetailModal';
import { useThemeMode } from '../design/ThemeModeContext';
import { CartLineItem, CatalogItem, TenantConfig } from '../domain/tenant.schema';
import { SectionLayout } from '../layouts/SectionLayout';
import { StorefrontContext, StorefrontContextValue } from '../sections/StorefrontContext';
import { EcommerceTemplate } from '../templates/EcommerceTemplate';
import { GastroTemplate } from '../templates/GastroTemplate';
import { ThemeProvider } from './ThemeProvider';

export interface StorefrontProps {
  tenant: TenantConfig;
  lines: CartLineItem[];
  cartCount: number;
  cartSubtotal: number;
  isCartOpen: boolean;
  selectedItem: CatalogItem | null;
  onOpenCart: () => void;
  onCloseCart: () => void;
  onSelectItem: (item: CatalogItem | null) => void;
  onQuickAdd: (item: CatalogItem) => void;
  onAddToCart: (
    item: CatalogItem,
    quantity: number,
    selectedVariants: Record<string, { label: string; priceDelta: number }>,
    notes: string
  ) => void;
  onUpdateQuantity: (lineId: string, delta: number) => void;
  onRemoveLine: (lineId: string) => void;
}

/**
 * Renders one tenant: resolves the effective color mode (tenant default + user choice),
 * publishes design tokens and picks the layout.
 * Must live inside <ThemeModeProvider>.
 */
export const Storefront: React.FC<StorefrontProps> = (props) => {
  const { tenant, lines, isCartOpen, selectedItem } = props;
  const { mode } = useThemeMode();

  // Single source of truth for the mode: every consumer below reads `resolved.theme.mode`.
  const resolved = useMemo<TenantConfig>(
    () => ({ ...tenant, theme: { ...tenant.theme, mode } }),
    [tenant, mode]
  );

  const context = useMemo<StorefrontContextValue>(
    () => ({
      tenant: resolved,
      cartCount: props.cartCount,
      cartSubtotal: props.cartSubtotal,
      onOpenCart: props.onOpenCart,
      onSelectItem: props.onSelectItem,
      onQuickAdd: props.onQuickAdd,
    }),
    [resolved, props.cartCount, props.cartSubtotal, props.onOpenCart, props.onSelectItem, props.onQuickAdd]
  );

  return (
    <StorefrontContext.Provider value={context}>
      <ThemeProvider theme={resolved.theme}>
        {resolved.sections ? (
          <SectionLayout sections={resolved.sections} />
        ) : resolved.templateType === 'ecommerce' ? (
          <EcommerceTemplate
            tenant={resolved}
            cartCount={props.cartCount}
            cartSubtotal={props.cartSubtotal}
            onOpenCart={props.onOpenCart}
            onSelectItem={props.onSelectItem}
            onQuickAdd={props.onQuickAdd}
          />
        ) : (
          <GastroTemplate
            tenant={resolved}
            cartCount={props.cartCount}
            cartSubtotal={props.cartSubtotal}
            onOpenCart={props.onOpenCart}
            onSelectItem={props.onSelectItem}
            onQuickAdd={props.onQuickAdd}
          />
        )}

        <ItemDetailModal
          item={selectedItem}
          tenant={resolved}
          onClose={() => props.onSelectItem(null)}
          onAddToCart={props.onAddToCart}
        />

        <CartDrawer
          isOpen={isCartOpen}
          onClose={props.onCloseCart}
          tenant={resolved}
          lines={lines}
          onUpdateQuantity={props.onUpdateQuantity}
          onRemoveLine={props.onRemoveLine}
        />
      </ThemeProvider>
    </StorefrontContext.Provider>
  );
};
