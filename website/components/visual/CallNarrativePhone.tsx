import type { ReactNode } from "react";

type CallNarrativePhoneProps = {
  children: ReactNode;
  className?: string;
};

export default function CallNarrativePhone({ children, className }: CallNarrativePhoneProps) {
  return (
    <div className={`relative mx-auto w-full max-w-sm ${className ?? ""}`}>
      <div className="relative rounded-xl border border-foreground/10 bg-card/80 p-2 shadow-[0_24px_60px_rgba(0,0,0,0.45)]">
        <div className="absolute left-1/2 top-3 h-1 w-16 -translate-x-1/2 rounded-full bg-foreground/10" />
        <div className="relative aspect-[9/19] w-full overflow-hidden rounded-xl border border-foreground/5 bg-background/80 p-4">
          {children}
        </div>
      </div>
    </div>
  );
}
