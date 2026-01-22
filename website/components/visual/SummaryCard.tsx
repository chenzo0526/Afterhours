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
      className={`rounded-2xl border border-white/10 bg-slate-900/90 p-6 text-sm text-white shadow-[0_12px_30px_rgba(0,0,0,0.35)] ${
        className ?? ""
      }`}
    >
      <div className="flex items-center justify-between text-xs uppercase tracking-[0.2em] text-white/50">
        <span>Afterhours Summary</span>
        <span>Inbound</span>
      </div>
      <div className="mt-5 space-y-3 text-white/80">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-white/50">Caller</p>
          <p className="mt-1 text-base font-semibold text-white">{caller}</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-white/50">Issue</p>
          <p className="mt-1 text-white/90">{issue}</p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-white/50">Urgency</p>
            <p className="mt-1 text-white/90">{urgency}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-white/50">Address</p>
            <p className="mt-1 text-white/90">{address}</p>
          </div>
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-white/50">Next action</p>
          <p className="mt-1 text-white/90">{nextAction}</p>
        </div>
      </div>
    </div>
  );
}
