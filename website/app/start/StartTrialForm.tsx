"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { motion } from "framer-motion";
import { START_TRIAL_FORM } from "@/lib/marketingCopy";

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

      // Extract businessName for redirect
      const businessName = String(payload.businessName || payload.name || "").trim();

      const response = await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json().catch(() => null);
      
      // Check for success (200 status and success: true)
      if (response.ok && response.status === 200 && data?.success) {
        // Redirect immediately to setup-guide with businessName
        const redirectUrl = businessName
          ? `/setup-guide?businessName=${encodeURIComponent(businessName)}`
          : "/setup-guide";

        router.push(redirectUrl);
      } else {
        setError(data?.message || "Something went wrong — please try again.");
        setIsSubmitting(false);
      }
    } catch (err) {
      setError("Something went wrong — please try again.");
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-md mx-auto"
    >
      <form
        onSubmit={handleSubmit}
        className="space-y-6 rounded-2xl border border-white/10 bg-neutral-900/40 p-8 backdrop-blur-xl shadow-2xl shadow-black/50 relative overflow-hidden"
      >
        {/* Top Highlight Gradient */}
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

        <div className="space-y-2 text-center">
          <h2 className="text-2xl font-semibold tracking-tight text-white">
            Start your 7-day trial
          </h2>
          <p className="text-sm text-neutral-400">
            No credit card required. Full access to all features.
          </p>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="name" className="text-xs font-medium uppercase tracking-wider text-neutral-500">
              Name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              className="w-full rounded-lg border border-white/10 bg-black/50 px-4 py-3 text-sm text-white placeholder-neutral-600 transition-colors focus:border-blue-500/50 focus:outline-none focus:ring-1 focus:ring-blue-500/50"
              placeholder="Jamie Rivera"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="businessName" className="text-xs font-medium uppercase tracking-wider text-neutral-500">
              Business Name <span className="normal-case font-normal text-neutral-600">(optional)</span>
            </label>
            <input
              id="businessName"
              name="businessName"
              type="text"
              className="w-full rounded-lg border border-white/10 bg-black/50 px-4 py-3 text-sm text-white placeholder-neutral-600 transition-colors focus:border-blue-500/50 focus:outline-none focus:ring-1 focus:ring-blue-500/50"
              placeholder="Northside Plumbing"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="email" className="text-xs font-medium uppercase tracking-wider text-neutral-500">
              Work Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              aria-required="true"
              className="w-full rounded-lg border border-white/10 bg-black/50 px-4 py-3 text-sm text-white placeholder-neutral-600 transition-colors focus:border-blue-500/50 focus:outline-none focus:ring-1 focus:ring-blue-500/50"
              placeholder="name@company.com"
            />
            <span className="block text-[11px] font-normal normal-case tracking-normal text-neutral-500 mt-1">
              Used only for setup and quick setup check coordination.
            </span>
          </div>

          <div className="space-y-2">
            <label htmlFor="phone" className="text-xs font-medium uppercase tracking-wider text-neutral-500">
              Phone <span className="normal-case font-normal text-neutral-600">(optional)</span>
            </label>
            <input
              id="phone"
              name="phone"
              type="tel"
              className="w-full rounded-lg border border-white/10 bg-black/50 px-4 py-3 text-sm text-white placeholder-neutral-600 transition-colors focus:border-blue-500/50 focus:outline-none focus:ring-1 focus:ring-blue-500/50"
              placeholder="Your phone number"
            />
            <span className="block text-[11px] font-normal normal-case tracking-normal text-neutral-500 mt-1">
              Used only for setup and quick setup check coordination.
            </span>
          </div>

          <div className="space-y-2">
            <label htmlFor="role" className="text-xs font-medium uppercase tracking-wider text-neutral-500">
              Role <span className="normal-case font-normal text-neutral-600">(optional)</span>
            </label>
            <input
              id="role"
              name="role"
              type="text"
              className="w-full rounded-lg border border-white/10 bg-black/50 px-4 py-3 text-sm text-white placeholder-neutral-600 transition-colors focus:border-blue-500/50 focus:outline-none focus:ring-1 focus:ring-blue-500/50"
              placeholder="Owner, Operations, Dispatcher"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="website" className="text-xs font-medium uppercase tracking-wider text-neutral-500">
              Company Website <span className="normal-case font-normal text-neutral-600">(optional)</span>
            </label>
            <input
              id="website"
              name="website"
              type="url"
              className="w-full rounded-lg border border-white/10 bg-black/50 px-4 py-3 text-sm text-white placeholder-neutral-600 transition-colors focus:border-blue-500/50 focus:outline-none focus:ring-1 focus:ring-blue-500/50"
              placeholder="https://yourcompany.com"
              onBlur={(event) => {
                const normalized = normalizeWebsite(event.currentTarget.value);
                if (normalized) {
                  event.currentTarget.value = normalized;
                }
              }}
            />
            <span className="block text-[11px] font-normal normal-case tracking-normal text-neutral-500 mt-1">
              Helps us tailor the call flow to your services and service area.
            </span>
          </div>
        </div>

        <input type="hidden" name="status" value={status} />
        <input type="hidden" name="source" value={source} />

        {error && (
          <div className="rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3">
            <p className="text-xs text-red-400" role="alert" aria-live="polite">
              {error}
            </p>
          </div>
        )}

        <button
          disabled={isSubmitting}
          type="submit"
          className="group relative w-full overflow-hidden rounded-full bg-[#0070f3] py-3 text-sm font-medium text-white shadow-[0_0_40px_-10px_rgba(0,112,243,0.5)] transition-all hover:bg-[#0060df] hover:shadow-[0_0_60px_-10px_rgba(0,112,243,0.7)] disabled:opacity-50 disabled:cursor-not-allowed"
          aria-busy={isSubmitting}
        >
          <span className="relative z-10 flex items-center justify-center gap-2">
            {isSubmitting ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/60 border-t-transparent" />
                {START_TRIAL_FORM.submittingLabel}
              </>
            ) : (
              <>
                {START_TRIAL_FORM.submitLabel}
                <svg className="h-4 w-4 transition-transform group-hover:translate-x-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </>
            )}
          </span>
        </button>
      </form>
    </motion.div>
  );
}
