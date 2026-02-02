import { ArrowRight } from "lucide-react";
import MotionContainer from "@/components/visual/MotionContainer";

export default function HowItWorksContent() {
  return (
    <div className="bg-background text-foreground">
      <section
        className="border-b border-border py-16 sm:py-20 lg:py-24"
        data-scroll-section
      >
        <div className="container mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <MotionContainer fadeInOnScroll subtleTranslateY>
            <div className="mx-auto max-w-2xl space-y-6 text-center">
              <h1 className="text-4xl font-semibold leading-tight tracking-tight sm:text-5xl text-foreground">
                How It Works
              </h1>
              <p className="text-lg text-muted-foreground sm:text-xl leading-relaxed">
                Afterhours answers late-night calls, captures the details, and only alerts your on-call staff member when it's actually urgent.
              </p>
            </div>
          </MotionContainer>
        </div>
      </section>

      <section
        className="border-b border-border bg-muted/20 py-16 sm:py-20 lg:py-24"
        data-scroll-section
      >
        <div className="container mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <MotionContainer fadeInOnScroll subtleTranslateY>
            <h2 className="text-2xl font-semibold text-foreground mb-10 text-center">
              Call Flow
            </h2>
            <div className="mx-auto max-w-3xl space-y-8">
              <div className="flex items-start gap-4 rounded-xl border border-border bg-card p-6">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/10 font-semibold text-primary">
                  1
                </div>
                <div className="flex-grow space-y-2">
                  <h3 className="font-semibold text-foreground">Call Forwarded</h3>
                  <p className="text-muted-foreground text-base leading-relaxed">
                    We answer the late-night call and let the caller know we'll capture the details and alert your team if it's urgent.
                  </p>
                </div>
              </div>

              <div className="flex justify-center">
                <ArrowRight className="h-6 w-6 text-muted-foreground" aria-hidden />
              </div>

              <div className="flex items-start gap-4 rounded-xl border border-border bg-card p-6">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/10 font-semibold text-primary">
                  2
                </div>
                <div className="flex-grow space-y-2">
                  <h3 className="font-semibold text-foreground">We Qualify Urgency</h3>
                  <p className="text-muted-foreground text-base leading-relaxed">
                    We ask a few questions and capture the details shared.
                  </p>
                </div>
              </div>

              <div className="flex justify-center">
                <ArrowRight className="h-6 w-6 text-muted-foreground" aria-hidden />
              </div>

              <div className="flex items-start gap-4 rounded-xl border border-border bg-card p-6">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/10 font-semibold text-primary">
                  3
                </div>
                <div className="flex-grow space-y-2">
                  <h3 className="font-semibold text-foreground">Notify or Report</h3>
                  <p className="text-muted-foreground text-base leading-relaxed">
                    Urgent calls trigger an on-call alert; everything else goes to a morning digest.
                  </p>
                </div>
              </div>
            </div>
          </MotionContainer>
        </div>
      </section>
    </div>
  );
}
