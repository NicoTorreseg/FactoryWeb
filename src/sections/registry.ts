import React from 'react';
import type { SectionOf, SectionType } from '../domain/tenant.schema';

export interface SectionProps<T extends SectionType> {
  section: SectionOf<T>;
}

type LazySection<T extends SectionType> = React.LazyExoticComponent<
  React.ComponentType<SectionProps<T>>
>;

/**
 * Section registry: `type` -> lazily loaded component.
 * Adding a section = (1) schema in `tenant.schema.ts`, (2) component, (3) one line here.
 * `Record<SectionType, ...>` makes the compiler fail if a schema type has no component.
 */
export const sectionRegistry: { [K in SectionType]: LazySection<K> } = {
  hero: React.lazy(() => import('./HeroSection').then((m) => ({ default: m.HeroSection }))),
  story: React.lazy(() => import('./StorySection').then((m) => ({ default: m.StorySection }))),
  productGrid: React.lazy(() =>
    import('./ProductGridSection').then((m) => ({ default: m.ProductGridSection }))
  ),
  menuList: React.lazy(() =>
    import('./MenuListSection').then((m) => ({ default: m.MenuListSection }))
  ),
  steps: React.lazy(() => import('./StepsSection').then((m) => ({ default: m.StepsSection }))),
  reviews: React.lazy(() =>
    import('./ReviewsSection').then((m) => ({ default: m.ReviewsSection }))
  ),
  location: React.lazy(() =>
    import('./LocationSection').then((m) => ({ default: m.LocationSection }))
  ),
  ctaBand: React.lazy(() =>
    import('./CtaBandSection').then((m) => ({ default: m.CtaBandSection }))
  ),
};
