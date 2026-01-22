"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type StartTrialFormProps = {
  status: string;
  source: string;
};

export default function StartTrialForm({ status, source }: StartTrialFormProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const normalizeWebsite = (value: string) => {
    const trimmed = value.trim();
    if (!trimmed) return "";
    const withScheme = /^[a-z][a-z0-9+.-]*:\/\//i.test(trimmed)
      ? trimmed
      : `https://${trimmed}`;
    try {
      const url = new URL(withScheme);
      return url.toString();
    } catch {
      return "";
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const form = event.currentTarget;
      const formData = new FormData(form);
      const payload = Object.fromEntries(formData.entries());
      const websiteRaw = String(payload.website ?? "");
      const normalizedWebsite = normalizeWebsite(websiteRaw);

      if (websiteRaw.trim().length && !normalizedWebsite) {
        setError("Please enter a valid website URL.");
        setIsSubmitting(false);
        return;
      }

      if (normalizedWebsite) {
        payload.website = normalizedWebsite;
      } else {
        delete payload.website;
      }

      const response = await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json().catch(() => null);
      if (!response.ok || !data?.ok) {
        setError("Something went wrong — please try again.");
        setIsSubmitting(false);
        return;
      }

      router.push("/thank-you");
    } catch (err) {
      setError("Something went wrong — please try again.");
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
            className="mt-2 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-sky-500/40"
            placeholder="Jamie Rivera"
          />
        </label>
        <label className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
          Business name (optional)
          <input
            name="businessName"
            className="mt-2 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-sky-500/40"
            placeholder="Northside Plumbing"
          />
        </label>
        <label className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
          Phone (optional)
          <input
            name="phone"
            className="mt-2 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-sky-500/40"
            placeholder="Your phone number"
          />
          <span className="mt-2 block text-[11px] font-normal normal-case tracking-normal text-muted-foreground">
            Used only for setup and quick setup check coordination.
          </span>
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
          <span className="mt-2 block text-[11px] font-normal normal-case tracking-normal text-muted-foreground">
            Used only for setup and quick setup check coordination.
          </span>
        </label>
        <label className="text-xs uppercase tracking-[0.2em] text-muted-foreground sm:col-span-2">
          Role (optional)
          <input
            name="role"
            type="text"
            className="mt-2 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-sky-500/40"
            placeholder="Owner, Operations, Dispatcher"
          />
        </label>
        <label className="text-xs uppercase tracking-[0.2em] text-muted-foreground sm:col-span-2">
          Company website (optional)
          <input
            name="website"
            type="text"
            className="mt-2 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-sky-500/40"
            placeholder="https://yourcompany.com"
            onBlur={(event) => {
              const normalized = normalizeWebsite(event.currentTarget.value);
              if (normalized) {
                event.currentTarget.value = normalized;
              }
            }}
          />
          <span className="mt-2 block text-[11px] font-normal normal-case tracking-normal text-muted-foreground">
            Helps us tailor the call flow to your services and service area.
          </span>
        </label>
      </div>
      <input type="hidden" name="status" value={status} />
      <input type="hidden" name="source" value={source} />
      <button
        type="submit"
        disabled={isSubmitting}
        className="mt-6 inline-flex w-full items-center justify-center rounded-full bg-sky-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-sky-400 disabled:cursor-not-allowed disabled:opacity-70"
        aria-busy={isSubmitting}
      >
        {isSubmitting ? (
          <span className="inline-flex items-center gap-2">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/60 border-t-transparent" />
            Submitting...
          </span>
        ) : (
          "Start trial when ready"
        )}
      </button>
      {error ? (
        <p className="mt-3 text-center text-xs text-red-400" role="alert">
          {error}
        </p>
      ) : null}
      <div className="mt-4 rounded-xl border border-border bg-muted/40 p-3 text-center text-xs text-muted-foreground">
        <p>No auto-billing.</p>
        <p>Nothing goes live until the quick setup check is complete.</p>
        <p>Stop after the quick setup check if it’s not a fit.</p>
      </div>
    </form>
  );
}
