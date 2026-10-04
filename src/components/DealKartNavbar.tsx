import React, { useState } from 'react';
import {
  Bell,
  ChevronDown,
  Flame,
  Heart,
  LayoutDashboard,
  LogOut,
  Menu,
  Package,
  Search,
  ShoppingCart,
  Sparkles,
  Truck,
  User,
  Zap,
} from 'lucide-react';
import { CustomerUser } from '../lib/firebase';
import { CartItem } from '../lib/syncedStore';

interface DealKartNavbarProps {
  appName: string;
  tagline?: string;
  logoUrl?: string;
  logoHeight?: number;
  showAnnouncement?: boolean;
  announcementBadge?: string;
  announcementText?: string;
  primaryColor?: string;
  headerStyle?: 'dark' | 'gradient' | 'light';
  cart: CartItem[];
  wishlistCount: number;
  currentCustomer: CustomerUser | null;
  categories?: string[];
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
  onSearchChange: (query: string) => void;
  onOpenCart: () => void;
  onOpenCustomerAuth: () => void;
  onOpenCustomerPortal: () => void;
  onOpenAdmin: () => void;
  onOpenDeliveryBoy: () => void;
  onLogoutCustomer: () => void;
}

export const DealKartNavbar: React.FC<DealKartNavbarProps> = ({
  appName,
  tagline = 'Deals Beyond Ordinary',
  logoUrl,
  logoHeight = 38,
  showAnnouncement = true,
  announcementBadge = '⚡ MEGA SALE',
  announcementText,
  primaryColor = '#7C3AED',
  headerStyle = 'dark',
  cart,
  wishlistCount,
  currentCustomer,
  categories = ['Electronics', 'Home & Living', 'Fashion', 'Beauty', 'Accessories'],
  selectedCategory,
  onSelectCategory,
  onSearchChange,
  onOpenCart,
  onOpenCustomerAuth,
  onOpenCustomerPortal,
  onOpenAdmin,
  onOpenDeliveryBoy,
  onLogoutCustomer,
}) => {
  const [searchInput, setSearchInput] = useState('');
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const totalCartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearchChange(searchInput.trim());
  };

  const isLight = headerStyle === 'light';
  const isGradient = headerStyle === 'gradient';

  return (
    <header
      className={`sticky top-0 z-40 w-full shadow-md transition-colors ${
        isLight
          ? 'bg-white text-stone-900 border-b border-stone-200'
          : isGradient
          ? 'text-white'
          : 'bg-[#0F0C20] text-white'
      }`}
      style={isGradient ? { background: `linear-gradient(135deg, ${primaryColor}, #0F0C20)` } : undefined}
    >
      {/* 0. OPTIONAL TOP ANNOUNCEMENT TICKER */}
      {showAnnouncement && announcementText && (
        <div
          className={`px-4 py-1.5 text-center text-xs font-semibold flex items-center justify-center gap-2 border-b ${
            isLight
              ? 'bg-stone-100 text-stone-800 border-stone-200'
              : 'border-white/10 text-white'
          }`}
          style={!isLight ? { backgroundColor: `${primaryColor}cc` } : undefined}
        >
          <span className="bg-amber-400 text-stone-950 text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider shrink-0 shadow-xs">
            {announcementBadge || 'OFFER'}
          </span>
          <span className="truncate max-w-2xl font-medium">{announcementText}</span>
        </div>
      )}

      {/* 1. TOP HEADER ROW */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-3 sm:gap-6">
        {/* LOGO (CUSTOM IMAGE OR DEFAULT STYLIZED BADGE) */}
        <div className="flex items-center gap-3 shrink-0">
          <a href="#" className="flex items-center gap-2.5 group">
            {logoUrl ? (
              <img
                src={logoUrl}
                alt={appName}
                style={{ height: `${logoHeight || 38}px`, maxHeight: '68px' }}
                className="object-contain max-w-[200px] sm:max-w-[260px] rounded transition-transform group-hover:scale-[1.02]"
              />
            ) : (
              <>
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform"
                  style={{ backgroundColor: primaryColor }}
                >
                  <Zap className="w-5 h-5 text-white fill-amber-300" />
                </div>
                <div>
                  <span className={`text-xl sm:text-2xl font-black tracking-tight flex items-center font-sans ${isLight ? 'text-stone-950' : 'text-white'}`}>
                    {appName || 'DealKart'}
                  </span>
                  <span className={`text-[10px] font-medium tracking-wide block -mt-1 truncate max-w-[160px] ${isLight ? 'text-stone-500' : 'text-purple-300'}`}>
                    {tagline}
                  </span>
                </div>
              </>
            )}
          </a>
        </div>

        {/* SEARCH BAR (Wide Central Search) */}
        <form
          onSubmit={handleSearchSubmit}
          className="hidden md:flex flex-1 max-w-2xl items-center bg-white rounded-full overflow-hidden shadow-inner pl-3 pr-1 py-1"
        >
          <div className="flex items-center text-xs font-semibold text-stone-600 pr-2 border-r border-stone-200">
            <select
              value={selectedCategory}
              onChange={(e) => onSelectCategory(e.target.value)}
              className="bg-transparent text-xs font-semibold text-stone-700 focus:outline-none cursor-pointer pr-1 max-w-[130px] truncate"
            >
              <option value="All">All Categories</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <input
            type="text"
            value={searchInput}
            onChange={(e) => {
              setSearchInput(e.target.value);
              onSearchChange(e.target.value);
            }}
            placeholder="Search deals, brands, products..."
            className="flex-1 px-3 py-1.5 text-xs text-stone-900 placeholder:text-stone-400 focus:outline-none"
          />

          <button
            type="submit"
            className="w-8 h-8 rounded-full bg-purple-600 hover:bg-purple-700 flex items-center justify-center text-white transition-colors cursor-pointer shrink-0"
            aria-label="Search"
          >
            <Search className="w-4 h-4" />
          </button>
        </form>

        {/* RIGHT ACTIONS: Wishlist, Cart, User Sign In, Admin Portal */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Admin shortcut */}
          <button
            onClick={onOpenAdmin}
            className="hidden xl:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-purple-200 hover:text-white bg-purple-900/40 hover:bg-purple-800/60 border border-purple-500/30 rounded-full transition-all cursor-pointer"
            title="Open Admin Dashboard"
          >
            <LayoutDashboard className="w-3.5 h-3.5 text-amber-400" />
            <span>Admin</span>
          </button>

          {/* Delivery Boy shortcut */}
          <button
            onClick={onOpenDeliveryBoy}
            className="hidden xl:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-purple-200 hover:text-white bg-purple-900/40 hover:bg-purple-800/60 border border-purple-500/30 rounded-full transition-all cursor-pointer"
            title="Open Delivery Boy Courier View"
          >
            <Truck className="w-3.5 h-3.5 text-blue-400" />
            <span>Courier</span>
          </button>

          {/* Wishlist Button */}
          <button
            className="p-2 text-stone-300 hover:text-white relative cursor-pointer transition-colors"
            title="Wishlist"
          >
            <Heart className="w-5 h-5" />
            {wishlistCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-rose-500 text-[10px] font-bold text-white flex items-center justify-center">
                {wishlistCount}
              </span>
            )}
          </button>

          {/* Cart Button with Counter Badge */}
          <button
            onClick={onOpenCart}
            className="p-2 text-stone-300 hover:text-white relative cursor-pointer transition-colors flex items-center gap-1"
            title="Shopping Cart"
          >
            <div className="relative">
              <ShoppingCart className="w-5 h-5 text-amber-400" />
              <span className="absolute -top-1.5 -right-2 px-1.5 py-0.2 min-w-4.5 h-4.5 rounded-full bg-purple-600 text-[10px] font-bold text-white flex items-center justify-center border-2 border-[#0F0C20] tabular-nums">
                {totalCartCount}
              </span>
            </div>
          </button>

          {/* Customer Authentication Button */}
          {currentCustomer ? (
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="inline-flex items-center gap-2 px-3 py-1.5 bg-purple-800/60 hover:bg-purple-700/60 text-white rounded-full text-xs font-bold border border-purple-400/40 transition-all cursor-pointer"
              >
                <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center text-[11px] font-bold text-white">
                  {currentCustomer.name.charAt(0).toUpperCase()}
                </div>
                <span className="max-w-[90px] truncate">{currentCustomer.name}</span>
                <ChevronDown className="w-3 h-3 text-purple-300" />
              </button>

              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-2xl border border-stone-200 py-1.5 text-stone-900 z-50 text-xs animate-in fade-in duration-150">
                  <div className="px-3.5 py-2 border-b border-stone-100">
                    <span className="font-bold block truncate">{currentCustomer.name}</span>
                    <span className="text-[11px] text-stone-400 truncate block">{currentCustomer.email}</span>
                  </div>
                  <button
                    onClick={() => {
                      setUserMenuOpen(false);
                      onOpenCustomerPortal();
                    }}
                    className="w-full text-left px-3.5 py-2 hover:bg-purple-50 flex items-center gap-2 cursor-pointer font-semibold text-stone-800"
                  >
                    <Package className="w-4 h-4 text-purple-600" />
                    <span>Track My Orders</span>
                  </button>
                  <button
                    onClick={() => {
                      setUserMenuOpen(false);
                      onLogoutCustomer();
                    }}
                    className="w-full text-left px-3.5 py-2 hover:bg-rose-50 text-rose-600 flex items-center gap-2 cursor-pointer font-semibold border-t border-stone-100"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={onOpenCustomerAuth}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-full text-xs font-bold shadow-md shadow-purple-600/30 transition-all cursor-pointer whitespace-nowrap active:scale-95"
            >
              <User className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. SECONDARY CATEGORY & NAVIGATION ROW */}
      <div className="bg-[#181335] border-t border-purple-900/40 px-4 sm:px-6 lg:px-8 py-2 text-xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-6 shrink-0 font-medium text-purple-200">
            <button
              onClick={() => onSelectCategory('All')}
              className="flex items-center gap-1.5 font-bold text-white hover:text-amber-400 transition-colors cursor-pointer"
            >
              <Menu className="w-4 h-4" />
              <span>Categories</span>
            </button>
            <a href="#daily-deals" className="hover:text-white transition-colors">
              Today's Deals
            </a>
            <a href="#bundles" className="hover:text-white transition-colors">
              Bundles
            </a>
            <a href="#popular-products" className="hover:text-white transition-colors">
              New Arrivals
            </a>
            <a href="#limited-drops" className="hover:text-white transition-colors">
              Trending
            </a>
            <a href="#member-zone" className="hover:text-white transition-colors">
              Member Zone
            </a>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <a
              href="#daily-deals"
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/20 hover:bg-purple-500/30 border border-purple-400/30 text-amber-300 font-bold text-[11px] cursor-pointer transition-colors"
            >
              <Bell className="w-3 h-3 text-amber-400" />
              <span>Deal Alerts</span>
            </a>
          </div>
        </div>
      </div>
    </header>
  );
};
