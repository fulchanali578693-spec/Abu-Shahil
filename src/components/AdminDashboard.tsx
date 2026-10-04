import React, { useState } from 'react';
import {
  ArrowLeft,
  Banknote,
  Check,
  CheckCircle2,
  ChevronDown,
  Clock,
  Copy,
  CreditCard,
  Database,
  ExternalLink,
  Eye,
  EyeOff,
  Filter,
  Flame,
  FolderPlus,
  Globe,
  Image as ImageIcon,
  KeyRound,
  LayoutDashboard,
  Lock,
  LogOut,
  Mail,
  MapPin,
  Monitor,
  Moon,
  Package,
  PackagePlus,
  Palette,
  Phone,
  Plus,
  QrCode,
  RefreshCw,
  RotateCcw,
  Search,
  Settings,
  ShieldCheck,
  Sliders,
  SlidersHorizontal,
  Sparkles,
  Sun,
  Tag,
  Trash2,
  TrendingUp,
  Truck,
  Type,
  Upload,
  User,
  UserPlus,
  X,
} from 'lucide-react';
import { SyncedStoreState, syncedStore, StoreProduct, CustomPaymentMethod } from '../lib/syncedStore';
import { OrderRecord, OrderStatus, fetchSupabaseOrders } from '../lib/supabase';
import { ProductVariant } from '../config/storeConfig';

