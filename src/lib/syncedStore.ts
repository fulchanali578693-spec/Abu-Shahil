import { OrderRecord, OrderStatus, fetchSupabaseOrders, updateSupabaseOrderStatus } from './supabase';
import { ProductVariant } from '../config/storeConfig';

export interface CartItem {
  id: string; // unique item id (productId + variantId)
  productId: string;
  productName: string;
  productImage: string;
  variantId: string;
  variantName: string;
  price: number;
  comparePrice?: number;
  quantity: number;
}

export interface CustomPaymentMethod {
  id: string;
  name: string;
  type: 'cod' | 'upi_qr' | 'bank_transfer' | 'gateway';
  enabled: boolean;
  badge?: string;
  description: string;
  instructions: string;
  qrCodeUrl?: string; // Can be a local uploaded Base64 image or URL
  accountDetails?: string;
  iconName: string;
}

export interface DeliveryAgent {
  id: string;
  deliveryId: string; // Auto-generated ID: e.g. "DEL-101"
  password: string;   // Auto-generated password: e.g. "Rider@101"
  name: string;
  phone: string;
  zone: string;
  vehicle: string;
  activeOrdersCount: number;
  cashCollectedToday: number;
  status: 'active' | 'on_break' | 'offline';
  joinedAt?: string;
}

export interface StoreProduct {
  id: string;
  name: string;
  subtitle: string;
  category: string;
  price: number;
  comparePrice: number;
  badge?: string;
  discountBadge?: string;
  rating: number;
  reviewsCount: number;
  description: string;
  stockCount: number;
  image: string;
  gallery: string[];
  variants: ProductVariant[];
  isDailyDeal?: boolean;
  isPopular?: boolean;
  isLimitedDrop?: boolean;
}

export interface ThemeConfig {
  primaryColor: string; // e.g. '#7C3AED'
  accentColor: string;  // e.g. '#F59E0B'
  themePreset: 'purple' | 'orange' | 'emerald' | 'blue' | 'black' | 'rose' | 'cyber' | 'custom';
  fontFamily: 'sans' | 'serif' | 'mono';
  headerStyle: 'dark' | 'gradient' | 'light';
  buttonRadius: 'rounded-full' | 'rounded-xl' | 'rounded-lg' | 'rounded-md';
}

export interface WebsiteCustomization {
  logoUrl?: string; // Custom uploaded image (Data URL or URL)
  logoHeight: number; // default 38 (24 - 80px)
  showAnnouncement: boolean;
  announcementBadge: string;
  heroHeadline: string;
  heroHeadlineHighlight: string;
  heroSubtitle: string;
  heroBadgeText: string;
  heroCtaText: string;
  heroSubCtaText: string;
  heroImage: string;
  banner1Title: string;
  banner1Subtitle: string;
  banner1Discount: string;
  banner1Badge: string;
  banner2Title: string;
  banner2Subtitle: string;
  banner2Discount: string;
  banner2Badge: string;
  trustBadge1Title: string;
  trustBadge1Desc: string;
  trustBadge2Title: string;
  trustBadge2Desc: string;
  trustBadge3Title: string;
  trustBadge3Desc: string;
  footerAbout: string;
  footerCopyright: string;
}

export const defaultThemeConfig: ThemeConfig = {
  primaryColor: '#7C3AED',
  accentColor: '#F59E0B',
  themePreset: 'purple',
  fontFamily: 'sans',
  headerStyle: 'dark',
  buttonRadius: 'rounded-full',
};

export const defaultCustomization: WebsiteCustomization = {
  logoUrl: '',
  logoHeight: 38,
  showAnnouncement: true,
  announcementBadge: '⚡ MEGA SAVINGS',
  heroHeadline: 'Great Finds.',
  heroHeadlineHighlight: 'Better Prices.',
  heroSubtitle: 'Shop Smarter. Save More.',
  heroBadgeText: 'Up To 80% Off Top Brands',
  heroCtaText: "Explore Today's Deals",
  heroSubCtaText: 'Cash on Delivery Available at Doorstep',
  heroImage: '/src/assets/images/dealkart_hero_banner_1791097277652.jpg',
  banner1Title: 'Buy More. Save More!',
  banner1Subtitle: 'Pair top tech gadgets, audio gear, and lifestyle essentials for volume bundle savings.',
  banner1Discount: 'Up To 70% Off',
  banner1Badge: 'Bundle Savings',
  banner2Title: 'Join DealKart+ for Extra Perks!',
  banner2Subtitle: 'VIP cash on delivery priority, early-bird drop alerts, and exclusive secret voucher codes.',
  banner2Discount: 'VIP Free Delivery',
  banner2Badge: 'Member Exclusive',
  trustBadge1Title: '30-Day Easy Returns',
  trustBadge1Desc: 'Hassle-free doorstep pickup',
  trustBadge2Title: '100% Authentic Brands',
  trustBadge2Desc: 'Verified manufacturer warranty',
  trustBadge3Title: 'Customer Support 24/7',
  trustBadge3Desc: 'Dedicated assistance anytime',
  footerAbout: 'Your trusted Cash-on-Delivery marketplace with verified doorstep parcel inspection.',
  footerCopyright: '© 2026 DealKart. All rights reserved. Powered by Jannat Infotech.',
};

