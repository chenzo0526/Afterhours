import type { ReactNode } from "react";

type CallNarrativePhoneProps = {
  children: ReactNode;
  className?: string;
};

export default function CallNarrativePhone({ children, className }: CallNarrativePhoneProps) {
  return (
    <div className={`relative mx-auto w-full max-w-sm ${className ?? ""}`}>
      <div className="relative rounded-[32px] border border-white/10 bg-slate-900/80 p-2 shadow-[0_24px_60px_rgba(0,0,0,0.45)]">
        <div className="absolute left-1/2 top-3 h-1 w-16 -translate-x-1/2 rounded-full bg-white/10" />
        <div className="relative aspect-[9/19] w-full overflow-hidden rounded-[26px] border border-white/5 bg-slate-950/80 p-4">
          {children}
        </div>
      </div>
    </div>
  );
}
