import React from 'react';

interface DisplayHeadingProps {
  /** Plain text with optional `*accent*` spans, e.g. "Recetas que pasan *de mano en mano*". */
  text: string;
  as?: 'h1' | 'h2' | 'h3';
  className?: string;
  /** Accent color class for the italic spans (defaults to the brand accent). */
  accentClassName?: string;
}

const ACCENT_PATTERN = /(\*[^*]+\*)/g;

/**
 * Editorial heading. Parses `*accent*` into italic accent-colored `<em>` nodes.
 * Pure string tokenizer: never injects HTML, so tenant JSON cannot inject markup.
 */
export const DisplayHeading: React.FC<DisplayHeadingProps> = ({
  text,
  as: Tag = 'h2',
  className = '',
  accentClassName = 'text-brand-accent',
}) => (
  <Tag
    className={`font-display font-medium leading-[1.08] tracking-tight text-balance ${className}`}
  >
    {text.split(ACCENT_PATTERN).map((part, index) =>
      part.startsWith('*') && part.endsWith('*') && part.length > 2 ? (
        <em key={index} className={`font-normal italic ${accentClassName}`}>
          {part.slice(1, -1)}
        </em>
      ) : (
        <React.Fragment key={index}>{part}</React.Fragment>
      )
    )}
  </Tag>
);
