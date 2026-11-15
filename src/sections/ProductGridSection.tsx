import React, { useMemo, useState } from 'react';
import { DisplayHeading } from '../design/primitives/DisplayHeading';
import { Eyebrow } from '../design/primitives/Eyebrow';
import { SectionShell } from '../design/primitives/SectionShell';
import { calculatePlatformSavings, formatARS } from '../domain/pricing';
import { CATALOG_ANCHOR_ID } from './cta';
import { useStorefront } from './StorefrontContext';
import type { SectionProps } from './registry';

export const ProductGridSection: React.FC<SectionProps<'productGrid'>> = ({ section }) => {
  const { tenant, onSelectItem, onQuickAdd } = useStorefront();
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const sym = tenant.commerce.currencySymbol;

  const categories = useMemo(
    () =>
      tenant.categories.filter(
        (c) => !section.categoryIds || section.categoryIds.includes(c.id)
      ),
    [tenant.categories, section.categoryIds]
  );

  const items = useMemo(() => {
    const allowed = new Set(categories.map((c) => c.id));
    return tenant.items.filter(
      (item) =>
        allowed.has(item.categoryId) &&
        (activeCategory === 'all' || item.categoryId === activeCategory)
    );
  }, [tenant.items, categories, activeCategory]);

  return (
    <SectionShell id={section.id ?? CATALOG_ANCHOR_ID} tone="alt">
      <div className="mb-10 max-w-2xl">
        {section.eyebrow && <Eyebrow className="mb-4">{section.eyebrow}</Eyebrow>}
        {section.title && (
          <DisplayHeading text={section.title} className="text-4xl sm:text-5xl" />
        )}
      </div>

      {categories.length > 1 && (
        <div className="no-scrollbar mb-10 flex gap-2 overflow-x-auto" role="tablist">
          {[{ id: 'all', name: 'Todo' }, ...categories].map((cat) => {
            const active = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setActiveCategory(cat.id)}
                className={`shrink-0 rounded-full border px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.16em] transition ${
                  active
                    ? 'border-brand-primary bg-brand-primary text-brand-on-primary'
                    : 'border-brand-border text-brand-muted hover:border-brand-text/40 hover:text-brand-text'
                }`}
              >
                {cat.name}
              </button>
            );
          })}
        </div>
      )}

      <div className="grid grid-cols-1 gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => {
          const savings = calculatePlatformSavings(item);
          const hasVariants = item.variants.length > 0;

          return (
            <article key={item.id} className="group flex flex-col">
              <button
                type="button"
                onClick={() => onSelectItem(item)}
                className="relative block overflow-hidden rounded-brand bg-brand-card text-left"
                aria-label={`Ver ${item.title}`}
              >
                <img
                  src={item.images[0]}
                  alt={item.title}
                  loading="lazy"
                  className="aspect-[4/5] w-full object-cover transition duration-700 group-hover:scale-[1.04]"
                />
                {item.badge && (
                  <span className="absolute left-3 top-3 rounded-full bg-brand-surface/90 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-brand-text backdrop-blur">
                    {item.badge}
                  </span>
                )}
              </button>

              <div className="mt-5 flex flex-1 flex-col">
                {item.stockLabel && <Eyebrow className="mb-2">{item.stockLabel}</Eyebrow>}
                <h3 className="font-display text-xl font-medium leading-snug">{item.title}</h3>
                <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-brand-muted">
                  {item.description}
                </p>

                <div className="mt-5 flex items-end justify-between gap-4 border-t border-brand-border pt-4">
                  <div>
                    {savings.hasPlatformComparison && (
                      <p className="text-[11px] text-brand-muted">
                        En {tenant.platformComparison.platformName}{' '}
                        <span className="line-through">
                          {formatARS(savings.platformPrice, sym)}
                        </span>{' '}
                        <span className="font-semibold text-brand-accent">
                          −{savings.percentSaved}%
                        </span>
                      </p>
                    )}
                    <p className="font-display text-2xl">{formatARS(item.price, sym)}</p>
                  </div>

                  <button
                    type="button"
                    onClick={() => (hasVariants ? onSelectItem(item) : onQuickAdd(item))}
                    className="rounded-full border border-brand-text/40 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.16em] transition hover:border-brand-primary hover:bg-brand-primary hover:text-brand-on-primary"
                  >
                    {hasVariants ? 'Elegir' : 'Agregar'}
                  </button>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </SectionShell>
  );
};
