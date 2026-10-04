/**
 * ============================================================================
 * AURACRAFT COD STORE TEMPLATE CONFIGURATION
 * ============================================================================
 * Easily customize your store details, product info, pricing, variants, and copy.
 * Everything here can be edited directly to tailor your single-product COD store!
 */

export interface ProductVariant {
  id: string;
  name: string;
  colorName: string;
  colorHex: string;
  image: string;
  badge?: string;
  inStock: boolean;
}

export interface ProductBundle {
  id: string;
  quantity: number;
  label: string;
  badge?: string;
  discountPercentage: number;
  savingsLabel: string;
}

export interface StoreReview {
  id: string;
  author: string;
  location: string;
  rating: number;
  date: string;
  variant: string;
  title: string;
  comment: string;
  verified: boolean;
}

export interface FaqItem {
  question: string;
  answer: string;
}

export interface StoreConfig {
  storeName: string;
  storeTagline: string;
  announcementBar: {
    enabled: boolean;
    text: string;
    badgeText: string;
  };
  support: {
    email: string;
    phone: string;
    hours: string;
  };
  currency: {
    symbol: string;
    code: string;
  };
  product: {
    id: string;
    name: string;
    subtitle: string;
    badge: string;
    price: number;
    comparePrice: number;
    rating: number;
    reviewsCount: number;
    description: string;
    shippingInfo: string;
    stockNotice: string;
    variants: ProductVariant[];
    bundles: ProductBundle[];
    gallery: string[];
    features: {
      title: string;
      description: string;
      icon: string;
    }[];
    specifications: {
      label: string;
      value: string;
    }[];
  };
  codPerks: {
    title: string;
    description: string;
  }[];
  reviews: StoreReview[];
  faqs: FaqItem[];
}

