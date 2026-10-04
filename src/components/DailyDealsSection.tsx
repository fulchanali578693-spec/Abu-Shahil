import React, { useState, useEffect } from 'react';
import {
  Flame,
  Plus,
  ShoppingCart,
  Star,
  Zap,
} from 'lucide-react';
import { StoreProduct } from '../lib/syncedStore';
import { CustomerUser } from '../lib/firebase';

interface DailyDealsSectionProps {
  products: StoreProduct[];
  currencySymbol: string;
  currentCustomer: CustomerUser | null;
  onAddToCart: (product: StoreProduct) => void;
  onRequireAuth: (actionDescription: string) => void;
}

export const DailyDealsSection: React.FC<DailyDealsSectionProps> = ({
  products,
  currencySymbol,
  currentCustomer,
  onAddToCart,
  onRequireAuth,
}) => {
  // Live ticking countdown timer
  const [timeLeft, setTimeLeft] = useState({ hours: 8, minutes: 24, seconds: 51 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: 59, seconds: 59 };
        if (prev.hours > 0) return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return { hours: 23, minutes: 59, seconds: 59 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const dailyDeals = products.filter((p) => p.isDailyDeal).slice(0, 4);

  const handleAddClick = (product: StoreProduct) => {
    // ENFORCE: "without login not allow anything"
    if (!currentCustomer) {
      onRequireAuth(`Sign in or create an account to add "${product.name}" to your cart.`);
      return;
    }
    onAddToCart(product);
  };

  return (
    <section id="daily-deals" className="py-10 bg-[#FAF8F5]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Deal Banner Header (Purple container matching the image) */}
        <div className="bg-gradient-to-r from-[#201047] via-[#2F156E] to-[#1F0C4B] rounded-2xl p-4 sm:p-6 mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4 text-white shadow-lg">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-400 text-stone-950 flex items-center justify-center font-bold shadow-md">
              <Zap className="w-6 h-6 fill-stone-950" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black tracking-tight flex items-center gap-2">
                <span>Daily Deals</span>
              </h2>
              <p className="text-xs text-purple-200">Fresh Deals Every 24 Hours!</p>
            </div>
          </div>

          {/* Countdown & Action */}
          <div className="flex flex-wrap items-center gap-4">
            {/* Countdown Blocks */}
            <div className="flex items-center gap-2 text-xs font-bold">
              <span className="text-purple-300">Ends In:</span>
              <div className="flex items-center gap-1">
                <span className="px-2 py-1 bg-white/10 rounded-md font-mono text-sm">
                  {String(timeLeft.hours).padStart(2, '0')}
                </span>
                <span className="text-purple-400">:</span>
                <span className="px-2 py-1 bg-white/10 rounded-md font-mono text-sm">
                  {String(timeLeft.minutes).padStart(2, '0')}
                </span>
                <span className="text-purple-400">:</span>
                <span className="px-2 py-1 bg-white/10 rounded-md font-mono text-sm text-amber-300">
                  {String(timeLeft.seconds).padStart(2, '0')}
                </span>
              </div>
            </div>

            {/* View All Deals button */}
            <a
              href="#popular-products"
              className="px-4 py-2 bg-[#CBF42C] hover:bg-[#b8e21e] text-stone-950 font-black text-xs rounded-full shadow-md transition-all cursor-pointer whitespace-nowrap"
            >
              View All Deals →
            </a>
          </div>
        </div>

        {/* 4 Daily Deals Product Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {dailyDeals.map((product) => (
            <div
              key={product.id}
              className="bg-white rounded-2xl border border-stone-200 shadow-xs hover:shadow-md transition-all overflow-hidden flex flex-col justify-between group"
            >
              {/* Product Visual Container with Discount Badge */}
              <div className="relative aspect-4/3 bg-stone-100 overflow-hidden">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
                />

                {/* Discount Badge */}
                {product.discountBadge && (
                  <span className="absolute top-2.5 left-2.5 px-2 py-0.5 bg-rose-500 text-white text-xs font-black rounded-md shadow-sm">
                    {product.discountBadge}
                  </span>
                )}
              </div>

              {/* Product Information */}
              <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-bold text-sm text-stone-900 group-hover:text-purple-700 transition-colors line-clamp-1">
                    {product.name}
                  </h3>

                  {/* Rating Stars */}
                  <div className="flex items-center gap-1.5 mt-1 text-xs">
                    <div className="flex text-amber-400">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                      ))}
                    </div>
                    <span className="font-semibold text-stone-600">({product.rating})</span>
                  </div>

                  {/* Price Row */}
                  <div className="flex items-baseline gap-2 mt-2">
                    <span className="text-xl font-black text-stone-950 tabular-nums">
                      {currencySymbol}{product.price.toFixed(2)}
                    </span>
                    <span className="text-xs text-stone-400 line-through tabular-nums">
                      {currencySymbol}{product.comparePrice.toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Vibrant Purple Add to Cart Button */}
                <button
                  onClick={() => handleAddClick(product)}
                  className="mt-4 w-full py-2.5 px-4 bg-purple-600 hover:bg-purple-700 active:scale-95 text-white font-black text-xs rounded-xl shadow-md shadow-purple-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <ShoppingCart className="w-4 h-4 text-amber-300" />
                  <span>Add to Cart</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
