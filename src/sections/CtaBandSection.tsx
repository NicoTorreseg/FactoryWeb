import React from 'react';
import { Button } from '../design/primitives/Button';
import { DisplayHeading } from '../design/primitives/DisplayHeading';
import { SectionShell } from '../design/primitives/SectionShell';
import { useCtaAction } from './cta';
import type { SectionProps } from './registry';

export const CtaBandSection: React.FC<SectionProps<'ctaBand'>> = ({ section }) => {
  const runCta = useCtaAction();

  return (
    <SectionShell id={section.id} tone="alt">
      <div className="mx-auto max-w-3xl text-center">
        <DisplayHeading text={section.headline} className="text-4xl sm:text-5xl" />
        <div className="mt-8 flex justify-center">
          <Button onClick={() => runCta('whatsapp')}>{section.ctaLabel}</Button>
        </div>
      </div>
    </SectionShell>
  );
};
