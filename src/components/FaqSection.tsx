import React, { useState } from 'react';
import { ChevronDown, HelpCircle, ShieldAlert } from 'lucide-react';
import { StoreConfig } from '../config/storeConfig';

interface FaqSectionProps {
  config: StoreConfig;
}

export const FaqSection: React.FC<FaqSectionProps> = ({ config }) => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleIndex = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <section id="faq" className="py-16 bg-[#FAF8F5] border-t border-stone-200/80">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <span className="text-xs font-bold uppercase tracking-widest text-amber-700">
            Transparent Answers
          </span>
          <h2 className="text-3xl font-serif-display font-bold text-stone-900 mt-2 tracking-tight">
            Cash on Delivery Questions
          </h2>
          <p className="text-xs sm:text-sm text-stone-600 mt-2">
            Everything you need to know about our courier delivery, cash payment, and product guarantees.
          </p>
        </div>

        <div className="space-y-3">
          {config.faqs.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={idx}
                className="bg-white rounded-xl border border-stone-200/90 overflow-hidden shadow-2xs transition-all"
              >
                <button
                  type="button"
                  onClick={() => toggleIndex(idx)}
                  className="w-full py-4 px-5 text-left flex items-center justify-between gap-4 cursor-pointer hover:bg-stone-50/60 transition-colors"
                >
                  <span className="font-bold text-sm sm:text-base text-stone-900">
                    {faq.question}
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 text-stone-500 shrink-0 transition-transform duration-200 ${
                      isOpen ? 'rotate-180 text-stone-900' : ''
                    }`}
                  />
                </button>

                {isOpen && (
                  <div className="px-5 pb-5 text-xs sm:text-sm text-stone-600 leading-relaxed border-t border-stone-100 pt-3 animate-in fade-in duration-150">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Support Help Contact Box */}
        <div className="mt-10 p-5 rounded-xl bg-white border border-stone-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center shrink-0">
              <HelpCircle className="w-5 h-5 text-amber-700" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-stone-900">Have a specific question before ordering?</h4>
              <p className="text-xs text-stone-500">Our customer team is available {config.support.hours}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <a
              href={`mailto:${config.support.email}`}
              className="text-xs font-semibold px-4 py-2 rounded-md bg-stone-100 hover:bg-stone-200 text-stone-800 transition-colors"
            >
              Email Support
            </a>
            <a
              href={`tel:${config.support.phone}`}
              className="text-xs font-bold px-4 py-2 rounded-md bg-stone-900 hover:bg-stone-800 text-white transition-colors"
            >
              Call {config.support.phone}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};
