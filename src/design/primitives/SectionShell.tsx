import React from 'react';
import { Reveal } from './Reveal';

interface SectionShellProps {
  id?: string;
  /** `alt` paints the secondary surface to create rhythm between sections. */
  tone?: 'base' | 'alt';
  className?: string;
  children: React.ReactNode;
}

/** Common vertical rhythm + max width for every section. */
export const SectionShell: React.FC<SectionShellProps> = ({
  id,
  tone = 'base',
  className = '',
  children,
}) => (
  <section
    id={id}
    className={`scroll-mt-16 px-5 py-20 sm:px-8 md:py-28 ${
      tone === 'alt' ? 'bg-brand-surface-alt' : ''
    } ${className}`}
  >
    <Reveal className="mx-auto max-w-6xl">{children}</Reveal>
  </section>
);
