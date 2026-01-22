type ProofProps = {
  body: string;
  title?: string;
};

export default function Proof({ body, title = "Proof" }: ProofProps) {
  return (
    <div className="rounded-2xl border border-border bg-card/70 p-6 shadow-sm">
      <p className="text-xs uppercase tracking-[0.2em] text-sky-400">{title}</p>
      <p className="mt-4 text-base text-muted-foreground">{body}</p>
      <div className="mt-6 grid gap-3 text-xs text-muted-foreground sm:grid-cols-3">
        {["Clean summaries", "Clear routing", "Reliable coverage"].map((item) => (
          <div key={item} className="rounded-xl border border-border bg-background/60 p-3">
            {item}
          </div>
        ))}
      </div>
    </div>
  );
}
