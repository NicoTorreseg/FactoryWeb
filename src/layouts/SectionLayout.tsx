import React from 'react';
import { ShoppingBag } from 'lucide-react';
import { Button } from '../design/primitives/Button';
import { ThemeToggle } from '../design/primitives/ThemeToggle';
import { formatARS } from '../domain/pricing';
import type { Section } from '../domain/tenant.schema';
import { SectionRenderer } from '../sections/SectionRenderer';
import { useStorefront } from '../sections/StorefrontContext';

interface SectionLayoutProps {
  sections: Section[];
}

/** Header + declarative sections + footer. Used by every tenant that defines `sections`. */
export const SectionLayout: React.FC<SectionLayoutProps> = ({ sections }) => {
  const { tenant, cartCount, cartSubtotal, onOpenCart } = useStorefront();
  const sym = tenant.commerce.currencySymbol;

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-30 border-b border-brand-border/70 bg-brand-surface/85 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-5 py-3 sm:px-8">
          <span className="font-display text-xl font-semibold tracking-tight sm:text-2xl">
            {tenant.brand.logoText}
          </span>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button variant="outline" onClick={onOpenCart} className="!px-4 !py-2.5">
              <ShoppingBag className="h-3.5 w-3.5" />
              Pedido
              <span className="rounded-full bg-brand-primary px-1.5 py-0.5 text-[10px] text-brand-on-primary">
                {cartCount}
              </span>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <SectionRenderer sections={sections} />
      </main>

      <footer className="border-t border-brand-border px-5 py-10 text-center sm:px-8">
        <p className="font-display text-lg">{tenant.brand.name}</p>
        <p className="mx-auto mt-1 max-w-md text-xs text-brand-muted">{tenant.brand.tagline}</p>
      </footer>

      {cartCount > 0 && (
        <div className="fixed inset-x-4 bottom-4 z-30 mx-auto max-w-xl sm:hidden">
          <button
            type="button"
            onClick={onOpenCart}
            className="flex w-full items-center justify-between rounded-full bg-brand-primary px-6 py-4 text-xs font-bold uppercase tracking-[0.16em] text-brand-on-primary shadow-2xl"
          >
            <span>Ver pedido ({cartCount})</span>
            <span>{formatARS(cartSubtotal, sym)}</span>
          </button>
        </div>
      )}
    </div>
  );
};
