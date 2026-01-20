import StartTrialButton from '@/components/StartTrialButton';
import StartTrialForm from './StartTrialForm';
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
  miss: "Afterhours answers late-night calls, captures the details, and only alerts your on-call staff member when it's actually urgent.",
  some: "Afterhours answers late-night calls, captures the details, and only alerts your on-call staff member when it's actually urgent.",
  covered: "Afterhours answers late-night calls, captures the details, and only alerts your on-call staff member when it's actually urgent.",
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
                Stop losing emergency calls while you're asleep.
              </h1>
              <p className="mt-4 text-lg text-muted-foreground sm:text-xl">{subheadline}</p>
              <ul className="mt-6 space-y-3 text-sm text-muted-foreground sm:text-base">
                {[
                  'Capture high-value emergencies instead of sending callers to voicemail.',
                  'Sleep through the night - only real emergencies get escalated.',
                  'Wake up to a clean morning report with every call summarized.',
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
                  No setup fee. No auto-billing. Cancel anytime.
                </span>
              </div>
              <div className="mt-6 w-full rounded-2xl border border-border bg-card/70 p-5">
                <p className="text-sm font-semibold text-foreground">What you get</p>
                <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                  {[
                    'Every forwarded call answered',
                    'Urgency + details captured',
                    'On-call notified only when urgent',
                    'Morning report for everything else',
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-3">
                      <Check className="mt-0.5 h-4 w-4 text-sky-400" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                <p className="mt-4 text-xs text-muted-foreground">
                  Notification delivery depends on carrier.
                </p>
              </div>
            </div>
          </div>
          <div
            id="callers-hear"
            className="mx-auto mt-10 max-w-2xl rounded-2xl border border-border bg-card/70 p-6 shadow-xl shadow-black/20"
          >
            <audio className="mt-4 w-full" controls preload="none">
              <source src="/audio/retell-agent-19.m4a" type="audio/mp4" />
              Your browser does not support the audio element.
            </audio>
            <div className="mt-6 rounded-xl border border-border bg-muted/40 p-4 text-xs text-muted-foreground">
              <div className="flex items-center justify-between gap-3 text-foreground">
                <div className="flex items-center gap-2">
                  <MessageSquareText className="h-4 w-4 text-sky-400" />
                  Live summary preview
                </div>
                <a
                  href="#callers-hear"
                  className="text-xs font-semibold text-sky-400 transition hover:text-sky-300"
                >
                  Hear what callers hear (15 sec)
                </a>
              </div>
              <p className="mt-2">
                Caller: Amanda L. | Issue: Water heater leak | Urgency: High | Address: Oak Ridge Dr (shared)
                | Callback: Next available | Next: Notify on-call
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-border bg-muted/30">
        <div className="container mx-auto px-6 py-10">
          <div className="grid gap-6 text-center sm:grid-cols-3">
            {[
              '70–85% of callers hang up when they hit voicemail.',
              'Most small businesses answer only ~38% of calls live.',
              'One emergency job often pays for the month.',
            ].map((item) => (
              <div key={item} className="rounded-2xl border border-border bg-card/70 p-5">
                <p className="text-sm font-semibold text-foreground">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-border bg-background">
        <div className="container mx-auto px-6 py-16 sm:py-20">
          <div className="text-center">
            <p className="text-xs uppercase tracking-[0.2em] text-sky-400">How it works</p>
            <h2 className="mt-3 text-3xl font-semibold sm:text-4xl">
              What happens when you're closed
            </h2>
          </div>
          <div className="mt-12 grid gap-8 lg:grid-cols-3">
            {[
              {
                title: 'Call forwarded',
                description:
                  "We answer the late-night call and let the caller know we'll capture the details and alert your team if it's urgent.",
                icon: PhoneCall,
              },
              {
                title: 'We qualify urgency',
                description: 'We capture the issue, urgency, and callback preference when shared.',
                icon: MessageSquareText,
              },
              {
                title: 'We notify or report',
                description:
                  'Urgent calls trigger an on-call alert; everything else goes to the morning report.',
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
                A clear, short summary
              </h2>
            </div>
            <div className="rounded-2xl border border-border bg-card p-6 text-sm text-foreground shadow-lg shadow-black/20">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Afterhours Summary</span>
                <span>Overnight</span>
              </div>
              <div className="mt-4 space-y-3">
                <p className="font-semibold">Urgent: Water heater leak</p>
                <div className="grid gap-1 text-xs text-muted-foreground">
                  <span>Caller: Amanda L.</span>
                  <span>Issue: Active leak from valve</span>
                  <span>Urgency: High</span>
                  <span>Address: Oak Ridge Dr (shared)</span>
                  <span>Callback: Next available</span>
                  <span>
                    Next action: <strong>Notify on-call</strong>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-border bg-background">
        <div className="container mx-auto px-6 py-16 sm:py-20">
          <div className="text-center">
            <p className="text-xs uppercase tracking-[0.2em] text-sky-400">Comparison</p>
            <h2 className="mt-3 text-3xl font-semibold sm:text-4xl">
              Voicemail vs Call Center vs Afterhours
            </h2>
          </div>
          <div className="mt-10 grid gap-6 lg:grid-cols-3">
            {[
              {
                title: 'Voicemail',
                points: ['Missed emergencies', 'No urgency filter', 'Callers hang up'],
              },
              {
                title: 'Call Center',
                points: ['High monthly cost', 'Generic scripts', 'Mixed urgency handling'],
              },
              {
                title: 'Afterhours',
                points: ['Every call answered', 'Urgency qualified', 'Only urgent calls escalated'],
              },
            ].map((column) => (
              <div key={column.title} className="rounded-2xl border border-border bg-card/70 p-6">
                <h3 className="text-lg font-semibold">{column.title}</h3>
                <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                  {column.points.map((point) => (
                    <li key={point} className="flex items-start gap-2">
                      <Check className="mt-0.5 h-4 w-4 text-sky-400" />
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-border bg-background">
        <div className="container mx-auto px-6 py-16 sm:py-20">
          <div className="grid gap-10 lg:grid-cols-[1fr_1fr] items-center">
            <div className="rounded-2xl border border-border bg-card/70 p-6">
              <p className="text-xs uppercase tracking-[0.2em] text-sky-400">Live trial</p>
              <h2 className="mt-3 text-3xl font-semibold sm:text-4xl">
                Try it live on your own phone line — no commitment
              </h2>
              <p className="mt-4 text-sm text-muted-foreground sm:text-base">
                Forward calls, see real summaries, and decide if it fits.
              </p>
            </div>
            <div className="rounded-2xl border border-border bg-muted/40 p-6">
              <div className="flex items-start gap-3">
                <div className="rounded-full border border-border bg-background p-2">
                  <Check className="h-4 w-4 text-sky-400" />
                </div>
                <div>
                  <p className="text-sm font-semibold">Clear handoff</p>
                  <p className="mt-2 text-xs text-muted-foreground">
                    We walk you through forwarding and run a required test call before go-live.
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
                    You&apos;ll get a clean call summary and notification attempt record.
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
              Pick a plan after your trial based on call volume.
            </p>
            <p className="mt-2 text-sm text-muted-foreground sm:text-base">
              Most shops start simple and adjust once they see real call volume.
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
                Start once forwarding is ready
              </h2>
              <p className="mt-4 text-sm text-muted-foreground sm:text-base">
                We set up forwarding and run a quick test call.
              </p>
              <div className="mt-6 rounded-2xl border border-border bg-card/70 p-5">
                <p className="text-sm font-semibold text-foreground">Setup checklist</p>
                <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                  {[
                    'Spoken company name',
                    'Primary on-call contact',
                    'When you consider calls urgent (nights, weekends, emergencies) + your timezone',
                    'Service area boundaries and exclusions',
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-3">
                      <Check className="mt-0.5 h-4 w-4 text-sky-400" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                <p className="mt-4 text-xs text-muted-foreground">
                  Go-live happens after the test call is approved.
                </p>
              </div>
            </div>
            <StartTrialForm status={status} />
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
                a: 'Yes. You can try it without committing.',
              },
              {
                q: 'What happens on urgent calls?',
                a: 'We notify your on-call contact with the summary right away.',
              },
              {
                q: "What happens when it's not urgent?",
                a: 'It goes to the morning report with full details.',
              },
              {
                q: 'How fast can we start?',
                a: 'As soon as forwarding is ready, usually within a day.',
              },
              {
                q: 'Do we need new hardware?',
                a: 'No. Use your existing number with call forwarding.',
              },
            ].map((item) => (
              <div key={item.q} className="rounded-2xl border border-border bg-card/70 p-6">
                <p className="text-sm font-semibold">{item.q}</p>
                <p className="mt-2 text-sm text-muted-foreground">{item.a}</p>
              </div>
            ))}
          </div>
          <div className="mt-8 text-center text-xs text-muted-foreground">
            <p className="font-semibold">Important notes:</p>
            <p className="mt-2">
              We don&apos;t promise arrival times — we pass the details and urgency to your team.
            </p>
            <p className="mt-2">If anyone is in immediate danger, call 911.</p>
          </div>
        </div>
      </section>

      <section className="bg-sky-500 text-white">
        <div className="container mx-auto px-6 py-16 text-center">
          <p className="text-xs uppercase tracking-[0.2em] text-white/70">Ready</p>
          <h2 className="mt-3 text-3xl font-semibold sm:text-4xl">
            See how late-night calls get handled
          </h2>
          <StartTrialButton className="mt-6 inline-flex items-center justify-center rounded-full bg-white px-6 py-3 text-sm font-semibold text-sky-600 transition hover:bg-white/90">
            Start Live Trial
          </StartTrialButton>
        </div>
      </section>
    </div>
  );
}
