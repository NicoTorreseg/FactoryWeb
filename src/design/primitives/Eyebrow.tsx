import React from 'react';

interface EyebrowProps {
  children: React.ReactNode;
  className?: string;
}

/** Small uppercase kicker above headings ("HIPÓDROMO CONDESA · CDMX"). */
export const Eyebrow: React.FC<EyebrowProps> = ({ children, className = '' }) => (
  <p
    className={`text-[11px] font-semibold uppercase tracking-[0.28em] text-brand-muted ${className}`}
  >
    {children}
  </p>
);
