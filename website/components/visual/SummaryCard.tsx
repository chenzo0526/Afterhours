type SummaryCardProps = {
  caller: string;
  issue: string;
  urgency: string;
  address: string;
  nextAction: string;
  className?: string;
};

export default function SummaryCard({
  caller,
  issue,
  urgency,
  address,
  nextAction,
  className,
}: SummaryCardProps) {
  return (
    <div
      className={`rounded-xl border border-foreground/10 bg-card/90 p-6 text-sm text-foreground shadow-[0_12px_30px_rgba(0,0,0,0.35)] ${
        className ?? ""
      }`}
    >
      <div className="flex items-center justify-between text-xs uppercase tracking-[0.2em] text-muted-foreground">
        <span>Afterhours Summary</span>
        <span>Inbound</span>
      </div>
      <div className="mt-5 space-y-3 text-foreground/80">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Caller</p>
          <p className="mt-1 text-base font-semibold text-foreground">{caller}</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Issue</p>
          <p className="mt-1 text-foreground/90">{issue}</p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Urgency</p>
            <p className="mt-1 text-foreground/90">{urgency}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Address</p>
            <p className="mt-1 text-foreground/90">{address}</p>
          </div>
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Next action</p>
          <p className="mt-1 text-foreground/90">{nextAction}</p>
        </div>
      </div>
    </div>
  );
}
