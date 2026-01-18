'use client';

import { useCallback } from 'react';
import { usePathname, useRouter } from 'next/navigation';

type StartTrialButtonProps = {
  className?: string;
  children: React.ReactNode;
};

export default function StartTrialButton({ className, children }: StartTrialButtonProps) {
  const router = useRouter();
  const pathname = usePathname();

  const handleClick = useCallback(() => {
    if (pathname === '/start') {
      const target = document.getElementById('start-trial');
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        if (window.location.hash !== '#start-trial') {
          window.history.replaceState(null, '', '#start-trial');
        }
        return;
      }
    }

    router.push('/start#start-trial');
  }, [pathname, router]);

  return (
    <button type="button" onClick={handleClick} className={className}>
      {children}
    </button>
  );
}
