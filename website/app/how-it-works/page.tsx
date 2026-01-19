import { ArrowRight } from 'lucide-react';

export default function HowItWorks() {
  return (
    <div className="py-24 sm:py-32">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-6">
            How It Works
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Afterhours answers late-night calls, captures the details, and only alerts your on-call staff member when it's actually urgent.
          </p>
        </div>

        {/* Flow Diagram */}
        <div className="max-w-5xl mx-auto mb-24">
          <h2 className="text-2xl font-semibold text-foreground mb-8 text-center">
            Call Flow
          </h2>
          <div className="space-y-6">
            {/* Step 1 */}
            <div className="flex items-start gap-4 p-6 border border-border rounded-lg bg-card">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold">
                1
              </div>
              <div className="flex-grow">
                <h3 className="font-semibold text-foreground mb-2">Call Forwarded</h3>
                <p className="text-muted-foreground">
                  We answer the late-night call and let the caller know we'll capture the details and alert your team if it's urgent.
                </p>
              </div>
            </div>

            <ArrowRight className="w-6 h-6 text-muted-foreground mx-auto" />

            {/* Step 2 */}
            <div className="flex items-start gap-4 p-6 border border-border rounded-lg bg-card">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold">
                2
              </div>
              <div className="flex-grow">
                <h3 className="font-semibold text-foreground mb-2">We Qualify Urgency</h3>
                <p className="text-muted-foreground">
                  We ask a few questions and capture the details shared.
                </p>
              </div>
            </div>

            <ArrowRight className="w-6 h-6 text-muted-foreground mx-auto" />

            {/* Step 3 */}
            <div className="flex items-start gap-4 p-6 border border-border rounded-lg bg-card">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold">
                3
              </div>
              <div className="flex-grow">
                <h3 className="font-semibold text-foreground mb-2">Notify or Report</h3>
                <p className="text-muted-foreground">
                  Urgent calls trigger an on-call alert; everything else goes to a morning report.
                </p>
              </div>
            </div>
          </div>
          <div className="mt-10 text-center text-xs text-muted-foreground">
            <p>We don't promise arrival times — we pass the details and urgency to your team.</p>
            <p className="mt-2">If this is a life-threatening emergency, call 911.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
