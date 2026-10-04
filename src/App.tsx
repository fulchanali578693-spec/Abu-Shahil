/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { CheckCircle2, LayoutDashboard, Package, ShoppingCart, Truck } from 'lucide-react';
import { syncedStore, SyncedStoreState, StoreProduct } from './lib/syncedStore';
import { getActiveCustomer, CustomerUser, customerLogout } from './lib/firebase';
import { OrderInsertPayload } from './lib/supabase';

// DealKart Template Components
import { DealKartNavbar } from './components/DealKartNavbar';
import { DealKartHero } from './components/DealKartHero';
import { ShopByCategory } from './components/ShopByCategory';
import { CategoryProductCatalog } from './components/CategoryProductCatalog';
import { DailyDealsSection } from './components/DailyDealsSection';
import { PromoBanners } from './components/PromoBanners';
import { PopularProductsSection } from './components/PopularProductsSection';
import { LimitedDropsSection } from './components/LimitedDropsSection';
import { CouponGrabber } from './components/CouponGrabber';
import { TrustCheckoutStrip } from './components/TrustCheckoutStrip';
import { DealKartFooter } from './components/DealKartFooter';

// Portals & Drawers
import { CartDrawer } from './components/CartDrawer';
import { CheckoutModal } from './components/CheckoutModal';
import { CustomerAuthModal } from './components/CustomerAuthModal';
import { CustomerPortalModal } from './components/CustomerPortalModal';
import { AdminDashboard } from './components/AdminDashboard';
import { DeliveryBoyView } from './components/DeliveryBoyView';

