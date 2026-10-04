import React from 'react';
import {
  Banknote,
  CheckCircle2,
  Clock,
  MapPin,
  Package,
  Phone,
  Truck,
  User,
  X,
} from 'lucide-react';
import { CustomerUser } from '../lib/firebase';
import { OrderRecord, OrderStatus } from '../lib/supabase';

interface CustomerPortalModalProps {
  isOpen: boolean;
  onClose: () => void;
  customer: CustomerUser | null;
  orders: OrderRecord[];
  currencySymbol: string;
}

export const CustomerPortalModal: React.FC<CustomerPortalModalProps> = ({
  isOpen,
  onClose,
  customer,
  orders,
  currencySymbol,
}) => {
  if (!isOpen || !customer) return null;

  // Filter orders for this customer by email or phone
  const customerOrders = orders.filter(
    (o) =>
      o.email.toLowerCase().trim() === customer.email.toLowerCase().trim() ||
      o.phone.trim() === customer.phone.trim()
  );

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'delivered':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-xs font-semibold bg-emerald-100 text-emerald-800">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Delivered & Paid</span>
          </span>
        );
      case 'out_for_delivery':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-xs font-semibold bg-blue-100 text-blue-800 animate-pulse">
            <Truck className="w-3.5 h-3.5" />
            <span>Out for Delivery</span>
          </span>
        );
      case 'confirmed':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-xs font-semibold bg-amber-100 text-amber-800">
            <Clock className="w-3.5 h-3.5" />
            <span>Confirmed / Packing</span>
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-xs font-semibold bg-stone-100 text-stone-600">
            <span>Cancelled</span>
          </span>
        );
      case 'pending':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <Clock className="w-3.5 h-3.5" />
            <span>Pending Dispatch</span>
          </span>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-stone-900/40 backdrop-blur-xs transition-opacity"
      />

      {/* Modal Dialog */}
      <div className="relative bg-white rounded-2xl border border-stone-200 shadow-2xl w-full max-w-2xl overflow-hidden z-10 animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-6 border-b border-stone-100 flex items-center justify-between bg-[#FAF8F5]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-stone-900 text-amber-400 flex items-center justify-center">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-stone-900 text-lg font-serif-display">
                My Orders & Live COD Tracking
              </h3>
              <p className="text-xs text-stone-500">
                Logged in as <strong>{customer.name}</strong> ({customer.email})
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-200/60 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[70vh] overflow-y-auto space-y-4">
          {customerOrders.length === 0 ? (
            <div className="text-center py-12 px-4">
              <Package className="w-12 h-12 text-stone-300 mx-auto mb-3" />
              <h4 className="font-bold text-stone-800 text-base">No Orders Found Yet</h4>
              <p className="text-xs text-stone-500 mt-1 max-w-xs mx-auto">
                Orders placed using your email (<span className="text-stone-700 font-medium">{customer.email}</span>) will show up here automatically with live tracking status.
              </p>
            </div>
          ) : (
            customerOrders.map((ord) => (
              <div
                key={ord.id}
                className="p-5 rounded-xl border border-stone-200 bg-stone-50/50 hover:bg-stone-50 transition-all space-y-3"
              >
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-stone-900">
                      Order #{ord.id}
                    </span>
                    <span className="text-xs text-stone-400">·</span>
                    <span className="text-xs text-stone-500">
                      {new Date(ord.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <div>{getStatusBadge(ord.status)}</div>
                </div>

                <div className="flex items-start justify-between gap-4 pt-2 border-t border-stone-200/60">
                  <div>
                    <h5 className="font-bold text-sm text-stone-900">{ord.product_name}</h5>
                    <p className="text-xs text-stone-600 mt-0.5">
                      Finish: <span className="font-medium text-stone-800">{ord.product_variant}</span> · Quantity: <span className="font-medium text-stone-800">{ord.quantity}</span>
                    </p>
                    <p className="text-xs text-stone-500 mt-1 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-stone-400" />
                      <span>{ord.address}, {ord.city}</span>
                    </p>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-xs text-stone-500 block">Cash Due at Door</span>
                    <span className="text-base font-bold tabular-nums text-stone-900 font-serif-display">
                      {currencySymbol}{(ord.total_price || ord.quantity * 79).toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Delivery Boy assigned notification */}
                {ord.status === 'out_for_delivery' && (
                  <div className="p-3 rounded-lg bg-blue-50 border border-blue-200 text-blue-900 text-xs flex items-center gap-2">
                    <Truck className="w-4 h-4 text-blue-600 shrink-0" />
                    <span>Your package is out with courier for delivery today. Have cash ready.</span>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-stone-50 border-t border-stone-200 flex justify-between items-center text-xs text-stone-600">
          <span>Need help? Contact support directly for quick address updates.</span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-stone-900 text-white rounded-lg font-bold hover:bg-stone-800 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
