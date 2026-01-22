import type { ReactNode } from "react";

type SectionTone = "default" | "muted" | "soft";
type SectionAlign = "left" | "center";

type SectionProps = {
  title?: string;
  kicker?: string;
  tone?: SectionTone;
  align?: SectionAlign;
  children: ReactNode;
};

const toneStyles: Record<SectionTone, string> = {
  default: "bg-background",
  muted: "bg-muted/30",
  soft: "bg-card/60",
};

export default function Section({
  title,
  kicker,
  tone = "default",
  align = "left",
  children,
}: SectionProps) {
  const alignment = align === "center" ? "text-center" : "text-left";

  return (
    <section className={`border-b border-border ${toneStyles[tone]}`}>
      <div className="container mx-auto px-6 py-14 sm:py-16 lg:py-20">
        {(title || kicker) && (
          <div className={`motion-fade ${alignment}`}>
            {kicker ? (
              <p className="text-xs uppercase tracking-[0.2em] text-sky-400">{kicker}</p>
            ) : null}
            {title ? (
              <h2 className="mt-3 text-2xl font-semibold leading-tight sm:text-3xl">{title}</h2>
            ) : null}
          </div>
        )}
        <div className={`mt-8 motion-fade ${alignment}`}>{children}</div>
      </div>
    </section>
  );
}
