import StartTrialButton from '@/components/StartTrialButton';
import {
  Check,
  Headphones,
  MessageSquareText,
  PhoneCall,
  Sparkles,
  Zap,
} from 'lucide-react';

type StatusKey = 'miss' | 'some' | 'covered';

const statusCopy: Record<StatusKey, string> = {
  miss: 'If your phone rings after hours and no one answers, you can miss the details.',
  some: 'If your phone rings after hours and no one answers, you can miss the details.',
  covered: 'If your phone rings after hours and no one answers, you can miss the details.',
};

const statusOptions = new Set<StatusKey>(['miss', 'some', 'covered']);

export default function StartPage({
  searchParams,
}: {
  searchParams?: { status?: string };
}) {
  const rawStatus = searchParams?.status?.toLowerCase() ?? '';
  const status = statusOptions.has(rawStatus as StatusKey) ? (rawStatus as StatusKey) : 'miss';
  const subheadline = statusCopy[status];

  return (
    <div className="bg-background text-foreground">
      <section className="relative overflow-hidden border-b border-border">
        <div className="container mx-auto px-6 py-16 sm:py-20 lg:py-24">
          <div className="grid gap-12 lg:grid-cols-[1.15fr_0.85fr] items-center">
            <div>
              <div className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-sky-400">
                <Sparkles className="h-4 w-4" />
                Live Trial
              </div>
              <h1 className="mt-4 text-4xl font-semibold leading-tight sm:text-5xl">
                Your phone rings after hours. When calls are forwarded, we capture details and notify your on-call contact.
              </h1>
              <p className="mt-4 text-lg text-muted-foreground sm:text-xl">{subheadline}</p>
              <ul className="mt-6 space-y-3 text-sm text-muted-foreground sm:text-base">
                {[
                  'Handle after-hours and overflow calls when forwarded',
                  'Capture job details, urgency, and callback preference when shared',
                  'Send a text summary to your on-call contact after the call (carrier delivery applies)',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <Check className="mt-0.5 h-5 w-5 text-sky-400" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-8 flex flex-col items-start gap-3">
                <StartTrialButton className="inline-flex items-center justify-center rounded-full bg-sky-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-sky-400">
                  Start Live Trial
                </StartTrialButton>
                <span className="text-xs text-muted-foreground">
                  No setup fee. You decide whether to continue after the trial.
                </span>
                <span className="text-xs text-muted-foreground">
                  Afterhours answers after-hours and overflow calls, collects essential details, and notifies your on-call contact. We do not dispatch or promise arrival times.
                </span>
                <span className="text-xs text-muted-foreground">
                  If this is a life-safety emergency, callers should hang up and call 911.
                </span>
              </div>
              <div className="mt-6 w-full rounded-2xl border border-border bg-card/70 p-5">
                <p className="text-sm font-semibold text-foreground">What the live trial includes</p>
                <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                  {[
                    'We take after-hours or overflow calls that you forward',
                    'A text summary is sent with job details + urgency (carrier delivery applies)',
                    'One simple handoff (sent to one phone number or email)',
                    'No auto-billing — you decide whether to continue',
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-3">
                      <Check className="mt-0.5 h-4 w-4 text-sky-400" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                <p className="mt-4 text-sm text-muted-foreground">
                  Multi-recipient notifications and advanced rules can be added after the trial.
                </p>
              </div>
            </div>
          </div>
          <div className="mx-auto mt-10 max-w-2xl rounded-2xl border border-border bg-card/70 p-6 shadow-xl shadow-black/20">
            <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <Headphones className="h-5 w-5 text-sky-400" />
              Hear a short sample of what callers hear
            </div>
            <audio className="mt-4 w-full" controls preload="none">
              <source src="/audio/retell-agent-19.m4a" type="audio/mp4" />
              Your browser does not support the audio element.
            </audio>
            <div className="mt-6 rounded-xl border border-border bg-muted/40 p-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-2 text-foreground">
                <MessageSquareText className="h-4 w-4 text-sky-400" />
                Live summary preview
              </div>
              <p className="mt-2">
                "Caller: kitchen sink overflow. Requests a callback when available. Address: Oak Ridge Dr.
                Urgency: high. Callback requested."
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-border bg-muted/30">
        <div className="container mx-auto px-6 py-6">
          <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            {['HVAC', 'Plumbing', 'Electrical', 'Restoration', 'Locksmith'].map((item) => (
              <span key={item} className="rounded-full border border-border px-4 py-2">
                {item}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-border bg-background">
        <div className="container mx-auto px-6 py-16 sm:py-20">
          <div className="text-center">
            <p className="text-xs uppercase tracking-[0.2em] text-sky-400">How it works</p>
            <h2 className="mt-3 text-3xl font-semibold sm:text-4xl">
              What happens when someone calls after hours
            </h2>
          </div>
          <div className="mt-12 grid gap-8 lg:grid-cols-3">
            {[
              {
                title: 'The call is taken after hours',
                description:
                  'Afterhours takes the call and lets the caller know their details will be passed along.',
                icon: PhoneCall,
              },
              {
                title: 'The job is qualified on the call',
                description:
                  'We capture issue, urgency, address, and callback preference when shared.',
                icon: MessageSquareText,
              },
              {
                title: 'A summary is sent after the call',
                description:
                  'A clear summary is sent after the call ends (delivery depends on carrier). No arrival times are promised.',
                icon: Zap,
              },
            ].map((step) => (
              <div key={step.title} className="rounded-2xl border border-border bg-card/70 p-6">
                <step.icon className="h-6 w-6 text-sky-400" />
                <h3 className="mt-4 text-lg font-semibold">{step.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-border bg-muted/20">
        <div className="container mx-auto px-6 py-16 sm:py-20">
          <div className="grid gap-10 lg:grid-cols-[1fr_1fr] items-center">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-sky-400">
                This is what hits your phone
              </p>
              <h2 className="mt-3 text-3xl font-semibold sm:text-4xl">
                Clear call details shortly after the call ends
              </h2>
              <p className="mt-4 text-sm text-muted-foreground sm:text-base">
                No voicemail hunting. Fewer partial notes. Key details are captured in one glance.
              </p>
            </div>
            <div className="rounded-2xl border border-border bg-card p-6 text-sm text-foreground shadow-lg shadow-black/20">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Afterhours Summary</span>
                <span>Late night</span>
              </div>
              <div className="mt-4 space-y-3">
                <div className="rounded-lg border border-border bg-background px-4 py-3">
                  <p className="font-semibold">Urgent: water heater leak</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Caller: Amanda L. | Oak Ridge Dr | Callback requested
                  </p>
                </div>
                <div className="grid gap-2 text-xs text-muted-foreground">
                  <span>Issue: Burst valve, active leak</span>
                  <span>Preferred window: caller requested next available</span>
                  <span>On-call: Carlos R.</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-border bg-background">
        <div className="container mx-auto px-6 py-16 sm:py-20">
          <div className="grid gap-10 lg:grid-cols-[1fr_1fr] items-center">
            <div className="rounded-2xl border border-border bg-card/70 p-6">
              <p className="text-xs uppercase tracking-[0.2em] text-sky-400">Live trial</p>
              <h2 className="mt-3 text-3xl font-semibold sm:text-4xl">
                Run Afterhours live — without committing
              </h2>
              <p className="mt-4 text-sm text-muted-foreground sm:text-base">
                The live trial takes forwarded calls and returns summaries, but you stay in full control.
              </p>
              <p className="mt-4 text-sm text-foreground">
                <strong>You decide whether to continue after the trial.</strong>
              </p>
              <div className="mt-6 flex items-center gap-2 text-xs text-muted-foreground">
                <Check className="h-4 w-4 text-sky-400" />
                No setup fee. You decide whether to continue after the trial.
              </div>
            </div>
            <div className="rounded-2xl border border-border bg-muted/40 p-6">
              <div className="flex items-start gap-3">
                <div className="rounded-full border border-border bg-background p-2">
                  <Check className="h-4 w-4 text-sky-400" />
                </div>
                <div>
                  <p className="text-sm font-semibold">Clear handoff</p>
                  <p className="mt-2 text-xs text-muted-foreground">
                    We walk you through forwarding and, when possible, run a test call during setup.
                  </p>
                </div>
              </div>
              <div className="mt-4 flex items-start gap-3">
                <div className="rounded-full border border-border bg-background p-2">
                  <Check className="h-4 w-4 text-sky-400" />
                </div>
                <div>
                  <p className="text-sm font-semibold">Clear visibility</p>
                  <p className="mt-2 text-xs text-muted-foreground">
                    Text summaries include a call summary record and notification attempt record; delivery depends on carrier.
                  </p>
                </div>
              </div>
              <div className="mt-4 flex items-start gap-3">
                <div className="rounded-full border border-border bg-background p-2">
                  <Check className="h-4 w-4 text-sky-400" />
                </div>
                <div>
                  <p className="text-sm font-semibold">No-risk exit</p>
                  <p className="mt-2 text-xs text-muted-foreground">
                    Stop after the trial if it is not a fit.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-border bg-background">
        <div className="container mx-auto px-6 py-16 sm:py-20">
          <div className="rounded-2xl border border-border bg-card/70 p-8 text-center sm:p-10">
            <p className="text-xs uppercase tracking-[0.2em] text-sky-400">Pricing</p>
            <h2 className="mt-3 text-3xl font-semibold sm:text-4xl">
              Simple, predictable monthly pricing
            </h2>
            <p className="mt-4 text-sm text-muted-foreground sm:text-base">
              Plans scale with your shop and call volume. You choose a plan only after your trial.
            </p>
          </div>
        </div>
      </section>

      <section id="start-trial" className="border-b border-border bg-muted/20">
        <div className="container mx-auto px-6 py-16 sm:py-20">
          <div className="grid gap-10 lg:grid-cols-[1fr_1fr] items-start">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-sky-400">Start live trial</p>
              <h2 className="mt-3 text-3xl font-semibold sm:text-4xl">
                Start your live trial (often about 30 minutes once forwarding is ready)
              </h2>
              <p className="mt-4 text-sm text-muted-foreground sm:text-base">
                Setup includes call forwarding and, when possible, a test call so you can hear it live.
              </p>
              <div className="mt-6 flex items-center gap-3 text-xs text-muted-foreground">
                <Check className="h-4 w-4 text-sky-400" />
                You decide whether to continue after the trial.
              </div>
            </div>
            <form
              method="POST"
              action="/api/lead"
              className="rounded-2xl border border-border bg-card/80 p-6 shadow-xl shadow-black/20"
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                  Name
                  <input
                    name="name"
                    required
                    className="mt-2 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-sky-500/40"
                    placeholder="Jamie Rivera"
                  />
                </label>
                <label className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                  Business name
                  <input
                    name="businessName"
                    required
                    className="mt-2 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-sky-500/40"
                    placeholder="Northside Plumbing"
                  />
                </label>
                <label className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                  Phone
                  <input
                    name="phone"
                    required
                    className="mt-2 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-sky-500/40"
                    placeholder="Your phone number"
                  />
                </label>
                <label className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                  Email
                  <input
                    type="email"
                    name="email"
                    required
                    className="mt-2 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-sky-500/40"
                    placeholder="you@company.com"
                  />
                </label>
                <label className="text-xs uppercase tracking-[0.2em] text-muted-foreground sm:col-span-2">
                  Trade
                  <select
                    name="trade"
                    required
                    className="mt-2 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-sky-500/40"
                    defaultValue=""
                  >
                    <option value="" disabled>
                      Select trade
                    </option>
                    {['HVAC', 'Plumbing', 'Electrical', 'Restoration', 'Locksmith', 'Other'].map(
                      (trade) => (
                        <option key={trade} value={trade}>
                          {trade}
                        </option>
                      )
                    )}
                  </select>
                </label>
                <label className="text-xs uppercase tracking-[0.2em] text-muted-foreground sm:col-span-2">
                  Company website (optional)
                  <input
                    name="website"
                    type="url"
                    className="mt-2 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-sky-500/40"
                    placeholder="https://yourcompany.com"
                  />
                  <span className="mt-2 block text-[11px] font-normal normal-case tracking-normal text-muted-foreground">
                    Helps us tailor the call flow to your services and service area.
                  </span>
                </label>
                <label className="text-xs uppercase tracking-[0.2em] text-muted-foreground sm:col-span-2">
                  Notes (optional)
                  <textarea
                    name="notes"
                    rows={4}
                    className="mt-2 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-sky-500/40"
                    placeholder="Anything we should know about your after-hours flow"
                  />
                </label>
              </div>
              <input type="hidden" name="status" value={status} />
              <button
                type="submit"
                className="mt-6 inline-flex w-full items-center justify-center rounded-full bg-sky-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-sky-400"
              >
                Start Live Trial
              </button>
              <p className="mt-3 text-center text-xs text-muted-foreground">
                No setup fee. You decide whether to continue after the trial.
              </p>
            </form>
          </div>
        </div>
      </section>

      <section className="border-b border-border bg-background">
        <div className="container mx-auto px-6 py-16 sm:py-20">
          <div className="text-center">
            <p className="text-xs uppercase tracking-[0.2em] text-sky-400">FAQ</p>
            <h2 className="mt-3 text-3xl font-semibold sm:text-4xl">
              Quick answers before you start
            </h2>
          </div>
          <div className="mt-10 grid gap-4 lg:grid-cols-2">
            {[
              {
                q: 'Is it really free to try?',
                a: 'Yes. No auto-billing. You decide whether to continue after the trial.',
              },
              {
                q: 'What does the trial include?',
                a: 'Call intake + clean summaries sent to one destination. Advanced notification rules unlock after.',
              },
              {
                q: 'How fast can we start?',
                a: 'Setup time varies; often about 30 minutes once forwarding is ready.',
              },
              {
                q: 'Do we need new hardware?',
                a: 'No. You forward your existing after-hours calls and we capture the details.',
              },
            ].map((item) => (
              <div key={item.q} className="rounded-2xl border border-border bg-card/70 p-6">
                <p className="text-sm font-semibold">{item.q}</p>
                <p className="mt-2 text-sm text-muted-foreground">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-sky-500 text-white">
        <div className="container mx-auto px-6 py-16 text-center">
          <p className="text-xs uppercase tracking-[0.2em] text-white/70">Ready</p>
          <h2 className="mt-3 text-3xl font-semibold sm:text-4xl">
            See what your after-hours calls can look like
          </h2>
          <p className="mt-3 text-sm text-white/80">
            No setup fee. You decide whether to continue after the trial.
          </p>
          <StartTrialButton className="mt-6 inline-flex items-center justify-center rounded-full bg-white px-6 py-3 text-sm font-semibold text-sky-600 transition hover:bg-white/90">
            Start Live Trial
          </StartTrialButton>
        </div>
      </section>
    </div>
  );
}
