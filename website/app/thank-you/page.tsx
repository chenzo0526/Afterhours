import { CheckCircle2, Clock, Mail, PhoneCall, Sparkles } from "lucide-react";

const setupCallUrl = "";

export default function ThankYouPage() {
  return (
    <div className="bg-background text-foreground">
      <section className="border-b border-border">
        <div className="container mx-auto px-6 py-16 sm:py-20">
          <div className="mx-auto max-w-3xl text-center">
            <div className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-sky-400">
              <Sparkles className="h-4 w-4" />
              Live Trial Confirmed
            </div>
            <h1 className="mt-4 text-4xl font-semibold leading-tight sm:text-5xl">
              You're in — your live trial is on the way.
            </h1>
            <p className="mt-4 text-lg text-muted-foreground sm:text-xl">
              We received your details. A specialist is putting together your Setup Kit now.
            </p>
            <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
              <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card/70 px-4 py-2 text-sm">
                <CheckCircle2 className="h-4 w-4 text-sky-400" />
                <span>Check your email for the Setup Kit</span>
              </div>
            </div>
          </div>

          <div className="mx-auto mt-12 max-w-4xl rounded-2xl border border-border bg-card/70 p-6 sm:p-8">
            <h2 className="text-lg font-semibold">What happens next</h2>
            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              {[
                {
                  title: "In 10 minutes",
                  description: "You'll get a Setup Kit with forwarding steps and the test-call plan.",
                  icon: Clock,
                },
                {
                  title: "Tonight",
                  description: "We're on standby to run your first live test call.",
                  icon: PhoneCall,
                },
                {
                  title: "Tomorrow morning",
                  description: "You'll receive your first call summary and tuning notes.",
                  icon: Mail,
                },
              ].map((item) => (
                <div key={item.title} className="rounded-xl border border-border bg-background/60 p-4">
                  <item.icon className="h-5 w-5 text-sky-400" />
                  <p className="mt-3 text-sm font-semibold">{item.title}</p>
                  <p className="mt-2 text-xs text-muted-foreground">{item.description}</p>
                </div>
              ))}
            </div>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a
                href="/how-it-works"
                className="inline-flex flex-1 items-center justify-center rounded-full bg-sky-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-sky-400"
              >
                See how it works
              </a>
              {setupCallUrl ? (
                <a
                  href={setupCallUrl}
                  className="inline-flex flex-1 items-center justify-center rounded-full border border-border bg-background px-6 py-3 text-sm font-semibold text-foreground transition hover:border-sky-400 hover:text-sky-400"
                >
                  Book 10-min setup call
                </a>
              ) : null}
            </div>
            <p className="mt-6 text-xs text-muted-foreground">
              Important notes: We confirm forwarding details before the test call. Notification delivery
              depends on carrier. If anyone is in immediate danger, call 911.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
