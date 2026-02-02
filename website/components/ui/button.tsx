'use client';

import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

// Helper to detect if child is a Link component
function isLinkChild(children: React.ReactNode): boolean {
  if (!React.isValidElement(children)) return false;
  const childType = children.type;
  if (typeof childType === 'string' && childType === 'a') return true;
  // Check if it's Next.js Link (has displayName or is a function with specific props)
  if (typeof childType === 'function' && 'displayName' in childType) {
    return (childType as { displayName?: string }).displayName === 'Link';
  }
  // Check for href prop which indicates anchor-like element
  if (children.props && 'href' in children.props) return true;
  return false;
}

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed',
  {
    variants: {
      variant: {
        primary:
          'bg-brand-blue text-primary-foreground hover:bg-brand-blue/90 active:bg-brand-blue/95',
        secondary:
          'border border-border bg-background hover:border-primary hover:text-primary hover:bg-brand-blue/10 active:bg-muted/50',
        ghost: 'hover:bg-accent hover:text-accent-foreground active:bg-accent/80',
        default:
          'bg-brand-blue text-primary-foreground hover:bg-brand-blue/90 active:bg-brand-blue/95',
        destructive:
          'bg-destructive text-destructive-foreground hover:bg-destructive/90',
        outline:
          'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
        link: 'text-primary underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 rounded-xl px-3 text-xs',
        lg: 'h-11 rounded-xl px-8',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      asChild = false,
      type,
      children,
      ...props
    },
    ref
  ) => {
    const computedClassName = cn(buttonVariants({ variant, size, className }));
    
    // Auto-detect Link/anchor children and use Slot automatically (no asChild needed)
    const shouldUseSlot = asChild || isLinkChild(children);
    
    if (shouldUseSlot) {
      return (
        <Slot
          ref={ref as React.Ref<HTMLElement>}
          className={computedClassName}
          {...(type && type !== 'button' ? {} : { type: undefined })}
          {...props}
        >
          {children}
        </Slot>
      );
    }
    
    return (
      <button
        ref={ref}
        type={type ?? 'button'}
        className={computedClassName}
        {...props}
      >
        {children}
      </button>
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };
