'use client';

import { Suspense, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import confetti from 'canvas-confetti';

function SetupGuideContent() {
  const searchParams = useSearchParams();
  const businessName = searchParams?.get('businessName') || '';

  // Trigger confetti once on mount
  useEffect(() => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#0070f3', '#10b981', '#f59e0b', '#ef4444'],
    });
  }, []); // Empty dependency array ensures it only fires once

  return (
    <div className="bg-[#050505] min-h-screen flex flex-col items-center justify-center px-6">
      <div className="max-w-2xl text-center">
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight text-white tracking-tight">
          Welcome aboard{businessName ? `, ${businessName}` : ''}.
        </h1>
        <p className="mt-6 text-lg sm:text-xl text-neutral-200 font-medium">
          Check your email for your Setup Kit.
        </p>
        <p className="mt-3 text-base sm:text-lg text-neutral-300 font-medium">
          Instructions to forward your lines are in your inbox.
        </p>
      </div>
    </div>
  );
}

export default function SetupGuidePage() {
  return (
    <Suspense
      fallback={
        <div className="bg-[#050505] min-h-screen flex flex-col items-center justify-center px-6">
          <div className="max-w-2xl text-center">
            <h1 className="text-3xl sm:text-4xl font-bold leading-tight text-white tracking-tight">
              Welcome aboard.
            </h1>
            <p className="mt-6 text-lg text-neutral-200 font-medium">
              Check your email for your Setup Kit.
            </p>
            <p className="mt-3 text-base text-neutral-300 font-medium">
              Instructions to forward your lines are in your inbox.
            </p>
          </div>
        </div>
      }
    >
      <SetupGuideContent />
    </Suspense>
  );
}
