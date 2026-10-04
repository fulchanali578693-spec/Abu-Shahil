import React, { useState } from 'react';
import {
  ArrowRight,
  Check,
  Minus,
  Plus,
  ShoppingBag,
  ShoppingCart,
  Tag,
  Trash2,
  X,
} from 'lucide-react';
import { CartItem, syncedStore } from '../lib/syncedStore';
import { CustomerUser } from '../lib/firebase';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  currencySymbol: string;
  appliedCoupon: { code: string; discountPercent: number } | null;
  currentCustomer: CustomerUser | null;
  onProceedToCheckout: () => void;
  onRequireAuth: (msg: string) => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  cart,
  currencySymbol,
  appliedCoupon,
  currentCustomer,
  onProceedToCheckout,
  onRequireAuth,
}) => {
  const [couponInput, setCouponInput] = useState('');
  const [couponError, setCouponError] = useState<string | null>(null);

  if (!isOpen) return null;

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const discountPercent = appliedCoupon ? appliedCoupon.discountPercent : 0;
  const discountAmount = (subtotal * discountPercent) / 100;
  const finalTotal = Math.max(0, subtotal - discountAmount);

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput.trim()) return;
    const res = syncedStore.applyCoupon(couponInput.trim());
    if (res.success) {
      setCouponError(null);
      setCouponInput('');
    } else {
      setCouponError(res.message);
    }
  };

  const handleCheckoutClick = () => {
    // ENFORCE: "customer can order after login. without login not allow anything."
    if (!currentCustomer) {
      onClose();
      onRequireAuth('Authentication Required: You must be logged in to proceed to checkout and place an order. Please sign in or register.');
      return;
    }
    onProceedToCheckout();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-stone-900/60 backdrop-blur-xs transition-opacity"
      />

      {/* Drawer */}
      <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col z-10 animate-in slide-in-from-right duration-250">
        {/* Header */}
        <div className="p-5 border-b border-stone-200 flex items-center justify-between bg-[#0F0C20] text-white">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-purple-600 flex items-center justify-center text-amber-300">
              <ShoppingCart className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-black text-base">Your Shopping Cart</h3>
              <p className="text-[11px] text-purple-300">
                {cart.length} unique item(s) in cart
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-white rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Cart Items List */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {cart.length === 0 ? (
            <div className="text-center py-16 px-4 space-y-3">
              <div className="w-16 h-16 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center mx-auto">
                <ShoppingBag className="w-8 h-8" />
              </div>
              <h4 className="font-bold text-stone-800 text-base">Your cart is empty</h4>
              <p className="text-xs text-stone-500 max-w-xs mx-auto">
                Explore our Daily Deals, Popular Products, and Limited Drops to add items!
              </p>
              <button
                onClick={onClose}
                className="mt-2 px-5 py-2 bg-stone-900 text-white rounded-full text-xs font-bold hover:bg-stone-800 cursor-pointer"
              >
                Start Shopping
              </button>
            </div>
          ) : (
            cart.map((item) => (
              <div
                key={item.id}
                className="p-3.5 rounded-xl border border-stone-200 bg-stone-50/50 flex gap-3 items-center justify-between"
              >
                <img
                  src={item.productImage}
                  alt={item.productName}
                  className="w-16 h-16 rounded-lg object-cover border border-stone-200 shrink-0 bg-white"
                />

                <div className="flex-1 min-w-0 pr-2">
                  <h4 className="font-bold text-xs text-stone-900 truncate" title={item.productName}>
                    {item.productName}
                  </h4>
                  <span className="text-[11px] text-stone-500 block truncate">
                    Finish: {item.variantName}
                  </span>
                  <div className="text-xs font-black text-stone-900 tabular-nums mt-1">
                    {currencySymbol}{item.price.toFixed(2)}
                  </div>
                </div>

                {/* Quantity Controls */}
                <div className="flex flex-col items-end gap-2 shrink-0">
                  <div className="flex items-center gap-1 bg-white border border-stone-300 rounded-lg p-0.5">
                    <button
                      onClick={() => syncedStore.updateCartQuantity(item.id, item.quantity - 1)}
                      className="p-1 text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded cursor-pointer"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="px-2 text-xs font-bold tabular-nums text-stone-900">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => syncedStore.updateCartQuantity(item.id, item.quantity + 1)}
                      className="p-1 text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded cursor-pointer"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>

                  <button
                    onClick={() => syncedStore.removeFromCart(item.id)}
                    className="text-stone-400 hover:text-rose-600 p-1 cursor-pointer"
                    title="Remove item"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer with Subtotal, Coupon, and Checkout Button */}
        {cart.length > 0 && (
          <div className="p-5 border-t border-stone-200 bg-stone-50 space-y-4">
            {/* Coupon Code Input */}
            <form onSubmit={handleApplyCoupon} className="space-y-1">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value)}
                  placeholder="Coupon code (e.g. SAVE10)"
                  className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-stone-300 focus:outline-none focus:border-stone-900 uppercase font-mono bg-white"
                />
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold rounded-lg cursor-pointer transition-colors"
                >
                  Apply
                </button>
              </div>

              {appliedCoupon && (
                <div className="flex items-center justify-between text-xs text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded">
                  <span className="font-bold flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" />
                    <span>Coupon '{appliedCoupon.code}' Applied ({appliedCoupon.discountPercent}%)</span>
                  </span>
                  <span className="font-bold tabular-nums">-{currencySymbol}{discountAmount.toFixed(2)}</span>
                </div>
              )}

              {couponError && (
                <p className="text-[11px] text-rose-600">{couponError}</p>
              )}
            </form>

            {/* Calculations */}
            <div className="space-y-1.5 text-xs text-stone-600">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-bold text-stone-900 tabular-nums">
                  {currencySymbol}{subtotal.toFixed(2)}
                </span>
              </div>

              {discountAmount > 0 && (
                <div className="flex justify-between text-emerald-700">
                  <span>Discount</span>
                  <span className="font-bold tabular-nums">
                    -{currencySymbol}{discountAmount.toFixed(2)}
                  </span>
                </div>
              )}

              <div className="flex justify-between">
                <span>Doorstep Delivery</span>
                <span className="font-bold text-emerald-700">FREE</span>
              </div>

              <div className="pt-2 border-t border-stone-200 flex justify-between items-baseline">
                <span className="text-sm font-black text-stone-900">Total</span>
                <span className="text-2xl font-black text-stone-950 tabular-nums font-serif-display">
                  {currencySymbol}{finalTotal.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Checkout Button */}
            <button
              onClick={handleCheckoutClick}
              className="w-full py-3.5 bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 hover:from-purple-500 hover:to-indigo-500 text-white font-black text-sm rounded-xl shadow-lg shadow-purple-600/30 transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-98"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            {!currentCustomer && (
              <p className="text-[11px] text-purple-800 text-center font-semibold bg-purple-50 p-2 rounded-lg border border-purple-200">
                🔒 Sign in required to complete order. Without login, ordering is not allowed.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
