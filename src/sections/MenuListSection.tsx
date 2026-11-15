import React from 'react';
import { DisplayHeading } from '../design/primitives/DisplayHeading';
import { Eyebrow } from '../design/primitives/Eyebrow';
import { SectionShell } from '../design/primitives/SectionShell';
import { formatARS } from '../domain/pricing';
import { CATALOG_ANCHOR_ID } from './cta';
import { useStorefront } from './StorefrontContext';
import type { SectionProps } from './registry';

/** Editorial menu: category headings, two columns, dotted leaders between name and price. */
export const MenuListSection: React.FC<SectionProps<'menuList'>> = ({ section }) => {
  const { tenant, onSelectItem, onQuickAdd } = useStorefront();
  const sym = tenant.commerce.currencySymbol;

  const categories = tenant.categories.filter(
    (c) => !section.categoryIds || section.categoryIds.includes(c.id)
  );

  return (
    <SectionShell id={section.id ?? CATALOG_ANCHOR_ID}>
      <div className="mb-12 max-w-2xl">
        {section.eyebrow && <Eyebrow className="mb-4">{section.eyebrow}</Eyebrow>}
        {section.title && (
          <DisplayHeading text={section.title} className="text-4xl sm:text-5xl" />
        )}
      </div>

      <div className="space-y-14">
        {categories.map((category) => {
          const items = tenant.items.filter((item) => item.categoryId === category.id);
          if (items.length === 0) return null;

          return (
            <div key={category.id}>
              <h3 className="mb-6 font-script text-3xl text-brand-accent">{category.name}</h3>
              <ul className="grid gap-x-14 gap-y-7 md:grid-cols-2">
                {items.map((item) => (
                  <li key={item.id}>
                    <button
                      type="button"
                      onClick={() =>
                        item.variants.length > 0 ? onSelectItem(item) : onQuickAdd(item)
                      }
                      className="group block w-full text-left"
                    >
                      <span className="flex items-baseline gap-3">
                        <span className="font-display text-lg font-medium group-hover:text-brand-accent">
                          {item.title}
                        </span>
                        <span
                          aria-hidden
                          className="min-w-4 flex-1 translate-y-[-3px] border-b border-dotted border-brand-border"
                        />
                        <span className="font-display text-lg">{formatARS(item.price, sym)}</span>
                      </span>
                      <span className="mt-1 block text-sm leading-relaxed text-brand-muted">
                        {item.description}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </SectionShell>
  );
};