export interface SyncedStoreState {
  appName: string;
  storeTagline: string;
  announcementText: string;
  supportEmail: string;
  supportPhone: string;
  currencySymbol: string;
  currencyCode: string;
  adminEmail: string;
  theme: ThemeConfig;
  customization: WebsiteCustomization;
  categories: string[];
  products: StoreProduct[];
  activeProductId: string;
  cart: CartItem[];
  appliedCoupon: { code: string; discountPercent: number; discountAmount?: number } | null;
  paymentMethods: CustomPaymentMethod[];
  deliveryAgents: DeliveryAgent[];
  orders: OrderRecord[];
}

export const initialCategories: string[] = [
  'Electronics',
  'Fashion',
  'Home & Living',
  'Beauty',
  'Sports',
  'Groceries',
  'Toys & Hobbies',
  'Accessories',
];

const STORAGE_KEY = 'dealkart_synced_state_v2';

// Seed products matching the DealKart template
const dealkartProducts: StoreProduct[] = [
  // 1. Daily Deals
  {
    id: 'prod-earbuds',
    name: 'True Wireless Earbuds ANC',
    subtitle: 'Deep Bass · Active Noise Cancellation · 36h Playtime',
    category: 'Electronics',
    price: 29.99,
    comparePrice: 79.99,
    badge: 'Deal of Day',
    discountBadge: '-62%',
    rating: 4.8,
    reviewsCount: 1240,
    description: 'High-fidelity audio with Bluetooth 5.3, ambient pass-through, and waterproof IPX7 rating.',
    stockCount: 85,
    image: '/src/assets/images/dealkart_smartwatch_1791097293110.jpg',
    gallery: ['/src/assets/images/dealkart_smartwatch_1791097293110.jpg'],
    variants: [
      { id: 'v-black', name: 'Stealth Black', colorName: 'Matte Black', colorHex: '#18181B', image: '/src/assets/images/dealkart_smartwatch_1791097293110.jpg', inStock: true },
      { id: 'v-white', name: 'Glacier White', colorName: 'Pure White', colorHex: '#F4F4F5', image: '/src/assets/images/dealkart_smartwatch_1791097293110.jpg', inStock: true },
    ],
    isDailyDeal: true,
  },
  {
    id: 'prod-coffeemaker',
    name: 'Smart Barista Coffee Maker',
    subtitle: '12-Cup Programmable · Thermal Carafe · Brew Strength Control',
    category: 'Home & Living',
    price: 49.99,
    comparePrice: 96.99,
    badge: 'Best Value',
    discountBadge: '-48%',
    rating: 4.9,
    reviewsCount: 890,
    description: 'Freshly brewed artisan coffee with auto-start timer and precision temperature calibration.',
    stockCount: 42,
    image: '/src/assets/images/dealkart_airfryer_1791097306132.jpg',
    gallery: ['/src/assets/images/dealkart_airfryer_1791097306132.jpg'],
    variants: [
      { id: 'v-steel', name: 'Brushed Steel', colorName: 'Silver Stainless', colorHex: '#A1A1AA', image: '/src/assets/images/dealkart_airfryer_1791097306132.jpg', inStock: true },
      { id: 'v-matte', name: 'Midnight Onyx', colorName: 'Matte Black', colorHex: '#27272A', image: '/src/assets/images/dealkart_airfryer_1791097306132.jpg', inStock: true },
    ],
    isDailyDeal: true,
  },
  {
    id: 'prod-smartwatch',
    name: 'Smart Watch Pro AMOLED',
    subtitle: 'Always-On Display · ECG & SpO2 Monitor · 10-Day Battery',
    category: 'Electronics',
    price: 79.99,
    comparePrice: 179.99,
    badge: 'Trending',
    discountBadge: '-55%',
    rating: 4.8,
    reviewsCount: 2150,
    description: 'Precision sapphire glass, aircraft titanium bezel, heart health analytics, and Bluetooth calls.',
    stockCount: 60,
    image: '/src/assets/images/dealkart_smartwatch_1791097293110.jpg',
    gallery: ['/src/assets/images/dealkart_smartwatch_1791097293110.jpg'],
    variants: [
      { id: 'v-space-black', name: 'Space Black', colorName: 'DLC Titanium', colorHex: '#1C1917', image: '/src/assets/images/dealkart_smartwatch_1791097293110.jpg', inStock: true },
      { id: 'v-rose-gold', name: 'Rose Gold', colorName: 'Warm Bronze', colorHex: '#D4A373', image: '/src/assets/images/dealkart_smartwatch_1791097293110.jpg', inStock: true },
    ],
    isDailyDeal: true,
  },
  {
    id: 'prod-moodlamp',
    name: 'Aura Glow LED Mood Lamp',
    subtitle: 'Touch Stepless Dimming · 16M Colors · Ambient Bedside Halo',
    category: 'Home & Living',
    price: 23.99,
    comparePrice: 39.99,
    badge: 'Popular',
    discountBadge: '-40%',
    rating: 4.9,
    reviewsCount: 670,
    description: 'Minimalist mushroom silhouette lamp with warm 2200K sunset amber glow and USB-C charging.',
    stockCount: 110,
    image: '/src/assets/images/cod_product_main_1791095851714.jpg',
    gallery: ['/src/assets/images/cod_product_main_1791095851714.jpg'],
    variants: [
      { id: 'v-warm', name: 'Warm Alabaster', colorName: 'Porcelain Sand', colorHex: '#FAF5EE', image: '/src/assets/images/cod_product_main_1791095851714.jpg', inStock: true },
      { id: 'v-amber', name: 'Sunset Terracotta', colorName: 'Warm Rust', colorHex: '#C86D51', image: '/src/assets/images/cod_product_lifestyle_1791095866054.jpg', inStock: true },
    ],
    isDailyDeal: true,
  },

  // 2. Popular Products
  {
    id: 'prod-casualshirt',
    name: 'Premium Oxford Casual Shirt',
    subtitle: '100% Breathable Combed Cotton · Wrinkle-Resistant Fit',
    category: 'Fashion',
    price: 34.99,
    comparePrice: 59.99,
    badge: 'Bestseller',
    discountBadge: '-42%',
    rating: 4.8,
    reviewsCount: 940,
    description: 'Tailored comfort with reinforced stitching, mother-of-pearl buttons, and lightweight all-day stretch.',
    stockCount: 75,
    image: '/src/assets/images/dealkart_hero_banner_1791097277652.jpg',
    gallery: ['/src/assets/images/dealkart_hero_banner_1791097277652.jpg'],
    variants: [
      { id: 'v-sky-blue', name: 'Sky Blue Oxford', colorName: 'Classic Blue', colorHex: '#7AA2E3', image: '/src/assets/images/dealkart_hero_banner_1791097277652.jpg', inStock: true },
      { id: 'v-crisp-white', name: 'Crisp White', colorName: 'Pure White', colorHex: '#FFFFFF', image: '/src/assets/images/dealkart_hero_banner_1791097277652.jpg', inStock: true },
    ],
    isPopular: true,
  },
  {
    id: 'prod-airfryer',
    name: 'Digital Touch Air Fryer 6.5L',
    subtitle: 'Rapid Air Circulation · 8 One-Touch Presets · Nonstick Basket',
    category: 'Home & Living',
    price: 89.99,
    comparePrice: 199.99,
    badge: 'Customer Choice',
    discountBadge: '-55%',
    rating: 4.9,
    reviewsCount: 3100,
    description: 'Crisp food with 85% less oil. Ceramic non-stick dishwasher-safe basket with LED glass touch panel.',
    stockCount: 34,
    image: '/src/assets/images/dealkart_airfryer_1791097306132.jpg',
    gallery: ['/src/assets/images/dealkart_airfryer_1791097306132.jpg'],
    variants: [
      { id: 'v-black-gold', name: 'Obsidian Black', colorName: 'Onyx Finish', colorHex: '#18181B', image: '/src/assets/images/dealkart_airfryer_1791097306132.jpg', inStock: true },
    ],
    isPopular: true,
  },
  {
    id: 'prod-skincare',
    name: 'Hydrating Botanical Skincare Set',
    subtitle: 'Hyaluronic Acid Cleanser · Rose Toner · Ceramide Barrier Serum',
    category: 'Beauty',
    price: 39.99,
    comparePrice: 79.99,
    badge: 'Organic',
    discountBadge: '-50%',
    rating: 4.9,
    reviewsCount: 1420,
    description: 'Dermatologist-tested 3-step regimen for radiant glass skin with natural plant peptides.',
    stockCount: 90,
    image: '/src/assets/images/cod_product_lifestyle_1791095866054.jpg',
    gallery: ['/src/assets/images/cod_product_lifestyle_1791095866054.jpg'],
    variants: [
      { id: 'v-rose', name: 'Rosewater Glow', colorName: 'Soft Blossom', colorHex: '#E8B4B8', image: '/src/assets/images/cod_product_lifestyle_1791095866054.jpg', inStock: true },
    ],
    isPopular: true,
  },
  {
    id: 'prod-headphones',
    name: 'Noise-Cancelling Studio Pro Headphones',
    subtitle: 'Hi-Res Audio Certified · 45h Battery · Memory Foam Cushion',
    category: 'Electronics',
    price: 99.99,
    comparePrice: 199.99,
    badge: 'Audiophile',
    discountBadge: '-50%',
    rating: 4.8,
    reviewsCount: 1840,
    description: 'Industry-leading 40mm graphene drivers with 3-level hybrid ANC and crystal clear dual microphones.',
    stockCount: 45,
    image: '/src/assets/images/dealkart_headphones_1791097318351.jpg',
    gallery: ['/src/assets/images/dealkart_headphones_1791097318351.jpg'],
    variants: [
      { id: 'v-midnight', name: 'Midnight Charcoal', colorName: 'Matte Grey', colorHex: '#27272A', image: '/src/assets/images/dealkart_headphones_1791097318351.jpg', inStock: true },
      { id: 'v-silver', name: 'Lunar Silver', colorName: 'Anodized Silver', colorHex: '#D4D4D8', image: '/src/assets/images/dealkart_headphones_1791097318351.jpg', inStock: true },
    ],
    isPopular: true,
  },

  // 3. Limited Drops
  {
    id: 'prod-sneakers',
    name: 'Retro High-Top Sneaker Drop',
    subtitle: 'Limited Run 500 Pairs · Premium Suede & Leather · Cushioned Cupsole',
    category: 'Fashion',
    price: 119.99,
    comparePrice: 189.99,
    badge: 'Only 500 Left',
    discountBadge: '-37%',
    rating: 4.9,
    reviewsCount: 520,
    description: 'Iconic throwback design with vintage distressed rubber sole and padded collar support.',
    stockCount: 28,
    image: '/src/assets/images/dealkart_hero_banner_1791097277652.jpg',
    gallery: ['/src/assets/images/dealkart_hero_banner_1791097277652.jpg'],
    variants: [
      { id: 'v-retro-beige', name: 'Sand & Mocha', colorName: 'Vintage Earth', colorHex: '#C5A880', image: '/src/assets/images/dealkart_hero_banner_1791097277652.jpg', inStock: true },
    ],
    isLimitedDrop: true,
  },
  {
    id: 'prod-heritagewatch',
    name: 'Heritage Automatic Chronograph',
    subtitle: 'Limited Batch · 24-Jewel Japanese Movement · Sapphire Dome',
    category: 'Accessories',
    price: 189.00,
    comparePrice: 350.00,
    badge: 'Only 200 Left',
    discountBadge: '-46%',
    rating: 5.0,
    reviewsCount: 310,
    description: 'Hand-assembled mechanical timepiece with genuine Italian calfskin strap and exhibition caseback.',
    stockCount: 15,
    image: '/src/assets/images/dealkart_smartwatch_1791097293110.jpg',
    gallery: ['/src/assets/images/dealkart_smartwatch_1791097293110.jpg'],
    variants: [
      { id: 'v-gold-leather', name: 'Vintage Gold & Brown', colorName: 'Polished Brass', colorHex: '#D4AF37', image: '/src/assets/images/dealkart_smartwatch_1791097293110.jpg', inStock: true },
    ],
    isLimitedDrop: true,
  },
];

