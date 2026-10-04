import React from 'react';
import { CheckCircle2, Lock, ShieldCheck, Star, Truck } from 'lucide-react';

export const TrustCheckoutStrip: React.FC = () => {
  return (
    <div className="bg-[#FAF8F5] py-10 border-b border-stone-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Fast Secure Checkout Row */}
        <div className="p-6 rounded-2xl bg-white border border-stone-200 flex flex-col md:flex-row items-center justify-between gap-4 shadow-xs">
          <div>
            <h4 className="text-base font-black text-stone-900">
              Fast, Secure & Easy Cash on Delivery Checkout
            </h4>
            <div className="flex flex-wrap items-center gap-4 text-xs text-stone-500 mt-1">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Multiple Payment Options (COD, UPI/QR, Wire)</span>
              </span>
              <span className="flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-stone-600" />
                <span>Data Privacy Guaranteed</span>
              </span>
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-purple-600" />
                <span>Inspect Parcel Before Payment</span>
              </span>
            </div>
          </div>

          {/* Payment Badges */}
          <div className="flex items-center gap-2 text-xs font-bold text-stone-700">
            <span className="px-2.5 py-1 bg-stone-100 rounded border border-stone-200 font-mono">
              COD Cash
            </span>
            <span className="px-2.5 py-1 bg-purple-50 text-purple-700 rounded border border-purple-200 font-mono">
              UPI / QR
            </span>
            <span className="px-2.5 py-1 bg-blue-50 text-blue-700 rounded border border-blue-200 font-mono">
              Direct Bank
            </span>
          </div>
        </div>

        {/* Loved By Thousands Strip matching the template */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <span className="w-2 h-2 rounded-full bg-rose-500" />
            <span className="text-sm font-black text-stone-900">
              Loved By Thousands · Real Customers. Real Savings.
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="p-4 bg-white rounded-xl border border-stone-200 space-y-2">
              <div className="flex text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3 h-3 fill-amber-400" />
                ))}
              </div>
              <p className="text-stone-700 leading-relaxed italic">
                "Amazing deals and super fast courier delivery! Paid cash when the driver handed over the package."
              </p>
              <span className="font-bold text-stone-900 block">— Sarah M., Verified Buyer</span>
            </div>

            <div className="p-4 bg-white rounded-xl border border-stone-200 space-y-2">
              <div className="flex text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3 h-3 fill-amber-400" />
                ))}
              </div>
              <p className="text-stone-700 leading-relaxed italic">
                "Saved so much with the bundles. The member discount stack is unbeatable!"
              </p>
              <span className="font-bold text-stone-900 block">— Ali R., VIP Member</span>
            </div>

            <div className="p-4 bg-white rounded-xl border border-stone-200 space-y-2">
              <div className="flex text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3 h-3 fill-amber-400" />
                ))}
              </div>
              <p className="text-stone-700 leading-relaxed italic">
                "Best marketplace for quality gadgets at competitive prices. QR code payment worked like a charm."
              </p>
              <span className="font-bold text-stone-900 block">— Ayesha K., Verified Buyer</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