export const defaultStoreConfig: StoreConfig = {
  storeName: "AuraCraft",
  storeTagline: "Artisanal Home Wellness & Acoustic Living",
  announcementBar: {
    enabled: true,
    text: "Zero online payment required — Inspect your parcel and pay cash upon delivery",
    badgeText: "FREE EXPRESS SHIPPING",
  },
  support: {
    email: "orders@auracraft.store",
    phone: "+1 (888) 428-7221",
    hours: "Mon – Sat, 9:00 AM – 7:00 PM",
  },
  currency: {
    symbol: "$",
    code: "USD",
  },
  product: {
    id: "aurapulse-ceramic-diffuser",
    name: "AuraPulse™ Ceramic Ultrasonic Aroma Diffuser & Ambient Lamp",
    subtitle: "Hand-poured porcelain clay · Whisper-quiet 22dB misting · 2700K Warm halo glow",
    badge: "Bestseller · Limited Batch",
    price: 79,
    comparePrice: 129,
    rating: 4.93,
    reviewsCount: 418,
    description:
      "Crafted from premium porous bisque porcelain, the AuraPulse seamlessly elevates your sanctuary. Utilizing high-frequency ultrasonic vibrations, it diffuses pure essential oil botanicals into an ultra-fine therapeutic mist without heat, while radiating a calming candlelight halo.",
    shippingInfo: "Free 48-Hour Inspected Courier Delivery · Pay in Cash at Door",
    stockNotice: "Only 14 units left from current artisanal firing batch",
    gallery: [
      "/src/assets/images/cod_product_main_1791095851714.jpg",
      "/src/assets/images/cod_product_lifestyle_1791095866054.jpg",
      "/src/assets/images/cod_product_details_1791095876485.jpg",
    ],
    variants: [
      {
        id: "matte-alabaster",
        name: "Matte Alabaster",
        colorName: "Alabaster White",
        colorHex: "#F5F3EF",
        image: "/src/assets/images/cod_product_main_1791095851714.jpg",
        badge: "Most Popular",
        inStock: true,
      },
      {
        id: "sahara-sand",
        name: "Sahara Sand",
        colorName: "Warm Sand Beige",
        colorHex: "#DEC8B0",
        image: "/src/assets/images/cod_product_lifestyle_1791095866054.jpg",
        inStock: true,
      },
      {
        id: "nordic-charcoal",
        name: "Nordic Charcoal",
        colorName: "Deep Slate Ceramic",
        colorHex: "#393836",
        image: "/src/assets/images/cod_product_details_1791095876485.jpg",
        inStock: true,
      },
    ],
    bundles: [
      {
        id: "bundle-1",
        quantity: 1,
        label: "Single Sanctuary Unit",
        discountPercentage: 0,
        savingsLabel: "Save $50 off MSRP",
      },
      {
        id: "bundle-2",
        quantity: 2,
        label: "Double Living & Bedroom Duo",
        badge: "Best Value (Save Extra 15%)",
        discountPercentage: 15,
        savingsLabel: "Save $124 total",
      },
      {
        id: "bundle-3",
        quantity: 3,
        label: "Full Home Harmony Trio (3 Units)",
        badge: "Gift Set (Save Extra 25%)",
        discountPercentage: 25,
        savingsLabel: "Save $210 total",
      },
    ],
    features: [
      {
        title: "Porous Artisanal Porcelain",
        description: "Individually turned and matte-finished ceramic stone exterior with subtle organic texture.",
        icon: "ShieldCheck",
      },
      {
        title: "22dB Ultrasonic Whisper Quiet",
        description: "2.4MHz vibration creates a cool micro-fine mist without heating essential botanical compounds.",
        icon: "VolumeX",
      },
      {
        title: "Warm 2700K Candle Halo",
        description: "Dimmable ambient LED ring creates a restful hearth glow for meditation and sound sleep.",
        icon: "Sun",
      },
      {
        title: "Automatic Waterless Safety Shut-off",
        description: "Smart optoelectronic sensor immediately powers down the device when water runs low.",
        icon: "Zap",
      },
    ],
    specifications: [
      { label: "Exterior Finish", value: "Hand-finished Matte Bisque Porcelain" },
      { label: "Water Reservoir", value: "280 ml BPA-Free High-Grade Polypropylene" },
      { label: "Misting Modes", value: "Continuous (6 hrs) / Intermittent (12 hrs)" },
      { label: "Acoustic Output", value: "< 22 dB (Whisper quiet)" },
      { label: "Coverage Area", value: "Up to 450 sq. ft / 42 m²" },
      { label: "Power Connector", value: "Universal USB-C with 2m braided textile cord" },
      { label: "Warranty", value: "2-Year Manufacturer Replacement Guarantee" },
    ],
  },
  codPerks: [
    {
      title: "100% Cash On Delivery",
      description: "No credit card needed. Keep your money safe in your pocket until the courier arrives.",
    },
    {
      title: "Parcel Inspection Allowed",
      description: "Verify the packaging integrity and seal before handing over cash to the courier agent.",
    },
    {
      title: "Complimentary Express Delivery",
      description: "Dispatched within 24 hours with real-time SMS courier dispatch alerts.",
    },
    {
      title: "7-Day Easy Exchange Policy",
      description: "If you are not completely enchanted, our courier will collect it hassle-free from your door.",
    },
  ],
  reviews: [
    {
      id: "rev-1",
      author: "Elena Rostova",
      location: "Verified Buyer",
      rating: 5,
      date: "3 days ago",
      variant: "Matte Alabaster",
      title: "The ceramic finish is genuinely museum grade",
      comment:
        "I was nervous ordering Cash on Delivery, but the driver was professional, let me check the box seal, and I paid in cash. The diffuser is heavy, quiet as a library, and looks stunning next to my lamp.",
      verified: true,
    },
    {
      id: "rev-2",
      author: "Marcus Vance",
      location: "Verified Buyer",
      rating: 5,
      date: "1 week ago",
      variant: "Nordic Charcoal",
      title: "Sleep quality improved noticeably",
      comment:
        "The ambient ring glow is gentle and doesn't glare at night. 2-3 drops of lavender oil runs for over 10 hours on intermittent mode. Arrived in just 2 days.",
      verified: true,
    },
    {
      id: "rev-3",
      author: "Sophia Chen",
      location: "Verified Buyer",
      rating: 5,
      date: "2 weeks ago",
      variant: "Sahara Sand",
      title: "Ordered the 2-pack for bedroom and living room",
      comment:
        "The bundle discount was generous and paying cash at the door gives so much peace of mind. Both diffusers work flawlessly.",
      verified: true,
    },
  ],
  faqs: [
    {
      question: "How does Cash on Delivery (COD) work?",
      answer:
        "Placing your order takes only 30 seconds: simply enter your delivery address and phone number in the form below. We will prepare your parcel and dispatch it via express courier. When the delivery driver arrives at your doorstep, you simply pay the exact cash amount.",
    },
    {
      question: "Do I need to enter any card or bank details online?",
      answer:
        "Never! You do not need to provide credit cards, debit cards, or banking information. You pay 100% in cash directly to the courier agent when they hand you your order.",
    },
    {
      question: "Can I inspect the parcel before paying?",
      answer:
        "Yes! Our courier partners permit external inspection of the tamper-evident packaging and delivery receipt before you complete payment.",
    },
    {
      question: "What if I am away when the courier arrives?",
      answer:
        "The courier will send an SMS and call your phone number prior to arrival. If you're unavailable, they will arrange a free re-delivery attempt at a convenient time for you.",
    },
    {
      question: "What happens if the item is damaged or defective?",
      answer:
        "All units are backed by our 7-Day Doorstep Replacement Guarantee and a 2-Year Manufacturer Warranty. If there is any defect, contact our support team and we will send a courier to exchange it at zero extra charge.",
    },
  ],
};
