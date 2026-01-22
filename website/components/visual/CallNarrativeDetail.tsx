type CallNarrativeDetailProps = {
  label: string;
  value: string;
  tone?: "default" | "muted" | "urgent";
  className?: string;
};

const toneStyles: Record<NonNullable<CallNarrativeDetailProps["tone"]>, string> = {
  default: "border-white/10 bg-white/5 text-white/85",
  muted: "border-white/5 bg-white/3 text-white/50",
  urgent: "border-red-400/30 bg-red-500/10 text-red-200",
};

export default function CallNarrativeDetail({
  label,
  value,
  tone = "default",
  className,
}: CallNarrativeDetailProps) {
  return (
    <div
      className={`rounded-xl border px-3 py-2 text-[11px] uppercase tracking-[0.2em] ${toneStyles[tone]} ${
        className ?? ""
      }`}
    >
      <div className="text-[10px] text-white/40">{label}</div>
      <div className="mt-1 text-xs font-semibold normal-case tracking-normal">{value}</div>
    </div>
  );
}
