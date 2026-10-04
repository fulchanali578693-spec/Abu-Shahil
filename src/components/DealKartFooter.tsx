import React from 'react';
import {
  CheckCircle2,
  Headphones,
  Mail,
  Phone,
  RotateCcw,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { ThemeConfig, WebsiteCustomization } from '../lib/syncedStore';

interface DealKartFooterProps {
  appName: string;
  tagline?: string;
  customization?: WebsiteCustomization;
  theme?: ThemeConfig;
  supportPhone?: string;
  supportEmail?: string;
  onOpenAdmin: () => void;
  onOpenCustomerAuth: () => void;
  onOpenDeliveryBoy: () => void;
}

export const DealKartFooter: React.FC<DealKartFooterProps> = ({
  appName,
  tagline = 'Deals Beyond Ordinary',
  customization,
  theme,
  supportPhone,
  supportEmail,
  onOpenAdmin,
  onOpenCustomerAuth,
  onOpenDeliveryBoy,
}) => {
  const t1Title = customization?.trustBadge1Title || '30-Day Easy Returns';
  const t1Desc = customization?.trustBadge1Desc || 'Hassle-free doorstep pickup';
  const t2Title = customization?.trustBadge2Title || '100% Authentic Brands';
  const t2Desc = customization?.trustBadge2Desc || 'Verified manufacturer warranty';
  const t3Title = customization?.trustBadge3Title || 'Customer Support 24/7';
  const t3Desc = customization?.trustBadge3Desc || 'Dedicated assistance anytime';

  const footerAbout = customization?.footerAbout || 'Your trusted Cash-on-Delivery marketplace with verified doorstep parcel inspection.';
  const footerCopyright = customization?.footerCopyright || `© 2026 ${appName || 'DealKart'}. All rights reserved. Powered by Jannat Infotech.`;
  const logoUrl = customization?.logoUrl;
  const logoHeight = customization?.logoHeight || 38;
  const primaryColor = theme?.primaryColor || '#7C3AED';

  return (
    <footer className="bg-[#0C091C] text-stone-300 pt-16 pb-12 border-t border-purple-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Trust Badges Strip matching the bottom of the template image */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 py-6 border-y border-purple-900/40 text-center sm:text-left">
          <div className="flex items-center justify-center sm:justify-start gap-3">
            <div className="w-10 h-10 rounded-full bg-purple-900/40 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <RotateCcw className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-sm text-white block">{t1Title}</span>
              <span className="text-xs text-purple-300">{t1Desc}</span>
            </div>
          </div>

          <div className="flex items-center justify-center sm:justify-start gap-3">
            <div className="w-10 h-10 rounded-full bg-purple-900/40 border border-purple-500/30 flex items-center justify-center text-amber-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-sm text-white block">{t2Title}</span>
              <span className="text-xs text-purple-300">{t2Desc}</span>
            </div>
          </div>

          <div className="flex items-center justify-center sm:justify-start gap-3">
            <div className="w-10 h-10 rounded-full bg-purple-900/40 border border-purple-500/30 flex items-center justify-center text-emerald-400">
              <Headphones className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-sm text-white block">{t3Title}</span>
              <span className="text-xs text-purple-300">{t3Desc}</span>
            </div>
          </div>
        </div>

        {/* Links Grid */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 text-xs">
          {/* Brand Info */}
          <div className="col-span-2 space-y-3">
            <div className="flex items-center gap-2">
              {logoUrl ? (
                <img
                  src={logoUrl}
                  alt={appName}
                  style={{ height: `${Math.min(logoHeight, 48)}px` }}
                  className="object-contain max-w-[200px] rounded"
                />
              ) : (
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-white"
                  style={{ backgroundColor: primaryColor }}
                >
                  <Zap className="w-4 h-4 fill-amber-300 text-white" />
                </div>
              )}
              <span className="text-xl font-black text-white">{appName || 'DealKart'}</span>
            </div>
            <p className="text-purple-300 max-w-sm leading-relaxed">
              {footerAbout}
            </p>
            {(supportPhone || supportEmail) && (
              <div className="pt-1 space-y-1 text-purple-300 text-[11px]">
                {supportPhone && (
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-amber-400" />
                    <span>{supportPhone}</span>
                  </div>
                )}
                {supportEmail && (
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-amber-400" />
                    <span>{supportEmail}</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Shop */}
          <div className="space-y-2">
            <h5 className="font-bold text-white text-xs uppercase tracking-wider mb-3">Shop</h5>
            <ul className="space-y-2 text-purple-200">
              <li><a href="#daily-deals" className="hover:text-white">All Categories</a></li>
              <li><a href="#daily-deals" className="hover:text-white">Today's Deals</a></li>
              <li><a href="#bundles" className="hover:text-white">Bundles</a></li>
              <li><a href="#popular-products" className="hover:text-white">New Arrivals</a></li>
            </ul>
          </div>

          {/* Help */}
          <div className="space-y-2">
            <h5 className="font-bold text-white text-xs uppercase tracking-wider mb-3">Help</h5>
            <ul className="space-y-2 text-purple-200">
              <li>
                <button onClick={onOpenCustomerAuth} className="hover:text-white cursor-pointer text-left">
                  Track Order (Sign In)
                </button>
              </li>
              <li><a href="#daily-deals" className="hover:text-white">Returns & Refunds</a></li>
              <li><a href="#daily-deals" className="hover:text-white">COD Inspection Policy</a></li>
              <li><a href="#daily-deals" className="hover:text-white">Customer Support</a></li>
            </ul>
          </div>

          {/* Management Portals */}
          <div className="space-y-2">
            <h5 className="font-bold text-white text-xs uppercase tracking-wider mb-3">Portals</h5>
            <ul className="space-y-2 text-purple-200">
              <li>
                <button
                  onClick={onOpenAdmin}
                  className="hover:text-amber-300 transition-colors font-bold text-left cursor-pointer"
                >
                  Admin Dashboard
                </button>
              </li>
              <li>
                <button
                  onClick={onOpenDeliveryBoy}
                  className="hover:text-blue-300 transition-colors font-bold text-left cursor-pointer"
                >
                  Delivery Boy Portal
                </button>
              </li>
              <li>
                <button
                  onClick={onOpenCustomerAuth}
                  className="hover:text-purple-300 transition-colors font-bold text-left cursor-pointer"
                >
                  Customer Account
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="pt-8 border-t border-purple-900/40 text-xs text-purple-400 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            {footerCopyright}
          </div>
          <div className="flex items-center gap-4">
            <span className="hover:text-white cursor-pointer">Privacy Policy</span>
            <span>·</span>
            <span className="hover:text-white cursor-pointer">Terms of Service</span>
            <span>·</span>
            <span className="hover:text-white cursor-pointer">Doorstep Inspection Policy</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