const initialPaymentMethods: CustomPaymentMethod[] = [
  {
    id: 'pay-cod',
    name: 'Cash on Delivery (COD)',
    type: 'cod',
    enabled: true,
    badge: 'Popular',
    description: 'Pay cash directly upon delivery after checking your parcel at your doorstep.',
    instructions: 'Have the exact cash amount ready for the delivery courier.',
    iconName: 'Banknote',
  },
  {
    id: 'pay-upi',
    name: 'UPI / QR Code Payment',
    type: 'upi_qr',
    enabled: true,
    badge: 'Zero Fee',
    description: 'Scan merchant QR code using GPay, PhonePe, Paytm, or any banking app.',
    instructions: 'Scan the QR code displayed below or pay to UPI ID. Upload receipt or enter UTR number.',
    qrCodeUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=upi://pay?pa=jannatinfotech@upi&pn=Jannat%20Infotech%20DealKart&am=29.99',
    accountDetails: 'UPI ID: jannatinfotech@upi | Merchant: Jannat Infotech DealKart',
    iconName: 'QrCode',
  },
  {
    id: 'pay-bank',
    name: 'Direct Bank Wire Transfer',
    type: 'bank_transfer',
    enabled: true,
    badge: 'Direct Deposit',
    description: 'Transfer directly into our verified corporate bank account.',
    instructions: 'Transfer funds to Chase Bank, Acc: 94829104812, Routing: 021000021. Include your Order ID in remarks.',
    accountDetails: 'Bank: JPMorgan Chase | Acc: 9482-9104-812 | Routing: 021000021',
    iconName: 'Landmark',
  },
];

