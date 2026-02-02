import CallFlowDemo from "@/components/CallFlowDemo";

export default function HomeHero() {
  return (
    <section className="relative min-h-screen bg-background text-foreground">
      <div className="absolute inset-0 opacity-40" aria-hidden="true">
        <div className="absolute -left-40 top-20 h-96 w-96 rounded-full bg-primary/20 blur-[120px]" />
        <div className="absolute -right-40 bottom-20 h-96 w-96 rounded-full bg-primary/20 blur-[120px]" />
      </div>

      <div className="relative mx-auto max-w-4xl px-6 pt-24 pb-16 md:pt-32 md:pb-24">
        <div className="space-y-6 text-center motion-fade">
          <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl md:text-6xl">
            Inbound calls handled the way they should be.
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground sm:text-xl">
            Answer every call, capture what matters, surface urgency, and deliver a clear summary.
          </p>
        </div>

        <div className="mt-16 md:mt-24 motion-fade motion-fade-delay-150">
          <CallFlowDemo />
        </div>
      </div>
    </section>
  );
}
