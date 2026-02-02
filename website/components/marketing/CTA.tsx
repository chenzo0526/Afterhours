import Link from "next/link";
import { HulyButton } from "@/components/ui/huly-button";

type CTAProps = {
  title: string;
  body?: string;
  buttonLabel: string;
  buttonHref: string;
};

export default function CTA({ title, body, buttonLabel, buttonHref }: CTAProps) {
  return (
    <section className="border-b border-border bg-primary text-primary-foreground">
      <div className="container mx-auto px-6 py-16 text-center">
        <div className="mx-auto max-w-3xl motion-fade">
          <h2 className="text-3xl font-semibold leading-tight sm:text-4xl">{title}</h2>
          {body ? <p className="mt-4 text-sm text-primary-foreground/80 sm:text-base">{body}</p> : null}
          <Link href={buttonHref} className="mt-6 inline-block">
            <HulyButton variant="primary" className="px-8 py-4">
              {buttonLabel}
            </HulyButton>
          </Link>
        </div>
      </div>
    </section>
  );
}
