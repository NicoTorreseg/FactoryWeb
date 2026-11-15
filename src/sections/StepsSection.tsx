import React from 'react';
import { DisplayHeading } from '../design/primitives/DisplayHeading';
import { Eyebrow } from '../design/primitives/Eyebrow';
import { SectionShell } from '../design/primitives/SectionShell';
import type { SectionProps } from './registry';

export const StepsSection: React.FC<SectionProps<'steps'>> = ({ section }) => (
  <SectionShell id={section.id}>
    <div className="mb-14 max-w-2xl">
      {section.eyebrow && <Eyebrow className="mb-4">{section.eyebrow}</Eyebrow>}
      <DisplayHeading text={section.title} className="text-4xl sm:text-5xl" />
    </div>

    <ol className="grid gap-10 md:grid-cols-3">
      {section.steps.map((step, index) => (
        <li key={step.title} className="border-t border-brand-border pt-6">
          <span className="font-display text-5xl font-light italic text-brand-accent">
            {String(index + 1).padStart(2, '0')}
          </span>
          <h3 className="mt-4 font-display text-xl font-medium">{step.title}</h3>
          <p className="mt-2 text-sm leading-relaxed text-brand-muted">{step.text}</p>
        </li>
      ))}
    </ol>
  </SectionShell>
);
