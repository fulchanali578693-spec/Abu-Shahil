import React from 'react';
import { ArrowRight, Flame, ShieldCheck, Sparkles, Tag, Zap } from 'lucide-react';
import { ThemeConfig, WebsiteCustomization } from '../lib/syncedStore';

interface DealKartHeroProps {
  customization?: WebsiteCustomization;
  theme?: ThemeConfig;
  onExploreDeals: () => void;
}

export const DealKartHero: React.FC<DealKartHeroProps> = ({
  customization,
  theme,
  onExploreDeals,
}) => {
  const headline = customization?.heroHeadline || 'Great Finds.';
  const headlineHighlight = customization?.heroHeadlineHighlight || 'Better Prices.';
  const subtitle = customization?.heroSubtitle || 'Shop Smarter. Save More.';
  const badgeText = customization?.heroBadgeText || 'Up To 80% Off Top Brands';
  const ctaText = customization?.heroCtaText || "Explore Today's Deals";
  const subCtaText = customization?.heroSubCtaText || 'Cash on Delivery Available at Doorstep';
  const heroImg = customization?.heroImage || '/src/assets/images/dealkart_hero_banner_1791097277652.jpg';
  const primaryColor = theme?.primaryColor || '#7C3AED';
  const accentColor = theme?.accentColor || '#F59E0B';

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-[#0F0C20] via-[#1B123C] to-[#FAF8F5] pt-8 pb-12 sm:pt-12 sm:pb-16 px-4 sm:px-6 lg:px-8">
      {/* Background ambient glow circles */}
      <div
        className="absolute top-0 left-1/4 w-96 h-96 rounded-full blur-3xl pointer-events-none opacity-30"
        style={{ backgroundColor: primaryColor }}
      />
      <div
        className="absolute top-20 right-10 w-80 h-80 rounded-full blur-3xl pointer-events-none opacity-20"
        style={{ backgroundColor: accentColor }}
      />

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
        {/* Left Column: Headline, Tags, CTA */}
        <div className="lg:col-span-6 space-y-6 text-center lg:text-left">
          {/* Main Display Headline */}
          <div className="space-y-2">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.1]">
              {headline}{' '}
              <span
                className="text-transparent bg-clip-text"
                style={{
                  backgroundImage: `linear-gradient(to right, ${accentColor}, #FDE047, ${accentColor})`,
                }}
              >
                {headlineHighlight}
              </span>
            </h1>
            <p className="text-xl sm:text-2xl font-bold text-purple-200">
              {subtitle}
            </p>
          </div>

          {/* Chips */}
          <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2.5 pt-1">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30">
              <Zap className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
              <span>{badgeText}</span>
            </span>

            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-purple-500/20 text-purple-200 border border-purple-400/30">
              <Flame className="w-3.5 h-3.5 text-rose-400" />
              <span>Limited Time Drop</span>
            </span>

            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Verified Authenticity</span>
            </span>
          </div>

          {/* CTA Button */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
            <button
              onClick={onExploreDeals}
              style={{
                background: `linear-gradient(135deg, ${primaryColor}, #4F46E5)`,
              }}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full text-sm sm:text-base font-black text-white hover:opacity-95 active:scale-95 shadow-xl shadow-purple-600/30 transition-all cursor-pointer"
            >
              <span>{ctaText}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <span className="text-xs text-purple-300">
              {subCtaText}
            </span>
          </div>
        </div>

        {/* Right Column: Hero Visual Graphic Banner */}
        <div className="lg:col-span-6 relative">
          <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-purple-500/20 bg-[#1A133A]/80 backdrop-blur-md group">
            <img
              src={heroImg}
              alt="Hero Showcase Banner"
              className="w-full aspect-16/10 object-cover object-center group-hover:scale-105 transition-transform duration-500"
            />

            {/* Floating Discount Badges matching the template */}
            <div className="absolute top-4 right-4 bg-lime-400 text-stone-950 font-black text-xs px-2.5 py-1 rounded-lg shadow-lg rotate-6 animate-bounce">
              -60% OFF
            </div>

            <div
              className="absolute bottom-6 left-6 text-white font-black text-xs px-3 py-1 rounded-lg shadow-lg -rotate-3"
              style={{ backgroundColor: primaryColor }}
            >
              -55% FLASH
            </div>

            <div
              className="absolute top-1/2 left-4 text-stone-950 font-black text-xs px-2.5 py-1 rounded-lg shadow-lg rotate-3"
              style={{ backgroundColor: accentColor }}
            >
              -40% DROP
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
