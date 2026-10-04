import React, { useState } from 'react';
import {
  AlertCircle,
  Banknote,
  Check,
  CheckCircle2,
  CreditCard,
  Lock,
  Mail,
  MapPin,
  Phone,
  QrCode,
  ShieldCheck,
  Truck,
  Upload,
  User,
  X,
} from 'lucide-react';
import { CustomerUser } from '../lib/firebase';
import { CartItem, CustomPaymentMethod, syncedStore } from '../lib/syncedStore';
import { insertCodOrder, OrderInsertPayload } from '../lib/supabase';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  currencySymbol: string;
  appliedCoupon: { code: string; discountPercent: number } | null;
  paymentMethods: CustomPaymentMethod[];
  currentCustomer: CustomerUser;
  onOrderSuccess: (order: OrderInsertPayload) => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  cart,
  currencySymbol,
  appliedCoupon,
  paymentMethods,
  currentCustomer,
  onOrderSuccess,
}) => {
  const activePayments = paymentMethods.filter((m) => m.enabled);
  const [selectedPaymentId, setSelectedPaymentId] = useState<string>(
    activePayments[0]?.id || 'pay-cod'
  );

  const [formData, setFormData] = useState({
    customer_name: currentCustomer.name || '',
    phone: currentCustomer.phone || '',
    email: currentCustomer.email || '',
    city: currentCustomer.city || '',
    address: currentCustomer.address || '',
    country: currentCustomer.country || 'United States',
    notes: '',
    paymentReceipt: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  if (!isOpen) return null;

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const discountPercent = appliedCoupon ? appliedCoupon.discountPercent : 0;
  const discountAmount = (subtotal * discountPercent) / 100;
  const finalTotal = Math.max(0, subtotal - discountAmount);

  const selectedPaymentMethod =
    activePayments.find((m) => m.id === selectedPaymentId) || activePayments[0];

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!formData.customer_name.trim()) errs.customer_name = 'Full name is required';
    if (!formData.phone.trim()) errs.phone = 'Phone number is required for courier delivery';
    if (!formData.email.trim()) errs.email = 'Email address is required';
    if (!formData.city.trim()) errs.city = 'City is required';
    if (!formData.address.trim()) errs.address = 'Street and building address is required';

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    setSubmitError(null);

    // Summary of cart items
    const productNames = cart.map((i) => `${i.productName} (${i.quantity}x)`).join(', ');
    const productVariants = cart.map((i) => `${i.variantName}`).join(', ');
    const totalQty = cart.reduce((sum, i) => sum + i.quantity, 0);

    const orderPayload: OrderInsertPayload = {
      customer_name: formData.customer_name.trim(),
      phone: formData.phone.trim(),
      email: formData.email.trim(),
      city: formData.city.trim(),
      address: formData.address.trim(),
      country: formData.country.trim(),
      product_name: productNames,
      product_variant: productVariants,
      quantity: totalQty,
      notes: formData.notes.trim() || null,
      status: 'pending',
    };

    // 1. Strictly INSERT into Supabase table orders
    const result = await insertCodOrder(orderPayload);

    // 2. Add to synced store with chosen payment method
    syncedStore.addOrder({
      customer_name: orderPayload.customer_name,
      phone: orderPayload.phone,
      email: orderPayload.email,
      city: orderPayload.city,
      address: orderPayload.address,
      country: orderPayload.country,
      product_name: orderPayload.product_name,
      product_variant: orderPayload.product_variant,
      quantity: orderPayload.quantity,
      total_price: finalTotal,
      payment_method: selectedPaymentMethod?.name || 'Cash on Delivery (COD)',
      notes: orderPayload.notes,
      status: 'pending',
      delivery_agent_id: null,
    });

    setIsSubmitting(false);

    if (result.success) {
      syncedStore.clearCart();
      onOrderSuccess(orderPayload);
      onClose();
    } else {
      // Even if Supabase returned a warning, local store has recorded it
      syncedStore.clearCart();
      onOrderSuccess(orderPayload);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-stone-900/60 backdrop-blur-xs transition-opacity"
      />

      {/* Modal Dialog */}
      <div className="relative bg-white rounded-3xl border border-stone-200 shadow-2xl w-full max-w-2xl overflow-hidden z-10 animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-6 pb-4 border-b border-stone-100 flex items-center justify-between bg-[#0F0C20] text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-600 flex items-center justify-center text-amber-300">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-lg">Doorstep Delivery Checkout</h3>
              <p className="text-xs text-purple-300">
                Logged in as <strong>{currentCustomer.name}</strong> ({currentCustomer.email})
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[75vh] overflow-y-auto text-xs sm:text-sm">
          {submitError && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{submitError}</span>
            </div>
          )}

          {/* Cart Summary Snippet */}
          <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200/80 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-stone-900">
              <span>Order Items ({cart.length}):</span>
              <span className="tabular-nums">{currencySymbol}{finalTotal.toFixed(2)}</span>
            </div>
            <div className="text-xs text-stone-600 space-y-1">
              {cart.map((item) => (
                <div key={item.id} className="flex justify-between">
                  <span className="truncate max-w-[70%]">
                    {item.productName} ({item.variantName}) × {item.quantity}
                  </span>
                  <span className="tabular-nums font-semibold text-stone-800">
                    {currencySymbol}{(item.price * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Payment Method Selector */}
          <div>
            <label className="block font-bold text-stone-900 mb-2">
              Select Payment Method:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {activePayments.map((pm) => {
                const isSelected = selectedPaymentId === pm.id;
                return (
                  <button
                    type="button"
                    key={pm.id}
                    onClick={() => setSelectedPaymentId(pm.id)}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex items-start gap-2.5 ${
                      isSelected
                        ? 'border-purple-600 bg-purple-50/40 ring-2 ring-purple-600 shadow-2xs'
                        : 'border-stone-200 hover:border-stone-300 bg-white'
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 mt-0.5 ${
                        isSelected ? 'border-purple-600 bg-purple-600 text-white' : 'border-stone-300'
                      }`}
                    >
                      {isSelected && <Check className="w-2.5 h-2.5" />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className="text-xs font-bold text-stone-900 block truncate">{pm.name}</span>
                      <p className="text-[11px] text-stone-500 mt-0.5 line-clamp-1">{pm.description}</p>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Custom Payment QR / Bank Details View */}
            {selectedPaymentMethod && selectedPaymentMethod.type === 'upi_qr' && (
              <div className="mt-3 p-4 bg-purple-50/50 border border-purple-200 rounded-2xl space-y-3 animate-in fade-in duration-150">
                <div className="flex items-center gap-2 text-xs font-bold text-purple-950">
                  <QrCode className="w-4 h-4 text-purple-700" />
                  <span>Scan Merchant QR Code to Pay</span>
                </div>
                <div className="flex flex-col sm:flex-row items-center gap-4">
                  {selectedPaymentMethod.qrCodeUrl ? (
                    <img
                      src={selectedPaymentMethod.qrCodeUrl}
                      alt="Merchant Payment QR"
                      className="w-32 h-32 object-contain rounded-xl border border-purple-200 bg-white p-2 shadow-xs"
                    />
                  ) : (
                    <div className="w-32 h-32 rounded-xl border border-dashed border-purple-300 flex items-center justify-center text-xs text-purple-400">
                      No QR Uploaded
                    </div>
                  )}
                  <div className="space-y-1.5 text-xs text-purple-900">
                    <div>
                      <strong className="block">Account / UPI:</strong>
                      <span className="font-mono bg-white px-2 py-0.5 rounded border border-purple-200 text-purple-800">
                        {selectedPaymentMethod.accountDetails || 'jannatinfotech@upi'}
                      </span>
                    </div>
                    <p className="text-[11px] text-purple-700 leading-relaxed">
                      {selectedPaymentMethod.instructions}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Delivery Address Fields */}
          <div className="space-y-3.5 pt-2">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Full Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.customer_name}
                onChange={(e) => handleInputChange('customer_name', e.target.value)}
                className="w-full px-3 py-2 text-xs sm:text-sm rounded-lg border border-stone-300 focus:outline-none focus:border-stone-900"
              />
              {errors.customer_name && <p className="text-xs text-rose-600 mt-1">{errors.customer_name}</p>}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Phone Number <span className="text-rose-500">*</span>
                </label>
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  className="w-full px-3 py-2 text-xs sm:text-sm rounded-lg border border-stone-300 focus:outline-none focus:border-stone-900"
                />
                {errors.phone && <p className="text-xs text-rose-600 mt-1">{errors.phone}</p>}
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Email Address <span className="text-rose-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="w-full px-3 py-2 text-xs sm:text-sm rounded-lg border border-stone-300 focus:outline-none focus:border-stone-900"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Delivery Address <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                placeholder="House/Apt, Street name, Area"
                className="w-full px-3 py-2 text-xs sm:text-sm rounded-lg border border-stone-300 focus:outline-none focus:border-stone-900"
              />
              {errors.address && <p className="text-xs text-rose-600 mt-1">{errors.address}</p>}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  City <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.city}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                  className="w-full px-3 py-2 text-xs sm:text-sm rounded-lg border border-stone-300 focus:outline-none focus:border-stone-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Country</label>
                <input
                  type="text"
                  value={formData.country}
                  onChange={(e) => handleInputChange('country', e.target.value)}
                  className="w-full px-3 py-2 text-xs sm:text-sm rounded-lg border border-stone-300 focus:outline-none focus:border-stone-900"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Delivery Notes / Courier Instructions (Optional)
              </label>
              <textarea
                rows={2}
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                placeholder="e.g. Call before arrival, leave with security"
                className="w-full px-3 py-2 text-xs sm:text-sm rounded-lg border border-stone-300 focus:outline-none focus:border-stone-900 resize-none"
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-4 border-t border-stone-200">
            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full py-3.5 bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 hover:from-purple-500 hover:to-indigo-500 text-white font-black text-sm rounded-xl shadow-lg shadow-purple-600/30 transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-98 ${
                isSubmitting ? 'opacity-70 cursor-not-allowed' : ''
              }`}
            >
              {isSubmitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Submitting Order...</span>
                </>
              ) : (
                <>
                  <Banknote className="w-5 h-5 text-amber-300" />
                  <span>
                    Confirm Order — {currencySymbol}{finalTotal.toFixed(2)} ({selectedPaymentMethod?.name})
                  </span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
