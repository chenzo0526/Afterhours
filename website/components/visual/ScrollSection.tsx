import type { ReactNode } from "react";
import MotionContainer from "@/components/visual/MotionContainer";

type ScrollSectionProps = {
  children: ReactNode;
  className?: string;
  withContainer?: boolean;
  reveal?: boolean;
};

export default function ScrollSection({
  children,
  className,
  withContainer = true,
  reveal = false,
}: ScrollSectionProps) {
  const content = withContainer ? (
    <div className="container mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
      {children}
    </div>
  ) : (
    <>{children}</>
  );

  return (
    <div
      className={`py-16 sm:py-20 lg:py-24 ${className ?? ""}`.trim()}
      data-scroll-section
    >
      {reveal ? (
        <MotionContainer fadeInOnScroll subtleTranslateY>
          {content}
        </MotionContainer>
      ) : (
        content
      )}
    </div>
  );
}
