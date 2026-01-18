import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy - Afterhours',
  description: 'Privacy policy for Afterhours.',
};

export default function Privacy() {
  return (
    <div className="pt-16 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto prose prose-gray">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Privacy Policy</h1>
        <p className="text-gray-600 mb-4">Last updated: {new Date().toLocaleDateString()}</p>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Information We Collect</h2>
          <p className="text-gray-700 mb-4">
            We collect information that you provide directly to us, including:
          </p>
          <ul className="list-disc pl-6 text-gray-700 space-y-2">
            <li>Contact information (name, email, phone number, company name)</li>
            <li>Business information (trade type, call volume, current processes)</li>
            <li>Call data and recordings (when using our service)</li>
            <li>Technical information (IP address, browser type, device information)</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">How We Use Your Information</h2>
          <p className="text-gray-700 mb-4">We use the information we collect to:</p>
          <ul className="list-disc pl-6 text-gray-700 space-y-2">
            <li>Provide, maintain, and improve our services</li>
            <li>Process and respond to your inquiries and requests</li>
            <li>Send you technical notices, updates, and support messages</li>
            <li>Monitor and analyze usage patterns and trends</li>
            <li>Detect, prevent, and address technical issues</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Call Data Processing</h2>
          <p className="text-gray-700 mb-4">
            When you use Afterhours, we process call data including:
          </p>
          <ul className="list-disc pl-6 text-gray-700 space-y-2">
            <li>Call recordings and transcripts</li>
            <li>Caller information (name, phone number, address)</li>
            <li>Call metadata (duration, time, date)</li>
            <li>Job details and notification information</li>
          </ul>
          <p className="text-gray-700 mt-4">
            This data is processed to provide our service, generate call summaries, and send notifications.
            We retain call data in accordance with our data retention policies and applicable law.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Data Sharing</h2>
          <p className="text-gray-700 mb-4">
            We do not sell your personal data. We may share your information only in the following circumstances:
          </p>
          <ul className="list-disc pl-6 text-gray-700 space-y-2">
            <li>With your explicit consent</li>
            <li>To comply with legal obligations or respond to lawful requests</li>
            <li>To protect our rights, privacy, safety, or property</li>
            <li>With service providers who assist us in operating our business (under strict confidentiality agreements)</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Data Security</h2>
          <p className="text-gray-700">
            We implement appropriate technical and organizational measures to protect your personal information 
            against unauthorized access, alteration, disclosure, or destruction. However, no method of transmission 
            over the Internet or electronic storage is 100% secure.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Your Rights</h2>
          <p className="text-gray-700 mb-4">You have the right to:</p>
          <ul className="list-disc pl-6 text-gray-700 space-y-2">
            <li>Access your personal information</li>
            <li>Correct inaccurate or incomplete information</li>
            <li>Request deletion of your personal information</li>
            <li>Object to processing of your personal information</li>
            <li>Request restriction of processing</li>
            <li>Data portability</li>
          </ul>
          <p className="text-gray-700 mt-4">
            To exercise these rights, please contact us at{' '}
            <a href="mailto:hello@afterhours.com" className="text-accent hover:underline">
              hello@afterhours.com
            </a>
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Contact Us</h2>
          <p className="text-gray-700">
            If you have questions about this Privacy Policy, please contact us at{' '}
            <a href="mailto:hello@afterhours.com" className="text-accent hover:underline">
              hello@afterhours.com
            </a>
          </p>
        </section>
      </div>
    </div>
  );
}
