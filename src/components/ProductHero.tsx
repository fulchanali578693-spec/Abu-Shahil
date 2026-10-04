import React, { useState } from 'react';
import {
  Check,
  ChevronRight,
  Flame,
  Package,
  ShieldCheck,
  Sparkles,
  Star,
  Truck,
} from 'lucide-react';
import { StoreConfig, ProductVariant } from '../config/storeConfig';
import { StoreProduct, CustomPaymentMethod } from '../lib/syncedStore';
import { CustomerUser } from '../lib/firebase';
import { CodOrderForm } from './CodOrderForm';

interface ProductHeroProps {
  config: StoreConfig;
  products: StoreProduct[];
  activeProductId: string;
  selectedVariant: ProductVariant;
  quantity: number;
  paymentMethods: CustomPaymentMethod[];
  currentCustomer: CustomerUser | null;
  onSelectProduct: (productId: string) => void;
  onSelectVariant: (v: ProductVariant) => void;
  onSelectQuantity: (q: number) => void;
}

export const ProductHero: React.FC<ProductHeroProps> = ({
  config,
  products,
  activeProductId,
  selectedVariant,
  quantity,
  paymentMethods,
  currentCustomer,
  onSelectProduct,
  onSelectVariant,
  onSelectQuantity,
}) => {
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [imageError, setImageError] = useState(false);

  const activeProduct = products.find((p) => p.id === activeProductId) || products[0];

  // Calculate pricing based on bundles
  const activeBundle = config.product.bundles.find((b) => b.quantity === quantity) || {
    id: 'custom',
    quantity,
    label: `${quantity} Units`,
    discountPercentage: quantity >= 3 ? 25 : quantity >= 2 ? 15 : 0,
    savingsLabel: '',
  };

  const discountRate = (100 - activeBundle.discountPercentage) / 100;
  const unitPrice = activeProduct.price * discountRate;
  const totalPrice = unitPrice * quantity;
  const originalTotalPrice = activeProduct.comparePrice * quantity;
  const totalSaved = originalTotalPrice - totalPrice;

  const currentImage =
    selectedVariant.image || activeProduct.gallery[activeImageIndex] || activeProduct.image;

  return (
    <section id="product" className="py-8 sm:py-12 lg:py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Category / Breadcrumb kicker */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-2 text-xs text-stone-500 font-medium">
          <span>Home</span>
          <ChevronRight className="w-3 h-3 text-stone-400" />
          <span>{activeProduct.category}</span>
          <ChevronRight className="w-3 h-3 text-stone-400" />
          <span className="text-stone-900 font-semibold">{activeProduct.name}</span>
        </div>

        {/* Product Catalog Switcher if Admin added more products */}
        {products.length > 1 && (
          <div className="flex items-center gap-1.5 bg-stone-100 p-1 rounded-lg border border-stone-200">
            <span className="text-[11px] font-semibold text-stone-500 px-2">Catalog:</span>
            {products.map((p) => (
              <button
                key={p.id}
                onClick={() => {
                  onSelectProduct(p.id);
                  if (p.variants && p.variants.length > 0) {
                    onSelectVariant(p.variants[0]);
                  }
                }}
                className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                  p.id === activeProduct.id
                    ? 'bg-white text-stone-900 shadow-2xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                {p.name.split(' ')[0]}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
        {/* LEFT COLUMN: Gallery & Visual Showcase (5 cols on lg) */}
        <div className="lg:col-span-5 space-y-4 lg:sticky lg:top-24">
          <div className="relative aspect-4/3 sm:aspect-square bg-stone-100 rounded-2xl overflow-hidden border border-stone-200/80 shadow-xs group">
            {!imageError ? (
              <img
                src={currentImage}
                alt={activeProduct.name}
                referrerPolicy="no-referrer"
                onError={() => setImageError(true)}
                className="w-full h-full object-cover object-center transition-all duration-300 group-hover:scale-[1.02]"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center bg-stone-100 p-8 text-center">
                <Sparkles className="w-12 h-12 text-stone-400 mb-3" />
                <span className="font-serif-display text-lg font-bold text-stone-800">
                  {activeProduct.name}
                </span>
                <span className="text-xs text-stone-500 mt-1">Artisanal Bisque Ceramic</span>
              </div>
            )}

            <div className="absolute top-4 left-4 bg-stone-900/90 text-white text-[11px] font-semibold tracking-wider uppercase px-3 py-1 rounded backdrop-blur-xs shadow-xs">
              {activeProduct.badge}
            </div>

            <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-md border border-stone-200 text-xs font-medium text-stone-800 shadow-xs flex items-center gap-2">
              <span
                className="w-3 h-3 rounded-full border border-stone-300 shrink-0"
                style={{ backgroundColor: selectedVariant.colorHex }}
              />
              <span>{selectedVariant.name}</span>
            </div>
          </div>

          {/* Gallery Thumbnails */}
          <div className="grid grid-cols-3 gap-3">
            {activeProduct.gallery.map((img, idx) => {
              const isSelected = activeImageIndex === idx;
              return (
                <button
                  key={idx}
                  onClick={() => {
                    setActiveImageIndex(idx);
                    setImageError(false);
                  }}
                  className={`aspect-4/3 rounded-lg overflow-hidden border-2 transition-all cursor-pointer bg-stone-100 ${
                    isSelected
                      ? 'border-stone-900 shadow-xs'
                      : 'border-stone-200 hover:border-stone-400 opacity-80 hover:opacity-100'
                  }`}
                >
                  <img
                    src={img}
                    alt={`Product view ${idx + 1}`}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                </button>
              );
            })}
          </div>

          {/* Quick COD Trust Guarantee Bullets */}
          <div className="p-4 bg-amber-50/70 border border-amber-200/70 rounded-xl space-y-2 text-xs text-amber-950">
            <div className="font-bold flex items-center gap-1.5 text-stone-900">
              <Truck className="w-4 h-4 text-amber-700" />
              <span>Doorstep Delivery Guarantees</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-stone-700 pt-1">
              <div className="flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Zero card required</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Inspect before payment</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Free 48h door delivery</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>7-Day swap guarantee</span>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Product Information & Direct COD Checkout Form */}
        <div className="lg:col-span-7 space-y-6">
          <div>
            <div className="flex items-center gap-2 text-xs text-stone-500 font-medium mb-1.5">
              <span>{activeProduct.category}</span>
              <span aria-hidden="true">·</span>
              <span className="text-emerald-700 font-semibold">In Stock ({activeProduct.stockCount} units)</span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-serif-display font-bold text-stone-950 tracking-tight leading-snug">
              {activeProduct.name}
            </h1>

            <p className="text-stone-600 text-sm sm:text-base mt-2 leading-relaxed">
              {activeProduct.subtitle}
            </p>

            <div className="flex items-center gap-3 mt-3 text-xs sm:text-sm">
              <div className="flex items-center text-amber-500">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <span className="font-bold text-stone-900 tabular-nums">
                {activeProduct.rating.toFixed(2)}
              </span>
              <span className="text-stone-400">·</span>
              <a href="#reviews" className="text-stone-600 hover:text-stone-900 underline underline-offset-2">
                {activeProduct.reviewsCount} verified reviews
              </a>
            </div>
          </div>

          {/* Pricing Box & Savings */}
          <div className="p-4 sm:p-5 rounded-xl bg-white border border-stone-200/90 shadow-2xs flex flex-wrap items-baseline justify-between gap-4">
            <div>
              <div className="flex items-baseline gap-3">
                <span className="text-3xl sm:text-4xl font-serif-display font-bold text-stone-950 tabular-nums">
                  {config.currency.symbol}{unitPrice.toFixed(2)}
                </span>
                <span className="text-base sm:text-lg text-stone-400 line-through tabular-nums font-normal">
                  {config.currency.symbol}{activeProduct.comparePrice.toFixed(2)}
                </span>
                <span className="px-2 py-0.5 text-xs font-bold text-emerald-800 bg-emerald-100 rounded">
                  Save {config.currency.symbol}{(activeProduct.comparePrice - unitPrice).toFixed(0)}
                </span>
              </div>
              <p className="text-xs text-stone-500 mt-1">
                Taxes & delivery included. Pay directly upon package inspection.
              </p>
            </div>

            <div className="flex items-center gap-2 text-xs font-medium text-amber-800 bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-200/60">
              <Flame className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Only {activeProduct.stockCount} units available for 48h dispatch</span>
            </div>
          </div>

          {/* Select Finish / Variant (Includes variants added by Admin) */}
          <div>
            <div className="flex items-center justify-between text-xs font-semibold text-stone-800 mb-2.5">
              <span>
                Select Finish: <strong className="text-stone-950 font-bold">{selectedVariant.name}</strong>
              </span>
              <span className="text-emerald-700 font-medium">Ready to ship</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {activeProduct.variants.map((variant) => {
                const isSelected = selectedVariant.id === variant.id;
                return (
                  <button
                    key={variant.id}
                    onClick={() => {
                      onSelectVariant(variant);
                      setImageError(false);
                    }}
                    className={`relative p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col gap-2 ${
                      isSelected
                        ? 'border-stone-950 bg-white ring-1 ring-stone-950 shadow-xs'
                        : 'border-stone-200 hover:border-stone-300 bg-white/70'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span
                        className="w-5 h-5 rounded-full border border-stone-300 shadow-2xs shrink-0"
                        style={{ backgroundColor: variant.colorHex }}
                      />
                      {isSelected && (
                        <div className="w-4 h-4 rounded-full bg-stone-950 text-white flex items-center justify-center">
                          <Check className="w-2.5 h-2.5" />
                        </div>
                      )}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-stone-900 truncate">
                        {variant.name}
                      </div>
                      <div className="text-[11px] text-stone-500 truncate">
                        {variant.colorName}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Bundle Deals & Quantity Selector */}
          <div>
            <div className="flex items-center justify-between text-xs font-semibold text-stone-800 mb-2.5">
              <span>Select Quantity & Bundle Discount:</span>
              <span className="text-stone-500 font-normal">Free Express COD on all orders</span>
            </div>

            <div className="space-y-2.5">
              {config.product.bundles.map((bundle) => {
                const isSelected = quantity === bundle.quantity;
                const bundleUnitPrice = activeProduct.price * ((100 - bundle.discountPercentage) / 100);
                const bundleTotalPrice = bundleUnitPrice * bundle.quantity;

                return (
                  <button
                    key={bundle.id}
                    onClick={() => onSelectQuantity(bundle.quantity)}
                    className={`w-full p-3.5 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between gap-3 ${
                      isSelected
                        ? 'border-stone-950 bg-amber-50/40 ring-1 ring-stone-950 shadow-xs'
                        : 'border-stone-200 hover:border-stone-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ${
                          isSelected
                            ? 'border-stone-950 bg-stone-950 text-white'
                            : 'border-stone-300 bg-white'
                        }`}
                      >
                        {isSelected && <Check className="w-3 h-3" />}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs sm:text-sm font-bold text-stone-900">
                            {bundle.label}
                          </span>
                          {bundle.badge && (
                            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 bg-amber-100 text-amber-800 rounded">
                              {bundle.badge}
                            </span>
                          )}
                        </div>
                        <span className="text-xs text-stone-500">
                          {config.currency.symbol}{bundleUnitPrice.toFixed(2)} each {bundle.savingsLabel && `· ${bundle.savingsLabel}`}
                        </span>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="text-sm sm:text-base font-bold tabular-nums text-stone-950">
                        {config.currency.symbol}{bundleTotalPrice.toFixed(2)}
                      </div>
                      <span className="text-[11px] text-emerald-700 font-medium">Free Shipping</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* COD Direct Order Form */}
          <div className="pt-2">
            <CodOrderForm
              config={config}
              productName={activeProduct.name}
              variants={activeProduct.variants}
              selectedVariant={selectedVariant}
              quantity={quantity}
              totalPrice={totalPrice}
              unitPrice={unitPrice}
              paymentMethods={paymentMethods}
              currentCustomer={currentCustomer}
              onSelectVariant={onSelectVariant}
              onUpdateQuantity={onSelectQuantity}
            />
          </div>
        </div>
      </div>
    </section>
  );
};
