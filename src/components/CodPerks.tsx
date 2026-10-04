import React from 'react';
import { Banknote, Eye, RotateCcw, ShieldCheck, Truck } from 'lucide-react';
import { StoreConfig } from '../config/storeConfig';

interface CodPerksProps {
  config: StoreConfig;
}

export const CodPerks: React.FC<CodPerksProps> = ({ config }) => {
  const icons = [
    <Banknote key="1" className="w-6 h-6 text-amber-700" />,
    <Eye key="2" className="w-6 h-6 text-amber-700" />,
    <Truck key="3" className="w-6 h-6 text-amber-700" />,
    <RotateCcw key="4" className="w-6 h-6 text-amber-700" />,
  ];

  return (
    <section className="py-12 bg-white border-y border-stone-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="text-xs font-bold uppercase tracking-widest text-amber-700">
            Consumer Protection Promise
          </span>
          <h2 className="text-2xl sm:text-3xl font-serif-display font-bold text-stone-900 mt-1">
            Why Thousands Choose Cash on Delivery
          </h2>
          <p className="text-xs sm:text-sm text-stone-600 mt-2">
            No upfront risk, no digital cards, and complete peace of mind with doorstep parcel inspection.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {config.codPerks.map((perk, index) => (
            <div
              key={index}
              className="p-6 rounded-xl bg-stone-50/60 border border-stone-200/70 hover:border-stone-300 transition-all text-left flex flex-col justify-between"
            >
              <div>
                <div className="w-12 h-12 rounded-lg bg-amber-500/10 flex items-center justify-center mb-4 border border-amber-500/20">
                  {icons[index % icons.length]}
                </div>
                <h3 className="font-bold text-base text-stone-900 mb-1.5">{perk.title}</h3>
                <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                  {perk.description}
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-stone-200/60 flex items-center gap-1.5 text-xs font-medium text-stone-500">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Guaranteed by {config.storeName}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
