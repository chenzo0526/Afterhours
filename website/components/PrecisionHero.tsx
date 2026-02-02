'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { HulyButton } from '@/components/ui/huly-button';
import { HERO, CTA_START_TRIAL } from '@/lib/marketingCopy';

/**
 * Precision Reveal — Hero. High-conversion copy, no AI talk.
 */
export default function PrecisionHero() {
  const [showModal, setShowModal] = useState(false);
  const [phone, setPhone] = useState('');
  const [isCalling, setIsCalling] = useState(false);

  const handleDemoClick = () => setShowModal(true);

  const handleSubmitPhone = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone.trim()) return;
    setIsCalling(true);
    try {
      const res = await fetch('/api/demo/call', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber: phone.trim(), type: 'interactive' }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.callUrl) {
        window.open(data.callUrl, '_blank');
        setShowModal(false);
        setPhone('');
      } else if (res.ok && data.callId) {
        setShowModal(false);
        setPhone('');
      } else {
        alert(data?.message ?? 'Demo call service is not configured.');
      }
    } catch {
      alert('Unable to start demo. Please try again.');
    } finally {
      setIsCalling(false);
    }
  };

  return (
    <>
      <section className="relative pt-40 pb-16 sm:pb-20 lg:pb-24 flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 bg-[#020202]">
        <div className="max-w-5xl mx-auto text-center">
          <h1 className="text-6xl md:text-8xl font-bold text-transparent bg-clip-text bg-gradient-to-b from-white to-white/70 leading-tight" style={{ letterSpacing: '-0.04em' }}>
            {HERO.headline}
          </h1>
          <p className="mt-8 text-lg sm:text-xl lg:text-2xl text-muted-foreground leading-relaxed max-w-3xl mx-auto">
            {HERO.subhead}
          </p>
          <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4">
            <HulyButton
              variant="secondary"
              className="text-base sm:text-lg px-6 sm:px-8 py-5 sm:py-6"
              onClick={handleDemoClick}
            >
              {HERO.ctaDemo}
            </HulyButton>
            <HulyButton
              variant="primary"
              className="text-base sm:text-lg px-6 sm:px-8 py-5 sm:py-6"
            >
              <Link href="#start-trial">{CTA_START_TRIAL}</Link>
            </HulyButton>
          </div>
          <p className="mt-8 text-sm text-muted-foreground">
            {HERO.proof}
          </p>
        </div>
      </section>

      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          onClick={() => !isCalling && setShowModal(false)}
        >
          <div
            className="relative w-full max-w-md mx-4 rounded-2xl border border-border/50 bg-[#020202] p-8"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-xl font-semibold text-foreground mb-2">{HERO.modalTitle}</h2>
            <p className="text-sm text-muted-foreground mb-6">
              {HERO.modalBody}
            </p>
            <form onSubmit={handleSubmitPhone} className="space-y-4">
              <Input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1 (555) 123-4567"
                required
                pattern="^\+?[1-9]\d{1,14}$"
                className="w-full"
              />
              <div className="flex gap-3">
                <HulyButton type="button" variant="secondary" className="flex-1 px-4 py-3" onClick={() => setShowModal(false)}>
                  {HERO.modalCancel}
                </HulyButton>
                <HulyButton
                  type="submit"
                  variant="primary"
                  className="flex-1 px-4 py-3"
                  disabled={isCalling}
                >
                  {isCalling ? HERO.modalSubmitConnecting : HERO.modalSubmit}
                </HulyButton>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
