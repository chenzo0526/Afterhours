import { Phone, MessageSquare, Clock, AlertTriangle, ArrowRight, CheckCircle2 } from 'lucide-react';

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
            A guided after-hours flow that captures key details and notifies your on-call contacts when configured.
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
                <h3 className="font-semibold text-foreground mb-2">Call Comes In</h3>
                <p className="text-muted-foreground">
                  Customer calls your business number after hours. Afterhours takes the call when it is forwarded.
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
                <h3 className="font-semibold text-foreground mb-2">Qualifies & Captures</h3>
                <p className="text-muted-foreground">
                  Afterhours asks a few questions to understand urgency and captures the details shared by the caller.
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
                <h3 className="font-semibold text-foreground mb-2">Call Logged for Your Records</h3>
                <p className="text-muted-foreground">
                  Call details and transcripts can be saved to your system of record, such as Airtable, if configured.
                </p>
              </div>
            </div>

            <ArrowRight className="w-6 h-6 text-muted-foreground mx-auto" />

            {/* Step 4 */}
            <div className="flex items-start gap-4 p-6 border border-border rounded-lg bg-card">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold">
                4
              </div>
              <div className="flex-grow">
                <h3 className="font-semibold text-foreground mb-2">On-Call Contact Notified</h3>
                <p className="text-muted-foreground">
                  A summary is sent to the primary on-call contact you specify, with backups optional.
                </p>
              </div>
            </div>

            <ArrowRight className="w-6 h-6 text-muted-foreground mx-auto" />

            {/* Step 5 */}
            <div className="flex items-start gap-4 p-6 border border-border rounded-lg bg-card">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold">
                5
              </div>
              <div className="flex-grow">
                <h3 className="font-semibold text-foreground mb-2">Notification Sent</h3>
                <p className="text-muted-foreground">
                  We send a summary by SMS or email. Delivery depends on carrier and email provider.
                </p>
              </div>
            </div>

            <ArrowRight className="w-6 h-6 text-muted-foreground mx-auto" />

            {/* Step 6 */}
            <div className="flex items-start gap-4 p-6 border border-border rounded-lg bg-card">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold">
                6
              </div>
              <div className="flex-grow">
                <h3 className="font-semibold text-foreground mb-2">Acknowledgment & Retry (Optional)</h3>
                <p className="text-muted-foreground">
                  If acknowledgment is enabled, the on-call contact can reply by SMS or click a secure link. Retry and backup notifications are configurable.
                </p>
              </div>
            </div>

            <ArrowRight className="w-6 h-6 text-muted-foreground mx-auto" />

            {/* Step 7 */}
            <div className="flex items-start gap-4 p-6 border border-border rounded-lg bg-card">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold">
                7
              </div>
              <div className="flex-grow">
                <h3 className="font-semibold text-foreground mb-2">Acknowledged & Logged</h3>
                <p className="text-muted-foreground">
                  If acknowledgment is enabled, the call record updates and events are logged in your system of record.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ACK + Escalation */}
        <div className="max-w-4xl mx-auto mb-24">
          <h2 className="text-2xl font-semibold text-foreground mb-8 text-center">
            Acknowledgment & Backup Notifications
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 border border-border rounded-lg bg-card">
              <div className="flex items-center gap-3 mb-4">
                <CheckCircle2 className="w-6 h-6 text-primary" />
                <h3 className="font-semibold text-foreground">Acknowledgment Methods</h3>
              </div>
              <ul className="space-y-2 text-muted-foreground">
                <li>• SMS reply: "Y", "YES", "ON IT", "TAKING"</li>
                <li>• Secure link click in SMS (if enabled)</li>
                <li>• Phone acknowledgment call (if enabled)</li>
              </ul>
            </div>
            <div className="p-6 border border-border rounded-lg bg-card">
              <div className="flex items-center gap-3 mb-4">
                <AlertTriangle className="w-6 h-6 text-primary" />
                <h3 className="font-semibold text-foreground">Backup Notifications</h3>
              </div>
              <ul className="space-y-2 text-muted-foreground">
                <li>• Optional follow-up to primary contact</li>
                <li>• Optional backup contacts if no acknowledgment</li>
                <li>• Optional owner/manager alert based on your rules</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Retry Timelines */}
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-semibold text-foreground mb-8 text-center">
            Notification Preferences (Configurable)
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 border border-border rounded-lg bg-card">
              <h3 className="font-semibold text-foreground mb-4">Normal Urgency</h3>
              <div className="space-y-2 text-sm text-muted-foreground">
                <div className="flex justify-between">
                  <span>Initial:</span>
                  <span>SMS to primary contact</span>
                </div>
                <div className="flex justify-between">
                  <span>Optional:</span>
                  <span>Follow-up SMS or call</span>
                </div>
                <div className="flex justify-between">
                  <span>Optional:</span>
                  <span>Backup contact</span>
                </div>
                <div className="flex justify-between">
                  <span>Optional:</span>
                  <span>Owner/manager alert</span>
                </div>
              </div>
            </div>
            <div className="p-6 border border-border rounded-lg bg-card">
              <h3 className="font-semibold text-foreground mb-4">High Urgency</h3>
              <div className="space-y-2 text-sm text-muted-foreground">
                <div className="flex justify-between">
                  <span>Initial:</span>
                  <span>SMS to primary contact</span>
                </div>
                <div className="flex justify-between">
                  <span>Optional:</span>
                  <span>Follow-up SMS or call</span>
                </div>
                <div className="flex justify-between">
                  <span>Optional:</span>
                  <span>Backup contact</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
