import Link from 'next/link';
import { Calendar, MessageCircle, CheckCircle2 } from 'lucide-react';

export default function ThankYouPage() {
  const calendlyUrl = process.env.NEXT_PUBLIC_CALENDLY_URL || '#';
  const smsNumber = process.env.NEXT_PUBLIC_SMS_NUMBER || '';
  const smsHref = smsNumber ? `sms:${smsNumber}` : '#';

  return (
    <div className="bg-background text-foreground">
      <section className="container mx-auto px-6 py-20 sm:py-24">
        <div className="mx-auto max-w-2xl rounded-2xl border border-border bg-card/80 p-8 text-center shadow-xl shadow-black/20 sm:p-12">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-sky-500/10">
            <CheckCircle2 className="h-6 w-6 text-sky-400" />
          </div>
          <h1 className="mt-6 text-3xl font-semibold sm:text-4xl">You're all set.</h1>
          <p className="mt-3 text-sm text-muted-foreground sm:text-base">
            We'll confirm when your live trial is ready.
          </p>
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <a
              href={calendlyUrl}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-sky-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-sky-400"
            >
              <Calendar className="h-4 w-4" />
              Book 10-minute setup
            </a>
            <a
              href={smsHref}
              className="inline-flex items-center justify-center gap-2 rounded-full border border-border px-5 py-3 text-sm font-semibold text-foreground transition hover:border-sky-400 hover:text-sky-300"
            >
              <MessageCircle className="h-4 w-4" />
              Text us
            </a>
          </div>
          <p className="mt-6 text-xs text-muted-foreground">
            Need another trial? You can start again anytime.
          </p>
          <Link
            href="/start"
            className="mt-4 inline-flex text-xs font-semibold uppercase tracking-[0.2em] text-sky-400"
          >
            Back to start
          </Link>
        </div>
      </section>
    </div>
  );
}
