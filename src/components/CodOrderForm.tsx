import React, { useState, useEffect } from 'react';
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
  RefreshCw,
  ShieldCheck,
  Truck,
  User,
  X,
} from 'lucide-react';
import { StoreConfig, ProductVariant } from '../config/storeConfig';
import { insertCodOrder, OrderInsertPayload } from '../lib/supabase';
import { CustomPaymentMethod, syncedStore } from '../lib/syncedStore';
import { CustomerUser } from '../lib/firebase';

interface CodOrderFormProps {
  config: StoreConfig;
  productName: string;
  variants: ProductVariant[];
  selectedVariant: ProductVariant;
  quantity: number;
  totalPrice: number;
  unitPrice: number;
  paymentMethods: CustomPaymentMethod[];
  currentCustomer?: CustomerUser | null;
  onSelectVariant: (variant: ProductVariant) => void;
  onUpdateQuantity: (qty: number) => void;
}

interface FormState {
  customer_name: string;
  phone: string;
  email: string;
  city: string;
  address: string;
  country: string;
  notes: string;
}

interface FormErrors {
  customer_name?: string;
  phone?: string;
  email?: string;
  city?: string;
  address?: string;
  country?: string;
}

export const CodOrderForm: React.FC<CodOrderFormProps> = ({
  config,
  productName,
  variants,
  selectedVariant,
  quantity,
  totalPrice,
  unitPrice,
  paymentMethods,
  currentCustomer,
  onSelectVariant,
  onUpdateQuantity,
}) => {
  const activePayments = paymentMethods.filter((m) => m.enabled);
  const [selectedPaymentId, setSelectedPaymentId] = useState<string>(
    activePayments[0]?.id || 'pay-cod'
  );

  const [formData, setFormData] = useState<FormState>({
    customer_name: currentCustomer?.name || '',
    phone: currentCustomer?.phone || '',
    email: currentCustomer?.email || '',
    city: currentCustomer?.city || '',
    address: currentCustomer?.address || '',
    country: currentCustomer?.country || 'United States',
    notes: '',
  });

  // Auto-populate when current customer changes
  useEffect(() => {
    if (currentCustomer) {
      setFormData((prev) => ({
        ...prev,
        customer_name: currentCustomer.name || prev.customer_name,
        phone: currentCustomer.phone || prev.phone,
        email: currentCustomer.email || prev.email,
        city: currentCustomer.city || prev.city,
        address: currentCustomer.address || prev.address,
        country: currentCustomer.country || prev.country,
      }));
    }
  }, [currentCustomer]);

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [lastSubmittedOrder, setLastSubmittedOrder] = useState<OrderInsertPayload | null>(null);

  const selectedPaymentMethod =
    activePayments.find((m) => m.id === selectedPaymentId) || activePayments[0];

  const handleInputChange = (field: keyof FormState, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field as keyof FormErrors]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field as keyof FormErrors];
        return next;
      });
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.customer_name.trim()) {
      newErrors.customer_name = 'Please enter your full name';
    } else if (formData.customer_name.trim().length < 2) {
      newErrors.customer_name = 'Name must be at least 2 characters';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required for courier delivery';
    } else if (!/^[0-9+()\s-]{7,20}$/.test(formData.phone.trim())) {
      newErrors.phone = 'Please enter a valid phone number (at least 7 digits)';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email address is required for dispatch updates';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      newErrors.email = 'Please provide a valid email address';
    }

    if (!formData.city.trim()) {
      newErrors.city = 'City / Municipality is required';
    }

    if (!formData.address.trim()) {
      newErrors.address = 'Street address & building number is required';
    } else if (formData.address.trim().length < 5) {
      newErrors.address = 'Please specify street, apartment or suite details';
    }

    if (!formData.country.trim()) {
      newErrors.country = 'Country is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      const formEl = document.getElementById('order-form-container');
      if (formEl) {
        formEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus('idle');

    // Strict 11 fields for Supabase INSERT
    const orderPayload: OrderInsertPayload = {
      customer_name: formData.customer_name.trim(),
      phone: formData.phone.trim(),
      email: formData.email.trim(),
      city: formData.city.trim(),
      address: formData.address.trim(),
      country: formData.country.trim(),
      product_name: productName,
      product_variant: selectedVariant.name,
      quantity: quantity,
      notes: formData.notes.trim() || null,
      status: 'pending',
    };

    // Strictly call Supabase INSERT (no select/update/delete)
    const result = await insertCodOrder(orderPayload);

    // Also record in synchronized store so Admin Dashboard and Customer Tracker update in real time!
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
      total_price: totalPrice,
      payment_method: selectedPaymentMethod?.name || 'Cash on Delivery (COD)',
      notes: orderPayload.notes,
      status: 'pending',
      delivery_agent_id: null,
    });

    setIsSubmitting(false);

    if (result.success) {
      setSubmitStatus('success');
      setLastSubmittedOrder(orderPayload);
      setFormData({
        customer_name: '',
        phone: '',
        email: '',
        city: '',
        address: '',
        country: 'United States',
        notes: '',
      });
      setErrors({});
    } else {
      setSubmitStatus('error');
    }
  };

  const handleResetOrder = () => {
    setSubmitStatus('idle');
    setLastSubmittedOrder(null);
  };

  return (
    <div id="order-form-container" className="w-full">
      {/* GENERIC ERROR BANNER ON FAILURE */}
      {submitStatus === 'error' && (
        <div className="mb-6 p-4 rounded-lg bg-rose-50 border border-rose-200 text-rose-900 flex items-start gap-3 transition-all animate-in fade-in duration-200">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <h4 className="font-semibold text-sm">Unable to Place Order</h4>
            <p className="text-xs text-rose-700 mt-0.5 leading-relaxed">
              Something went wrong while submitting your Cash on Delivery order. Please check your network connection and details, then try again.
            </p>
          </div>
          <button
            onClick={() => setSubmitStatus('idle')}
            className="text-rose-500 hover:text-rose-800 p-1 cursor-pointer"
            aria-label="Dismiss error"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* SUCCESS BANNER / ORDER CONFIRMATION VIEW */}
      {submitStatus === 'success' && lastSubmittedOrder && (
        <div className="p-6 sm:p-8 rounded-xl bg-emerald-50/80 border border-emerald-200 text-emerald-950 transition-all shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center shrink-0 border border-emerald-300">
              <CheckCircle2 className="w-7 h-7 text-emerald-600" />
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">Order Confirmed</span>
              <h3 className="text-xl sm:text-2xl font-serif-display font-bold text-stone-900">
                Thank You, {lastSubmittedOrder.customer_name}!
              </h3>
            </div>
          </div>

          <p className="text-sm text-stone-700 leading-relaxed mb-6">
            Your order has been recorded in Supabase and assigned to courier dispatch. You can track its status in real-time.
          </p>

          <div className="bg-white p-5 rounded-lg border border-emerald-100 shadow-xs mb-6 space-y-3 text-xs sm:text-sm">
            <div className="flex justify-between items-center pb-2 border-b border-stone-100">
              <span className="text-stone-500">Product:</span>
              <span className="font-semibold text-stone-900 text-right">{lastSubmittedOrder.product_name}</span>
            </div>
            <div className="flex justify-between items-center pb-2 border-b border-stone-100">
              <span className="text-stone-500">Finish:</span>
              <span className="font-semibold text-stone-900">{lastSubmittedOrder.product_variant}</span>
            </div>
            <div className="flex justify-between items-center pb-2 border-b border-stone-100">
              <span className="text-stone-500">Quantity:</span>
              <span className="font-semibold tabular-nums text-stone-900">{lastSubmittedOrder.quantity} Unit(s)</span>
            </div>
            <div className="flex justify-between items-center pb-2 border-b border-stone-100">
              <span className="text-stone-500">Payment Selected:</span>
              <span className="font-semibold text-stone-900">{selectedPaymentMethod?.name}</span>
            </div>
            <div className="flex justify-between items-center pb-2 border-b border-stone-100">
              <span className="text-stone-500">Delivery Address:</span>
              <span className="font-medium text-stone-800 text-right max-w-[60%] truncate">
                {lastSubmittedOrder.address}, {lastSubmittedOrder.city}, {lastSubmittedOrder.country}
              </span>
            </div>
            <div className="flex justify-between items-center pt-1 text-sm font-bold text-stone-950">
              <span>Total Due on Delivery:</span>
              <span className="tabular-nums text-amber-700 text-base">
                {config.currency.symbol}{totalPrice.toFixed(2)} {config.currency.code}
              </span>
            </div>
          </div>

          <div className="p-4 rounded-lg bg-amber-50/80 border border-amber-200/80 flex items-start gap-3 text-xs text-amber-900 mb-6">
            <Banknote className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Doorstep Courier Instructions:</span>
              <p className="mt-0.5 text-amber-800 leading-normal">
                Our delivery courier will call your phone (<span className="font-medium">{lastSubmittedOrder.phone}</span>) before arriving. Please inspect the parcel and complete payment.
              </p>
            </div>
          </div>

          <button
            onClick={handleResetOrder}
            className="w-full sm:w-auto px-6 py-2.5 text-xs font-semibold text-stone-700 bg-white hover:bg-stone-50 border border-stone-300 rounded-md transition-all shadow-2xs cursor-pointer flex items-center justify-center gap-2"
          >
            <RefreshCw className="w-3.5 h-3.5 text-stone-500" />
            <span>Place Another Order</span>
          </button>
        </div>
      )}

      {/* ACTIVE COD ORDER FORM */}
      {submitStatus !== 'success' && (
        <form
          onSubmit={handleSubmit}
          noValidate
          className="bg-white rounded-xl border border-stone-200/90 p-5 sm:p-7 shadow-xs relative"
        >
          {/* Header Title */}
          <div className="border-b border-stone-100 pb-4 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-stone-900 font-semibold text-base sm:text-lg">
                <Truck className="w-5 h-5 text-amber-600" />
                <span>Express Doorstep Delivery</span>
              </div>
              <span className="text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200/80">
                Zero Online Card Required
              </span>
            </div>
            <p className="text-xs text-stone-500 mt-1">
              Provide your delivery details. You inspect the parcel upon arrival before completing payment.
            </p>
          </div>

          {/* Product Variant Quick Switcher inside Form */}
          <div className="mb-6 p-3.5 bg-stone-50/80 rounded-lg border border-stone-200/70">
            <div className="text-xs font-semibold text-stone-700 mb-2.5 flex items-center justify-between">
              <span>Selected Finish: <strong className="text-stone-950 font-bold">{selectedVariant.name}</strong></span>
              <span className="text-[11px] text-stone-500">Switch Variant:</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {variants.map((v) => {
                const isSelected = selectedVariant.id === v.id;
                return (
                  <button
                    type="button"
                    key={v.id}
                    onClick={() => onSelectVariant(v)}
                    className={`flex items-center gap-2 p-2 rounded-md border text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'border-stone-900 bg-white shadow-2xs ring-1 ring-stone-900'
                        : 'border-stone-200 hover:border-stone-300 bg-white/60'
                    }`}
                  >
                    <span
                      className="w-4 h-4 rounded-full border border-stone-300 shrink-0 shadow-2xs"
                      style={{ backgroundColor: v.colorHex }}
                    />
                    <span className="text-xs font-medium text-stone-800 truncate">
                      {v.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* PAYMENT METHOD SELECTION (Requirement 8) */}
          <div className="mb-6">
            <label className="block text-xs font-semibold text-stone-800 mb-2">
              Choose Payment Method:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {activePayments.map((pm) => {
                const isSelected = selectedPaymentId === pm.id;
                return (
                  <button
                    type="button"
                    key={pm.id}
                    onClick={() => setSelectedPaymentId(pm.id)}
                    className={`p-3 rounded-lg border text-left transition-all cursor-pointer flex items-start gap-2.5 ${
                      isSelected
                        ? 'border-stone-900 bg-amber-50/30 ring-1 ring-stone-900 shadow-2xs'
                        : 'border-stone-200 hover:border-stone-300 bg-white'
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 mt-0.5 ${
                        isSelected ? 'border-stone-900 bg-stone-900 text-white' : 'border-stone-300'
                      }`}
                    >
                      {isSelected && <Check className="w-2.5 h-2.5" />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-stone-900 truncate">{pm.name}</span>
                        {pm.badge && (
                          <span className="text-[10px] bg-stone-100 text-stone-700 px-1.5 py-0.2 rounded font-semibold">
                            {pm.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-stone-500 mt-0.5 line-clamp-1">{pm.description}</p>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Custom Payment Instruction Details */}
            {selectedPaymentMethod && selectedPaymentMethod.type !== 'cod' && (
              <div className="mt-3 p-3.5 bg-stone-50 border border-stone-200/80 rounded-lg text-xs space-y-2 animate-in fade-in duration-150">
                <div className="font-bold text-stone-900 flex items-center gap-1.5">
                  <QrCode className="w-4 h-4 text-amber-700" />
                  <span>{selectedPaymentMethod.name} Instructions</span>
                </div>
                <p className="text-stone-600 text-[11px]">{selectedPaymentMethod.instructions}</p>
                {selectedPaymentMethod.qrCodeUrl && (
                  <div className="flex items-center gap-3 pt-1">
                    <img
                      src={selectedPaymentMethod.qrCodeUrl}
                      alt="Payment QR"
                      className="w-16 h-16 rounded border border-stone-300 bg-white p-1"
                    />
                    <div className="text-[11px] text-stone-700">
                      <span className="font-bold block">Scan QR Code with camera or UPI app</span>
                      <span className="font-mono text-stone-500">{selectedPaymentMethod.accountDetails}</span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Form Fields Grid */}
          <div className="space-y-4">
            {/* Customer Name */}
            <div>
              <label htmlFor="customer_name" className="block text-xs font-semibold text-stone-800 mb-1.5">
                Full Name <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-stone-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  id="customer_name"
                  type="text"
                  value={formData.customer_name}
                  onChange={(e) => handleInputChange('customer_name', e.target.value)}
                  placeholder="e.g. Eleanor Vance"
                  className={`w-full pl-9 pr-3 py-2.5 text-sm rounded-md border bg-white text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-1 transition-all ${
                    errors.customer_name
                      ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-500/20'
                      : 'border-stone-300 focus:border-stone-900 focus:ring-stone-900/20'
                  }`}
                />
              </div>
              {errors.customer_name && (
                <p className="text-xs text-rose-600 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3 shrink-0" />
                  <span>{errors.customer_name}</span>
                </p>
              )}
            </div>

            {/* Phone & Email Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="phone" className="block text-xs font-semibold text-stone-800 mb-1.5">
                  Phone Number <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-stone-400">
                    <Phone className="w-4 h-4" />
                  </div>
                  <input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    placeholder="+1 (555) 000-0000"
                    className={`w-full pl-9 pr-3 py-2.5 text-sm rounded-md border bg-white text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-1 transition-all ${
                      errors.phone
                        ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-500/20'
                        : 'border-stone-300 focus:border-stone-900 focus:ring-stone-900/20'
                    }`}
                  />
                </div>
                {errors.phone ? (
                  <p className="text-xs text-rose-600 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3 shrink-0" />
                    <span>{errors.phone}</span>
                  </p>
                ) : (
                  <p className="text-[11px] text-stone-400 mt-1">
                    Courier calls before arriving at your door
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="email" className="block text-xs font-semibold text-stone-800 mb-1.5">
                  Email Address <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-stone-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="eleanor@example.com"
                    className={`w-full pl-9 pr-3 py-2.5 text-sm rounded-md border bg-white text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-1 transition-all ${
                      errors.email
                        ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-500/20'
                        : 'border-stone-300 focus:border-stone-900 focus:ring-stone-900/20'
                    }`}
                  />
                </div>
                {errors.email ? (
                  <p className="text-xs text-rose-600 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3 shrink-0" />
                    <span>{errors.email}</span>
                  </p>
                ) : (
                  <p className="text-[11px] text-stone-400 mt-1">
                    Receipt and tracking link sent here
                  </p>
                )}
              </div>
            </div>

            {/* Street Address */}
            <div>
              <label htmlFor="address" className="block text-xs font-semibold text-stone-800 mb-1.5">
                Delivery Address <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-stone-400">
                  <MapPin className="w-4 h-4" />
                </div>
                <input
                  id="address"
                  type="text"
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  placeholder="House/Apt number, street name, neighborhood or building"
                  className={`w-full pl-9 pr-3 py-2.5 text-sm rounded-md border bg-white text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-1 transition-all ${
                    errors.address
                      ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-500/20'
                      : 'border-stone-300 focus:border-stone-900 focus:ring-stone-900/20'
                  }`}
                />
              </div>
              {errors.address && (
                <p className="text-xs text-rose-600 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3 shrink-0" />
                  <span>{errors.address}</span>
                </p>
              )}
            </div>

            {/* City & Country Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="city" className="block text-xs font-semibold text-stone-800 mb-1.5">
                  City / Town <span className="text-rose-500">*</span>
                </label>
                <input
                  id="city"
                  type="text"
                  value={formData.city}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                  placeholder="e.g. Austin"
                  className={`w-full px-3 py-2.5 text-sm rounded-md border bg-white text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-1 transition-all ${
                    errors.city
                      ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-500/20'
                      : 'border-stone-300 focus:border-stone-900 focus:ring-stone-900/20'
                  }`}
                />
                {errors.city && (
                  <p className="text-xs text-rose-600 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3 shrink-0" />
                    <span>{errors.city}</span>
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="country" className="block text-xs font-semibold text-stone-800 mb-1.5">
                  Country <span className="text-rose-500">*</span>
                </label>
                <select
                  id="country"
                  value={formData.country}
                  onChange={(e) => handleInputChange('country', e.target.value)}
                  className="w-full px-3 py-2.5 text-sm rounded-md border border-stone-300 bg-white text-stone-900 focus:outline-none focus:border-stone-900 focus:ring-1 focus:ring-stone-900/20 transition-all"
                >
                  <option value="United States">United States</option>
                  <option value="Canada">Canada</option>
                  <option value="United Kingdom">United Kingdom</option>
                  <option value="Australia">Australia</option>
                  <option value="United Arab Emirates">United Arab Emirates</option>
                  <option value="Saudi Arabia">Saudi Arabia</option>
                  <option value="Germany">Germany</option>
                  <option value="France">France</option>
                  <option value="Singapore">Singapore</option>
                  <option value="India">India</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            {/* Delivery Notes */}
            <div>
              <label htmlFor="notes" className="block text-xs font-semibold text-stone-800 mb-1.5">
                Delivery Instructions <span className="text-stone-400 font-normal">(Optional)</span>
              </label>
              <textarea
                id="notes"
                rows={2}
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                placeholder="e.g. Ring doorbell twice, deliver after 2 PM, or leave with security if away"
                className="w-full px-3 py-2 text-sm rounded-md border border-stone-300 bg-white text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-stone-900 focus:ring-1 focus:ring-stone-900/20 transition-all resize-none"
              />
            </div>
          </div>

          {/* Pricing & Cash Due Calculation Summary */}
          <div className="mt-6 pt-5 border-t border-stone-100 bg-stone-50 -mx-5 -mb-5 sm:-mx-7 sm:-mb-7 p-5 sm:p-7 rounded-b-xl">
            <div className="space-y-2 mb-4 text-xs sm:text-sm">
              <div className="flex justify-between text-stone-600">
                <span>Items Subtotal ({quantity}x):</span>
                <span className="tabular-nums font-medium text-stone-900">
                  {config.currency.symbol}{(unitPrice * quantity).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between text-stone-600">
                <span className="flex items-center gap-1">
                  <span>Courier Delivery:</span>
                  <span className="text-[11px] text-emerald-700 bg-emerald-100/70 px-1.5 py-0.2 rounded font-semibold">
                    FREE
                  </span>
                </span>
                <span className="tabular-nums font-semibold text-emerald-700">$0.00</span>
              </div>
              <div className="pt-2 border-t border-stone-200/80 flex justify-between items-baseline">
                <div>
                  <span className="text-sm sm:text-base font-bold text-stone-900">Total Due Upon Delivery:</span>
                  <p className="text-[11px] text-stone-500">
                    Payment Method: {selectedPaymentMethod?.name}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-xl sm:text-2xl font-bold tabular-nums text-stone-950 font-serif-display">
                    {config.currency.symbol}{totalPrice.toFixed(2)}
                  </span>
                  <span className="text-xs text-stone-500 ml-1">{config.currency.code}</span>
                </div>
              </div>
            </div>

            {/* Submit Button - Disabled while sending */}
            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full py-3.5 px-6 rounded-lg text-sm sm:text-base font-bold text-white transition-all shadow-md flex items-center justify-center gap-3 cursor-pointer ${
                isSubmitting
                  ? 'bg-stone-500 cursor-not-allowed opacity-90'
                  : 'bg-stone-900 hover:bg-stone-800 active:scale-[0.99] hover:shadow-lg'
              }`}
            >
              {isSubmitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Submitting Order...</span>
                </>
              ) : (
                <>
                  <Banknote className="w-5 h-5 text-amber-400" />
                  <span>
                    Confirm Order — {config.currency.symbol}{totalPrice.toFixed(2)} ({selectedPaymentMethod?.name})
                  </span>
                </>
              )}
            </button>

            <div className="mt-3.5 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-[11px] text-stone-500 text-center">
              <span className="flex items-center gap-1">
                <Lock className="w-3 h-3 text-emerald-600" />
                <span>Zero Card / Bank Details Required</span>
              </span>
              <span className="text-stone-300">·</span>
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-amber-600" />
                <span>Inspect Package Before Handing Payment</span>
              </span>
            </div>
          </div>
        </form>
      )}
    </div>
  );
};
