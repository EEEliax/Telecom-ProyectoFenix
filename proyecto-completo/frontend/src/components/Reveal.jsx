import { useEffect, useRef, useState } from 'react';

/**
 * Reveal — scroll-triggered fade-in-up animation via IntersectionObserver.
 * Mirrors the reveal.tsx component from diseño-v0.
 */
export default function Reveal({ children, className = '', delay = 0, as: Tag = 'div' }) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.15 }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <Tag
      ref={ref}
      style={{ animationDelay: `${delay}ms` }}
      className={`reveal${visible ? ' is-visible' : ''}${className ? ' ' + className : ''}`}
    >
      {children}
    </Tag>
  );
}
