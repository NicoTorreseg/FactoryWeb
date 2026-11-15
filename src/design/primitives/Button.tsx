import React from 'react';

type ButtonVariant = 'primary' | 'outline' | 'ghost-light' | 'outline-light';

interface CommonProps {
  variant?: ButtonVariant;
  className?: string;
  children: React.ReactNode;
}

type ButtonProps = CommonProps & React.ButtonHTMLAttributes<HTMLButtonElement>;
type LinkButtonProps = CommonProps & React.AnchorHTMLAttributes<HTMLAnchorElement>;

const BASE =
  'inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-[11px] font-bold uppercase tracking-[0.2em] transition duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-accent';

const VARIANTS: Record<ButtonVariant, string> = {
  primary: 'bg-brand-primary text-brand-on-primary hover:opacity-90',
  outline:
    'border border-brand-text/40 text-brand-text hover:border-brand-text hover:bg-brand-text/5',
  /** For use over dark photography (always light text, regardless of color mode). */
  'ghost-light': 'bg-white text-zinc-900 hover:bg-white/90',
  'outline-light': 'border border-white/60 text-white hover:border-white hover:bg-white/10',
};

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  className = '',
  children,
  ...rest
}) => (
  <button type="button" className={`${BASE} ${VARIANTS[variant]} ${className}`} {...rest}>
    {children}
  </button>
);

export const LinkButton: React.FC<LinkButtonProps> = ({
  variant = 'primary',
  className = '',
  children,
  ...rest
}) => (
  <a className={`${BASE} ${VARIANTS[variant]} ${className}`} {...rest}>
    {children}
  </a>
);
