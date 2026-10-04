import React from 'react';
import { CheckCircle2, MessageSquare, Star, ThumbsUp } from 'lucide-react';
import { StoreConfig } from '../config/storeConfig';

interface CustomerReviewsProps {
  config: StoreConfig;
}

export const CustomerReviews: React.FC<CustomerReviewsProps> = ({ config }) => {
  return (
    <section id="reviews" className="py-16 sm:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header with aggregate score */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 border-b border-stone-200 pb-8">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-amber-700">
            Real Customer Experiences
          </span>
          <h2 className="text-3xl sm:text-4xl font-serif-display font-bold text-stone-900 mt-2 tracking-tight">
            Verified Cash on Delivery Buyers
          </h2>
          <p className="text-xs sm:text-sm text-stone-600 mt-2 max-w-xl">
            Read direct feedback from clients who ordered online with Cash on Delivery and had their parcel delivered directly to their doorstep.
          </p>
        </div>

        <div className="flex items-center gap-4 bg-white p-4 rounded-xl border border-stone-200 shadow-2xs shrink-0">
          <div className="text-3xl font-serif-display font-bold text-stone-950 tabular-nums">
            {config.product.rating.toFixed(2)}
          </div>
          <div>
            <div className="flex items-center text-amber-400">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-amber-400" />
              ))}
            </div>
            <span className="text-xs text-stone-500 font-medium">
              Based on {config.product.reviewsCount} verified orders
            </span>
          </div>
        </div>
      </div>

      {/* Reviews Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {config.reviews.map((rev) => (
          <div
            key={rev.id}
            className="p-6 rounded-2xl bg-white border border-stone-200/90 shadow-2xs hover:shadow-xs transition-all flex flex-col justify-between"
          >
            <div>
              {/* Star Rating & Date */}
              <div className="flex items-center justify-between mb-3 text-xs">
                <div className="flex items-center text-amber-400">
                  {[...Array(rev.rating)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                  ))}
                </div>
                <span className="text-stone-400 tabular-nums">{rev.date}</span>
              </div>

              {/* Review Title */}
              <h3 className="font-bold text-sm sm:text-base text-stone-900 mb-2 leading-snug">
                "{rev.title}"
              </h3>

              {/* Review Text */}
              <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                {rev.comment}
              </p>
            </div>

            {/* Author Footer */}
            <div className="mt-6 pt-4 border-t border-stone-100 flex items-center justify-between text-xs">
              <div>
                <span className="font-bold text-stone-900 block">{rev.author}</span>
                <span className="text-stone-400 text-[11px]">Variant: {rev.variant}</span>
              </div>

              {rev.verified && (
                <div className="flex items-center gap-1 text-[11px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>Verified COD Buyer</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
