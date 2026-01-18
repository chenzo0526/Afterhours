'use client';

import { useState } from 'react';

const faqs = [
  {
    question: 'Will this replace my team?',
    answer:
      "No. Afterhours handles after-hours and overflow call intake and sends a summary to your team. It's designed to complement your existing workflow, not replace it.",
  },
  {
    question: 'What if the customer is angry?',
    answer:
      'We keep a calm, professional tone and capture the details. If you enable a handoff and someone is available, the caller can request it.',
  },
  {
    question: 'Can it transfer to a human?',
    answer:
      'If you enable a handoff and it is staffed, callers can request it. Otherwise we capture details and notify your on-call contact.',
  },
  {
    question: "How does it handle urgent calls?",
    answer:
      "It asks a few questions to assess urgency and labels the call based on the caller's answers. You decide how those labels are used for notifications.",
  },
  {
    question: 'What about emergencies?',
    answer:
      'If a caller indicates a life-safety emergency, we instruct them to hang up and call 911. We do not dispatch or promise arrival times.',
  },
  {
    question: 'Does it work with my existing number?',
    answer:
      'Yes. Afterhours works with your existing phone number via call forwarding or a supported carrier setup. We confirm the best option during onboarding.',
  },
  {
    question: 'How fast are notifications sent?',
    answer:
      'Summaries are sent after the call ends by SMS and email. Delivery timing depends on the carrier and email provider.',
  },
  {
    question: 'Do I need new hardware?',
    answer: 'No. Afterhours works entirely in the cloud. You just need to configure call forwarding or use your existing phone system. No new phones, hardware, or equipment required.',
  },
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Frequently Asked Questions
          </h2>
        </div>
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="border border-gray-200 rounded-lg overflow-hidden"
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full px-6 py-4 text-left flex justify-between items-center hover:bg-gray-50 transition-colors"
              >
                <span className="font-semibold text-gray-900">{faq.question}</span>
                <span className="text-gray-500 text-xl">
                  {openIndex === index ? '−' : '+'}
                </span>
              </button>
              {openIndex === index && (
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                  <p className="text-gray-600">{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
