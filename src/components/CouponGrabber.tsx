import React, { useState } from 'react';
import { Bell, Check, Copy, Sparkles, Tag, Ticket } from 'lucide-react';
import { syncedStore } from '../lib/syncedStore';

interface CouponGrabberProps {
  onCouponApplied: (msg: string) => void;
}

export const CouponGrabber: React.FC<CouponGrabberProps> = ({ onCouponApplied }) => {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const coupons = [
    {
      code: 'SAVE10',
      discount: '10% OFF',
      desc: 'Min. Order $50',
      badge: 'POPULAR',
      bg: 'bg-gradient-to-r from-purple-500/10 via-purple-500/5 to-purple-500/20 border-purple-300',
      text: 'text-purple-700',
    },
    {
      code: 'FREESHIP',
      discount: 'Free Shipping',
      desc: 'On Orders $35+',
      badge: 'ALL ORDERS',
      bg: 'bg-gradient-to-r from-teal-500/10 via-teal-500/5 to-teal-500/20 border-teal-300',
      text: 'text-teal-700',
    },
    {
      code: 'MEGA20',
      discount: '20% OFF',
      desc: 'Member Exclusive',
      badge: 'VIP DEALS',
      bg: 'bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-amber-500/20 border-amber-300',
      text: 'text-amber-800',
    },
  ];

  const handleApplyCoupon = (code: string) => {
    const res = syncedStore.applyCoupon(code);
    setCopiedCode(code);
    onCouponApplied(res.message);
    setTimeout(() => setCopiedCode(null), 2500);
  };

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (newsletterEmail) {
      setSubscribed(true);
      setTimeout(() => setSubscribed(false), 4000);
      setNewsletterEmail('');
    }
  };

  return (
    <section className="py-12 bg-white border-b border-stone-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Coupons Row */}
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Ticket className="w-5 h-5 text-amber-500" />
            <h3 className="text-xl sm:text-2xl font-black text-stone-900 tracking-tight">
              Grab Your Coupons
            </h3>
          </div>
          <p className="text-xs text-stone-500 mb-6">Stack Savings On Your Favorites!</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {coupons.map((c) => (
              <div
                key={c.code}
                className={`p-5 rounded-2xl border-2 border-dashed ${c.bg} flex items-center justify-between gap-4 transition-all hover:scale-[1.02] shadow-2xs`}
              >
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-white/90 text-stone-800 shadow-2xs">
                    {c.badge}
                  </span>
                  <div className={`text-xl font-black ${c.text} mt-1.5`}>
                    {c.discount}
                  </div>
                  <span className="text-xs text-stone-500">{c.desc}</span>
                </div>

                <button
                  onClick={() => handleApplyCoupon(c.code)}
                  className="px-4 py-2 bg-white hover:bg-stone-900 hover:text-white text-stone-900 rounded-xl text-xs font-black shadow-xs border border-stone-200 transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
                >
                  {copiedCode === c.code ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Applied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-stone-400" />
                      <span>Apply {c.code}</span>
                    </>
                  )}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Never Miss A Deal Again Newsletter Strip matching the template */}
        <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-[#170E33] via-[#261352] to-[#170E33] text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
          <div className="flex items-center gap-4 text-center md:text-left">
            <div className="w-14 h-14 rounded-2xl bg-amber-400 text-stone-950 flex items-center justify-center font-bold shrink-0 shadow-lg">
              <Bell className="w-7 h-7 fill-stone-950" />
            </div>
            <div>
              <h4 className="text-xl sm:text-2xl font-black text-white">Never Miss A Deal Again!</h4>
              <p className="text-xs sm:text-sm text-purple-200 mt-0.5">
                Get instant alerts and VIP flash discount drops on the hottest offers.
              </p>
            </div>
          </div>

          <form onSubmit={handleSubscribe} className="w-full md:w-auto flex items-center gap-2 max-w-md">
            <input
              type="email"
              required
              value={newsletterEmail}
              onChange={(e) => setNewsletterEmail(e.target.value)}
              placeholder="Enter your email"
              className="flex-1 px-4 py-3 bg-white/10 text-white placeholder:text-purple-300 rounded-full text-xs sm:text-sm border border-purple-500/30 focus:outline-none focus:border-amber-400"
            />
            <button
              type="submit"
              className="px-6 py-3 bg-[#CBF42C] hover:bg-[#b8e21e] text-stone-950 font-black text-xs sm:text-sm rounded-full transition-all shadow-md cursor-pointer whitespace-nowrap"
            >
              {subscribed ? 'Subscribed!' : 'Subscribe'}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
};
