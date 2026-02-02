'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { FAQ as FAQ_LIST, FAQ_HEADING } from '@/lib/marketingCopy';

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-[#050505]" aria-labelledby="faq-heading">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-16">
          <h2 id="faq-heading" className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            {FAQ_HEADING}
          </h2>
        </div>
        <div className="space-y-4" role="list">
          {FAQ_LIST.map((faq, index) => {
            const isOpen = openIndex === index;
            const buttonId = `faq-button-${index}`;
            const panelId = `faq-panel-${index}`;
            
            return (
              <div
                key={index}
                className="border border-border/50 rounded-xl overflow-hidden bg-[#0a0a0a]"
                role="listitem"
              >
                <Button
                  id={buttonId}
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  aria-expanded={isOpen}
                  aria-controls={panelId}
                  variant="ghost"
                  className="w-full px-6 py-4 text-left flex justify-between items-center h-auto"
                >
                  <span className="font-semibold text-foreground">{faq.question}</span>
                  <span className="text-muted-foreground text-xl" aria-hidden="true">
                    {isOpen ? '−' : '+'}
                  </span>
                </Button>
                <div
                  id={panelId}
                  role="region"
                  aria-labelledby={buttonId}
                  className={`px-6 py-4 bg-[#0a0a0a] border-t border-border/50 ${isOpen ? '' : 'hidden'}`}
                >
                  <p className="text-foreground/90">{faq.answer}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
