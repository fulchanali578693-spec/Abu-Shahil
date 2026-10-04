import React from 'react';
import { ArrowRight, Flame, Sparkles } from 'lucide-react';
import { StoreProduct } from '../lib/syncedStore';
import { CustomerUser } from '../lib/firebase';

interface LimitedDropsSectionProps {
  products: StoreProduct[];
  currencySymbol: string;
  currentCustomer: CustomerUser | null;
  onAddToCart: (product: StoreProduct) => void;
  onRequireAuth: (msg: string) => void;
}

export const LimitedDropsSection: React.FC<LimitedDropsSectionProps> = ({
  products,
  currencySymbol,
  currentCustomer,
  onAddToCart,
  onRequireAuth,
}) => {
  const limitedDrops = products.filter((p) => p.isLimitedDrop);

  const handleAdd = (p: StoreProduct) => {
    if (!currentCustomer) {
      onRequireAuth(`Please sign in or register to claim limited drop "${p.name}".`);
      return;
    }
    onAddToCart(p);
  };

  return (
    <section id="limited-drops" className="py-12 bg-[#0E0B1F] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2">
                <span>Limited Drops</span>
                <Flame className="w-5 h-5 text-rose-500 fill-rose-500" />
              </span>
            </div>
            <p className="text-xs text-purple-300">Rare Finds. Limited Stock!</p>
          </div>

          <a
            href="#limited-drops"
            className="px-5 py-2.5 bg-[#CBF42C] hover:bg-[#b5dc21] text-stone-950 text-xs font-black rounded-full shadow-lg transition-all self-start sm:self-auto cursor-pointer"
          >
            Shop Limited →
          </a>
        </div>

        {/* Drops Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {limitedDrops.map((drop) => (
            <div
              key={drop.id}
              className="bg-[#1A1538] rounded-2xl p-4 border border-purple-900/60 hover:border-purple-500 transition-all flex flex-col justify-between group"
            >
              <div className="relative aspect-square rounded-xl bg-purple-950/40 overflow-hidden mb-3">
                <img
                  src={drop.image}
                  alt={drop.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>

              <div className="space-y-2">
                <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-lime-400/20 text-lime-300 border border-lime-400/30">
                  {drop.badge || 'Limited Batch'}
                </span>

                <h4 className="font-bold text-xs sm:text-sm text-white truncate">
                  {drop.name}
                </h4>

                <div className="flex items-baseline justify-between pt-1">
                  <span className="text-base sm:text-lg font-black text-amber-300 tabular-nums">
                    {currencySymbol}{drop.price.toFixed(2)}
                  </span>
                  <button
                    onClick={() => handleAdd(drop)}
                    className="px-3 py-1 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
                  >
                    Add
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
