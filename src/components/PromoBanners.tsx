import React from 'react';
import { ArrowRight, Check, Crown, Gift, Sparkles, Tag, Zap } from 'lucide-react';
import { ThemeConfig, WebsiteCustomization } from '../lib/syncedStore';

interface PromoBannersProps {
  customization?: WebsiteCustomization;
  theme?: ThemeConfig;
  onExploreBundles: () => void;
  onJoinMember: () => void;
}

export const PromoBanners: React.FC<PromoBannersProps> = ({
  customization,
  theme,
  onExploreBundles,
  onJoinMember,
}) => {
  const b1Title = customization?.banner1Title || 'Buy More. Save More!';
  const b1Subtitle = customization?.banner1Subtitle || 'Pair top tech gadgets, audio gear, and lifestyle essentials for volume bundle savings.';
  const b1Discount = customization?.banner1Discount || 'Up To 70% Off';
  const b1Badge = customization?.banner1Badge || 'Bundle Savings';

  const b2Title = customization?.banner2Title || 'Join DealKart+ for Extra Perks!';
  const b2Subtitle = customization?.banner2Subtitle || 'VIP cash on delivery priority, early-bird drop alerts, and exclusive secret voucher codes.';
  const b2Discount = customization?.banner2Discount || 'VIP Free Delivery';
  const b2Badge = customization?.banner2Badge || 'Member Exclusive';

  const primaryColor = theme?.primaryColor || '#7C3AED';
  const accentColor = theme?.accentColor || '#F59E0B';

  return (
    <section id="bundles" className="py-8 bg-white border-y border-stone-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Card 1: Bundle Savings (Fresh vibrant card) */}
          <div className="relative rounded-3xl p-6 sm:p-8 bg-gradient-to-br from-[#E2F79A]/80 via-[#D4F070]/70 to-[#C5E84A]/60 border border-lime-300 shadow-sm overflow-hidden flex flex-col justify-between">
            <div className="space-y-2 relative z-10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-stone-900 font-black text-xs uppercase tracking-wider">
                  <Gift className="w-5 h-5 text-emerald-800" />
                  <span>{b1Badge}</span>
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-stone-900 text-white">
                  {b1Discount}
                </span>
              </div>

              <h3 className="text-2xl sm:text-3xl font-black text-stone-950 tracking-tight">
                {b1Title}
              </h3>
              <p className="text-xs sm:text-sm text-stone-700 max-w-sm">
                {b1Subtitle}
              </p>
            </div>

            <div className="pt-8 relative z-10">
              <button
                onClick={onExploreBundles}
                className="inline-flex items-center gap-2 px-6 py-3 bg-stone-950 hover:bg-stone-800 text-white font-bold text-xs rounded-full shadow-md transition-all cursor-pointer"
              >
                <span>Explore Bundles</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Card 2: Member Exclusive (Deep theme card) */}
          <div
            className="relative rounded-3xl p-6 sm:p-8 text-white border border-purple-800 shadow-lg overflow-hidden flex flex-col justify-between"
            style={{
              background: `linear-gradient(135deg, #1C0E3F 0%, ${primaryColor}44 50%, #0C071C 100%)`,
            }}
          >
            <div className="space-y-4 relative z-10">
              <div className="flex items-center justify-between">
                <div
                  className="flex items-center gap-2 font-black text-xs uppercase tracking-wider"
                  style={{ color: accentColor }}
                >
                  <Crown className="w-5 h-5" style={{ fill: accentColor, color: accentColor }} />
                  <span>{b2Badge}</span>
                </div>
                <span
                  className="px-2.5 py-0.5 rounded-full text-xs font-black text-stone-950"
                  style={{ backgroundColor: accentColor }}
                >
                  {b2Discount}
                </span>
              </div>

              <div>
                <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                  {b2Title}
                </h3>
                <p className="text-xs text-purple-200 mt-1">
                  {b2Subtitle}
                </p>
              </div>

              <ul className="space-y-1.5 text-xs text-purple-100">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-amber-400" />
                  <span>Extra 10% Member Discount</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-amber-400" />
                  <span>Early Access to Limited Drops</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-amber-400" />
                  <span>Free Fast Shipping on All Orders</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-amber-400" />
                  <span>Exclusive Member Secret Deals</span>
                </li>
              </ul>
            </div>

            <div className="pt-6 relative z-10">
              <button
                onClick={onJoinMember}
                style={{ backgroundColor: accentColor }}
                className="inline-flex items-center gap-2 px-6 py-3 hover:opacity-90 text-stone-950 font-black text-xs rounded-full shadow-lg transition-all cursor-pointer"
              >
                <span>Join VIP Members →</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
