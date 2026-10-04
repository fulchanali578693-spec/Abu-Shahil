import React from 'react';
import { ShieldCheck, Sun, VolumeX, Zap, Droplets, Sparkles, Feather } from 'lucide-react';
import { StoreConfig } from '../config/storeConfig';

interface ProductFeaturesProps {
  config: StoreConfig;
}

export const ProductFeatures: React.FC<ProductFeaturesProps> = ({ config }) => {
  const getIcon = (name: string) => {
    switch (name) {
      case 'VolumeX':
        return <VolumeX className="w-5 h-5 text-amber-700" />;
      case 'Sun':
        return <Sun className="w-5 h-5 text-amber-700" />;
      case 'Zap':
        return <Zap className="w-5 h-5 text-amber-700" />;
      case 'ShieldCheck':
      default:
        return <ShieldCheck className="w-5 h-5 text-amber-700" />;
    }
  };

  return (
    <section id="features" className="py-16 sm:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Section Header */}
      <div className="max-w-3xl mb-12">
        <span className="text-xs font-bold uppercase tracking-widest text-amber-700">
          Pure Acoustic & Botanical Engineering
        </span>
        <h2 className="text-3xl sm:text-4xl font-serif-display font-bold text-stone-900 mt-2 tracking-tight">
          Form and Function in Organic Porcelain Harmony
        </h2>
        <p className="text-sm sm:text-base text-stone-600 mt-3 leading-relaxed">
          {config.product.description}
        </p>
      </div>

      {/* 2x2 Feature Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {config.product.features.map((feature, idx) => (
          <div
            key={idx}
            className="p-6 sm:p-8 rounded-2xl bg-white border border-stone-200/80 shadow-2xs hover:shadow-xs transition-all flex items-start gap-5"
          >
            <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-200/80 flex items-center justify-center shrink-0">
              {getIcon(feature.icon)}
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-stone-900 mb-2">
                {feature.title}
              </h3>
              <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                {feature.description}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Highlight Callout Banner */}
      <div className="mt-12 p-6 sm:p-8 rounded-2xl bg-[#F4F0E8] border border-amber-900/10 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-1.5 text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start gap-2 text-xs font-bold uppercase tracking-wider text-amber-900">
            <Feather className="w-4 h-4 text-amber-700" />
            <span>Sustainable & Safe Living</span>
          </div>
          <h4 className="text-xl sm:text-2xl font-serif-display font-bold text-stone-900">
            100% Non-Toxic Bisque Ceramic & BPA-Free Reservoir
          </h4>
          <p className="text-xs sm:text-sm text-stone-600 max-w-2xl">
            Designed for homes with children and pets. Zero heated elements, zero plastics touching vapor, and tested for pure aromatic dispersion.
          </p>
        </div>

        <a
          href="#product"
          className="px-6 py-3 text-xs sm:text-sm font-bold text-white bg-stone-900 hover:bg-stone-800 rounded-md transition-all whitespace-nowrap shadow-xs"
        >
          Select Your Color Variant
        </a>
      </div>
    </section>
  );
};
