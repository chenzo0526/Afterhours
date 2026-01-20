"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type StartTrialFormProps = {
  status: string;
};

export default function StartTrialForm({ status }: StartTrialFormProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const form = event.currentTarget;
      const formData = new FormData(form);
      const payload = Object.fromEntries(formData.entries());

      const response = await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error("Request failed");
      }

      router.push("/thank-you");
    } catch (err) {
      setError("Something went wrong. Please try again in a moment.");
      setIsSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
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
            {["HVAC", "Plumbing", "Electrical", "Restoration", "Locksmith", "Other"].map(
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
            placeholder="Anything we should know about your overnight flow"
          />
        </label>
      </div>
      <input type="hidden" name="status" value={status} />
      <button
        type="submit"
        disabled={isSubmitting}
        className="mt-6 inline-flex w-full items-center justify-center rounded-full bg-sky-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-sky-400 disabled:cursor-not-allowed disabled:opacity-70"
      >
        Start Live Trial
      </button>
      {error ? (
        <p className="mt-3 text-center text-xs text-red-400">{error}</p>
      ) : (
        <p className="mt-3 text-center text-xs text-muted-foreground">
          No setup fee. No auto-billing. Cancel anytime.
        </p>
      )}
      <p className="mt-2 text-center text-xs text-muted-foreground">
        We confirm your setup details before the required test call and go-live.
      </p>
    </form>
  );
}
