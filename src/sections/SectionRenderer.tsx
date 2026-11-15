import React, { Suspense } from 'react';
import type { Section } from '../domain/tenant.schema';
import { sectionRegistry } from './registry';

/** Component shape shared by every registry entry once the discriminant is erased. */
type AnySectionComponent = React.ComponentType<{ section: Section }>;

/**
 * The single place where the registry's per-type generics are erased. It is sound because
 * `section.type` selects the matching component and the schema guarantees the payload shape.
 */
function resolveComponent(section: Section): AnySectionComponent {
  return sectionRegistry[section.type] as unknown as AnySectionComponent;
}

interface SectionRendererProps {
  sections: Section[];
}

export const SectionRenderer: React.FC<SectionRendererProps> = ({ sections }) => (
  <>
    {sections.map((section, index) => {
      const Component = resolveComponent(section);
      return (
        <Suspense key={`${section.type}-${index}`} fallback={<div className="min-h-[40vh]" />}>
          <Component section={section} />
        </Suspense>
      );
    })}
  </>
);
