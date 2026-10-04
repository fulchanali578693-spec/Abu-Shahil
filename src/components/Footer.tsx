import React from 'react';
import { Mail, Phone, ShieldCheck, Truck, Lock, LayoutDashboard, User } from 'lucide-react';
import { SyncedStoreState } from '../lib/syncedStore';

interface FooterProps {
  state: SyncedStoreState;
  onOpenCustomizer: () => void;
  onOpenAdmin: () => void;
  onOpenCustomerAuth: () => void;
  onOpenDeliveryBoy: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  state,
  onOpenCustomizer,
  onOpenAdmin,
  onOpenCustomerAuth,
  onOpenDeliveryBoy,
}) => {
  return (
    <footer className="bg-stone-900 text-stone-300 pt-16 pb-12 border-t border-stone-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-stone-800">
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <span className="text-2xl font-serif-display font-bold text-white tracking-tight">
              {state.appName}
            </span>
            <p className="text-xs sm:text-sm text-stone-400 max-w-sm leading-relaxed">
              {state.storeTagline}. Handcrafted quality, seamless Cash on Delivery fulfillment, and real-time courier tracking.
            </p>
            <div className="flex flex-col gap-2 text-xs text-stone-400 pt-2">
              <a
                href={`tel:${state.supportPhone}`}
                className="hover:text-white transition-colors flex items-center gap-2"
              >
                <Phone className="w-3.5 h-3.5 text-amber-500" />
                <span>Customer Care: {state.supportPhone}</span>
              </a>
              <a
                href={`mailto:${state.supportEmail}`}
                className="hover:text-white transition-colors flex items-center gap-2"
              >
                <Mail className="w-3.5 h-3.5 text-amber-500" />
                <span>{state.supportEmail}</span>
              </a>
            </div>
          </div>

          {/* COD Assurances */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4">
              COD Benefits
            </h4>
            <ul className="space-y-2.5 text-xs text-stone-400">
              <li className="flex items-center gap-1.5">
                <Truck className="w-3.5 h-3.5 text-amber-400" />
                <span>Free 48h Delivery</span>
              </li>
              <li className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Parcel Inspection</span>
              </li>
              <li className="flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-stone-400" />
                <span>Zero Card Required</span>
              </li>
              <li>7-Day Replacement</li>
              <li>Cash Paid to Courier</li>
            </ul>
          </div>

          {/* Portals & Management */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4">
              Portals & Access
            </h4>
            <ul className="space-y-2.5 text-xs text-stone-400">
              <li>
                <button
                  onClick={onOpenCustomerAuth}
                  className="hover:text-white transition-colors flex items-center gap-1.5 text-left cursor-pointer"
                >
                  <User className="w-3.5 h-3.5 text-stone-500" />
                  <span>Customer Login / Portal</span>
                </button>
              </li>
              <li>
                <button
                  onClick={onOpenAdmin}
                  className="hover:text-white transition-colors flex items-center gap-1.5 text-left cursor-pointer"
                >
                  <LayoutDashboard className="w-3.5 h-3.5 text-amber-400" />
                  <span>Admin Dashboard</span>
                </button>
              </li>
              <li>
                <button
                  onClick={onOpenDeliveryBoy}
                  className="hover:text-white transition-colors flex items-center gap-1.5 text-left cursor-pointer"
                >
                  <Truck className="w-3.5 h-3.5 text-blue-400" />
                  <span>Delivery Boy Mobile View</span>
                </button>
              </li>
              <li>
                <button
                  onClick={onOpenCustomizer}
                  className="hover:text-white transition-colors text-left cursor-pointer"
                >
                  Template Config Drawer
                </button>
              </li>
            </ul>
          </div>

          {/* Active Payment Methods */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4">
              Supported Payments
            </h4>
            <ul className="space-y-2 text-xs text-stone-400">
              {state.paymentMethods
                .filter((m) => m.enabled)
                .map((m) => (
                  <li key={m.id} className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    <span>{m.name}</span>
                  </li>
                ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-500">
          <div>
            © {new Date().getFullYear()} {state.appName}. All rights reserved. Powered by Supabase & Firebase Auth.
          </div>
          <div className="flex items-center gap-4">
            <span>Privacy Policy</span>
            <span>·</span>
            <span>Terms of Service</span>
            <span>·</span>
            <span>COD Delivery Guarantee</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
