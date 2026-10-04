import React, { useState } from 'react';
import {
  LayoutDashboard,
  Lock,
  Package,
  ShieldCheck,
  Sliders,
  Truck,
  User,
  X,
} from 'lucide-react';
import { CustomerUser } from '../lib/firebase';

interface NavbarProps {
  appName: string;
  announcementText: string;
  currentCustomer: CustomerUser | null;
  onOpenCustomerAuth: () => void;
  onOpenCustomerPortal: () => void;
  onOpenAdmin: () => void;
  onOpenDeliveryBoy: () => void;
  onScrollToOrder: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  appName,
  announcementText,
  currentCustomer,
  onOpenCustomerAuth,
  onOpenCustomerPortal,
  onOpenAdmin,
  onOpenDeliveryBoy,
  onScrollToOrder,
}) => {
  const [announcementDismissed, setAnnouncementDismissed] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full bg-[#FAF8F5]/95 backdrop-blur-md border-b border-stone-200/80 transition-all">
      {/* Slim Top Announcement Bar */}
      {!announcementDismissed && (
        <div className="bg-stone-900 text-stone-200 px-4 py-1.5 text-xs flex items-center justify-between tracking-wide">
          <div className="mx-auto flex items-center gap-2 text-center font-medium">
            <span className="hidden sm:inline-block px-2 py-0.5 text-[10px] uppercase font-bold tracking-wider bg-amber-500/20 text-amber-300 rounded border border-amber-500/30">
              FREE EXPRESS COD
            </span>
            <span>{announcementText}</span>
          </div>
          <button
            onClick={() => setAnnouncementDismissed(true)}
            className="text-stone-400 hover:text-white transition-colors p-0.5 ml-2 cursor-pointer"
            aria-label="Dismiss announcement"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Top Bar Contract: Zone 1 (Brand) — Zone 2 (Nav links) — Zone 3 (Primary Actions) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-4">
        {/* Zone 1: Single text element wordmark */}
        <a
          href="#"
          className="text-2xl font-serif-display font-bold tracking-tight text-stone-950 hover:text-amber-900 transition-colors whitespace-nowrap"
        >
          {appName}
        </a>

        {/* Zone 2: 4-5 clean text navigation links */}
        <nav className="hidden lg:flex items-center gap-7 text-sm font-medium text-stone-600">
          <a href="#product" className="hover:text-stone-950 transition-colors">
            Product
          </a>
          <a href="#features" className="hover:text-stone-950 transition-colors">
            Craftsmanship
          </a>
          <a href="#specifications" className="hover:text-stone-950 transition-colors">
            Specifications
          </a>
          <a href="#reviews" className="hover:text-stone-950 transition-colors">
            Reviews
          </a>
          <a href="#faq" className="hover:text-stone-950 transition-colors">
            COD FAQs
          </a>
        </nav>

        {/* Zone 3: 1-2 primary actions + Portals */}
        <div className="flex items-center gap-2.5">
          {/* Customer Login / My Account */}
          {currentCustomer ? (
            <button
              onClick={onOpenCustomerPortal}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-stone-800 bg-white hover:bg-stone-100 border border-stone-300 rounded-md transition-all cursor-pointer whitespace-nowrap shadow-2xs"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="max-w-[110px] truncate">{currentCustomer.name}</span>
            </button>
          ) : (
            <button
              onClick={onOpenCustomerAuth}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-stone-700 bg-white hover:bg-stone-100 border border-stone-300 rounded-md transition-all cursor-pointer whitespace-nowrap shadow-2xs"
            >
              <User className="w-3.5 h-3.5 text-stone-500" />
              <span>Customer Login</span>
            </button>
          )}

          {/* Admin Dashboard Entry Button */}
          <button
            onClick={onOpenAdmin}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-stone-700 bg-stone-100 hover:bg-stone-200 border border-stone-300 rounded-md transition-all cursor-pointer whitespace-nowrap"
            title="Open Admin Dashboard to manage orders, products & couriers"
          >
            <LayoutDashboard className="w-3.5 h-3.5 text-stone-600" />
            <span>Admin</span>
          </button>

          {/* Order COD Button */}
          <button
            onClick={onScrollToOrder}
            className="inline-flex items-center gap-2 px-4 py-2 sm:px-5 sm:py-2.5 text-xs sm:text-sm font-semibold text-white bg-stone-900 hover:bg-stone-800 active:scale-[0.98] rounded-md transition-all shadow-sm cursor-pointer whitespace-nowrap"
          >
            <Package className="w-4 h-4 text-amber-400" />
            <span>Order COD</span>
          </button>
        </div>
      </div>
    </header>
  );
};
