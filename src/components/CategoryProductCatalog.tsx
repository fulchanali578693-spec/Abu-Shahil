import React, { useState } from 'react';
import {
  Check,
  Heart,
  Layers,
  Package,
  Plus,
  ShieldCheck,
  ShoppingCart,
  Star,
  Truck,
  Zap,
} from 'lucide-react';
import { StoreProduct } from '../lib/syncedStore';
import { CustomerUser } from '../lib/firebase';
import { ProductVariant } from '../config/storeConfig';

interface CategoryProductCatalogProps {
  products: StoreProduct[];
  categories: string[];
  selectedCategory: string;
  onSelectCategory: (cat: string) => void;
  currencySymbol: string;
  currentCustomer: CustomerUser | null;
  onAddToCart: (product: StoreProduct, variant?: ProductVariant) => void;
  onRequireAuth: (msg: string) => void;
  onOpenAdmin?: () => void;
}

export const CategoryProductCatalog: React.FC<CategoryProductCatalogProps> = ({
  products,
  categories,
  selectedCategory,
  onSelectCategory,
  currencySymbol,
  currentCustomer,
  onAddToCart,
  onRequireAuth,
  onOpenAdmin,
}) => {
  const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>({});
  const [wishlist, setWishlist] = useState<Record<string, boolean>>({});

  const toggleWish = (id: string) => {
    setWishlist((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleSelectVariant = (productId: string, variantId: string) => {
    setSelectedVariants((prev) => ({ ...prev, [productId]: variantId }));
  };

  // Filter products by selected category
  const filteredProducts =
    selectedCategory === 'All'
      ? products
      : products.filter((p) => p.category.toLowerCase() === selectedCategory.toLowerCase());

  const handleAdd = (product: StoreProduct) => {
    // ENFORCEMENT: "without login not allow anything"
    if (!currentCustomer) {
      onRequireAuth(`Please sign in or register to add "${product.name}" to your cart. Login is required before placing orders.`);
      return;
    }

    const chosenVariantId = selectedVariants[product.id];
    const chosenVariant = product.variants.find((v) => v.id === chosenVariantId) || product.variants[0];
    onAddToCart(product, chosenVariant);
  };

  return (
    <section id="category-catalog" className="py-12 bg-[#FAF8F5] border-b border-stone-200/80 scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-purple-700 font-bold text-xs uppercase tracking-wider">
              <Layers className="w-4 h-4" />
              <span>Full Marketplace Catalog</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight mt-1">
              Category-Wise Product Collection
            </h2>
            <p className="text-xs sm:text-sm text-stone-500 mt-1">
              Browse products organized by category. Cash on delivery & doorstep inspection available for all items.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-stone-500 bg-white px-3 py-1.5 rounded-xl border border-stone-200 shadow-2xs">
              Showing {filteredProducts.length} of {products.length} Products
            </span>
          </div>
        </div>

        {/* Category Option Tabs Bar (Requirement: "add category option on website") */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          <button
            onClick={() => onSelectCategory('All')}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
              selectedCategory === 'All'
                ? 'bg-purple-600 text-white shadow-sm ring-2 ring-purple-600 ring-offset-1'
                : 'bg-white text-stone-700 hover:bg-stone-100 border border-stone-200'
            }`}
          >
            <span>All Categories</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                selectedCategory === 'All' ? 'bg-purple-700 text-purple-100' : 'bg-stone-100 text-stone-600'
              }`}
            >
              {products.length}
            </span>
          </button>

          {categories.map((cat) => {
            const count = products.filter(
              (p) => p.category.toLowerCase() === cat.toLowerCase()
            ).length;
            const isSelected = selectedCategory === cat;

            return (
              <button
                key={cat}
                onClick={() => onSelectCategory(isSelected ? 'All' : cat)}
                className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-purple-600 text-white shadow-sm ring-2 ring-purple-600 ring-offset-1'
                    : 'bg-white text-stone-700 hover:bg-stone-100 border border-stone-200'
                }`}
              >
                <span>{cat}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    isSelected ? 'bg-purple-700 text-purple-100' : 'bg-stone-100 text-stone-600'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Product Cards Grid */}
        {filteredProducts.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-stone-200/80 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center mx-auto">
              <Package className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-stone-900">
              No products found in &quot;{selectedCategory}&quot; category
            </h3>
            <p className="text-xs text-stone-500 max-w-sm mx-auto">
              You can add unlimited products to this category anytime from the Admin Dashboard.
            </p>
            {onOpenAdmin && (
              <button
                onClick={onOpenAdmin}
                className="mt-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl transition-all cursor-pointer shadow-xs"
              >
                Open Admin & Add Product
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {filteredProducts.map((product) => {
              const activeVariantId = selectedVariants[product.id] || product.variants[0]?.id;
              const activeVariant =
                product.variants.find((v) => v.id === activeVariantId) || product.variants[0];
              const displayImage = activeVariant?.image || product.image;
              const isWish = !!wishlist[product.id];
              const discountPercent = Math.round(
                ((product.comparePrice - product.price) / product.comparePrice) * 100
              );

              return (
                <div
                  key={product.id}
                  className="bg-white rounded-3xl border border-stone-200/90 overflow-hidden hover:border-purple-300 hover:shadow-lg transition-all flex flex-col justify-between group relative"
                >
                  {/* Top Badges & Wishlist */}
                  <div className="relative aspect-4/3 bg-stone-50 overflow-hidden">
                    <img
                      src={displayImage}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />

                    {/* Category Pill Tag */}
                    <div className="absolute top-3 left-3 flex flex-col gap-1">
                      <span className="px-2.5 py-0.5 rounded-full bg-white/95 backdrop-blur-xs text-[10px] font-black uppercase tracking-wider text-purple-900 shadow-xs border border-purple-100">
                        {product.category}
                      </span>
                      {product.badge && (
                        <span className="px-2 py-0.5 rounded-full bg-amber-400 text-amber-950 text-[10px] font-black shadow-xs">
                          {product.badge}
                        </span>
                      )}
                    </div>

                    {/* Wishlist Button */}
                    <button
                      onClick={() => toggleWish(product.id)}
                      className="absolute top-3 right-3 p-2 rounded-full bg-white/90 backdrop-blur-xs text-stone-400 hover:text-rose-500 transition-colors shadow-xs cursor-pointer"
                      title="Save to Wishlist"
                    >
                      <Heart className={`w-4 h-4 ${isWish ? 'fill-rose-500 text-rose-500' : ''}`} />
                    </button>

                    {/* Discount Pill */}
                    {discountPercent > 0 && (
                      <div className="absolute bottom-3 left-3 bg-rose-600 text-white text-[10px] font-black px-2 py-0.5 rounded-md shadow-xs">
                        SAVE {discountPercent}%
                      </div>
                    )}
                  </div>

                  {/* Card Content */}
                  <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3">
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-1.5 text-xs">
                        <div className="flex text-amber-400">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className="w-3 h-3 fill-amber-400" />
                          ))}
                        </div>
                        <span className="text-[11px] font-bold text-stone-500">
                          {product.rating} ({product.reviewsCount})
                        </span>
                      </div>

                      <h3
                        className="font-bold text-sm text-stone-900 line-clamp-1 group-hover:text-purple-700 transition-colors"
                        title={product.name}
                      >
                        {product.name}
                      </h3>

                      <p className="text-[11px] text-stone-500 line-clamp-2 leading-relaxed">
                        {product.subtitle || product.description}
                      </p>
                    </div>

                    {/* Variants Swatches if product has variants */}
                    {product.variants.length > 1 && (
                      <div className="pt-2 border-t border-stone-100">
                        <div className="flex items-center justify-between text-[11px] text-stone-500 mb-1.5">
                          <span>Option:</span>
                          <span className="font-semibold text-stone-800">{activeVariant?.name}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          {product.variants.map((v) => {
                            const isSelected = v.id === activeVariantId;
                            return (
                              <button
                                key={v.id}
                                onClick={() => handleSelectVariant(product.id, v.id)}
                                className={`w-5 h-5 rounded-full border transition-all cursor-pointer p-0.5 ${
                                  isSelected ? 'ring-2 ring-purple-600 scale-110' : 'border-stone-300'
                                }`}
                                style={{ backgroundColor: v.colorHex }}
                                title={v.name}
                              />
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Price and Add to Cart Row */}
                    <div className="pt-3 border-t border-stone-100 flex items-center justify-between gap-2">
                      <div>
                        <div className="flex items-baseline gap-1.5">
                          <span className="text-lg sm:text-xl font-black text-stone-900 tabular-nums">
                            {currencySymbol}{product.price.toFixed(2)}
                          </span>
                          <span className="text-xs text-stone-400 line-through tabular-nums">
                            {currencySymbol}{product.comparePrice.toFixed(2)}
                          </span>
                        </div>
                        <span className="text-[10px] text-emerald-700 font-semibold block">
                          Free COD Delivery
                        </span>
                      </div>

                      <button
                        onClick={() => handleAdd(product)}
                        className="px-3.5 py-2.5 bg-stone-900 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center gap-1.5 group-hover:bg-purple-600"
                        title={currentCustomer ? 'Add to Cart' : 'Login required to add to cart'}
                      >
                        <ShoppingCart className="w-3.5 h-3.5" />
                        <span>Add to Cart</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};
