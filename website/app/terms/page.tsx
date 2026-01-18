import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service - Afterhours',
  description: 'Terms of service for Afterhours.',
};

export default function Terms() {
  return (
    <div className="pt-16 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto prose prose-gray">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Terms of Service</h1>
        <p className="text-gray-600 mb-4">Last updated: {new Date().toLocaleDateString()}</p>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Agreement to Terms</h2>
          <p className="text-gray-700">
            By accessing or using Afterhours ("Service"), you agree to be bound by these Terms of Service. 
            If you disagree with any part of these terms, you may not access the Service.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Use of Service</h2>
          <p className="text-gray-700 mb-4">You agree to use the Service only for lawful purposes and in accordance with these Terms. You agree not to:</p>
          <ul className="list-disc pl-6 text-gray-700 space-y-2">
            <li>Use the Service in any way that violates any applicable law or regulation</li>
            <li>Transmit any malicious code, viruses, or harmful data</li>
            <li>Attempt to gain unauthorized access to the Service or related systems</li>
            <li>Interfere with or disrupt the Service or servers connected to the Service</li>
            <li>Use the Service to send spam or unsolicited communications</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Account Registration</h2>
          <p className="text-gray-700">
            To use certain features of the Service, you may be required to register for an account. 
            You agree to provide accurate, current, and complete information during registration and to update 
            such information to keep it accurate, current, and complete.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Payment Terms</h2>
          <p className="text-gray-700 mb-4">
            If you purchase a subscription to the Service, you agree to pay all fees associated with your subscription. 
            Fees are billed in advance on a monthly or annual basis, as applicable. You are responsible for:
          </p>
          <ul className="list-disc pl-6 text-gray-700 space-y-2">
            <li>All charges incurred under your account</li>
            <li>Maintaining accurate billing information</li>
            <li>Notifying us of any changes to your billing information</li>
          </ul>
          <p className="text-gray-700 mt-4">
            We reserve the right to change our pricing with 30 days' notice. Refunds are provided in accordance 
            with our refund policy, if applicable.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Service Availability</h2>
          <p className="text-gray-700">
            We strive to provide reliable service, but we do not guarantee that the Service will be available 
            at all times or free from errors. The Service may be subject to scheduled maintenance, updates, 
            or unplanned outages. We are not liable for any damages resulting from Service unavailability.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Intellectual Property</h2>
          <p className="text-gray-700">
            The Service and its original content, features, and functionality are owned by Afterhours and are 
            protected by international copyright, trademark, patent, trade secret, and other intellectual property laws.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Limitation of Liability</h2>
          <p className="text-gray-700 mb-4">
            To the maximum extent permitted by law, Afterhours shall not be liable for any indirect, incidental, 
            special, consequential, or punitive damages, or any loss of profits or revenues, whether incurred directly 
            or indirectly, or any loss of data, use, goodwill, or other intangible losses resulting from:
          </p>
          <ul className="list-disc pl-6 text-gray-700 space-y-2">
            <li>Your use or inability to use the Service</li>
            <li>Any unauthorized access to or use of our servers or data</li>
            <li>Any errors or omissions in the Service</li>
            <li>Any interruption or cessation of transmission to or from the Service</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Indemnification</h2>
          <p className="text-gray-700">
            You agree to defend, indemnify, and hold harmless Afterhours and its officers, directors, employees, 
            and agents from and against any claims, liabilities, damages, losses, and expenses, including reasonable 
            attorney's fees, arising out of or in any way connected with your use of the Service or violation of these Terms.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Termination</h2>
          <p className="text-gray-700">
            We may terminate or suspend your account and access to the Service immediately, without prior notice, 
            for any reason, including breach of these Terms. Upon termination, your right to use the Service will 
            cease immediately.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Changes to Terms</h2>
          <p className="text-gray-700">
            We reserve the right to modify these Terms at any time. We will notify you of any material changes 
            by posting the new Terms on this page and updating the "Last updated" date. Your continued use of 
            the Service after such changes constitutes acceptance of the new Terms.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Contact Us</h2>
          <p className="text-gray-700">
            If you have questions about these Terms, please contact us at{' '}
            <a href="mailto:hello@afterhours.com" className="text-accent hover:underline">
              hello@afterhours.com
            </a>
          </p>
        </section>
      </div>
    </div>
  );
}
