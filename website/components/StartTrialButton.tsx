'use client';

import { useCallback } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { HulyButton } from '@/components/ui/huly-button';
import { cn } from '@/lib/utils';

type StartTrialButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  children: React.ReactNode;
};

export default function StartTrialButton({ className, children, ...props }: StartTrialButtonProps) {
  const router = useRouter();
  const pathname = usePathname();

  const handleClick = useCallback(() => {
    if (pathname === '/') {
      const target = document.getElementById('start-trial');
      if (target) {
        const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        target.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
        if (window.location.hash !== '#start-trial') {
          window.history.replaceState(null, '', '/#start-trial');
        }
        return;
      }
    }

    router.push('/#start-trial');
  }, [pathname, router]);

  return (
    <HulyButton
      type="button"
      variant="primary"
      onClick={handleClick}
      className={cn(className)}
      {...props}
    >
      {children}
    </HulyButton>
  );
}
