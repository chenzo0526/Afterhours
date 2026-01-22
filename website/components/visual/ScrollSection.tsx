import type { ReactNode } from "react";

type ScrollSectionProps = {
  children: ReactNode;
  className?: string;
  withContainer?: boolean;
};

export default function ScrollSection({
  children,
  className,
  withContainer = true,
}: ScrollSectionProps) {
  const content = withContainer ? (
    <div className="container mx-auto px-6">{children}</div>
  ) : (
    <>{children}</>
  );

  return (
    <div className={`py-14 sm:py-16 lg:py-20 ${className ?? ""}`} data-scroll-section>
      {/* TODO(PASS-4): add scroll transition hooks here. */}
      {content}
    </div>
  );
}
