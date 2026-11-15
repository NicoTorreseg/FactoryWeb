import React from 'react';
import { DisplayHeading } from '../design/primitives/DisplayHeading';
import { Eyebrow } from '../design/primitives/Eyebrow';
import { SectionShell } from '../design/primitives/SectionShell';
import type { SectionProps } from './registry';

export const StorySection: React.FC<SectionProps<'story'>> = ({ section }) => {
  const framed = section.variant === 'framed';

  return (
    <SectionShell id={section.id}>
      <div className="grid items-center gap-12 md:grid-cols-12 md:gap-16">
        <div className="md:col-span-7">
          {section.eyebrow && <Eyebrow className="mb-5">{section.eyebrow}</Eyebrow>}
          <DisplayHeading text={section.headline} className="text-4xl sm:text-5xl" />

          <div className="mt-8 space-y-4 text-[15px] leading-relaxed text-brand-muted">
            {section.body.map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
          </div>

          {section.signature && (
            <p className="mt-8 font-script text-2xl text-brand-accent">{section.signature}</p>
          )}
        </div>

        <div className="md:col-span-5">
          <figure
            className={
              framed
                ? 'rotate-1 rounded-sm border border-brand-border bg-brand-card p-3 shadow-[0_18px_40px_-18px_rgb(0_0_0/0.45)] transition-transform duration-500 hover:rotate-0'
                : 'overflow-hidden rounded-brand'
            }
          >
            <img
              src={section.imageUrl}
              alt=""
              loading="lazy"
              className="aspect-[4/5] w-full object-cover"
            />
          </figure>
        </div>
      </div>
    </SectionShell>
  );
};