export default function App() {
  const [syncedState, setSyncedState] = useState<SyncedStoreState>(syncedStore.getState());
  const [viewMode, setViewMode] = useState<'storefront' | 'admin' | 'delivery'>('storefront');

  // Customer Authentication state
  const [currentCustomer, setCurrentCustomer] = useState<CustomerUser | null>(getActiveCustomer());
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authRestrictionMsg, setAuthRestrictionMsg] = useState<string | null>(null);

  // Cart & Modals state
  const [cartDrawerOpen, setCartDrawerOpen] = useState(false);
  const [checkoutModalOpen, setCheckoutModalOpen] = useState(false);
  const [orderPortalOpen, setOrderPortalOpen] = useState(false);
  const [confirmedOrder, setConfirmedOrder] = useState<OrderInsertPayload | null>(null);

  // Filter & Search state
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Subscribe to live synchronized store
  useEffect(() => {
    const unsub = syncedStore.subscribe(() => {
      setSyncedState({ ...syncedStore.getState() });
    });
    return unsub;
  }, []);

  // Update browser tab title
  useEffect(() => {
    document.title = `${syncedState.appName} - Deals Beyond Ordinary | Great Finds. Better Prices.`;
  }, [syncedState.appName]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // ENFORCEMENT: "without login not allow anything"
  const handleRequireAuth = (actionDescription: string) => {
    setAuthRestrictionMsg(actionDescription);
    setAuthModalOpen(true);
  };

  const handleAddToCart = (product: StoreProduct, variant?: any) => {
    // Check if customer is logged in
    if (!currentCustomer) {
      handleRequireAuth(`Authentication Required: Please sign in or register to add "${product.name}" to your cart. Without login, purchasing is not allowed.`);
      return;
    }

    syncedStore.addToCart(product, variant);
    showToast(`"${product.name}" added to cart!`);
  };

  const handleCustomerLogout = () => {
    customerLogout();
    setCurrentCustomer(null);
    showToast('Signed out of customer account.');
  };

  const handleOrderSuccess = (order: OrderInsertPayload) => {
    setConfirmedOrder(order);
    showToast('Order confirmed! Package assigned to courier dispatch.');
  };

  // Filter products by selected category and search
  const filteredProducts = syncedState.products.filter((p) => {
    const matchesCat = selectedCategory === 'All' || p.category === selectedCategory;
    const matchesSearch =
      !searchQuery ||
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.subtitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  // --- 1. ADMIN DASHBOARD VIEW ---
  if (viewMode === 'admin') {
    return (
      <AdminDashboard
        state={syncedState}
        onExit={() => setViewMode('storefront')}
        onOpenDeliveryBoyView={() => setViewMode('delivery')}
      />
    );
  }

  // --- 2. DELIVERY BOY COURIER VIEW ---
  if (viewMode === 'delivery') {
    return (
      <DeliveryBoyView
        state={syncedState}
        onExit={() => setViewMode('storefront')}
      />
    );
  }

  const fontClass =
    syncedState.theme?.fontFamily === 'serif'
      ? 'font-serif'
      : syncedState.theme?.fontFamily === 'mono'
      ? 'font-mono'
      : 'font-sans';

  // --- 3. DEALKART STOREFRONT (MATCHING THE UPLOADED TEMPLATE) ---
  return (
    <div className={`min-h-screen flex flex-col bg-[#FAF8F5] text-stone-900 ${fontClass} selection:bg-purple-200`}>
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-20 right-5 z-50 p-4 bg-[#0F0C20] text-white rounded-2xl shadow-2xl border border-purple-500/40 text-xs font-bold flex items-center gap-2.5 animate-in slide-in-from-top-3 duration-200">
          <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 1. Header Navigation matching the template & live customization */}
      <DealKartNavbar
        appName={syncedState.appName}
        tagline={syncedState.storeTagline}
        logoUrl={syncedState.customization?.logoUrl}
        logoHeight={syncedState.customization?.logoHeight}
        showAnnouncement={syncedState.customization?.showAnnouncement}
        announcementBadge={syncedState.customization?.announcementBadge}
        announcementText={syncedState.announcementText}
        primaryColor={syncedState.theme?.primaryColor}
        headerStyle={syncedState.theme?.headerStyle}
        cart={syncedState.cart}
        wishlistCount={2}
        currentCustomer={currentCustomer}
        categories={syncedState.categories}
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
        onSearchChange={setSearchQuery}
        onOpenCart={() => setCartDrawerOpen(true)}
        onOpenCustomerAuth={() => {
          setAuthRestrictionMsg(null);
          setAuthModalOpen(true);
        }}
        onOpenCustomerPortal={() => setOrderPortalOpen(true)}
        onOpenAdmin={() => setViewMode('admin')}
        onOpenDeliveryBoy={() => setViewMode('delivery')}
        onLogoutCustomer={handleCustomerLogout}
      />

      {/* 2. Main Storefront Content */}
      <main className="flex-1">
        {/* Hero Section matching the template & live customization */}
        <DealKartHero
          customization={syncedState.customization}
          theme={syncedState.theme}
          onExploreDeals={() => {
            const el = document.getElementById('daily-deals');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          }}
        />

        {/* Shop By Category Row (Dynamic Categories from Admin) */}
        <ShopByCategory
          categories={syncedState.categories}
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
        />

        {/* Category-Wise Product Catalog (Requirement: "all product will add on website with category wise. add category option on website.") */}
        <CategoryProductCatalog
          products={syncedState.products}
          categories={syncedState.categories}
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
          currencySymbol={syncedState.currencySymbol}
          currentCustomer={currentCustomer}
          onAddToCart={handleAddToCart}
          onRequireAuth={handleRequireAuth}
          onOpenAdmin={() => setViewMode('admin')}
        />

        {/* Daily Deals with Countdown Timer & Add to Cart */}
        <DailyDealsSection
          products={filteredProducts}
          currencySymbol={syncedState.currencySymbol}
          currentCustomer={currentCustomer}
          onAddToCart={handleAddToCart}
          onRequireAuth={handleRequireAuth}
        />

        {/* Promotional Split Banners (Bundle Savings & Member Exclusive) */}
        <PromoBanners
          customization={syncedState.customization}
          theme={syncedState.theme}
          onExploreBundles={() => {
            const el = document.getElementById('popular-products');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          }}
          onJoinMember={() => {
            if (!currentCustomer) {
              handleRequireAuth('Sign in or register an account to unlock DealKart+ VIP membership.');
            } else {
              showToast('You are already an active DealKart+ Member!');
            }
          }}
        />

        {/* Popular Products (Customer Favorites) */}
        <PopularProductsSection
          products={filteredProducts}
          currencySymbol={syncedState.currencySymbol}
          currentCustomer={currentCustomer}
          onAddToCart={handleAddToCart}
          onRequireAuth={handleRequireAuth}
        />

        {/* Limited Drops (Dark Luxury Section) */}
        <LimitedDropsSection
          products={filteredProducts}
          currencySymbol={syncedState.currencySymbol}
          currentCustomer={currentCustomer}
          onAddToCart={handleAddToCart}
          onRequireAuth={handleRequireAuth}
        />

        {/* Grab Your Coupons & Newsletter Strip */}
        <CouponGrabber
          onCouponApplied={(msg) => {
            showToast(msg);
            setCartDrawerOpen(true);
          }}
        />

        {/* Trust, Payment Methods & Customer Testimonials Strip */}
        <TrustCheckoutStrip />
      </main>

      {/* 3. Footer matching the template & live customization */}
      <DealKartFooter
        appName={syncedState.appName}
        tagline={syncedState.storeTagline}
        customization={syncedState.customization}
        theme={syncedState.theme}
        supportPhone={syncedState.supportPhone}
        supportEmail={syncedState.supportEmail}
        onOpenAdmin={() => setViewMode('admin')}
        onOpenCustomerAuth={() => {
          setAuthRestrictionMsg(null);
          setAuthModalOpen(true);
        }}
        onOpenDeliveryBoy={() => setViewMode('delivery')}
      />

      {/* 4. Slide-over Shopping Cart Drawer */}
      <CartDrawer
        isOpen={cartDrawerOpen}
        onClose={() => setCartDrawerOpen(false)}
        cart={syncedState.cart}
        currencySymbol={syncedState.currencySymbol}
        appliedCoupon={syncedState.appliedCoupon}
        currentCustomer={currentCustomer}
        onProceedToCheckout={() => {
          setCartDrawerOpen(false);
          setCheckoutModalOpen(true);
        }}
        onRequireAuth={handleRequireAuth}
      />

      {/* 5. Checkout Modal (Logged-In Customer Only) */}
      {currentCustomer && (
        <CheckoutModal
          isOpen={checkoutModalOpen}
          onClose={() => setCheckoutModalOpen(false)}
          cart={syncedState.cart}
          currencySymbol={syncedState.currencySymbol}
          appliedCoupon={syncedState.appliedCoupon}
          paymentMethods={syncedState.paymentMethods}
          currentCustomer={currentCustomer}
          onOrderSuccess={handleOrderSuccess}
        />
      )}

      {/* 6. Customer Authentication Modal (Enforces "without register denied login" & restriction) */}
      <CustomerAuthModal
        isOpen={authModalOpen}
        onClose={() => {
          setAuthModalOpen(false);
          setAuthRestrictionMsg(null);
        }}
        currentCustomer={currentCustomer}
        restrictionMessage={authRestrictionMsg}
        onCustomerChange={(cust) => {
          setCurrentCustomer(cust);
          if (cust) {
            showToast(`Welcome, ${cust.name}!`);
          }
        }}
        onOpenCustomerPortal={() => setOrderPortalOpen(true)}
      />

      {/* 7. Customer Order Tracking Portal Modal */}
      <CustomerPortalModal
        isOpen={orderPortalOpen}
        onClose={() => setOrderPortalOpen(false)}
        customer={currentCustomer}
        orders={syncedState.orders}
        currencySymbol={syncedState.currencySymbol}
      />

      {/* 8. Order Confirmed Success Popup */}
      {confirmedOrder && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
          <div
            onClick={() => setConfirmedOrder(null)}
            className="fixed inset-0 bg-stone-900/60 backdrop-blur-xs"
          />
          <div className="relative bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full text-center space-y-4 shadow-2xl border border-purple-200 z-10 animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 rounded-full bg-emerald-100 border border-emerald-300 flex items-center justify-center mx-auto text-emerald-600">
              <CheckCircle2 className="w-9 h-9" />
            </div>

            <div>
              <span className="text-xs font-black uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full">
                Order Received
              </span>
              <h3 className="text-2xl font-black text-stone-900 mt-2 font-serif-display">
                Thank You, {confirmedOrder.customer_name}!
              </h3>
              <p className="text-xs text-stone-600 mt-1">
                Your order for <strong>{confirmedOrder.product_name}</strong> is confirmed and logged in Supabase.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-purple-50 text-left text-xs space-y-2 border border-purple-200 text-purple-950">
              <div><strong>Delivery Address:</strong> {confirmedOrder.address}, {confirmedOrder.city}</div>
              <div><strong>Courier Contact:</strong> {confirmedOrder.phone}</div>
              <div><strong>Payment:</strong> Cash on Delivery / Inspected Doorstep Handover</div>
            </div>

            <div className="flex gap-2.5 pt-2">
              <button
                onClick={() => {
                  setConfirmedOrder(null);
                  setOrderPortalOpen(true);
                }}
                className="flex-1 py-3 bg-purple-600 hover:bg-purple-700 text-white font-black text-xs rounded-xl shadow-md transition-all cursor-pointer"
              >
                Track This Order
              </button>
              <button
                onClick={() => setConfirmedOrder(null)}
                className="px-5 py-3 bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold text-xs rounded-xl transition-all cursor-pointer"
              >
                Continue Shopping
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
