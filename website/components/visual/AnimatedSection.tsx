import type { ReactNode } from "react";
import MotionContainer from "@/components/visual/MotionContainer";

type AnimatedSectionProps = {
  children: ReactNode;
  className?: string;
};

export default function AnimatedSection({
  children,
  className,
}: AnimatedSectionProps) {
  return (
    <MotionContainer
      className={className}
      fadeInOnScroll
      subtleTranslateY
    >
      {children}
    </MotionContainer>
  );
}
