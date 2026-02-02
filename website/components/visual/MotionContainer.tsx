'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';

type MotionContainerProps = {
  children: ReactNode;
  className?: string;
  fade?: boolean;
  slideUp?: boolean;
  blurIn?: boolean;
  fadeInOnScroll?: boolean;
  blurToClear?: boolean;
  subtleTranslateY?: boolean;
};

export default function MotionContainer({
  children,
  className,
  fadeInOnScroll,
  subtleTranslateY,
  blurIn,
  blurToClear,
}: MotionContainerProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const useScrollFade = Boolean(fadeInOnScroll || subtleTranslateY || blurIn || blurToClear);

  useEffect(() => {
    if (!useScrollFade || !ref.current) return;
    const el = ref.current;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) setVisible(true);
      },
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [useScrollFade]);

  const scrollFadeClass = useScrollFade
    ? `motion-scroll-fade ${visible ? 'motion-scroll-fade-visible' : ''}`
    : '';

  return (
    <div ref={ref} className={[className, scrollFadeClass].filter(Boolean).join(' ')}>
      {children}
    </div>
  );
}
