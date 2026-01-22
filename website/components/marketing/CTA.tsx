import Link from "next/link";

type CTAProps = {
  title: string;
  body?: string;
  buttonLabel: string;
  buttonHref: string;
};

export default function CTA({ title, body, buttonLabel, buttonHref }: CTAProps) {
  return (
    <section className="border-b border-border bg-sky-500 text-white">
      <div className="container mx-auto px-6 py-16 text-center">
        <div className="mx-auto max-w-3xl motion-fade">
          <h2 className="text-3xl font-semibold leading-tight sm:text-4xl">{title}</h2>
          {body ? <p className="mt-4 text-sm text-white/80 sm:text-base">{body}</p> : null}
          <Link
            href={buttonHref}
            className="mt-6 inline-flex items-center justify-center rounded-full bg-white px-6 py-3 text-sm font-semibold text-sky-600 transition hover:bg-white/90"
          >
            {buttonLabel}
          </Link>
        </div>
      </div>
    </section>
  );
}