const initialDeliveryAgents: DeliveryAgent[] = [
  {
    id: 'agent-1',
    deliveryId: 'DEL-101',
    password: 'Rider@101',
    name: 'Liam Martinez',
    phone: '+1 (555) 234-9812',
    zone: 'Downtown & Central Metro',
    vehicle: 'Electric Van #04',
    activeOrdersCount: 2,
    cashCollectedToday: 139.98,
    status: 'active',
    joinedAt: '2026-01-15',
  },
  {
    id: 'agent-2',
    deliveryId: 'DEL-102',
    password: 'Rider@102',
    name: 'Tariq Al-Mansoor',
    phone: '+1 (555) 876-5432',
    zone: 'North Suburbs & West Hills',
    vehicle: 'Motorbike Express #12',
    activeOrdersCount: 1,
    cashCollectedToday: 79.99,
    status: 'active',
    joinedAt: '2026-02-20',
  },
];

class SyncedStore {
  private state: SyncedStoreState;
  private listeners: Set<() => void> = new Set();

  constructor() {
    this.state = this.loadState();
    this.syncFromSupabase();
  }

  private loadState(): SyncedStoreState {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        
        // Ensure all loaded delivery agents have auto-generated deliveryId and password
        const loadedAgents: DeliveryAgent[] = (parsed.deliveryAgents && parsed.deliveryAgents.length ? parsed.deliveryAgents : initialDeliveryAgents).map((a: DeliveryAgent, idx: number) => ({
          ...a,
          deliveryId: a.deliveryId || `DEL-${101 + idx}`,
          password: a.password || `Rider@${101 + idx}`,
        }));

        // Collect all categories from products and saved list
        const productCategories = (parsed.products || dealkartProducts).map((p: StoreProduct) => p.category);
        const mergedCategories = Array.from(new Set([...initialCategories, ...(parsed.categories || []), ...productCategories]));

        return {
          appName: parsed.appName || 'DealKart',
          storeTagline: parsed.storeTagline || 'Deals Beyond Ordinary',
          announcementText: parsed.announcementText || '⚡ Mega Savings: Up To 80% Off Top Brands · Free Fast Delivery with COD',
          supportEmail: parsed.supportEmail || 'jannatinfotech@gmail.com',
          supportPhone: parsed.supportPhone || '+1 (800) 829-2872',
          currencySymbol: parsed.currencySymbol || '$',
          currencyCode: parsed.currencyCode || 'USD',
          adminEmail: 'jannatinfotech@gmail.com',
          theme: parsed.theme ? { ...defaultThemeConfig, ...parsed.theme } : defaultThemeConfig,
          customization: parsed.customization ? { ...defaultCustomization, ...parsed.customization } : defaultCustomization,
          categories: mergedCategories,
          products: parsed.products && parsed.products.length ? parsed.products : dealkartProducts,
          activeProductId: parsed.activeProductId || dealkartProducts[0].id,
          cart: parsed.cart || [],
          appliedCoupon: parsed.appliedCoupon || null,
          paymentMethods: parsed.paymentMethods || initialPaymentMethods,
          deliveryAgents: loadedAgents,
          orders: parsed.orders || [],
        };
      }
    } catch (e) {
      console.warn('Could not read saved synced state', e);
    }

    return {
      appName: 'DealKart',
      storeTagline: 'Deals Beyond Ordinary',
      announcementText: '⚡ Mega Savings: Up To 80% Off Top Brands · Free Fast Delivery with COD',
      supportEmail: 'jannatinfotech@gmail.com',
      supportPhone: '+1 (800) 829-2872',
      currencySymbol: '$',
      currencyCode: 'USD',
      adminEmail: 'jannatinfotech@gmail.com',
      theme: defaultThemeConfig,
      customization: defaultCustomization,
      categories: initialCategories,
      products: dealkartProducts,
      activeProductId: dealkartProducts[0].id,
      cart: [],
      appliedCoupon: null,
      paymentMethods: initialPaymentMethods,
      deliveryAgents: initialDeliveryAgents,
      orders: [],
    };
  }

  private saveState(): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
    } catch (e) {
      console.warn('Could not save synced state', e);
    }
    this.notify();
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify(): void {
    this.listeners.forEach((fn) => fn());
  }

  public getState(): SyncedStoreState {
    return this.state;
  }

  public async syncFromSupabase(): Promise<void> {
    const res = await fetchSupabaseOrders();
    if (res.orders && res.orders.length > 0) {
      const existingIds = new Set(this.state.orders.map((o) => String(o.id)));
      const newOrders = [...this.state.orders];
      res.orders.forEach((remoteOrder) => {
        if (!existingIds.has(String(remoteOrder.id))) {
          newOrders.unshift(remoteOrder);
        }
      });
      this.state.orders = newOrders;
      this.saveState();
    }
  }

  // --- CART MANAGEMENT ---
  public addToCart(product: StoreProduct, variant?: ProductVariant, quantity: number = 1): void {
    const selectedVariant = variant || product.variants[0];
    const cartItemId = `${product.id}-${selectedVariant.id}`;

    const existingIndex = this.state.cart.findIndex((item) => item.id === cartItemId);

    if (existingIndex > -1) {
      this.state.cart[existingIndex].quantity += quantity;
    } else {
      this.state.cart.push({
        id: cartItemId,
        productId: product.id,
        productName: product.name,
        productImage: selectedVariant.image || product.image,
        variantId: selectedVariant.id,
        variantName: selectedVariant.name,
        price: product.price,
        comparePrice: product.comparePrice,
        quantity,
      });
    }

    this.saveState();
  }

  public removeFromCart(cartItemId: string): void {
    this.state.cart = this.state.cart.filter((item) => item.id !== cartItemId);
    this.saveState();
  }

  public updateCartQuantity(cartItemId: string, quantity: number): void {
    if (quantity <= 0) {
      this.removeFromCart(cartItemId);
      return;
    }

    this.state.cart = this.state.cart.map((item) =>
      item.id === cartItemId ? { ...item, quantity } : item
    );
    this.saveState();
  }

  public clearCart(): void {
    this.state.cart = [];
    this.state.appliedCoupon = null;
    this.saveState();
  }

  public applyCoupon(code: string): { success: boolean; message: string } {
    const cleanCode = code.toUpperCase().trim();
    if (cleanCode === 'SAVE10') {
      this.state.appliedCoupon = { code: 'SAVE10', discountPercent: 10 };
      this.saveState();
      return { success: true, message: '10% Discount Coupon Applied!' };
    }
    if (cleanCode === 'MEGA20') {
      this.state.appliedCoupon = { code: 'MEGA20', discountPercent: 20 };
      this.saveState();
      return { success: true, message: '20% Mega Member Coupon Applied!' };
    }
    if (cleanCode === 'FREESHIP') {
      this.state.appliedCoupon = { code: 'FREESHIP', discountPercent: 0 };
      this.saveState();
      return { success: true, message: 'Free Express Courier Shipping Applied!' };
    }

    return { success: false, message: 'Invalid or expired coupon code' };
  }

  // --- ADMIN PAYMENT MANAGEMENT WITH QR UPLOAD ---
  public updatePaymentMethodQrImage(methodId: string, qrCodeDataUrl: string): void {
    this.state.paymentMethods = this.state.paymentMethods.map((m) =>
      m.id === methodId ? { ...m, qrCodeUrl: qrCodeDataUrl } : m
    );
    this.saveState();
  }

  public updatePaymentMethod(id: string, updates: Partial<CustomPaymentMethod>): void {
    this.state.paymentMethods = this.state.paymentMethods.map((m) =>
      m.id === id ? { ...m, ...updates } : m
    );
    this.saveState();
  }

  public addPaymentMethod(method: Omit<CustomPaymentMethod, 'id'>): CustomPaymentMethod {
    const newMethod: CustomPaymentMethod = {
      ...method,
      id: `pay-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    };
    this.state.paymentMethods = [...this.state.paymentMethods, newMethod];
    this.saveState();
    return newMethod;
  }

  // --- CATEGORY MANAGEMENT ---
  public addCategory(categoryName: string): boolean {
    const clean = categoryName.trim();
    if (!clean) return false;
    if (!this.state.categories.some((c) => c.toLowerCase() === clean.toLowerCase())) {
      this.state.categories = [...this.state.categories, clean];
      this.saveState();
      return true;
    }
    return false;
  }

  public deleteCategory(categoryName: string): void {
    this.state.categories = this.state.categories.filter((c) => c !== categoryName);
    this.saveState();
  }

  // --- PRODUCT MANAGEMENT ---
  public addProduct(product: Omit<StoreProduct, 'id'>): StoreProduct {
    const newProduct: StoreProduct = {
      ...product,
      id: `prod-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    };
    if (newProduct.category && !this.state.categories.includes(newProduct.category)) {
      this.state.categories = [...this.state.categories, newProduct.category];
    }
    this.state.products = [newProduct, ...this.state.products];
    this.state.activeProductId = newProduct.id;
    this.saveState();
    return newProduct;
  }

  public updateProduct(productId: string, updates: Partial<StoreProduct>): void {
    if (updates.category && !this.state.categories.includes(updates.category)) {
      this.state.categories = [...this.state.categories, updates.category];
    }
    this.state.products = this.state.products.map((p) =>
      p.id === productId ? { ...p, ...updates } : p
    );
    this.saveState();
  }

  public deleteProduct(productId: string): void {
    this.state.products = this.state.products.filter((p) => p.id !== productId);
    if (this.state.activeProductId === productId && this.state.products.length > 0) {
      this.state.activeProductId = this.state.products[0].id;
    }
    this.saveState();
  }

  public addProductVariant(productId: string, variant: Omit<ProductVariant, 'id'>): void {
    const newVariant: ProductVariant = {
      ...variant,
      id: `var-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    };

    this.state.products = this.state.products.map((p) => {
      if (p.id === productId) {
        return {
          ...p,
          variants: [...p.variants, newVariant],
        };
      }
      return p;
    });
    this.saveState();
  }

  public setActiveProduct(productId: string): void {
    if (this.state.products.some((p) => p.id === productId)) {
      this.state.activeProductId = productId;
      this.saveState();
    }
  }

  // --- ORDER MANAGEMENT ---
  public addOrder(order: Omit<OrderRecord, 'id' | 'created_at'>): OrderRecord {
    const newOrder: OrderRecord = {
      ...order,
      id: `ord-${Date.now().toString().slice(-4)}`,
      created_at: new Date().toISOString(),
    };
    this.state.orders = [newOrder, ...this.state.orders];
    this.saveState();
    return newOrder;
  }

  public async updateOrderStatus(
    orderId: string | number,
    status: OrderStatus,
    deliveryAgentId?: string | null
  ): Promise<void> {
    this.state.orders = this.state.orders.map((o) => {
      if (String(o.id) === String(orderId)) {
        return {
          ...o,
          status,
          delivery_agent_id:
            deliveryAgentId !== undefined ? deliveryAgentId : o.delivery_agent_id,
        };
      }
      return o;
    });

    if (status === 'delivered') {
      const order = this.state.orders.find((o) => String(o.id) === String(orderId));
      if (order && order.delivery_agent_id) {
        this.state.deliveryAgents = this.state.deliveryAgents.map((agent) => {
          if (agent.id === order.delivery_agent_id) {
            return {
              ...agent,
              cashCollectedToday: agent.cashCollectedToday + (order.total_price || 79),
              activeOrdersCount: Math.max(0, agent.activeOrdersCount - 1),
            };
          }
          return agent;
        });
      }
    }

    this.saveState();
    await updateSupabaseOrderStatus(orderId, status);
  }

  public assignOrderToAgent(orderId: string | number, agentId: string): void {
    this.state.orders = this.state.orders.map((o) => {
      if (String(o.id) === String(orderId)) {
        return {
          ...o,
          delivery_agent_id: agentId,
          status: o.status === 'pending' ? 'confirmed' : o.status,
        };
      }
      return o;
    });

    this.state.deliveryAgents = this.state.deliveryAgents.map((a) => {
      if (a.id === agentId) {
        return { ...a, activeOrdersCount: a.activeOrdersCount + 1 };
      }
      return a;
    });

    this.saveState();
  }

  // --- DELIVERY FLEET & COURIER MANAGEMENT (Requirement: Auto-generated Delivery ID & Pass) ---
  public addDeliveryAgent(data: {
    name: string;
    phone: string;
    zone: string;
    vehicle: string;
    deliveryId?: string;
    password?: string;
  }): DeliveryAgent {
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const generatedDeliveryId = data.deliveryId?.trim() || `DEL-${randomNum}`;
    const generatedPassword = data.password?.trim() || `Rider@${randomNum}`;

    const newAgent: DeliveryAgent = {
      id: `agent-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      deliveryId: generatedDeliveryId,
      password: generatedPassword,
      name: data.name.trim(),
      phone: data.phone.trim(),
      zone: data.zone.trim(),
      vehicle: data.vehicle.trim() || 'Motorbike Express',
      activeOrdersCount: 0,
      cashCollectedToday: 0,
      status: 'active',
      joinedAt: new Date().toISOString().split('T')[0],
    };

    this.state.deliveryAgents = [newAgent, ...this.state.deliveryAgents];
    this.saveState();
    return newAgent;
  }

  public updateDeliveryAgent(id: string, updates: Partial<DeliveryAgent>): void {
    this.state.deliveryAgents = this.state.deliveryAgents.map((a) =>
      a.id === id ? { ...a, ...updates } : a
    );
    this.saveState();
  }

  public deleteDeliveryAgent(id: string): void {
    this.state.deliveryAgents = this.state.deliveryAgents.filter((a) => a.id !== id);
    this.saveState();
  }

  public regenerateDeliveryPassword(id: string): string {
    const newPass = `Rider@${Math.floor(1000 + Math.random() * 9000)}`;
    this.state.deliveryAgents = this.state.deliveryAgents.map((a) =>
      a.id === id ? { ...a, password: newPass } : a
    );
    this.saveState();
    return newPass;
  }

  public authenticateDeliveryAgent(deliveryId: string, pass: string): DeliveryAgent | null {
    const cleanId = deliveryId.trim().toUpperCase();
    const cleanPass = pass.trim();
    return (
      this.state.deliveryAgents.find(
        (a) => a.deliveryId.toUpperCase() === cleanId && a.password === cleanPass
      ) || null
    );
  }

  // --- SETTINGS ---
  public updateSettings(settings: {
    appName?: string;
    storeTagline?: string;
    announcementText?: string;
    supportEmail?: string;
    supportPhone?: string;
    currencySymbol?: string;
    currencyCode?: string;
  }): void {
    this.state = {
      ...this.state,
      ...settings,
    };
    this.saveState();
  }

  // --- THEME & WEBSITE CUSTOMIZATION ---
  public updateTheme(themeUpdates: Partial<ThemeConfig>): void {
    this.state.theme = {
      ...this.state.theme,
      ...themeUpdates,
    };
    this.saveState();
  }

  public updateCustomization(customizationUpdates: Partial<WebsiteCustomization>): void {
    this.state.customization = {
      ...this.state.customization,
      ...customizationUpdates,
    };
    this.saveState();
  }

  public updateWebsiteLogo(logoDataUrl: string): void {
    this.state.customization = {
      ...this.state.customization,
      logoUrl: logoDataUrl,
    };
    this.saveState();
  }

  public removeWebsiteLogo(): void {
    this.state.customization = {
      ...this.state.customization,
      logoUrl: '',
    };
    this.saveState();
  }

  public resetThemeAndCustomization(): void {
    this.state.theme = { ...defaultThemeConfig };
    this.state.customization = { ...defaultCustomization };
    this.saveState();
  }
}

export const syncedStore = new SyncedStore();