interface AdminDashboardProps {
  state: SyncedStoreState;
  onExit: () => void;
  onOpenDeliveryBoyView: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  state,
  onExit,
  onOpenDeliveryBoyView,
}) => {
  // Authentication State
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState<boolean>(() => {
    return localStorage.getItem('auracraft_admin_auth') === 'true';
  });
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);

  // Active navigation tab (Requirement: Customize every thing, Theme Style, Custom Logo)
  const [activeTab, setActiveTab] = useState<
    'overview' | 'orders' | 'products' | 'customize' | 'payments' | 'delivery' | 'settings'
  >('overview');

  // Search & Filter state for Orders
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isSyncing, setIsSyncing] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modals state
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [showAddVariantModal, setShowAddVariantModal] = useState(false);
  const [showAddPaymentModal, setShowAddPaymentModal] = useState(false);
  const [showAddDeliveryAgentModal, setShowAddDeliveryAgentModal] = useState(false);
  const [showCreatedCredentialsModal, setShowCreatedCredentialsModal] = useState(false);
  const [createdAgentCredentials, setCreatedAgentCredentials] = useState<{
    name: string;
    deliveryId: string;
    password: string;
    phone: string;
    zone: string;
  } | null>(null);
  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [selectedOrderForDetail, setSelectedOrderForDetail] = useState<OrderRecord | null>(null);

  // Delivery Boy Form State (Auto-Generated ID & Password)
  const [newAgentName, setNewAgentName] = useState('');
  const [newAgentPhone, setNewAgentPhone] = useState('');
  const [newAgentZone, setNewAgentZone] = useState('');
  const [newAgentVehicle, setNewAgentVehicle] = useState('Motorbike Express');
  const [newAgentDeliveryId, setNewAgentDeliveryId] = useState(() => `DEL-${Math.floor(1000 + Math.random() * 9000)}`);
  const [newAgentPassword, setNewAgentPassword] = useState(() => `Rider@${Math.floor(1000 + Math.random() * 9000)}`);
  const [showPasswordMap, setShowPasswordMap] = useState<Record<string, boolean>>({});

  // Category Filtering in Product tab
  const [productCategoryFilter, setProductCategoryFilter] = useState<string>('all');

  // Add Product Form State (Category-wise, Unlimited Products, File Upload)
  const [newProductName, setNewProductName] = useState('');
  const [newProductCategory, setNewProductCategory] = useState(state.categories[0] || 'Electronics');
  const [isCustomCategory, setIsCustomCategory] = useState(false);
  const [customCategoryInput, setCustomCategoryInput] = useState('');
  const [newProductPrice, setNewProductPrice] = useState(89);
  const [newProductComparePrice, setNewProductComparePrice] = useState(139);
  const [newProductSubtitle, setNewProductSubtitle] = useState('');
  const [newProductDescription, setNewProductDescription] = useState('');
  const [newProductImage, setNewProductImage] = useState('/src/assets/images/cod_product_main_1791095851714.jpg');
  const [newProductStock, setNewProductStock] = useState(50);
  const [newProductBadge, setNewProductBadge] = useState('Deal of Day');
  const [newProductIsDailyDeal, setNewProductIsDailyDeal] = useState(false);
  const [newProductIsPopular, setNewProductIsPopular] = useState(true);
  const [newProductIsLimitedDrop, setNewProductIsLimitedDrop] = useState(false);

  // Add Variant Form State
  const [targetProductId, setTargetProductId] = useState(state.products[0]?.id || '');
  const [newVariantName, setNewVariantName] = useState('');
  const [newVariantColorName, setNewVariantColorName] = useState('');
  const [newVariantColorHex, setNewVariantColorHex] = useState('#8A9A86');
  const [newVariantImage, setNewVariantImage] = useState('/src/assets/images/cod_product_lifestyle_1791095866054.jpg');

  // Add Payment Method Form State
  const [newPaymentName, setNewPaymentName] = useState('');
  const [newPaymentType, setNewPaymentType] = useState<'cod' | 'upi_qr' | 'bank_transfer' | 'gateway'>('upi_qr');
  const [newPaymentDescription, setNewPaymentDescription] = useState('');
  const [newPaymentInstructions, setNewPaymentInstructions] = useState('');
  const [newPaymentQrUrl, setNewPaymentQrUrl] = useState('');
  const [newPaymentAccountDetails, setNewPaymentAccountDetails] = useState('');

  // Settings State
  const [settingsAppName, setSettingsAppName] = useState(state.appName);
  const [settingsTagline, setSettingsTagline] = useState(state.storeTagline);
  const [settingsAnnouncement, setSettingsAnnouncement] = useState(state.announcementText);
  const [settingsSupportPhone, setSettingsSupportPhone] = useState(state.supportPhone);
  const [settingsSupportEmail, setSettingsSupportEmail] = useState(state.supportEmail);
  const [settingsCurrencySymbol, setSettingsCurrencySymbol] = useState(state.currencySymbol);

  // --- WEBSITE CUSTOMIZATION & THEME STATE (Requirement: Customise everything, Theme Style, Custom Logo) ---
  const [customLogoUrl, setCustomLogoUrl] = useState(state.customization.logoUrl || '');
  const [customLogoHeight, setCustomLogoHeight] = useState(state.customization.logoHeight || 38);
  const [themePrimaryColor, setThemePrimaryColor] = useState(state.theme.primaryColor || '#7C3AED');
  const [themeAccentColor, setThemeAccentColor] = useState(state.theme.accentColor || '#F59E0B');
  const [themePreset, setThemePreset] = useState(state.theme.themePreset || 'purple');
  const [themeFontFamily, setThemeFontFamily] = useState(state.theme.fontFamily || 'sans');
  const [themeHeaderStyle, setThemeHeaderStyle] = useState(state.theme.headerStyle || 'dark');
  const [themeButtonRadius, setThemeButtonRadius] = useState(state.theme.buttonRadius || 'rounded-full');

  // Announcement Bar
  const [showAnnouncement, setShowAnnouncement] = useState(state.customization.showAnnouncement ?? true);
  const [announcementBadge, setAnnouncementBadge] = useState(state.customization.announcementBadge || '⚡ MEGA SAVINGS');

  // Hero Section Customization
  const [heroHeadline, setHeroHeadline] = useState(state.customization.heroHeadline || 'Great Finds.');
  const [heroHeadlineHighlight, setHeroHeadlineHighlight] = useState(state.customization.heroHeadlineHighlight || 'Better Prices.');
  const [heroSubtitle, setHeroSubtitle] = useState(state.customization.heroSubtitle || 'Shop Smarter. Save More.');
  const [heroBadgeText, setHeroBadgeText] = useState(state.customization.heroBadgeText || 'Up To 80% Off Top Brands');
  const [heroCtaText, setHeroCtaText] = useState(state.customization.heroCtaText || "Explore Today's Deals");
  const [heroSubCtaText, setHeroSubCtaText] = useState(state.customization.heroSubCtaText || 'Cash on Delivery Available at Doorstep');
  const [heroImage, setHeroImage] = useState(state.customization.heroImage || '/src/assets/images/dealkart_hero_banner_1791097277652.jpg');

  // Promotional Split Banners
  const [banner1Title, setBanner1Title] = useState(state.customization.banner1Title || 'Buy More. Save More!');
  const [banner1Subtitle, setBanner1Subtitle] = useState(state.customization.banner1Subtitle || 'Pair top tech gadgets, audio gear, and lifestyle essentials for volume bundle savings.');
  const [banner1Discount, setBanner1Discount] = useState(state.customization.banner1Discount || 'Up To 70% Off');
  const [banner1Badge, setBanner1Badge] = useState(state.customization.banner1Badge || 'Bundle Savings');

  const [banner2Title, setBanner2Title] = useState(state.customization.banner2Title || 'Join DealKart+ for Extra Perks!');
  const [banner2Subtitle, setBanner2Subtitle] = useState(state.customization.banner2Subtitle || 'VIP cash on delivery priority, early-bird drop alerts, and exclusive secret voucher codes.');
  const [banner2Discount, setBanner2Discount] = useState(state.customization.banner2Discount || 'VIP Free Delivery');
  const [banner2Badge, setBanner2Badge] = useState(state.customization.banner2Badge || 'Member Exclusive');

  // Trust Badges & Footer
  const [trustBadge1Title, setTrustBadge1Title] = useState(state.customization.trustBadge1Title || '30-Day Easy Returns');
  const [trustBadge1Desc, setTrustBadge1Desc] = useState(state.customization.trustBadge1Desc || 'Hassle-free doorstep pickup');
  const [trustBadge2Title, setTrustBadge2Title] = useState(state.customization.trustBadge2Title || '100% Authentic Brands');
  const [trustBadge2Desc, setTrustBadge2Desc] = useState(state.customization.trustBadge2Desc || 'Verified manufacturer warranty');
  const [trustBadge3Title, setTrustBadge3Title] = useState(state.customization.trustBadge3Title || 'Customer Support 24/7');
  const [trustBadge3Desc, setTrustBadge3Desc] = useState(state.customization.trustBadge3Desc || 'Dedicated assistance anytime');
  const [footerAbout, setFooterAbout] = useState(state.customization.footerAbout || 'Your trusted Cash-on-Delivery marketplace with verified doorstep parcel inspection.');
  const [footerCopyright, setFooterCopyright] = useState(state.customization.footerCopyright || `© 2026 ${state.appName}. All rights reserved. Powered by Jannat Infotech.`);

  const THEME_PALETTES = [
    { id: 'purple', name: 'Royal Purple', primary: '#7C3AED', accent: '#F59E0B', desc: 'Vibrant Luxury' },
    { id: 'orange', name: 'Sunset Flame', primary: '#EA580C', accent: '#FBBF24', desc: 'High Energy & Action' },
    { id: 'emerald', name: 'Emerald Luxury', primary: '#059669', accent: '#F59E0B', desc: 'Trust & Fresh Living' },
    { id: 'blue', name: 'Ocean Sapphire', primary: '#2563EB', accent: '#06B6D4', desc: 'Tech & Modern Minimal' },
    { id: 'black', name: 'Midnight Obsidian', primary: '#18181B', accent: '#EAB308', desc: 'Stealth & Premium Dark' },
    { id: 'rose', name: 'Crimson Rose', primary: '#E11D48', accent: '#FB7185', desc: 'Passionate & Bold' },
    { id: 'cyber', name: 'Cyber Indigo', primary: '#4F46E5', accent: '#10B981', desc: 'Next-Gen Cyber Neon' },
  ];

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Logo file upload handler
  const handleLogoFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        showToast('Image size exceeds 2MB limit.');
        return;
      }
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        const res = uploadEvent.target?.result as string;
        if (res) {
          setCustomLogoUrl(res);
          showToast('Custom logo uploaded! Save changes to sync with live website.');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Hero Image file upload handler
  const handleHeroImageFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 3 * 1024 * 1024) {
        showToast('Image size exceeds 3MB limit.');
        return;
      }
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        const res = uploadEvent.target?.result as string;
        if (res) {
          setHeroImage(res);
          showToast('Hero banner image uploaded! Save changes to sync with live website.');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Save All Website Customizations & Theme
  const handleSaveAllCustomizations = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    syncedStore.updateTheme({
      primaryColor: themePrimaryColor,
      accentColor: themeAccentColor,
      themePreset: themePreset as any,
      fontFamily: themeFontFamily as any,
      headerStyle: themeHeaderStyle as any,
      buttonRadius: themeButtonRadius as any,
    });

    syncedStore.updateCustomization({
      logoUrl: customLogoUrl,
      logoHeight: Number(customLogoHeight),
      showAnnouncement,
      announcementBadge,
      heroHeadline,
      heroHeadlineHighlight,
      heroSubtitle,
      heroBadgeText,
      heroCtaText,
      heroSubCtaText,
      heroImage,
      banner1Title,
      banner1Subtitle,
      banner1Discount,
      banner1Badge,
      banner2Title,
      banner2Subtitle,
      banner2Discount,
      banner2Badge,
      trustBadge1Title,
      trustBadge1Desc,
      trustBadge2Title,
      trustBadge2Desc,
      trustBadge3Title,
      trustBadge3Desc,
      footerAbout,
      footerCopyright,
    });

    syncedStore.updateSettings({
      appName: settingsAppName.trim(),
      storeTagline: settingsTagline.trim(),
      announcementText: settingsAnnouncement.trim(),
      supportPhone: settingsSupportPhone.trim(),
      supportEmail: settingsSupportEmail.trim(),
      currencySymbol: settingsCurrencySymbol.trim(),
    });

    showToast('✨ Website customization & theme style synced in real-time to the live website!');
  };

  // Reset to default theme & customization
  const handleResetToDefault = () => {
    if (confirm('Are you sure you want to reset the website theme, custom logo, and styling to default settings?')) {
      syncedStore.resetThemeAndCustomization();
      setCustomLogoUrl('');
      setCustomLogoHeight(38);
      setThemePrimaryColor('#7C3AED');
      setThemeAccentColor('#F59E0B');
      setThemePreset('purple');
      setThemeFontFamily('sans');
      setThemeHeaderStyle('dark');
      setThemeButtonRadius('rounded-full');
      setShowAnnouncement(true);
      setAnnouncementBadge('⚡ MEGA SAVINGS');
      setHeroHeadline('Great Finds.');
      setHeroHeadlineHighlight('Better Prices.');
      setHeroSubtitle('Shop Smarter. Save More.');
      setHeroBadgeText('Up To 80% Off Top Brands');
      setHeroCtaText("Explore Today's Deals");
      setHeroSubCtaText('Cash on Delivery Available at Doorstep');
      setHeroImage('/src/assets/images/dealkart_hero_banner_1791097277652.jpg');
      setBanner1Title('Buy More. Save More!');
      setBanner1Subtitle('Pair top tech gadgets, audio gear, and lifestyle essentials for volume bundle savings.');
      setBanner1Discount('Up To 70% Off');
      setBanner1Badge('Bundle Savings');
      setBanner2Title('Join DealKart+ for Extra Perks!');
      setBanner2Subtitle('VIP cash on delivery priority, early-bird drop alerts, and exclusive secret voucher codes.');
      setBanner2Discount('VIP Free Delivery');
      setBanner2Badge('Member Exclusive');
      setTrustBadge1Title('30-Day Easy Returns');
      setTrustBadge1Desc('Hassle-free doorstep pickup');
      setTrustBadge2Title('100% Authentic Brands');
      setTrustBadge2Desc('Verified manufacturer warranty');
      setTrustBadge3Title('Customer Support 24/7');
      setTrustBadge3Desc('Dedicated assistance anytime');
      showToast('Website style, theme, and logo have been reset to defaults.');
    }
  };

  // Handle Admin Login
  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (
      adminEmail.trim().toLowerCase() === 'jannatinfotech@gmail.com' &&
      adminPassword === 'JannatInfotech@6900'
    ) {
      setIsAdminLoggedIn(true);
      localStorage.setItem('auracraft_admin_auth', 'true');
      setAuthError(null);
    } else {
      setAuthError('Invalid credentials. Please verify your admin email and password.');
    }
  };

  const handleAdminLogout = () => {
    setIsAdminLoggedIn(false);
    localStorage.removeItem('auracraft_admin_auth');
  };

  // Sync Supabase Orders
  const handleManualSync = async () => {
    setIsSyncing(true);
    await syncedStore.syncFromSupabase();
    setIsSyncing(false);
    showToast('Orders synchronized with Supabase database!');
  };

  // Filter Orders
  const filteredOrders = state.orders.filter((order) => {
    const matchesSearch =
      order.customer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.phone.includes(searchQuery) ||
      order.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      String(order.id).includes(searchQuery);

    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Calculate Order Statistics
  const totalOrders = state.orders.length;
  const pendingOrders = state.orders.filter((o) => o.status === 'pending').length;
  const confirmedOrders = state.orders.filter((o) => o.status === 'confirmed').length;
  const outForDeliveryOrders = state.orders.filter((o) => o.status === 'out_for_delivery').length;
  const deliveredOrders = state.orders.filter((o) => o.status === 'delivered').length;

  const totalRevenue = state.orders
    .filter((o) => o.status === 'delivered')
    .reduce((acc, o) => acc + (o.total_price || o.quantity * 79), 0);

  const pendingCashRevenue = state.orders
    .filter((o) => o.status !== 'delivered' && o.status !== 'cancelled')
    .reduce((acc, o) => acc + (o.total_price || o.quantity * 79), 0);

  // Update order status handler
  const handleStatusChange = async (orderId: string | number, newStatus: OrderStatus) => {
    await syncedStore.updateOrderStatus(orderId, newStatus);
    showToast(`Order #${orderId} updated to ${newStatus.replace('_', ' ')}!`);
  };

  // Submit Add Product (Category-Wise, Unlimited Products, Real-Time Website Update)
  const handleCreateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProductName.trim()) return;

    const finalCategory = isCustomCategory
      ? (customCategoryInput.trim() || 'General')
      : (newProductCategory || 'Electronics');

    const created = syncedStore.addProduct({
      name: newProductName.trim(),
      subtitle: newProductSubtitle.trim() || 'Top-rated selection with Cash on Delivery',
      category: finalCategory,
      price: Number(newProductPrice) || 49.99,
      comparePrice: Number(newProductComparePrice) || Number(newProductPrice) * 1.5,
      badge: newProductBadge || 'New Arrival',
      rating: 4.9,
      reviewsCount: 18,
      description: newProductDescription.trim() || 'Quality assured product inspected prior to doorstep cash delivery.',
      stockCount: Number(newProductStock) || 50,
      image: newProductImage,
      gallery: [newProductImage],
      isDailyDeal: newProductIsDailyDeal,
      isPopular: newProductIsPopular,
      isLimitedDrop: newProductIsLimitedDrop,
      variants: [
        {
          id: `var-default-${Date.now()}`,
          name: 'Standard Edition',
          colorName: 'Default',
          colorHex: '#334155',
          image: newProductImage,
          inStock: true,
        },
      ],
    });

    setShowAddProductModal(false);
    setNewProductName('');
    setNewProductSubtitle('');
    setNewProductDescription('');
    setIsCustomCategory(false);
    setCustomCategoryInput('');
    showToast(`"${created.name}" added in category "${finalCategory}"! Live on website.`);
  };

  // Submit Add Category
  const handleCreateCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;
    const ok = syncedStore.addCategory(newCategoryName.trim());
    if (ok) {
      showToast(`Category "${newCategoryName.trim()}" created successfully!`);
      setNewCategoryName('');
      setShowAddCategoryModal(false);
    } else {
      showToast(`Category already exists or is invalid.`);
    }
  };

  // Regenerate Courier Credentials
  const handleRegenerateAgentCredentials = () => {
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    setNewAgentDeliveryId(`DEL-${randomNum}`);
    setNewAgentPassword(`Rider@${randomNum}`);
  };

  // Submit Add Delivery Boy (Requirement: Auto-Generated ID & Password from Admin)
  const handleCreateDeliveryAgent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAgentName.trim() || !newAgentPhone.trim()) return;

    const newAgent = syncedStore.addDeliveryAgent({
      name: newAgentName.trim(),
      phone: newAgentPhone.trim(),
      zone: newAgentZone.trim() || 'City Central',
      vehicle: newAgentVehicle.trim() || 'Motorbike Express',
      deliveryId: newAgentDeliveryId.trim(),
      password: newAgentPassword.trim(),
    });

    setCreatedAgentCredentials({
      name: newAgent.name,
      deliveryId: newAgent.deliveryId,
      password: newAgent.password,
      phone: newAgent.phone,
      zone: newAgent.zone,
    });

    setShowAddDeliveryAgentModal(false);
    setShowCreatedCredentialsModal(true);

    // Reset with fresh auto credentials for next time
    setNewAgentName('');
    setNewAgentPhone('');
    setNewAgentZone('');
    handleRegenerateAgentCredentials();

    showToast(`Delivery Boy ${newAgent.name} registered with ID ${newAgent.deliveryId}!`);
  };

  // Submit Add Variant
  const handleCreateVariant = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVariantName.trim()) return;

    syncedStore.addProductVariant(targetProductId || state.products[0]?.id, {
      name: newVariantName.trim(),
      colorName: newVariantColorName.trim() || newVariantName.trim(),
      colorHex: newVariantColorHex,
      image: newVariantImage,
      inStock: true,
    });

    setShowAddVariantModal(false);
    setNewVariantName('');
    showToast('New variant added! Customers can now select it on the website.');
  };

  // Submit Add Payment System
  const handleCreatePaymentMethod = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPaymentName.trim()) return;

    syncedStore.addPaymentMethod({
      name: newPaymentName.trim(),
      type: newPaymentType,
      enabled: true,
      badge: 'New',
      description: newPaymentDescription.trim() || 'Custom payment method',
      instructions: newPaymentInstructions.trim() || 'Please follow instructions provided at delivery.',
      qrCodeUrl: newPaymentQrUrl.trim() || undefined,
      accountDetails: newPaymentAccountDetails.trim() || undefined,
      iconName: newPaymentType === 'upi_qr' ? 'QrCode' : newPaymentType === 'bank_transfer' ? 'Landmark' : 'CreditCard',
    });

    setShowAddPaymentModal(false);
    setNewPaymentName('');
    showToast('Custom payment system uploaded & activated!');
  };

  // Save Settings
  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    syncedStore.updateSettings({
      appName: settingsAppName.trim(),
      storeTagline: settingsTagline.trim(),
      announcementText: settingsAnnouncement.trim(),
      supportPhone: settingsSupportPhone.trim(),
      supportEmail: settingsSupportEmail.trim(),
      currencySymbol: settingsCurrencySymbol.trim(),
    });
    showToast('Settings saved! Website header, titles, and footer updated instantly.');
  };

  // --- 1. ADMIN LOGIN VIEW IF NOT LOGGED IN ---
  if (!isAdminLoggedIn) {
    return (
      <div className="min-h-screen bg-[#F5F5F7] flex flex-col justify-center items-center p-4">
        {/* Apple Style Login Card */}
        <div className="w-full max-w-md bg-white/90 backdrop-blur-xl rounded-2xl border border-stone-200/80 shadow-xl p-8 animate-in zoom-in-95 duration-200">
          <div className="text-center mb-8">
            <div className="w-14 h-14 rounded-2xl bg-stone-900 text-amber-400 flex items-center justify-center mx-auto mb-4 shadow-sm">
              <LayoutDashboard className="w-7 h-7" />
            </div>
            <h1 className="text-2xl font-bold font-serif-display text-stone-900">
              Admin Portal Login
            </h1>
            <p className="text-xs text-stone-500 mt-1">
              Sign in to manage Cash-on-Delivery orders, products & couriers
            </p>
          </div>

          {authError && (
            <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-900 text-xs flex items-center gap-2">
              <Lock className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{authError}</span>
            </div>
          )}

          <form onSubmit={handleAdminLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Admin Email Address
              </label>
              <input
                type="email"
                required
                value={adminEmail}
                onChange={(e) => setAdminEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-stone-300 focus:outline-none focus:border-stone-900 bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Password
              </label>
              <input
                type="password"
                required
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-stone-300 focus:outline-none focus:border-stone-900 bg-white"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-stone-900 hover:bg-stone-800 text-white rounded-lg text-xs sm:text-sm font-bold shadow-sm transition-all active:scale-[0.99] cursor-pointer"
            >
              Sign In to Admin Dashboard
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={onExit}
              className="text-xs text-stone-500 hover:text-stone-900 flex items-center justify-center gap-1 mx-auto cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Return to Storefront</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // --- 2. MAIN ADMIN DASHBOARD ---
  return (
    <div className="min-h-screen bg-[#F5F5F7] text-stone-900 flex flex-col">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 p-4 bg-stone-900 text-white rounded-xl shadow-xl border border-stone-700 text-xs font-medium flex items-center gap-2.5 animate-in slide-in-from-top-2 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Apple-Style Glass Navbar */}
      <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-stone-200/80 px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={onExit}
            className="p-1.5 rounded-lg text-stone-600 hover:text-stone-900 hover:bg-stone-100 transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-semibold"
            title="Return to website storefront"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Storefront</span>
          </button>
          <div className="h-4 w-px bg-stone-300 hidden sm:block" />
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-stone-900 text-amber-400 flex items-center justify-center font-bold text-sm shadow-2xs">
              <LayoutDashboard className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-base font-serif-display tracking-tight text-stone-900 leading-tight block">
                {state.appName} Admin
              </span>
              <span className="text-[10px] text-stone-500 hidden sm:block">
                Supabase COD Logistics & Store Management
              </span>
            </div>
          </div>
        </div>

        {/* Top Actions: Sync Supabase, Delivery Boy Shortcut, Admin Profile */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleManualSync}
            disabled={isSyncing}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold rounded-lg border border-stone-300/80 transition-all cursor-pointer"
            title="Sync with Supabase orders table"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-stone-600 ${isSyncing ? 'animate-spin' : ''}`} />
            <span className="hidden md:inline">Sync Supabase</span>
          </button>

          <button
            onClick={onOpenDeliveryBoyView}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-900 text-xs font-bold rounded-lg border border-amber-500/30 transition-all cursor-pointer"
            title="Access the delivery boy portal"
          >
            <Truck className="w-3.5 h-3.5 text-amber-700" />
            <span className="hidden sm:inline">Delivery Boy Portal</span>
          </button>

          <button
            onClick={handleAdminLogout}
            className="p-1.5 text-stone-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
            title="Log out of admin"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Workspace with Sidebar Tabs */}
      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col md:flex-row gap-6 items-start">
        {/* Sidebar Navigation */}
        <aside className="w-full md:w-60 bg-white rounded-2xl p-3 border border-stone-200/80 shadow-xs shrink-0">
          <nav className="space-y-1">
            <button
              onClick={() => setActiveTab('overview')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'overview'
                  ? 'bg-stone-900 text-white shadow-2xs'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <TrendingUp className="w-4 h-4" />
                <span>Overview & Analytics</span>
              </div>
            </button>

            <button
              onClick={() => setActiveTab('orders')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'orders'
                  ? 'bg-stone-900 text-white shadow-2xs'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Package className="w-4 h-4" />
                <span>Orders Management</span>
              </div>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full tabular-nums ${
                  activeTab === 'orders' ? 'bg-stone-800 text-amber-300' : 'bg-stone-100 text-stone-600'
                }`}
              >
                {state.orders.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('products')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'products'
                  ? 'bg-stone-900 text-white shadow-2xs'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Palette className="w-4 h-4" />
                <span>Products & Categories</span>
              </div>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full tabular-nums ${
                  activeTab === 'products' ? 'bg-stone-800 text-amber-300' : 'bg-stone-100 text-stone-600'
                }`}
              >
                {state.products.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('customize')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'customize'
                  ? 'bg-gradient-to-r from-purple-900 to-stone-900 text-white shadow-2xs'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>Website & Theme</span>
              </div>
              <span className="text-[10px] px-1.5 py-0.5 rounded-full font-bold bg-amber-400/20 text-amber-600 border border-amber-400/30">
                Customizer
              </span>
            </button>

            <button
              onClick={() => setActiveTab('payments')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'payments'
                  ? 'bg-stone-900 text-white shadow-2xs'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <CreditCard className="w-4 h-4" />
                <span>Payment Systems</span>
              </div>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full tabular-nums ${
                  activeTab === 'payments' ? 'bg-stone-800 text-amber-300' : 'bg-stone-100 text-stone-600'
                }`}
              >
                {state.paymentMethods.filter((m) => m.enabled).length} Active
              </span>
            </button>

            <button
              onClick={() => setActiveTab('delivery')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'delivery'
                  ? 'bg-stone-900 text-white shadow-2xs'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Truck className="w-4 h-4" />
                <span>Delivery Boy System</span>
              </div>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full tabular-nums ${
                  activeTab === 'delivery' ? 'bg-stone-800 text-amber-300' : 'bg-stone-100 text-stone-600'
                }`}
              >
                {state.deliveryAgents.length} Agents
              </span>
            </button>

            <button
              onClick={() => setActiveTab('settings')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'settings'
                  ? 'bg-stone-900 text-white shadow-2xs'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Settings className="w-4 h-4" />
                <span>Store Settings</span>
              </div>
            </button>
          </nav>

          <div className="mt-6 pt-4 border-t border-stone-100 text-[11px] text-stone-400 space-y-1 px-2">
            <div>Supabase: <span className="text-emerald-700 font-semibold">Connected</span></div>
            <div>Table: <span className="font-mono text-stone-600">public.orders</span></div>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 w-full space-y-6">
          {/* TAB 1: OVERVIEW & STATISTICS */}
          {activeTab === 'overview' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-2xl font-bold font-serif-display text-stone-900">
                    Order Logistics Overview
                  </h2>
                  <p className="text-xs text-stone-500">
                    Real-time Cash on Delivery performance metrics & courier fulfillment
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setActiveTab('orders')}
                    className="px-3.5 py-2 bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
                  >
                    View All Orders
                  </button>
                </div>
              </div>

              {/* KPI Cards (Apple Light Style) */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Total Orders */}
                <div className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-xs">
                  <div className="flex items-center justify-between text-stone-500 mb-2">
                    <span className="text-xs font-semibold uppercase tracking-wider">Total Orders</span>
                    <Package className="w-4 h-4 text-stone-400" />
                  </div>
                  <div className="text-2xl sm:text-3xl font-bold tabular-nums text-stone-900 font-serif-display">
                    {totalOrders}
                  </div>
                  <span className="text-[11px] text-emerald-700 font-medium mt-1 block">
                    {deliveredOrders} completed deliveries
                  </span>
                </div>

                {/* Cash Collected / Revenue */}
                <div className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-xs">
                  <div className="flex items-center justify-between text-stone-500 mb-2">
                    <span className="text-xs font-semibold uppercase tracking-wider">Cash Collected</span>
                    <Banknote className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div className="text-2xl sm:text-3xl font-bold tabular-nums text-stone-900 font-serif-display">
                    {state.currencySymbol}{totalRevenue.toFixed(2)}
                  </div>
                  <span className="text-[11px] text-stone-400 mt-1 block">
                    Paid directly to couriers
                  </span>
                </div>

                {/* Cash Pending in Transit */}
                <div className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-xs">
                  <div className="flex items-center justify-between text-stone-500 mb-2">
                    <span className="text-xs font-semibold uppercase tracking-wider">Pending COD</span>
                    <Clock className="w-4 h-4 text-amber-600" />
                  </div>
                  <div className="text-2xl sm:text-3xl font-bold tabular-nums text-amber-900 font-serif-display">
                    {state.currencySymbol}{pendingCashRevenue.toFixed(2)}
                  </div>
                  <span className="text-[11px] text-amber-700 font-medium mt-1 block">
                    {pendingOrders + confirmedOrders + outForDeliveryOrders} active in pipeline
                  </span>
                </div>

                {/* Out for Delivery */}
                <div className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-xs">
                  <div className="flex items-center justify-between text-stone-500 mb-2">
                    <span className="text-xs font-semibold uppercase tracking-wider">Courier Dispatches</span>
                    <Truck className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className="text-2xl sm:text-3xl font-bold tabular-nums text-blue-900 font-serif-display">
                    {outForDeliveryOrders}
                  </div>
                  <span className="text-[11px] text-blue-700 font-medium mt-1 block">
                    Parcels currently with drivers
                  </span>
                </div>
              </div>

              {/* Status Breakdown Bar */}
              <div className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-xs">
                <h3 className="text-xs font-bold text-stone-700 uppercase tracking-wider mb-3">
                  Logistics Pipeline Distribution
                </h3>
                <div className="h-3 w-full bg-stone-100 rounded-full overflow-hidden flex">
                  <div
                    style={{ width: `${(deliveredOrders / Math.max(1, totalOrders)) * 100}%` }}
                    className="bg-emerald-500 h-full"
                    title={`Delivered: ${deliveredOrders}`}
                  />
                  <div
                    style={{ width: `${(outForDeliveryOrders / Math.max(1, totalOrders)) * 100}%` }}
                    className="bg-blue-500 h-full"
                    title={`Out for Delivery: ${outForDeliveryOrders}`}
                  />
                  <div
                    style={{ width: `${(confirmedOrders / Math.max(1, totalOrders)) * 100}%` }}
                    className="bg-amber-500 h-full"
                    title={`Confirmed: ${confirmedOrders}`}
                  />
                  <div
                    style={{ width: `${(pendingOrders / Math.max(1, totalOrders)) * 100}%` }}
                    className="bg-stone-400 h-full"
                    title={`Pending: ${pendingOrders}`}
                  />
                </div>
                <div className="flex flex-wrap gap-4 mt-3 text-xs text-stone-600">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                    <span>Delivered ({deliveredOrders})</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                    <span>Out for Delivery ({outForDeliveryOrders})</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                    <span>Confirmed ({confirmedOrders})</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-stone-400" />
                    <span>Pending ({pendingOrders})</span>
                  </span>
                </div>
              </div>

              {/* Recent Orders Preview */}
              <div className="bg-white rounded-2xl border border-stone-200/80 shadow-xs overflow-hidden">
                <div className="p-5 border-b border-stone-100 flex items-center justify-between">
                  <h3 className="font-bold text-sm text-stone-900">Recent Customer Orders</h3>
                  <button
                    onClick={() => setActiveTab('orders')}
                    className="text-xs font-semibold text-stone-600 hover:text-stone-900"
                  >
                    View All →
                  </button>
                </div>
                <div className="divide-y divide-stone-100">
                  {state.orders.slice(0, 5).map((order) => (
                    <div key={order.id} className="p-4 flex items-center justify-between gap-4 text-xs">
                      <div>
                        <span className="font-bold text-stone-900 block">{order.customer_name}</span>
                        <span className="text-stone-500">
                          {order.product_variant} · {order.quantity} unit(s) · {order.city}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-bold tabular-nums text-stone-900 font-serif-display text-sm">
                          {state.currencySymbol}{(order.total_price || order.quantity * 79).toFixed(2)}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                            order.status === 'delivered'
                              ? 'bg-emerald-100 text-emerald-800'
                              : order.status === 'out_for_delivery'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {order.status.replace('_', ' ')}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: ORDERS MANAGEMENT (Search, filter, update status, details) */}
          {activeTab === 'orders' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-2xl font-bold font-serif-display text-stone-900">
                    Orders Management
                  </h2>
                  <p className="text-xs text-stone-500">
                    Search, filter, assign delivery agents, and update order fulfillment status
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleManualSync}
                    className="px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-semibold rounded-lg border border-stone-300 transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                    <span>Refresh</span>
                  </button>
                </div>
              </div>

              {/* Search and Filters Bar */}
              <div className="bg-white p-4 rounded-2xl border border-stone-200/80 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
                {/* Search Bar */}
                <div className="relative w-full md:w-80">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-stone-400">
                    <Search className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search name, phone, city, ID..."
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-stone-300 focus:outline-none focus:border-stone-900 bg-white"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-stone-400 hover:text-stone-700"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Status Segmented Tabs */}
                <div className="flex flex-wrap items-center gap-1.5 text-xs font-medium w-full md:w-auto">
                  {['all', 'pending', 'confirmed', 'out_for_delivery', 'delivered', 'cancelled'].map(
                    (st) => (
                      <button
                        key={st}
                        onClick={() => setStatusFilter(st)}
                        className={`px-3 py-1.5 rounded-lg transition-all capitalize cursor-pointer ${
                          statusFilter === st
                            ? 'bg-stone-900 text-white font-semibold shadow-2xs'
                            : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                        }`}
                      >
                        {st.replace('_', ' ')}
                      </button>
                    )
                  )}
                </div>
              </div>

              {/* Orders Table */}
              <div className="bg-white rounded-2xl border border-stone-200/80 shadow-xs overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="bg-stone-50 border-b border-stone-200 text-stone-500 font-semibold">
                        <th className="py-3 px-4">Order ID</th>
                        <th className="py-3 px-4">Customer</th>
                        <th className="py-3 px-4">Phone / City</th>
                        <th className="py-3 px-4">Product & Variant</th>
                        <th className="py-3 px-4">Cash Due</th>
                        <th className="py-3 px-4">Assigned Courier</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100 font-normal">
                      {filteredOrders.length === 0 ? (
                        <tr>
                          <td colSpan={8} className="py-12 text-center text-stone-400">
                            No orders found matching your search and filter criteria.
                          </td>
                        </tr>
                      ) : (
                        filteredOrders.map((ord) => {
                          const total = ord.total_price || ord.quantity * 79;
                          const assignedAgent = state.deliveryAgents.find(
                            (a) => a.id === ord.delivery_agent_id
                          );

                          return (
                            <tr key={ord.id} className="hover:bg-stone-50/60 transition-colors">
                              <td className="py-3.5 px-4 font-mono font-bold text-stone-600">
                                #{ord.id}
                              </td>
                              <td className="py-3.5 px-4">
                                <span className="font-bold text-stone-900 block">
                                  {ord.customer_name}
                                </span>
                                <span className="text-[11px] text-stone-400">{ord.email}</span>
                              </td>
                              <td className="py-3.5 px-4">
                                <span className="font-medium text-stone-800 block">{ord.phone}</span>
                                <span className="text-[11px] text-stone-500">{ord.city}</span>
                              </td>
                              <td className="py-3.5 px-4">
                                <span className="font-semibold text-stone-900 block">
                                  {ord.product_variant}
                                </span>
                                <span className="text-[11px] text-stone-500">
                                  Qty: {ord.quantity} · {ord.payment_method || 'COD'}
                                </span>
                              </td>
                              <td className="py-3.5 px-4 font-bold tabular-nums text-stone-950 font-serif-display text-sm">
                                {state.currencySymbol}{total.toFixed(2)}
                              </td>
                              <td className="py-3.5 px-4">
                                <select
                                  value={ord.delivery_agent_id || ''}
                                  onChange={(e) => {
                                    if (e.target.value) {
                                      syncedStore.assignOrderToAgent(ord.id, e.target.value);
                                      showToast(`Assigned order #${ord.id} to delivery courier.`);
                                    }
                                  }}
                                  className="text-[11px] font-semibold bg-stone-50 border border-stone-300 rounded px-2 py-1 text-stone-700 cursor-pointer focus:outline-none"
                                >
                                  <option value="">Unassigned</option>
                                  {state.deliveryAgents.map((ag) => (
                                    <option key={ag.id} value={ag.id}>
                                      {ag.name}
                                    </option>
                                  ))}
                                </select>
                              </td>
                              <td className="py-3.5 px-4">
                                <select
                                  value={ord.status}
                                  onChange={(e) =>
                                    handleStatusChange(ord.id, e.target.value as OrderStatus)
                                  }
                                  className={`text-[11px] font-bold rounded px-2 py-1 border cursor-pointer focus:outline-none capitalize ${
                                    ord.status === 'delivered'
                                      ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                                      : ord.status === 'out_for_delivery'
                                      ? 'bg-blue-50 text-blue-800 border-blue-300'
                                      : ord.status === 'confirmed'
                                      ? 'bg-amber-50 text-amber-800 border-amber-300'
                                      : ord.status === 'cancelled'
                                      ? 'bg-stone-100 text-stone-600 border-stone-300'
                                      : 'bg-stone-50 text-stone-800 border-stone-300'
                                  }`}
                                >
                                  <option value="pending">Pending</option>
                                  <option value="confirmed">Confirmed</option>
                                  <option value="out_for_delivery">Out for Delivery</option>
                                  <option value="delivered">Delivered (Cash Collected)</option>
                                  <option value="cancelled">Cancelled</option>
                                </select>
                              </td>
                              <td className="py-3.5 px-4 text-right">
                                <button
                                  onClick={() => setSelectedOrderForDetail(ord)}
                                  className="px-2.5 py-1 text-[11px] font-semibold text-stone-700 bg-stone-100 hover:bg-stone-200 rounded border border-stone-300 transition-colors cursor-pointer"
                                >
                                  Details
                                </button>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: PRODUCTS & CATEGORIES (Requirement: Unlimited Products, Category-Wise, Category Management) */}
          {activeTab === 'products' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-2xl font-bold font-serif-display text-stone-900">
                    Product Catalog & Categories
                  </h2>
                  <p className="text-xs text-stone-500">
                    Add unlimited products category-wise, create custom categories, and manage variants. Updates sync in real-time.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => setShowAddCategoryModal(true)}
                    className="px-3.5 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-semibold rounded-lg border border-stone-300 transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <FolderPlus className="w-3.5 h-3.5 text-stone-600" />
                    <span>+ Add Category</span>
                  </button>

                  <button
                    onClick={() => setShowAddVariantModal(true)}
                    className="px-3.5 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-semibold rounded-lg border border-stone-300 transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5 text-stone-600" />
                    <span>Add Variant</span>
                  </button>

                  <button
                    onClick={() => setShowAddProductModal(true)}
                    className="px-3.5 py-2 bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <PackagePlus className="w-3.5 h-3.5 text-amber-400" />
                    <span>+ Add Unlimited Product</span>
                  </button>
                </div>
              </div>

              {/* Category Filter & Management Bar */}
              <div className="bg-white p-4 rounded-2xl border border-stone-200/80 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-stone-700 flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5 text-amber-600" />
                    <span>Filter Products Category-Wise:</span>
                  </span>
                  <span className="text-[11px] text-stone-400">
                    Total: {state.products.length} Products across {state.categories.length} Categories
                  </span>
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setProductCategoryFilter('all')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      productCategoryFilter === 'all'
                        ? 'bg-stone-900 text-white shadow-2xs'
                        : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                    }`}
                  >
                    All Categories ({state.products.length})
                  </button>

                  {state.categories.map((cat) => {
                    const count = state.products.filter((p) => p.category === cat).length;
                    const isSelected = productCategoryFilter === cat;
                    return (
                      <div key={cat} className="flex items-center">
                        <button
                          onClick={() => setProductCategoryFilter(cat)}
                          className={`px-3 py-1.5 rounded-l-xl text-xs font-bold transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-amber-600 text-white shadow-2xs'
                              : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                          }`}
                        >
                          {cat} ({count})
                        </button>
                        {/* Option to delete empty custom category */}
                        {count === 0 && !['Electronics', 'Fashion', 'Home & Living'].includes(cat) && (
                          <button
                            onClick={() => {
                              syncedStore.deleteCategory(cat);
                              showToast(`Category "${cat}" removed.`);
                              if (productCategoryFilter === cat) setProductCategoryFilter('all');
                            }}
                            className="px-1.5 py-1.5 bg-stone-200 hover:bg-rose-100 hover:text-rose-700 rounded-r-xl text-stone-400 text-xs transition-colors cursor-pointer"
                            title="Delete category"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Products Cards List */}
              <div className="grid grid-cols-1 gap-4">
                {state.products
                  .filter((p) => productCategoryFilter === 'all' || p.category === productCategoryFilter)
                  .map((prod) => (
                    <div
                      key={prod.id}
                      className="bg-white rounded-2xl border border-stone-200/80 p-5 sm:p-6 shadow-xs space-y-4 hover:border-stone-300 transition-all"
                    >
                      <div className="flex flex-col sm:flex-row items-start justify-between gap-4 pb-4 border-b border-stone-100">
                        <div className="flex items-start gap-4">
                          <img
                            src={prod.image}
                            alt={prod.name}
                            className="w-16 h-16 rounded-xl object-cover border border-stone-200 shrink-0 bg-stone-50"
                          />
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md uppercase tracking-wider">
                                {prod.category}
                              </span>
                              {prod.badge && (
                                <span className="text-[11px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md">
                                  {prod.badge}
                                </span>
                              )}
                              <span className="text-stone-300">·</span>
                              <span className="text-xs text-emerald-700 font-medium">
                                Stock: {prod.stockCount} units
                              </span>
                            </div>
                            <h3 className="text-base sm:text-lg font-bold text-stone-900 mt-1">
                              {prod.name}
                            </h3>
                            <p className="text-xs text-stone-500 mt-0.5 max-w-xl line-clamp-2">
                              {prod.subtitle}
                            </p>
                          </div>
                        </div>

                        <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto shrink-0 gap-2">
                          <div className="text-right">
                            <span className="text-xl sm:text-2xl font-bold font-serif-display text-stone-950 tabular-nums">
                              {state.currencySymbol}{prod.price.toFixed(2)}
                            </span>
                            <span className="text-xs text-stone-400 line-through ml-2 tabular-nums">
                              {state.currencySymbol}{prod.comparePrice.toFixed(2)}
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => {
                                setTargetProductId(prod.id);
                                setShowAddVariantModal(true);
                              }}
                              className="text-xs text-stone-600 hover:text-stone-900 bg-stone-100 hover:bg-stone-200 px-2.5 py-1 rounded-lg font-semibold transition-colors cursor-pointer"
                            >
                              + Variant
                            </button>
                            <button
                              onClick={() => {
                                if (state.products.length <= 1) {
                                  showToast('Store must keep at least 1 active product.');
                                  return;
                                }
                                syncedStore.deleteProduct(prod.id);
                                showToast(`"${prod.name}" removed from catalog.`);
                              }}
                              className="p-1.5 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                              title="Delete Product"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Variants associated with this product */}
                      <div>
                        <div className="flex items-center justify-between mb-2.5 text-xs font-semibold text-stone-700">
                          <span>Product Color / Style Variants ({prod.variants.length}):</span>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                          {prod.variants.map((v) => (
                            <div
                              key={v.id}
                              className="p-2.5 rounded-xl border border-stone-200 bg-stone-50/70 flex items-center gap-2.5"
                            >
                              <span
                                className="w-4 h-4 rounded-full border border-stone-300 shrink-0 shadow-2xs"
                                style={{ backgroundColor: v.colorHex }}
                              />
                              <div className="min-w-0">
                                <span className="font-bold text-xs text-stone-900 block truncate">
                                  {v.name}
                                </span>
                                <span className="text-[10px] text-stone-500 block truncate">
                                  {v.colorName}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* TAB: WEBSITE CUSTOMIZER & THEME STUDIO (Requirement: "Admin Can customise every thing on website from admin panel .also can update theme style add custom website logo .") */}
          {activeTab === 'customize' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              {/* Header with Quick Save Actions */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-2xl border border-stone-200/80 shadow-xs">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-400 text-stone-950">
                      Live Customizer
                    </span>
                    <h2 className="text-xl sm:text-2xl font-bold font-serif-display text-stone-900">
                      Website Customization & Theme Studio
                    </h2>
                  </div>
                  <p className="text-xs text-stone-500 mt-1">
                    Customise everything on your storefront: upload custom website logo, update theme styles, choose brand colors, customize hero headlines, promo banners, announcement ticker & trust badges.
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={handleResetToDefault}
                    className="px-3 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold rounded-xl border border-stone-300 transition-colors flex items-center gap-1.5 cursor-pointer"
                    title="Reset to default theme & logo"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Reset Defaults</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSaveAllCustomizations()}
                    className="px-5 py-2 bg-gradient-to-r from-purple-700 to-indigo-700 hover:from-purple-600 hover:to-indigo-600 text-white text-xs sm:text-sm font-bold rounded-xl shadow-md shadow-purple-700/20 transition-all flex items-center gap-2 cursor-pointer active:scale-95"
                  >
                    <Sparkles className="w-4 h-4 text-amber-300" />
                    <span>Save & Publish Live</span>
                  </button>
                </div>
              </div>

              {/* LIVE INTERACTIVE STOREFRONT MINI PREVIEW */}
              <div className="bg-stone-900 text-white rounded-3xl p-5 border border-stone-800 shadow-xl overflow-hidden space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-stone-800">
                  <div className="flex items-center gap-2 text-xs font-bold text-amber-400">
                    <Monitor className="w-4 h-4" />
                    <span>Live Interactive Website Mockup Preview</span>
                  </div>
                  <span className="text-[11px] text-stone-400">
                    Updates in real-time as you tweak styling below
                  </span>
                </div>

                {/* Mini Announcement bar preview */}
                {showAnnouncement && (
                  <div
                    className="rounded-lg px-3 py-1 text-center text-[11px] font-semibold flex items-center justify-center gap-2 truncate"
                    style={{ backgroundColor: `${themePrimaryColor}cc` }}
                  >
                    <span className="bg-amber-400 text-stone-950 text-[9px] font-black px-1.5 py-0.2 rounded-full">
                      {announcementBadge}
                    </span>
                    <span className="truncate">{settingsAnnouncement}</span>
                  </div>
                )}

                {/* Mini Navbar preview */}
                <div
                  className={`rounded-2xl px-4 py-2.5 flex items-center justify-between gap-4 transition-colors ${
                    themeHeaderStyle === 'light'
                      ? 'bg-white text-stone-900 border border-stone-200'
                      : 'bg-[#0F0C20] text-white border border-white/10'
                  }`}
                  style={
                    themeHeaderStyle === 'gradient'
                      ? { background: `linear-gradient(135deg, ${themePrimaryColor}, #0F0C20)` }
                      : undefined
                  }
                >
                  <div className="flex items-center gap-2.5">
                    {customLogoUrl ? (
                      <img
                        src={customLogoUrl}
                        alt="Logo Preview"
                        style={{ height: `${Math.min(customLogoHeight, 44)}px` }}
                        className="object-contain max-w-[140px] rounded"
                      />
                    ) : (
                      <div
                        className="w-7 h-7 rounded-lg flex items-center justify-center text-white"
                        style={{ backgroundColor: themePrimaryColor }}
                      >
                        <Sparkles className="w-4 h-4 fill-amber-300 text-white" />
                      </div>
                    )}
                    <div>
                      <span className="font-bold text-sm leading-tight block">
                        {settingsAppName || 'DealKart'}
                      </span>
                      <span className="text-[9px] opacity-70 block -mt-0.5 truncate max-w-[120px]">
                        {settingsTagline}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-xs">
                    <span className="hidden sm:inline opacity-70">Categories</span>
                    <span className="hidden sm:inline opacity-70">Today's Deals</span>
                    <div
                      className="px-3 py-1 rounded-full text-[11px] font-bold text-white"
                      style={{ backgroundColor: themePrimaryColor }}
                    >
                      Cart (2)
                    </div>
                  </div>
                </div>

                {/* Mini Hero preview */}
                <div className="rounded-2xl p-4 bg-gradient-to-r from-stone-950 via-purple-950 to-stone-900 border border-purple-900/30 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="space-y-1.5 text-center sm:text-left">
                    <span
                      className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold border"
                      style={{
                        backgroundColor: `${themeAccentColor}22`,
                        color: themeAccentColor,
                        borderColor: `${themeAccentColor}44`,
                      }}
                    >
                      {heroBadgeText}
                    </span>
                    <h4 className="text-base sm:text-lg font-black text-white leading-tight">
                      {heroHeadline}{' '}
                      <span
                        className="text-transparent bg-clip-text"
                        style={{
                          backgroundImage: `linear-gradient(to right, ${themeAccentColor}, #FDE047, ${themeAccentColor})`,
                        }}
                      >
                        {heroHeadlineHighlight}
                      </span>
                    </h4>
                    <p className="text-xs text-purple-200">{heroSubtitle}</p>
                    <div className="pt-1 flex items-center gap-2">
                      <button
                        type="button"
                        className="px-3.5 py-1.5 text-[11px] font-bold text-white rounded-full shadow-md"
                        style={{ backgroundColor: themePrimaryColor }}
                      >
                        {heroCtaText}
                      </button>
                      <span className="text-[10px] text-stone-400">{heroSubCtaText}</span>
                    </div>
                  </div>

                  {heroImage && (
                    <img
                      src={heroImage}
                      alt="Banner Preview"
                      className="w-32 h-20 object-cover rounded-xl border border-white/10 shrink-0"
                    />
                  )}
                </div>
              </div>

              {/* 1. CUSTOM WEBSITE LOGO & BRAND IDENTITY CARD */}
              <div className="bg-white rounded-2xl border border-stone-200/80 p-6 shadow-xs space-y-5">
                <div className="flex items-center gap-2.5 pb-3 border-b border-stone-100">
                  <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center font-bold">
                    <ImageIcon className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-stone-900">
                      1. Custom Website Logo & Brand Identity
                    </h3>
                    <p className="text-xs text-stone-500">
                      Upload your own brand logo or provide an image link. Adjust the exact height to fit perfectly.
                    </p>
                  </div>
                </div>

                {/* Logo Upload Box */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-stone-800 mb-1.5">
                        Upload Logo File (PNG, SVG, JPG, WebP)
                      </label>
                      <div className="border-2 border-dashed border-stone-300 hover:border-purple-500 rounded-2xl p-4 text-center transition-colors bg-stone-50/50">
                        <Upload className="w-6 h-6 text-stone-400 mx-auto mb-2" />
                        <label className="cursor-pointer">
                          <span className="px-3 py-1.5 bg-stone-900 hover:bg-stone-800 text-white rounded-lg text-xs font-bold transition-colors inline-block">
                            Choose Logo File
                          </span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleLogoFileUpload}
                            className="hidden"
                          />
                        </label>
                        <p className="text-[11px] text-stone-400 mt-2">
                          Max 2MB. Transparent background recommended.
                        </p>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-stone-800 mb-1.5">
                        Or Paste Logo Image URL
                      </label>
                      <input
                        type="url"
                        value={customLogoUrl}
                        onChange={(e) => setCustomLogoUrl(e.target.value)}
                        placeholder="https://example.com/logo.png"
                        className="w-full px-3.5 py-2 text-xs rounded-xl border border-stone-300 focus:outline-none focus:border-stone-900"
                      />
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="text-xs font-bold text-stone-800">
                          Logo Height Size: <span className="text-purple-700">{customLogoHeight}px</span>
                        </label>
                        <span className="text-[11px] text-stone-400">Default: 38px</span>
                      </div>
                      <input
                        type="range"
                        min="24"
                        max="70"
                        step="2"
                        value={customLogoHeight}
                        onChange={(e) => setCustomLogoHeight(Number(e.target.value))}
                        className="w-full accent-purple-600 cursor-pointer"
                      />
                    </div>
                  </div>

                  {/* Logo Live Preview Boxes */}
                  <div className="space-y-3">
                    <label className="block text-xs font-bold text-stone-800">
                      Live Logo Previews
                    </label>

                    {/* Preview on Dark Header */}
                    <div className="bg-[#0F0C20] p-4 rounded-xl border border-stone-800 flex items-center justify-between">
                      <div className="space-y-1">
                        <span className="text-[10px] text-stone-400 uppercase tracking-wider block">
                          Navbar Dark Mode Preview:
                        </span>
                        {customLogoUrl ? (
                          <img
                            src={customLogoUrl}
                            alt="Logo Dark Preview"
                            style={{ height: `${customLogoHeight}px` }}
                            className="object-contain max-w-[200px] rounded"
                          />
                        ) : (
                          <div className="flex items-center gap-2">
                            <div
                              className="w-8 h-8 rounded-lg flex items-center justify-center text-white"
                              style={{ backgroundColor: themePrimaryColor }}
                            >
                              <Sparkles className="w-4 h-4 fill-amber-300" />
                            </div>
                            <span className="font-bold text-lg text-white">
                              {settingsAppName}
                            </span>
                          </div>
                        )}
                      </div>

                      {customLogoUrl && (
                        <button
                          type="button"
                          onClick={() => {
                            setCustomLogoUrl('');
                            showToast('Custom logo removed. Default brand badge restored.');
                          }}
                          className="px-2.5 py-1 text-[11px] text-rose-400 hover:text-rose-300 bg-rose-950/40 hover:bg-rose-950/60 rounded-lg border border-rose-800/40 transition-colors cursor-pointer"
                        >
                          Remove Logo
                        </button>
                      )}
                    </div>

                    {/* Preview on Light Card */}
                    <div className="bg-white p-4 rounded-xl border border-stone-200 flex items-center justify-between">
                      <div className="space-y-1">
                        <span className="text-[10px] text-stone-500 uppercase tracking-wider block">
                          Light Background Preview:
                        </span>
                        {customLogoUrl ? (
                          <img
                            src={customLogoUrl}
                            alt="Logo Light Preview"
                            style={{ height: `${customLogoHeight}px` }}
                            className="object-contain max-w-[200px] rounded"
                          />
                        ) : (
                          <div className="flex items-center gap-2">
                            <div
                              className="w-8 h-8 rounded-lg flex items-center justify-center text-white"
                              style={{ backgroundColor: themePrimaryColor }}
                            >
                              <Sparkles className="w-4 h-4 fill-amber-300" />
                            </div>
                            <span className="font-bold text-lg text-stone-900">
                              {settingsAppName}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Store Name & Tagline */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-stone-100">
                  <div>
                    <label className="block text-xs font-bold text-stone-800 mb-1">
                      Storefront Brand Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={settingsAppName}
                      onChange={(e) => setSettingsAppName(e.target.value)}
                      placeholder="e.g. DealKart"
                      className="w-full px-3 py-2 text-xs rounded-xl border border-stone-300 focus:outline-none focus:border-stone-900"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-800 mb-1">
                      Storefront Tagline
                    </label>
                    <input
                      type="text"
                      value={settingsTagline}
                      onChange={(e) => setSettingsTagline(e.target.value)}
                      placeholder="e.g. Deals Beyond Ordinary"
                      className="w-full px-3 py-2 text-xs rounded-xl border border-stone-300 focus:outline-none focus:border-stone-900"
                    />
                  </div>
                </div>
              </div>

              {/* 2. THEME STYLE, COLOR PRESETS & PALETTES CARD */}
              <div className="bg-white rounded-2xl border border-stone-200/80 p-6 shadow-xs space-y-5">
                <div className="flex items-center gap-2.5 pb-3 border-b border-stone-100">
                  <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
                    <Palette className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-stone-900">
                      2. Theme Style, Color Presets & Typography
                    </h3>
                    <p className="text-xs text-stone-500">
                      Select one of the curated luxury palettes or pick your own custom primary & accent colors.
                    </p>
                  </div>
                </div>

                {/* 1-Click Preset Palettes */}
                <div>
                  <label className="block text-xs font-bold text-stone-800 mb-2">
                    One-Click Curated Theme Palettes:
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5">
                    {THEME_PALETTES.map((pal) => {
                      const isSelected = themePrimaryColor.toLowerCase() === pal.primary.toLowerCase();
                      return (
                        <button
                          key={pal.id}
                          type="button"
                          onClick={() => {
                            setThemePreset(pal.id as any);
                            setThemePrimaryColor(pal.primary);
                            setThemeAccentColor(pal.accent);
                            showToast(`Selected ${pal.name} theme style!`);
                          }}
                          className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                            isSelected
                              ? 'border-purple-600 bg-purple-50/50 ring-2 ring-purple-600/30 shadow-xs'
                              : 'border-stone-200 hover:border-stone-300 bg-stone-50/50'
                          }`}
                        >
                          <div className="flex items-center gap-1.5 mb-1.5">
                            <span
                              className="w-4 h-4 rounded-full shadow-2xs"
                              style={{ backgroundColor: pal.primary }}
                            />
                            <span
                              className="w-3 h-3 rounded-full shadow-2xs"
                              style={{ backgroundColor: pal.accent }}
                            />
                            {isSelected && <Check className="w-3.5 h-3.5 text-purple-700 ml-auto" />}
                          </div>
                          <span className="font-bold text-[11px] text-stone-900 block truncate leading-tight">
                            {pal.name}
                          </span>
                          <span className="text-[9px] text-stone-500 block truncate">
                            {pal.desc}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Custom Color Pickers */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
                  <div>
                    <label className="block text-xs font-bold text-stone-800 mb-1.5">
                      Primary Brand Color
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={themePrimaryColor}
                        onChange={(e) => {
                          setThemePrimaryColor(e.target.value);
                          setThemePreset('custom');
                        }}
                        className="w-9 h-9 rounded-lg border border-stone-300 cursor-pointer p-0.5 bg-white"
                      />
                      <input
                        type="text"
                        value={themePrimaryColor}
                        onChange={(e) => {
                          setThemePrimaryColor(e.target.value);
                          setThemePreset('custom');
                        }}
                        className="flex-1 px-3 py-1.5 text-xs font-mono rounded-lg border border-stone-300 uppercase"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-800 mb-1.5">
                      Accent / Highlight Color
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={themeAccentColor}
                        onChange={(e) => {
                          setThemeAccentColor(e.target.value);
                          setThemePreset('custom');
                        }}
                        className="w-9 h-9 rounded-lg border border-stone-300 cursor-pointer p-0.5 bg-white"
                      />
                      <input
                        type="text"
                        value={themeAccentColor}
                        onChange={(e) => {
                          setThemeAccentColor(e.target.value);
                          setThemePreset('custom');
                        }}
                        className="flex-1 px-3 py-1.5 text-xs font-mono rounded-lg border border-stone-300 uppercase"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-800 mb-1.5">
                      Navbar Header Style
                    </label>
                    <select
                      value={themeHeaderStyle}
                      onChange={(e) => setThemeHeaderStyle(e.target.value as any)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-stone-300 bg-white"
                    >
                      <option value="dark">Luxury Dark (#0F0C20)</option>
                      <option value="light">Crisp Minimal Light</option>
                      <option value="gradient">Brand Color Gradient</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-800 mb-1.5">
                      Typography / Font Family
                    </label>
                    <select
                      value={themeFontFamily}
                      onChange={(e) => setThemeFontFamily(e.target.value as any)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-stone-300 bg-white"
                    >
                      <option value="sans">Modern Clean Sans (Plus Jakarta / Inter)</option>
                      <option value="serif">Editorial Luxury Serif (Cormorant)</option>
                      <option value="mono">Tech Monospace</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* 3. TOP ANNOUNCEMENT BAR CARD */}
              <div className="bg-white rounded-2xl border border-stone-200/80 p-6 shadow-xs space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
                      <Flame className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="font-bold text-base text-stone-900">
                        3. Top Announcement Ticker Bar
                      </h3>
                      <p className="text-xs text-stone-500">
                        Prominently display ongoing sales, free Cash-on-Delivery promises, or flash offers.
                      </p>
                    </div>
                  </div>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <span className="text-xs font-bold text-stone-700">Show Announcement:</span>
                    <input
                      type="checkbox"
                      checked={showAnnouncement}
                      onChange={(e) => setShowAnnouncement(e.target.checked)}
                      className="w-4 h-4 accent-purple-600 rounded cursor-pointer"
                    />
                  </label>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-stone-800 mb-1">
                      Badge Text
                    </label>
                    <input
                      type="text"
                      value={announcementBadge}
                      onChange={(e) => setAnnouncementBadge(e.target.value)}
                      placeholder="e.g. ⚡ MEGA SAVINGS"
                      className="w-full px-3 py-2 text-xs rounded-xl border border-stone-300 focus:outline-none focus:border-stone-900"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-stone-800 mb-1">
                      Announcement Ticker Message
                    </label>
                    <input
                      type="text"
                      value={settingsAnnouncement}
                      onChange={(e) => setSettingsAnnouncement(e.target.value)}
                      placeholder="Zero online payment required — Inspect your parcel and pay cash upon delivery"
                      className="w-full px-3 py-2 text-xs rounded-xl border border-stone-300 focus:outline-none focus:border-stone-900"
                    />
                  </div>
                </div>
              </div>

              {/* 4. HERO SECTION HEADLINES & GRAPHICS CARD */}
              <div className="bg-white rounded-2xl border border-stone-200/80 p-6 shadow-xs space-y-4">
                <div className="flex items-center gap-2.5 pb-3 border-b border-stone-100">
                  <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
                    <Globe className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-stone-900">
                      4. Hero Section Showcase & Banner
                    </h3>
                    <p className="text-xs text-stone-500">
                      Customize the main landing headline, highlighted words, discount tags, and banner artwork.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-stone-800 mb-1">
                      Hero Headline
                    </label>
                    <input
                      type="text"
                      value={heroHeadline}
                      onChange={(e) => setHeroHeadline(e.target.value)}
                      placeholder="Great Finds."
                      className="w-full px-3 py-2 text-xs rounded-xl border border-stone-300 focus:outline-none focus:border-stone-900"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-800 mb-1">
                      Headline Highlight Word (Gradient Accent)
                    </label>
                    <input
                      type="text"
                      value={heroHeadlineHighlight}
                      onChange={(e) => setHeroHeadlineHighlight(e.target.value)}
                      placeholder="Better Prices."
                      className="w-full px-3 py-2 text-xs rounded-xl border border-stone-300 focus:outline-none focus:border-stone-900"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-800 mb-1">
                      Hero Subtitle / Description
                    </label>
                    <input
                      type="text"
                      value={heroSubtitle}
                      onChange={(e) => setHeroSubtitle(e.target.value)}
                      placeholder="Shop Smarter. Save More."
                      className="w-full px-3 py-2 text-xs rounded-xl border border-stone-300 focus:outline-none focus:border-stone-900"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-800 mb-1">
                      Discount Badge Chip
                    </label>
                    <input
                      type="text"
                      value={heroBadgeText}
                      onChange={(e) => setHeroBadgeText(e.target.value)}
                      placeholder="Up To 80% Off Top Brands"
                      className="w-full px-3 py-2 text-xs rounded-xl border border-stone-300 focus:outline-none focus:border-stone-900"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-800 mb-1">
                      CTA Button Text
                    </label>
                    <input
                      type="text"
                      value={heroCtaText}
                      onChange={(e) => setHeroCtaText(e.target.value)}
                      placeholder="Explore Today's Deals"
                      className="w-full px-3 py-2 text-xs rounded-xl border border-stone-300 focus:outline-none focus:border-stone-900"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-800 mb-1">
                      Sub-CTA Trust Text
                    </label>
                    <input
                      type="text"
                      value={heroSubCtaText}
                      onChange={(e) => setHeroSubCtaText(e.target.value)}
                      placeholder="Cash on Delivery Available at Doorstep"
                      className="w-full px-3 py-2 text-xs rounded-xl border border-stone-300 focus:outline-none focus:border-stone-900"
                    />
                  </div>
                </div>

                {/* Hero Banner Image Upload */}
                <div className="pt-2 border-t border-stone-100 grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                  <div>
                    <label className="block text-xs font-bold text-stone-800 mb-1.5">
                      Upload Custom Hero Banner Graphic
                    </label>
                    <div className="flex items-center gap-2">
                      <label className="px-3.5 py-2 bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold rounded-xl cursor-pointer flex items-center gap-1.5 transition-colors">
                        <Upload className="w-3.5 h-3.5" />
                        <span>Choose Banner Image</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleHeroImageFileUpload}
                          className="hidden"
                        />
                      </label>
                      <span className="text-[11px] text-stone-400">Max 3MB (16:10 ratio)</span>
                    </div>
                  </div>

                  {heroImage && (
                    <div className="flex items-center gap-3">
                      <img
                        src={heroImage}
                        alt="Hero Preview"
                        className="w-28 h-16 object-cover rounded-xl border border-stone-200 shadow-2xs"
                      />
                      <span className="text-xs text-stone-600 font-medium truncate max-w-[200px]">
                        Active hero banner applied
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* 5. PROMOTIONAL SPLIT BANNERS CARD */}
              <div className="bg-white rounded-2xl border border-stone-200/80 p-6 shadow-xs space-y-4">
                <div className="flex items-center gap-2.5 pb-3 border-b border-stone-100">
                  <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-700 flex items-center justify-center font-bold">
                    <Tag className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-stone-900">
                      5. Promotional Split Banners (Bundles & Member Club)
                    </h3>
                    <p className="text-xs text-stone-500">
                      Customize the two prominent mid-page promotional banners.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Left Banner */}
                  <div className="p-4 rounded-xl border border-lime-300 bg-lime-50/40 space-y-3">
                    <span className="font-bold text-xs text-emerald-900 uppercase tracking-wider block">
                      Left Promotional Banner (Bundle Savings)
                    </span>
                    <div>
                      <label className="block text-[11px] font-bold text-stone-700 mb-1">Title</label>
                      <input
                        type="text"
                        value={banner1Title}
                        onChange={(e) => setBanner1Title(e.target.value)}
                        className="w-full px-3 py-1.5 text-xs rounded-lg border border-stone-300 bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-stone-700 mb-1">Subtitle</label>
                      <input
                        type="text"
                        value={banner1Subtitle}
                        onChange={(e) => setBanner1Subtitle(e.target.value)}
                        className="w-full px-3 py-1.5 text-xs rounded-lg border border-stone-300 bg-white"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[11px] font-bold text-stone-700 mb-1">Badge Text</label>
                        <input
                          type="text"
                          value={banner1Badge}
                          onChange={(e) => setBanner1Badge(e.target.value)}
                          className="w-full px-3 py-1.5 text-xs rounded-lg border border-stone-300 bg-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-stone-700 mb-1">Discount Text</label>
                        <input
                          type="text"
                          value={banner1Discount}
                          onChange={(e) => setBanner1Discount(e.target.value)}
                          className="w-full px-3 py-1.5 text-xs rounded-lg border border-stone-300 bg-white"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Right Banner */}
                  <div className="p-4 rounded-xl border border-purple-300 bg-purple-50/40 space-y-3">
                    <span className="font-bold text-xs text-purple-900 uppercase tracking-wider block">
                      Right Promotional Banner (VIP Club)
                    </span>
                    <div>
                      <label className="block text-[11px] font-bold text-stone-700 mb-1">Title</label>
                      <input
                        type="text"
                        value={banner2Title}
                        onChange={(e) => setBanner2Title(e.target.value)}
                        className="w-full px-3 py-1.5 text-xs rounded-lg border border-stone-300 bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-stone-700 mb-1">Subtitle</label>
                      <input
                        type="text"
                        value={banner2Subtitle}
                        onChange={(e) => setBanner2Subtitle(e.target.value)}
                        className="w-full px-3 py-1.5 text-xs rounded-lg border border-stone-300 bg-white"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[11px] font-bold text-stone-700 mb-1">Badge Text</label>
                        <input
                          type="text"
                          value={banner2Badge}
                          onChange={(e) => setBanner2Badge(e.target.value)}
                          className="w-full px-3 py-1.5 text-xs rounded-lg border border-stone-300 bg-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-stone-700 mb-1">Discount Text</label>
                        <input
                          type="text"
                          value={banner2Discount}
                          onChange={(e) => setBanner2Discount(e.target.value)}
                          className="w-full px-3 py-1.5 text-xs rounded-lg border border-stone-300 bg-white"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 6. TRUST GUARANTEES & FOOTER CARD */}
              <div className="bg-white rounded-2xl border border-stone-200/80 p-6 shadow-xs space-y-4">
                <div className="flex items-center gap-2.5 pb-3 border-b border-stone-100">
                  <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-stone-900">
                      6. Trust Guarantee Badges & Footer Information
                    </h3>
                    <p className="text-xs text-stone-500">
                      Customize the 3 trust promises, customer support info, and footer copyright text.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="p-3 rounded-xl bg-stone-50 border border-stone-200 space-y-2">
                    <span className="font-bold text-xs text-stone-700 block">Trust Badge 1</span>
                    <input
                      type="text"
                      value={trustBadge1Title}
                      onChange={(e) => setTrustBadge1Title(e.target.value)}
                      placeholder="Title"
                      className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-stone-300 bg-white"
                    />
                    <input
                      type="text"
                      value={trustBadge1Desc}
                      onChange={(e) => setTrustBadge1Desc(e.target.value)}
                      placeholder="Description"
                      className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-stone-300 bg-white"
                    />
                  </div>

                  <div className="p-3 rounded-xl bg-stone-50 border border-stone-200 space-y-2">
                    <span className="font-bold text-xs text-stone-700 block">Trust Badge 2</span>
                    <input
                      type="text"
                      value={trustBadge2Title}
                      onChange={(e) => setTrustBadge2Title(e.target.value)}
                      placeholder="Title"
                      className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-stone-300 bg-white"
                    />
                    <input
                      type="text"
                      value={trustBadge2Desc}
                      onChange={(e) => setTrustBadge2Desc(e.target.value)}
                      placeholder="Description"
                      className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-stone-300 bg-white"
                    />
                  </div>

                  <div className="p-3 rounded-xl bg-stone-50 border border-stone-200 space-y-2">
                    <span className="font-bold text-xs text-stone-700 block">Trust Badge 3</span>
                    <input
                      type="text"
                      value={trustBadge3Title}
                      onChange={(e) => setTrustBadge3Title(e.target.value)}
                      placeholder="Title"
                      className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-stone-300 bg-white"
                    />
                    <input
                      type="text"
                      value={trustBadge3Desc}
                      onChange={(e) => setTrustBadge3Desc(e.target.value)}
                      placeholder="Description"
                      className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-stone-300 bg-white"
                    />
                  </div>
                </div>

                <div className="space-y-3 pt-2">
                  <div>
                    <label className="block text-xs font-bold text-stone-800 mb-1">
                      Footer About Description
                    </label>
                    <textarea
                      rows={2}
                      value={footerAbout}
                      onChange={(e) => setFooterAbout(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-stone-300 focus:outline-none focus:border-stone-900"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-800 mb-1">
                      Footer Copyright Text
                    </label>
                    <input
                      type="text"
                      value={footerCopyright}
                      onChange={(e) => setFooterCopyright(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-stone-300 focus:outline-none focus:border-stone-900"
                    />
                  </div>
                </div>

                {/* Final Save Button */}
                <div className="pt-4 border-t border-stone-100 flex items-center justify-between">
                  <span className="text-xs text-stone-500">
                    Changes are automatically broadcast to all customer devices.
                  </span>
                  <button
                    type="button"
                    onClick={() => handleSaveAllCustomizations()}
                    className="px-6 py-2.5 bg-gradient-to-r from-purple-700 to-indigo-700 hover:from-purple-600 hover:to-indigo-600 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md transition-all cursor-pointer flex items-center gap-2"
                  >
                    <Sparkles className="w-4 h-4 text-amber-300" />
                    <span>Save & Sync All Customizations</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: PAYMENT SYSTEMS (Requirement 8: Upload and add custom payment) */}
          {activeTab === 'payments' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-2xl font-bold font-serif-display text-stone-900">
                    Payment Methods & Custom Systems
                  </h2>
                  <p className="text-xs text-stone-500">
                    Upload and activate custom payment options: COD, UPI / QR, Bank Transfer, or Gateways
                  </p>
                </div>

                <button
                  onClick={() => setShowAddPaymentModal(true)}
                  className="px-3.5 py-2 bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5 text-amber-400" />
                  <span>Upload & Add Payment Method</span>
                </button>
              </div>

              {/* Payment Methods List */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {state.paymentMethods.map((method) => (
                  <div
                    key={method.id}
                    className={`bg-white rounded-2xl p-5 border transition-all flex flex-col justify-between ${
                      method.enabled
                        ? 'border-stone-200 shadow-xs'
                        : 'border-stone-200/60 bg-stone-50/50 opacity-70'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700">
                            {method.type === 'cod' ? (
                              <Banknote className="w-4 h-4" />
                            ) : method.type === 'upi_qr' ? (
                              <QrCode className="w-4 h-4" />
                            ) : (
                              <CreditCard className="w-4 h-4" />
                            )}
                          </div>
                          <div>
                            <h3 className="font-bold text-sm text-stone-900">{method.name}</h3>
                            <span className="text-[11px] text-stone-400 uppercase font-mono">
                              Type: {method.type}
                            </span>
                          </div>
                        </div>

                        {/* Toggle Active Button */}
                        <button
                          onClick={() => {
                            syncedStore.updatePaymentMethod(method.id, { enabled: !method.enabled });
                            showToast(`${method.name} is now ${!method.enabled ? 'Enabled' : 'Disabled'} on checkout!`);
                          }}
                          className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                            method.enabled
                              ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                              : 'bg-stone-200 text-stone-600 hover:bg-stone-300'
                          }`}
                        >
                          {method.enabled ? 'Active on Store' : 'Disabled'}
                        </button>
                      </div>

                      <p className="text-xs text-stone-600 mb-2 leading-relaxed">
                        {method.description}
                      </p>

                      {method.instructions && (
                        <div className="p-2.5 rounded-lg bg-stone-50 text-[11px] text-stone-600 mb-3 border border-stone-200/60">
                          <strong>Customer Instructions:</strong> {method.instructions}
                        </div>
                      )}

                      {/* QR Code Preview & Direct File Upload System */}
                      {method.type === 'upi_qr' && (
                        <div className="p-3.5 bg-stone-50 rounded-xl border border-stone-200 mb-3 space-y-2.5">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-stone-900 flex items-center gap-1.5">
                              <QrCode className="w-4 h-4 text-amber-700" />
                              <span>Merchant QR Code</span>
                            </span>
                            <label className="inline-flex items-center gap-1.5 px-3 py-1 bg-stone-900 hover:bg-stone-800 text-white rounded-md text-[11px] font-bold cursor-pointer transition-all shadow-xs">
                              <Upload className="w-3.5 h-3.5 text-amber-400" />
                              <span>Upload QR Image</span>
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) {
                                    const reader = new FileReader();
                                    reader.onload = (uploadEvent) => {
                                      const dataUrl = uploadEvent.target?.result as string;
                                      syncedStore.updatePaymentMethodQrImage(method.id, dataUrl);
                                      showToast(`QR Code image uploaded successfully for ${method.name}!`);
                                    };
                                    reader.readAsDataURL(file);
                                  }
                                }}
                              />
                            </label>
                          </div>

                          <div className="flex items-center gap-3 bg-white p-2.5 rounded-lg border border-stone-200">
                            {method.qrCodeUrl ? (
                              <img
                                src={method.qrCodeUrl}
                                alt="Merchant Payment QR"
                                className="w-16 h-16 object-contain rounded border border-stone-200 bg-white"
                              />
                            ) : (
                              <div className="w-16 h-16 rounded border border-dashed border-stone-300 flex flex-col items-center justify-center text-[10px] text-stone-400">
                                <QrCode className="w-5 h-5 text-stone-300" />
                                <span>No QR</span>
                              </div>
                            )}
                            <div className="text-[11px] text-stone-600 flex-1 min-w-0">
                              <span className="font-bold text-stone-900 block truncate">
                                {method.accountDetails || 'UPI ID: jannatinfotech@upi'}
                              </span>
                              <span className="text-[10px] text-stone-400 block mt-0.5">
                                Formats: PNG, JPG, WebP. Customers scan at checkout.
                              </span>
                            </div>
                          </div>
                        </div>
                      )}

                      {method.qrCodeUrl && method.type !== 'upi_qr' && (
                        <div className="p-3 bg-white rounded-lg border border-stone-200 flex items-center gap-3 mb-2">
                          <img
                            src={method.qrCodeUrl}
                            alt="Merchant Payment QR"
                            className="w-14 h-14 object-contain rounded border border-stone-200"
                          />
                          <div className="text-[11px] text-stone-600">
                            <span className="font-bold block text-stone-900">Custom QR Code Active</span>
                            <span>{method.accountDetails}</span>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="pt-3 border-t border-stone-100 text-[11px] text-stone-400 flex items-center justify-between">
                      <span>Status: {method.enabled ? 'Shown at checkout' : 'Hidden from customers'}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: DELIVERY BOY SYSTEM (Requirement: Auto-generated ID/Pass, Add Delivery Boy Option on Admin Panel) */}
          {activeTab === 'delivery' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-2xl font-bold font-serif-display text-stone-900">
                    Delivery Boy Fleet Logistics & Accounts
                  </h2>
                  <p className="text-xs text-stone-500">
                    Add delivery couriers. Delivery ID and password are auto-generated from admin for courier mobile login.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => {
                      handleRegenerateAgentCredentials();
                      setShowAddDeliveryAgentModal(true);
                    }}
                    className="px-3.5 py-2 bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <UserPlus className="w-3.5 h-3.5 text-amber-400" />
                    <span>+ Add Delivery Boy</span>
                  </button>

                  <button
                    onClick={onOpenDeliveryBoyView}
                    className="px-3.5 py-2 bg-amber-500/10 hover:bg-amber-500/20 text-amber-900 text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer border border-amber-500/30"
                  >
                    <ExternalLink className="w-3.5 h-3.5 text-amber-700" />
                    <span>Open Courier Mobile Portal</span>
                  </button>
                </div>
              </div>

              {/* Delivery Couriers Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {state.deliveryAgents.map((agent) => {
                  const isPasswordVisible = !!showPasswordMap[agent.id];

                  return (
                    <div
                      key={agent.id}
                      className="bg-white rounded-2xl p-5 border border-stone-200/80 shadow-xs space-y-4 flex flex-col justify-between hover:border-stone-300 transition-all"
                    >
                      <div>
                        {/* Courier Header */}
                        <div className="flex items-start justify-between pb-3 border-b border-stone-100">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-800 flex items-center justify-center font-bold">
                              <Truck className="w-5 h-5" />
                            </div>
                            <div>
                              <h3 className="font-bold text-sm text-stone-900">{agent.name}</h3>
                              <span className="text-xs text-stone-500">{agent.phone}</span>
                            </div>
                          </div>

                          <select
                            value={agent.status}
                            onChange={(e) => {
                              syncedStore.updateDeliveryAgent(agent.id, {
                                status: e.target.value as 'active' | 'on_break' | 'offline',
                              });
                              showToast(`Status for ${agent.name} updated to ${e.target.value}.`);
                            }}
                            className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded cursor-pointer border ${
                              agent.status === 'active'
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                : agent.status === 'on_break'
                                ? 'bg-amber-50 text-amber-800 border-amber-200'
                                : 'bg-stone-100 text-stone-600 border-stone-200'
                            }`}
                          >
                            <option value="active">Active</option>
                            <option value="on_break">On Break</option>
                            <option value="offline">Offline</option>
                          </select>
                        </div>

                        {/* Courier Credentials Box (Auto-Generated ID & Password) */}
                        <div className="mt-3 p-3 bg-amber-50/70 border border-amber-200/80 rounded-xl space-y-2 text-xs">
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] font-bold text-amber-900 flex items-center gap-1">
                              <KeyRound className="w-3 h-3 text-amber-700" />
                              <span>Login Credentials</span>
                            </span>
                            <span className="text-[10px] text-amber-700 font-medium">Auto-Generated</span>
                          </div>

                          {/* Delivery ID */}
                          <div className="flex items-center justify-between bg-white px-2.5 py-1.5 rounded-lg border border-amber-200/60">
                            <div>
                              <span className="text-[10px] text-stone-400 block">Delivery ID</span>
                              <span className="font-mono font-bold text-stone-900 text-xs">
                                {agent.deliveryId}
                              </span>
                            </div>
                            <button
                              onClick={() => {
                                navigator.clipboard.writeText(agent.deliveryId);
                                showToast(`Delivery ID "${agent.deliveryId}" copied!`);
                              }}
                              className="p-1 text-stone-400 hover:text-amber-800 transition-colors cursor-pointer"
                              title="Copy Delivery ID"
                            >
                              <Copy className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          {/* Password */}
                          <div className="flex items-center justify-between bg-white px-2.5 py-1.5 rounded-lg border border-amber-200/60">
                            <div>
                              <span className="text-[10px] text-stone-400 block">Password</span>
                              <span className="font-mono font-bold text-stone-900 text-xs">
                                {isPasswordVisible ? agent.password : '••••••••'}
                              </span>
                            </div>
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() =>
                                  setShowPasswordMap((prev) => ({
                                    ...prev,
                                    [agent.id]: !prev[agent.id],
                                  }))
                                }
                                className="p-1 text-stone-400 hover:text-stone-700 transition-colors cursor-pointer"
                                title={isPasswordVisible ? 'Hide password' : 'Show password'}
                              >
                                {isPasswordVisible ? (
                                  <EyeOff className="w-3.5 h-3.5" />
                                ) : (
                                  <Eye className="w-3.5 h-3.5" />
                                )}
                              </button>
                              <button
                                onClick={() => {
                                  navigator.clipboard.writeText(agent.password);
                                  showToast('Password copied to clipboard!');
                                }}
                                className="p-1 text-stone-400 hover:text-amber-800 transition-colors cursor-pointer"
                                title="Copy Password"
                              >
                                <Copy className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Zone & Vehicle */}
                        <div className="mt-3 p-3 rounded-xl bg-stone-50 space-y-1 text-xs text-stone-600">
                          <div>
                            <strong>Assigned Zone:</strong> {agent.zone}
                          </div>
                          <div>
                            <strong>Vehicle:</strong> {agent.vehicle}
                          </div>
                        </div>

                        {/* Metrics */}
                        <div className="grid grid-cols-2 gap-2 pt-3 border-t border-stone-100 text-xs mt-3">
                          <div>
                            <span className="text-stone-400 text-[11px] block">Active Parcels</span>
                            <span className="font-bold tabular-nums text-stone-900 text-sm">
                              {agent.activeOrdersCount}
                            </span>
                          </div>
                          <div>
                            <span className="text-stone-400 text-[11px] block">Cash Collected</span>
                            <span className="font-bold tabular-nums text-emerald-700 text-sm">
                              {state.currencySymbol}{agent.cashCollectedToday.toFixed(2)}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Card Footer Actions */}
                      <div className="pt-3 border-t border-stone-100 flex items-center justify-between text-xs">
                        <button
                          onClick={() => {
                            const newPass = syncedStore.regenerateDeliveryPassword(agent.id);
                            showToast(`New password generated for ${agent.name}: ${newPass}`);
                          }}
                          className="text-amber-800 hover:underline font-semibold text-[11px] cursor-pointer flex items-center gap-1"
                        >
                          <RefreshCw className="w-3 h-3" />
                          <span>Regen Pass</span>
                        </button>

                        <button
                          onClick={() => {
                            if (state.deliveryAgents.length <= 1) {
                              showToast('Fleet must have at least 1 courier.');
                              return;
                            }
                            syncedStore.deleteDeliveryAgent(agent.id);
                            showToast(`Delivery Boy ${agent.name} removed from fleet.`);
                          }}
                          className="text-stone-400 hover:text-rose-600 p-1 rounded hover:bg-rose-50 transition-colors cursor-pointer"
                          title="Delete Delivery Boy"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 6: SETTINGS (Requirement 6: Customize application name, etc.) */}
          {activeTab === 'settings' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <div>
                <h2 className="text-2xl font-bold font-serif-display text-stone-900">
                  Store & Application Settings
                </h2>
                <p className="text-xs text-stone-500">
                  Customize the application name, announcement message, and support details. Changes sync in real-time to the public website.
                </p>
              </div>

              <form
                onSubmit={handleSaveSettings}
                className="bg-white rounded-2xl border border-stone-200/80 p-6 shadow-xs space-y-5"
              >
                {/* Application Name */}
                <div>
                  <label className="block text-xs font-semibold text-stone-800 mb-1.5">
                    Application / Storefront Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={settingsAppName}
                    onChange={(e) => setSettingsAppName(e.target.value)}
                    placeholder="e.g. AuraCraft Living"
                    className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-stone-300 focus:outline-none focus:border-stone-900"
                  />
                  <p className="text-[11px] text-stone-400 mt-1">
                    Updates the brand title in the top navigation, page header, and footer.
                  </p>
                </div>

                {/* Tagline */}
                <div>
                  <label className="block text-xs font-semibold text-stone-800 mb-1.5">
                    Store Tagline
                  </label>
                  <input
                    type="text"
                    value={settingsTagline}
                    onChange={(e) => setSettingsTagline(e.target.value)}
                    placeholder="Artisanal Home Wellness & Acoustic Living"
                    className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-stone-300 focus:outline-none focus:border-stone-900"
                  />
                </div>

                {/* Top Announcement Bar Text */}
                <div>
                  <label className="block text-xs font-semibold text-stone-800 mb-1.5">
                    Top Announcement Bar Ticker
                  </label>
                  <input
                    type="text"
                    value={settingsAnnouncement}
                    onChange={(e) => setSettingsAnnouncement(e.target.value)}
                    placeholder="Zero online payment required — Inspect your parcel and pay cash upon delivery"
                    className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-stone-300 focus:outline-none focus:border-stone-900"
                  />
                </div>

                {/* Currency & Contacts Row */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-stone-800 mb-1.5">
                      Currency Symbol
                    </label>
                    <input
                      type="text"
                      value={settingsCurrencySymbol}
                      onChange={(e) => setSettingsCurrencySymbol(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-stone-300 focus:outline-none focus:border-stone-900"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-800 mb-1.5">
                      Support Phone Number
                    </label>
                    <input
                      type="text"
                      value={settingsSupportPhone}
                      onChange={(e) => setSettingsSupportPhone(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-stone-300 focus:outline-none focus:border-stone-900"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-800 mb-1.5">
                      Support Email
                    </label>
                    <input
                      type="email"
                      value={settingsSupportEmail}
                      onChange={(e) => setSettingsSupportEmail(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-stone-300 focus:outline-none focus:border-stone-900"
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-stone-100 flex items-center justify-end">
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-stone-900 hover:bg-stone-800 text-white rounded-lg text-xs sm:text-sm font-bold shadow-xs transition-all cursor-pointer"
                  >
                    Save & Sync Application Settings
                  </button>
                </div>
              </form>
            </div>
          )}
        </main>
      </div>

      {/* MODAL 1: ADD PRODUCT MODAL (Requirement: Unlimited Products, Category-Wise, Image Upload) */}
      {showAddProductModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
          <div
            onClick={() => setShowAddProductModal(false)}
            className="fixed inset-0 bg-stone-900/40 backdrop-blur-xs"
          />
          <div className="relative bg-white rounded-3xl border border-stone-200 shadow-2xl w-full max-w-lg overflow-hidden z-10 p-6 sm:p-7 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100 mb-4">
              <h3 className="font-bold text-base text-stone-900 flex items-center gap-2">
                <PackagePlus className="w-5 h-5 text-amber-600" />
                <span>Add Product to Store (Unlimited)</span>
              </h3>
              <button
                onClick={() => setShowAddProductModal(false)}
                className="text-stone-400 hover:text-stone-700 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateProduct} className="space-y-3.5 text-xs sm:text-sm">
              <div>
                <label className="block font-bold text-stone-700 mb-1">Product Title *</label>
                <input
                  type="text"
                  required
                  value={newProductName}
                  onChange={(e) => setNewProductName(e.target.value)}
                  placeholder="e.g. Minimalist Ceramic Diffuser Pro"
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 focus:outline-none focus:border-stone-900"
                />
              </div>

              {/* Category Selection with New Category inline option */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-bold text-stone-700">Category *</label>
                  <button
                    type="button"
                    onClick={() => setIsCustomCategory(!isCustomCategory)}
                    className="text-[11px] text-amber-800 font-bold hover:underline cursor-pointer"
                  >
                    {isCustomCategory ? '← Choose Existing' : '+ Type New Category'}
                  </button>
                </div>

                {isCustomCategory ? (
                  <input
                    type="text"
                    required
                    value={customCategoryInput}
                    onChange={(e) => setCustomCategoryInput(e.target.value)}
                    placeholder="Enter new category name (e.g. Footwear, Kitchen)"
                    className="w-full px-3 py-2 rounded-xl border border-amber-400 focus:outline-none focus:border-amber-600 bg-amber-50/30"
                  />
                ) : (
                  <select
                    value={newProductCategory}
                    onChange={(e) => setNewProductCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 focus:outline-none focus:border-stone-900 bg-white"
                  >
                    {state.categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">Subtitle / Features Kicker</label>
                <input
                  type="text"
                  value={newProductSubtitle}
                  onChange={(e) => setNewProductSubtitle(e.target.value)}
                  placeholder="e.g. Ultrasonic Mist · Warm Halo Glow · Whisper Quiet"
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 focus:outline-none focus:border-stone-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-stone-700 mb-1">
                    Sale Price ({state.currencySymbol}) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={newProductPrice}
                    onChange={(e) => setNewProductPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 focus:outline-none focus:border-stone-900"
                  />
                </div>
                <div>
                  <label className="block font-bold text-stone-700 mb-1">
                    Compare Price ({state.currencySymbol})
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={newProductComparePrice}
                    onChange={(e) => setNewProductComparePrice(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 focus:outline-none focus:border-stone-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Stock Count</label>
                  <input
                    type="number"
                    value={newProductStock}
                    onChange={(e) => setNewProductStock(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 focus:outline-none focus:border-stone-900"
                  />
                </div>
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Badge Tag</label>
                  <select
                    value={newProductBadge}
                    onChange={(e) => setNewProductBadge(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 focus:outline-none focus:border-stone-900 bg-white"
                  >
                    <option value="Deal of Day">Deal of Day</option>
                    <option value="Bestseller">Bestseller</option>
                    <option value="Trending">Trending</option>
                    <option value="New Arrival">New Arrival</option>
                    <option value="Organic">Organic</option>
                  </select>
                </div>
              </div>

              {/* Product Image: Upload File or URL */}
              <div>
                <label className="block font-bold text-stone-700 mb-1">
                  Product Image (File Upload or Image URL)
                </label>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <label className="px-3 py-1.5 bg-stone-100 hover:bg-stone-200 border border-stone-300 rounded-xl text-xs font-bold cursor-pointer flex items-center gap-1.5 transition-colors">
                      <Upload className="w-3.5 h-3.5 text-stone-600" />
                      <span>Choose File from Device</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onload = (uploadEv) => {
                              setNewProductImage(uploadEv.target?.result as string);
                              showToast('Product image uploaded successfully!');
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                    </label>
                    <span className="text-[11px] text-stone-400">
                      {newProductImage.startsWith('data:') ? 'Custom image uploaded' : 'Or use URL below'}
                    </span>
                  </div>

                  <input
                    type="text"
                    value={newProductImage}
                    onChange={(e) => setNewProductImage(e.target.value)}
                    placeholder="https://... or upload above"
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 focus:outline-none focus:border-stone-900 text-xs font-mono"
                  />

                  {newProductImage && (
                    <div className="flex items-center gap-2.5 p-2 bg-stone-50 border border-stone-200 rounded-xl">
                      <img
                        src={newProductImage}
                        alt="Product Preview"
                        className="w-12 h-12 rounded-lg object-cover border border-stone-200"
                      />
                      <span className="text-[11px] text-emerald-700 font-bold">
                        Image Preview Ready
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-3 border-t border-stone-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddProductModal(false)}
                  className="px-4 py-2 text-stone-600 hover:bg-stone-100 rounded-xl text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer"
                >
                  Publish Product to Website
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD CATEGORY MODAL */}
      {showAddCategoryModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
          <div
            onClick={() => setShowAddCategoryModal(false)}
            className="fixed inset-0 bg-stone-900/40 backdrop-blur-xs"
          />
          <div className="relative bg-white rounded-3xl border border-stone-200 shadow-2xl w-full max-w-sm overflow-hidden z-10 p-6 animate-in zoom-in-95 duration-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <h3 className="font-bold text-base text-stone-900 flex items-center gap-2">
                <FolderPlus className="w-5 h-5 text-amber-600" />
                <span>Create New Category</span>
              </h3>
              <button
                onClick={() => setShowAddCategoryModal(false)}
                className="text-stone-400 hover:text-stone-700 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateCategory} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Category Name *
                </label>
                <input
                  type="text"
                  required
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  placeholder="e.g. Footwear, Kitchen & Dining, Watches"
                  className="w-full px-3 py-2.5 text-xs sm:text-sm rounded-xl border border-stone-300 focus:outline-none focus:border-stone-900"
                />
                <p className="text-[11px] text-stone-400 mt-1">
                  Will instantly appear as a filter option across storefront and admin.
                </p>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddCategoryModal(false)}
                  className="px-4 py-2 text-stone-600 hover:bg-stone-100 rounded-xl text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-bold cursor-pointer"
                >
                  Add Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD DELIVERY BOY (Requirement: Auto-generated Delivery ID & Pass) */}
      {showAddDeliveryAgentModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
          <div
            onClick={() => setShowAddDeliveryAgentModal(false)}
            className="fixed inset-0 bg-stone-900/40 backdrop-blur-xs"
          />
          <div className="relative bg-white rounded-3xl border border-stone-200 shadow-2xl w-full max-w-md overflow-hidden z-10 p-6 sm:p-7 animate-in zoom-in-95 duration-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-700 flex items-center justify-center font-bold">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-stone-900">
                    Register New Delivery Boy
                  </h3>
                  <span className="text-[11px] text-stone-500">
                    Credentials auto-generated for courier portal
                  </span>
                </div>
              </div>
              <button
                onClick={() => setShowAddDeliveryAgentModal(false)}
                className="text-stone-400 hover:text-stone-700 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateDeliveryAgent} className="space-y-3.5 text-xs sm:text-sm">
              <div>
                <label className="block font-bold text-stone-700 mb-1">Courier Full Name *</label>
                <input
                  type="text"
                  required
                  value={newAgentName}
                  onChange={(e) => setNewAgentName(e.target.value)}
                  placeholder="e.g. Carlos Vance"
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 focus:outline-none focus:border-stone-900"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">Phone Number *</label>
                <input
                  type="tel"
                  required
                  value={newAgentPhone}
                  onChange={(e) => setNewAgentPhone(e.target.value)}
                  placeholder="+1 (555) 492-8172"
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 focus:outline-none focus:border-stone-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Delivery Zone</label>
                  <input
                    type="text"
                    value={newAgentZone}
                    onChange={(e) => setNewAgentZone(e.target.value)}
                    placeholder="Downtown Metro"
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 focus:outline-none focus:border-stone-900"
                  />
                </div>
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Vehicle Type</label>
                  <select
                    value={newAgentVehicle}
                    onChange={(e) => setNewAgentVehicle(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 focus:outline-none focus:border-stone-900 bg-white"
                  >
                    <option value="Motorbike Express">Motorbike Express</option>
                    <option value="Electric Scooter">Electric Scooter</option>
                    <option value="Delivery Van">Delivery Van</option>
                    <option value="Bicycle Courier">Bicycle Courier</option>
                  </select>
                </div>
              </div>

              {/* Auto-Generated Credentials Preview Box */}
              <div className="p-3.5 bg-amber-50/80 border border-amber-200 rounded-2xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-950 flex items-center gap-1.5">
                    <KeyRound className="w-3.5 h-3.5 text-amber-700" />
                    <span>Auto-Generated Courier Credentials</span>
                  </span>
                  <button
                    type="button"
                    onClick={handleRegenerateAgentCredentials}
                    className="text-[11px] font-bold text-amber-800 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>Regenerate</span>
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2 bg-white rounded-xl border border-amber-200/60">
                    <span className="text-[10px] text-stone-400 block">Delivery ID</span>
                    <span className="font-mono font-bold text-amber-950 text-xs">
                      {newAgentDeliveryId}
                    </span>
                  </div>
                  <div className="p-2 bg-white rounded-xl border border-amber-200/60">
                    <span className="text-[10px] text-stone-400 block">Auto Password</span>
                    <span className="font-mono font-bold text-amber-950 text-xs">
                      {newAgentPassword}
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddDeliveryAgentModal(false)}
                  className="px-4 py-2 text-stone-600 hover:bg-stone-100 rounded-xl text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer"
                >
                  Create & Generate Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: SUCCESSFUL CREDENTIALS CREATED MODAL */}
      {showCreatedCredentialsModal && createdAgentCredentials && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
          <div
            onClick={() => setShowCreatedCredentialsModal(false)}
            className="fixed inset-0 bg-stone-900/50 backdrop-blur-xs"
          />
          <div className="relative bg-white rounded-3xl border border-stone-200 shadow-2xl w-full max-w-md overflow-hidden z-10 p-6 sm:p-7 animate-in zoom-in-95 duration-200 text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div>
              <h3 className="text-xl font-bold font-serif-display text-stone-900">
                Delivery Boy Registered!
              </h3>
              <p className="text-xs text-stone-500 mt-1">
                Share these auto-generated credentials with <strong>{createdAgentCredentials.name}</strong> so they can log into the Delivery Boy Portal.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 text-left space-y-2 text-xs">
              <div className="flex justify-between items-center pb-2 border-b border-amber-200/60">
                <span className="text-stone-500">Delivery ID:</span>
                <span className="font-mono font-bold text-stone-900 bg-white px-2 py-0.5 rounded border border-amber-200">
                  {createdAgentCredentials.deliveryId}
                </span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-amber-200/60">
                <span className="text-stone-500">Auto Password:</span>
                <span className="font-mono font-bold text-stone-900 bg-white px-2 py-0.5 rounded border border-amber-200">
                  {createdAgentCredentials.password}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-stone-500">Assigned Zone:</span>
                <span className="font-medium text-stone-800">{createdAgentCredentials.zone}</span>
              </div>
            </div>

            <div className="flex gap-2.5 pt-2">
              <button
                onClick={() => {
                  const text = `Hello ${createdAgentCredentials.name}, your courier portal credentials for ${state.appName}:\nDelivery ID: ${createdAgentCredentials.deliveryId}\nPassword: ${createdAgentCredentials.password}`;
                  navigator.clipboard.writeText(text);
                  showToast('Credentials copied to clipboard!');
                }}
                className="flex-1 py-3 bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Copy className="w-4 h-4 text-amber-400" />
                <span>Copy Credentials</span>
              </button>
              <button
                onClick={() => setShowCreatedCredentialsModal(false)}
                className="px-4 py-3 bg-stone-100 hover:bg-stone-200 text-stone-700 font-semibold text-xs rounded-xl transition-all cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: ADD VARIANT MODAL (Requirement 9) */}
      {showAddVariantModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
          <div
            onClick={() => setShowAddVariantModal(false)}
            className="fixed inset-0 bg-stone-900/40 backdrop-blur-xs"
          />
          <div className="relative bg-white rounded-2xl border border-stone-200 shadow-2xl w-full max-w-md overflow-hidden z-10 p-6 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100 mb-4">
              <h3 className="font-bold text-base text-stone-900 flex items-center gap-2">
                <Palette className="w-5 h-5 text-amber-700" />
                <span>Add Product Variant</span>
              </h3>
              <button
                onClick={() => setShowAddVariantModal(false)}
                className="text-stone-400 hover:text-stone-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateVariant} className="space-y-3.5 text-xs sm:text-sm">
              <div>
                <label className="block font-semibold text-stone-700 mb-1">Target Product</label>
                <select
                  value={targetProductId}
                  onChange={(e) => setTargetProductId(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-stone-300 focus:outline-none focus:border-stone-900 bg-white"
                >
                  {state.products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Variant Name *</label>
                <input
                  type="text"
                  required
                  value={newVariantName}
                  onChange={(e) => setNewVariantName(e.target.value)}
                  placeholder="e.g. Nordic Moss Green"
                  className="w-full px-3 py-2 rounded-lg border border-stone-300 focus:outline-none focus:border-stone-900"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Color Description</label>
                <input
                  type="text"
                  value={newVariantColorName}
                  onChange={(e) => setNewVariantColorName(e.target.value)}
                  placeholder="e.g. Muted Sage Olive"
                  className="w-full px-3 py-2 rounded-lg border border-stone-300 focus:outline-none focus:border-stone-900"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Color Hex</label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={newVariantColorHex}
                    onChange={(e) => setNewVariantColorHex(e.target.value)}
                    className="w-10 h-10 rounded border border-stone-300 cursor-pointer p-0.5"
                  />
                  <input
                    type="text"
                    value={newVariantColorHex}
                    onChange={(e) => setNewVariantColorHex(e.target.value)}
                    className="flex-1 px-3 py-2 rounded-lg border border-stone-300 font-mono text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Variant Photo URL</label>
                <input
                  type="text"
                  value={newVariantImage}
                  onChange={(e) => setNewVariantImage(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-stone-300 focus:outline-none focus:border-stone-900"
                />
              </div>

              <div className="pt-3 border-t border-stone-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddVariantModal(false)}
                  className="px-4 py-2 text-stone-600 hover:bg-stone-100 rounded-lg text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-lg text-xs font-bold"
                >
                  Add Variant
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: UPLOAD & ADD CUSTOM PAYMENT METHOD (Requirement 8) */}
      {showAddPaymentModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
          <div
            onClick={() => setShowAddPaymentModal(false)}
            className="fixed inset-0 bg-stone-900/40 backdrop-blur-xs"
          />
          <div className="relative bg-white rounded-2xl border border-stone-200 shadow-2xl w-full max-w-md overflow-hidden z-10 p-6 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100 mb-4">
              <h3 className="font-bold text-base text-stone-900 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-amber-700" />
                <span>Upload & Add Custom Payment Method</span>
              </h3>
              <button
                onClick={() => setShowAddPaymentModal(false)}
                className="text-stone-400 hover:text-stone-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreatePaymentMethod} className="space-y-3.5 text-xs sm:text-sm">
              <div>
                <label className="block font-semibold text-stone-700 mb-1">Payment Method Name *</label>
                <input
                  type="text"
                  required
                  value={newPaymentName}
                  onChange={(e) => setNewPaymentName(e.target.value)}
                  placeholder="e.g. PhonePe / GooglePay QR or Wire Transfer"
                  className="w-full px-3 py-2 rounded-lg border border-stone-300 focus:outline-none focus:border-stone-900"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Payment Type</label>
                <select
                  value={newPaymentType}
                  onChange={(e) => setNewPaymentType(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-lg border border-stone-300 focus:outline-none focus:border-stone-900 bg-white"
                >
                  <option value="upi_qr">UPI / QR Code Scan</option>
                  <option value="bank_transfer">Direct Bank Transfer</option>
                  <option value="cod">Cash on Delivery (COD)</option>
                  <option value="gateway">Card / Online Gateway</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Short Description</label>
                <input
                  type="text"
                  value={newPaymentDescription}
                  onChange={(e) => setNewPaymentDescription(e.target.value)}
                  placeholder="e.g. Scan to pay instantly with zero surcharge"
                  className="w-full px-3 py-2 rounded-lg border border-stone-300 focus:outline-none focus:border-stone-900"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Customer Instructions</label>
                <textarea
                  rows={2}
                  value={newPaymentInstructions}
                  onChange={(e) => setNewPaymentInstructions(e.target.value)}
                  placeholder="e.g. Scan QR, input your Order ID in notes, and show confirmation to courier"
                  className="w-full px-3 py-2 rounded-lg border border-stone-300 focus:outline-none focus:border-stone-900 resize-none text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Upload QR Code Image File or Specify URL
                </label>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <label className="px-3 py-1.5 bg-stone-100 hover:bg-stone-200 border border-stone-300 rounded-lg text-xs font-semibold cursor-pointer flex items-center gap-1.5 transition-colors">
                      <Upload className="w-3.5 h-3.5 text-stone-600" />
                      <span>Choose Image File</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onload = (ev) => {
                              setNewPaymentQrUrl(ev.target?.result as string);
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                    </label>
                    <span className="text-[11px] text-stone-500">
                      {newPaymentQrUrl.startsWith('data:') ? 'Image uploaded from device' : 'Or paste URL below'}
                    </span>
                  </div>
                  <input
                    type="text"
                    value={newPaymentQrUrl}
                    onChange={(e) => setNewPaymentQrUrl(e.target.value)}
                    placeholder="https://... or upload from device above"
                    className="w-full px-3 py-2 rounded-lg border border-stone-300 focus:outline-none focus:border-stone-900 font-mono text-xs"
                  />
                  {newPaymentQrUrl && (
                    <div className="flex items-center gap-2 p-2 bg-stone-50 border border-stone-200 rounded">
                      <img src={newPaymentQrUrl} alt="QR Preview" className="w-10 h-10 object-contain rounded border" />
                      <span className="text-[11px] text-emerald-700 font-semibold">QR Code Preview Ready</span>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Account Details / UPI ID / Bank Info
                </label>
                <input
                  type="text"
                  value={newPaymentAccountDetails}
                  onChange={(e) => setNewPaymentAccountDetails(e.target.value)}
                  placeholder="e.g. UPI: store@upi | Bank: JPMorgan Chase"
                  className="w-full px-3 py-2 rounded-lg border border-stone-300 focus:outline-none focus:border-stone-900"
                />
              </div>

              <div className="pt-3 border-t border-stone-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddPaymentModal(false)}
                  className="px-4 py-2 text-stone-600 hover:bg-stone-100 rounded-lg text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-lg text-xs font-bold"
                >
                  Upload & Activate
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: ORDER DETAILS POPUP */}
      {selectedOrderForDetail && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
          <div
            onClick={() => setSelectedOrderForDetail(null)}
            className="fixed inset-0 bg-stone-900/40 backdrop-blur-xs"
          />
          <div className="relative bg-white rounded-2xl border border-stone-200 shadow-2xl w-full max-w-lg overflow-hidden z-10 p-6 animate-in zoom-in-95 duration-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <div>
                <span className="font-mono text-xs font-bold text-stone-500">
                  Order #{selectedOrderForDetail.id}
                </span>
                <h3 className="font-bold text-base text-stone-900">
                  {selectedOrderForDetail.customer_name}
                </h3>
              </div>
              <button
                onClick={() => setSelectedOrderForDetail(null)}
                className="text-stone-400 hover:text-stone-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <div><strong>Email:</strong> {selectedOrderForDetail.email}</div>
              <div><strong>Phone:</strong> {selectedOrderForDetail.phone}</div>
              <div><strong>Address:</strong> {selectedOrderForDetail.address}, {selectedOrderForDetail.city}, {selectedOrderForDetail.country}</div>
              <div><strong>Product:</strong> {selectedOrderForDetail.product_name} ({selectedOrderForDetail.product_variant})</div>
              <div><strong>Quantity:</strong> {selectedOrderForDetail.quantity}</div>
              <div><strong>Payment Method:</strong> {selectedOrderForDetail.payment_method || 'Cash on Delivery'}</div>
              <div><strong>Total Cash:</strong> {state.currencySymbol}{(selectedOrderForDetail.total_price || selectedOrderForDetail.quantity * 79).toFixed(2)}</div>
              <div><strong>Status:</strong> <span className="uppercase font-bold">{selectedOrderForDetail.status}</span></div>
              {selectedOrderForDetail.notes && (
                <div className="p-2.5 rounded bg-stone-50 border border-stone-200">
                  <strong>Notes:</strong> {selectedOrderForDetail.notes}
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-stone-100 flex justify-end">
              <button
                onClick={() => setSelectedOrderForDetail(null)}
                className="px-4 py-2 bg-stone-900 text-white rounded-lg text-xs font-bold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
