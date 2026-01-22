"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";

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
  fade = false,
  slideUp = false,
  blurIn = false,
  fadeInOnScroll = false,
  blurToClear = false,
  subtleTranslateY = false,
}: MotionContainerProps) {
  const prefersReducedMotion = useReducedMotion();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 767px)");
    const update = () => setIsMobile(mediaQuery.matches);
    update();
    mediaQuery.addEventListener("change", update);
    return () => mediaQuery.removeEventListener("change", update);
  }, []);

  const shouldAnimate = !prefersReducedMotion && (fade || slideUp || blurIn);
  const shouldScrollAnimate =
    !prefersReducedMotion && !isMobile && (fadeInOnScroll || blurToClear || subtleTranslateY);

  if (!shouldAnimate && !shouldScrollAnimate) {
    return <div className={className}>{children}</div>;
  }

  const baseInitial = {
    opacity: fade ? 0 : 1,
    y: slideUp ? 16 : 0,
    filter: blurIn ? "blur(10px)" : "blur(0px)",
  };

  const baseAnimate = {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
  };

  if (shouldScrollAnimate) {
    const initial = {
      opacity: fadeInOnScroll ? 0 : 1,
      y: subtleTranslateY ? 12 : 0,
      filter: blurToClear ? "blur(10px)" : "blur(0px)",
    };

    const whileInView = {
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
    };

    return (
      <motion.div
        className={className}
        initial={initial}
        whileInView={whileInView}
        viewport={{ amount: 0.25, once: true }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        {/* Motion begins on scroll intersection to stay restrained. */}
        {/* TODO(PASS-5): attach shared scroll timelines for staged storytelling. */}
        {children}
      </motion.div>
    );
  }

  return (
    <motion.div
      className={className}
      initial={baseInitial}
      animate={baseAnimate}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      {/* TODO(PASS-5): connect to scroll-driven timelines. */}
      {children}
    </motion.div>
  );
}
