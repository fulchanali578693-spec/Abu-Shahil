import React, { useState } from 'react';
import { Heart, Plus, ShoppingCart, Star } from 'lucide-react';
import { StoreProduct } from '../lib/syncedStore';
import { CustomerUser } from '../lib/firebase';

interface PopularProductsSectionProps {
  products: StoreProduct[];
  currencySymbol: string;
  currentCustomer: CustomerUser | null;
  onAddToCart: (product: StoreProduct) => void;
  onRequireAuth: (msg: string) => void;
}

export const PopularProductsSection: React.FC<PopularProductsSectionProps> = ({
  products,
  currencySymbol,
  currentCustomer,
  onAddToCart,
  onRequireAuth,
}) => {
  const [wishlist, setWishlist] = useState<Record<string, boolean>>({});

  const toggleWishlist = (id: string) => {
    setWishlist((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const popular = products.filter((p) => p.isPopular || !p.isDailyDeal);

  const handleAdd = (p: StoreProduct) => {
    // ENFORCE: "without login not allow anything"
    if (!currentCustomer) {
      onRequireAuth(`Please sign in or register to add "${p.name}" to your cart.`);
      return;
    }
    onAddToCart(p);
  };

  return (
    <section id="popular-products" className="py-12 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl sm:text-2xl font-black text-stone-900 tracking-tight">
                Popular Products
              </span>
            </div>
            <p className="text-xs text-stone-500">Customer Favorites</p>
          </div>
          <a href="#all-products" className="text-xs font-bold text-purple-700 hover:text-purple-900">
            View All →
          </a>
        </div>

        {/* 6-Column Grid matching the template */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {popular.map((product) => {
            const isWish = !!wishlist[product.id];
            return (
              <div
                key={product.id}
                className="bg-white rounded-2xl border border-stone-200 p-3 hover:border-purple-300 hover:shadow-md transition-all flex flex-col justify-between group relative"
              >
                {/* Wishlist Heart */}
                <button
                  onClick={() => toggleWishlist(product.id)}
                  className="absolute top-4 right-4 z-10 p-1.5 rounded-full bg-white/80 backdrop-blur-xs text-stone-400 hover:text-rose-500 transition-colors cursor-pointer shadow-xs"
                >
                  <Heart className={`w-3.5 h-3.5 ${isWish ? 'fill-rose-500 text-rose-500' : ''}`} />
                </button>

                {/* Thumbnail Image */}
                <div className="aspect-square rounded-xl bg-stone-50 overflow-hidden mb-2.5">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>

                {/* Details */}
                <div className="space-y-1">
                  <h4 className="font-bold text-xs text-stone-900 truncate" title={product.name}>
                    {product.name}
                  </h4>

                  <div className="flex items-center gap-1 text-[11px] text-stone-500">
                    <div className="flex text-amber-400">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-2.5 h-2.5 fill-amber-400" />
                      ))}
                    </div>
                    <span>({product.rating})</span>
                  </div>

                  <div className="text-sm font-black text-stone-900 tabular-nums pt-1">
                    {currencySymbol}{product.price.toFixed(2)}
                  </div>
                </div>

                {/* Quick Add Button */}
                <button
                  onClick={() => handleAdd(product)}
                  className="mt-3 w-full py-1.5 px-2 bg-stone-100 hover:bg-purple-600 hover:text-white text-stone-800 text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add</span>
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
