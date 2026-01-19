'use client';

import { useState } from 'react';

const faqs = [
  {
    question: 'Is it really free to try?',
    answer: "Yes. It's free to try and easy to stop.",
  },
  {
    question: 'What happens on urgent calls?',
    answer:
      "We notify your on-call contact right away. If it's life-threatening, callers should call 911.",
  },
  {
    question: "What happens when it's not urgent?",
    answer: 'It goes to the morning report with full details.',
  },
  {
    question: 'How fast can we start?',
    answer: 'As soon as forwarding is ready, usually within a day.',
  },
  {
    question: 'Do I need new hardware?',
    answer: 'No. Use your existing number with call forwarding.',
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
