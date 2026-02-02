type CallNarrativeDetailProps = {
  label: string;
  value: string;
  tone?: "default" | "muted" | "urgent";
  className?: string;
};

const toneStyles: Record<NonNullable<CallNarrativeDetailProps["tone"]>, string> = {
  default: "border-foreground/10 bg-foreground/5 text-foreground/85",
  muted: "border-foreground/5 bg-foreground/3 text-muted-foreground",
  urgent: "border-destructive/30 bg-destructive/10 text-destructive-foreground",
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
      <div className="text-[10px] text-muted-foreground/60">{label}</div>
      <div className="mt-1 text-xs font-semibold normal-case tracking-normal">{value}</div>
    </div>
  );
}
