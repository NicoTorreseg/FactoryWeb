import React from 'react';
import { Clock, MapPin } from 'lucide-react';
import { Button } from '../design/primitives/Button';
import { DisplayHeading } from '../design/primitives/DisplayHeading';
import { useCtaAction } from './cta';
import { useStorefront } from './StorefrontContext';
import type { SectionProps } from './registry';

/** Full-bleed photo hero. Text is always light because it sits on a dark photographic overlay. */
export const HeroSection: React.FC<SectionProps<'hero'>> = ({ section }) => {
  const { tenant } = useStorefront();
  const runCta = useCtaAction();
  const image = section.imageUrl ?? tenant.brand.heroBannerUrl;

  return (
    <section className="relative flex min-h-[88svh] flex-col justify-end overflow-hidden bg-zinc-950 text-white">
      <img
        src={image}
        alt=""
        // React 18 only forwards the lowercase attribute; it hints the LCP image to the browser.
        {...{ fetchpriority: 'high' }}
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/55 to-black/25" />

      <div className="relative mx-auto w-full max-w-6xl px-5 pb-10 pt-32 sm:px-8 md:pb-16">
        {section.eyebrow && (
          <p className="mb-5 text-[11px] font-semibold uppercase tracking-[0.3em] text-white/75">
            {section.eyebrow}
          </p>
        )}

        <DisplayHeading
          as="h1"
          text={section.headline}
          className="max-w-3xl text-[2.6rem] sm:text-6xl md:text-7xl"
          accentClassName="text-amber-300"
        />

        {section.tagline && (
          <p className="mt-5 font-script text-2xl text-amber-200 sm:text-3xl">{section.tagline}</p>
        )}

        {section.ctas.length > 0 && (
          <div className="mt-8 flex flex-wrap gap-3">
            {section.ctas.map((cta) => (
              <Button
                key={cta.label}
                variant={cta.variant === 'primary' ? 'ghost-light' : 'outline-light'}
                onClick={() => runCta(cta.action)}
              >
                {cta.label}
              </Button>
            ))}
          </div>
        )}

        <div className="mt-12 flex flex-wrap gap-x-8 gap-y-2 border-t border-white/20 pt-5 text-xs text-white/80">
          <span className="inline-flex items-center gap-2">
            <MapPin className="h-3.5 w-3.5" />
            {tenant.brand.locationLabel}
          </span>
          <span className="inline-flex items-center gap-2">
            <Clock className="h-3.5 w-3.5" />
            {tenant.brand.scheduleLabel}
          </span>
        </div>
      </div>
    </section>
  );
};
