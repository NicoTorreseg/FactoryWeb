import React, { useEffect, useRef, useState } from 'react';

interface RevealProps {
  className?: string;
  children: React.ReactNode;
}

/**
 * Fades content in when it enters the viewport (CSS transition, ~25 lines of JS, no library).
 * Falls back to visible when IntersectionObserver is unavailable; reduced motion is handled in CSS.
 */
export const Reveal: React.FC<RevealProps> = ({ className = '', children }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node || typeof IntersectionObserver === 'undefined') {
      setVisible(true);
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.12 }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} data-visible={visible} className={`reveal ${className}`}>
      {children}
    </div>
  );
};
