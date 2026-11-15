import React from 'react';
import { Star } from 'lucide-react';
import { DisplayHeading } from '../design/primitives/DisplayHeading';
import { Eyebrow } from '../design/primitives/Eyebrow';
import { SectionShell } from '../design/primitives/SectionShell';
import { useStorefront } from './StorefrontContext';
import type { SectionProps } from './registry';

export const ReviewsSection: React.FC<SectionProps<'reviews'>> = ({ section }) => {
  const { tenant } = useStorefront();

  return (
    <SectionShell id={section.id} tone="alt">
      <div className="mb-12 flex flex-wrap items-end justify-between gap-6">
        <div className="max-w-2xl">
          {section.eyebrow && <Eyebrow className="mb-4">{section.eyebrow}</Eyebrow>}
          {section.title && (
            <DisplayHeading text={section.title} className="text-4xl sm:text-5xl" />
          )}
        </div>
        <p className="inline-flex items-center gap-2 text-sm text-brand-muted">
          <Star className="h-4 w-4 fill-brand-accent text-brand-accent" />
          <span className="font-semibold text-brand-text">{tenant.brand.ratingScore}</span>·{' '}
          {tenant.brand.reviewsCount} reseñas
        </p>
      </div>

      <div className="grid gap-10 md:grid-cols-3">
        {tenant.reviews.map((review) => (
          <figure key={review.id} className="flex flex-col">
            <span aria-hidden className="font-display text-6xl leading-none text-brand-accent">
              “
            </span>
            <blockquote className="-mt-2 font-display text-lg leading-relaxed">
              {review.text}
            </blockquote>
            <figcaption className="mt-5 text-[11px] font-semibold uppercase tracking-[0.18em] text-brand-muted">
              {review.author} · {review.source}
            </figcaption>
          </figure>
        ))}
      </div>
    </SectionShell>
  );
};
