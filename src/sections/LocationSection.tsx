import React from 'react';
import { Clock, Instagram, MapPin, Truck } from 'lucide-react';
import { DisplayHeading } from '../design/primitives/DisplayHeading';
import { Eyebrow } from '../design/primitives/Eyebrow';
import { SectionShell } from '../design/primitives/SectionShell';
import { buildWhatsAppGreetingUrl } from './cta';
import { LinkButton } from '../design/primitives/Button';
import { useStorefront } from './StorefrontContext';
import type { SectionProps } from './registry';

export const LocationSection: React.FC<SectionProps<'location'>> = ({ section }) => {
  const { tenant } = useStorefront();
  const { brand, commerce } = tenant;

  const rows = [
    { icon: MapPin, label: 'Dónde estamos', value: brand.locationLabel },
    { icon: Clock, label: 'Horarios', value: brand.scheduleLabel },
    { icon: Truck, label: 'Entrega', value: commerce.deliveryTimeEstimate },
  ];

  return (
    <SectionShell id={section.id}>
      <div className="grid gap-12 md:grid-cols-2 md:gap-16">
        <div>
          {section.eyebrow && <Eyebrow className="mb-4">{section.eyebrow}</Eyebrow>}
          {section.title && (
            <DisplayHeading text={section.title} className="text-4xl sm:text-5xl" />
          )}
          <div className="mt-8 flex flex-wrap gap-3">
            <LinkButton
              href={buildWhatsAppGreetingUrl(commerce.whatsappPhone, brand.name)}
              target="_blank"
              rel="noopener noreferrer"
            >
              Escribinos por WhatsApp
            </LinkButton>
            {brand.instagramHandle && (
              <LinkButton
                variant="outline"
                href={`https://instagram.com/${brand.instagramHandle.replace('@', '')}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Instagram className="h-3.5 w-3.5" />
                {brand.instagramHandle}
              </LinkButton>
            )}
          </div>
        </div>

        <dl className="space-y-6">
          {rows.map(({ icon: Icon, label, value }) => (
            <div key={label} className="flex gap-4 border-b border-brand-border pb-6">
              <Icon className="mt-1 h-4 w-4 shrink-0 text-brand-accent" />
              <div>
                <dt className="text-[11px] font-semibold uppercase tracking-[0.2em] text-brand-muted">
                  {label}
                </dt>
                <dd className="mt-1 font-display text-lg">{value}</dd>
              </div>
            </div>
          ))}
        </dl>
      </div>
    </SectionShell>
  );
};
