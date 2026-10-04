import React, { useState } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  Lock,
  LogOut,
  Mail,
  MapPin,
  Package,
  Phone,
  ShieldCheck,
  User,
  UserPlus,
  X,
} from 'lucide-react';
import {
  customerLogin,
  customerRegister,
  customerLogout,
  CustomerUser,
  isCustomerRegistered,
} from '../lib/firebase';

interface CustomerAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentCustomer: CustomerUser | null;
  restrictionMessage?: string | null;
  onCustomerChange: (customer: CustomerUser | null) => void;
  onOpenCustomerPortal?: () => void;
}

export const CustomerAuthModal: React.FC<CustomerAuthModalProps> = ({
  isOpen,
  onClose,
  currentCustomer,
  restrictionMessage,
  onCustomerChange,
  onOpenCustomerPortal,
}) => {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');

  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);

  // Register form state
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regCity, setRegCity] = useState('');
  const [regAddress, setRegAddress] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regError, setRegError] = useState<string | null>(null);
  const [regSuccess, setRegSuccess] = useState<string | null>(null);

  if (!isOpen) return null;

  // HANDLE LOGIN:
  // Strict rule: "without register denied login"
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);

    if (!loginEmail.trim()) {
      setLoginError('Please enter your email address');
      return;
    }

    // Verify registration
    const isRegistered = isCustomerRegistered(loginEmail.trim());
    if (!isRegistered) {
      setLoginError(
        'Access Denied: No account found with this email. You must register an account first before logging in.'
      );
      return;
    }

    const res = customerLogin(loginEmail, loginPassword);
    if (res.success && res.user) {
      onCustomerChange(res.user);
      onClose();
    } else {
      setLoginError(res.error || 'Failed to authenticate');
    }
  };

  // HANDLE REGISTRATION:
  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setRegError(null);
    setRegSuccess(null);

    if (!regName.trim() || !regEmail.trim() || !regPhone.trim()) {
      setRegError('Please provide your name, email, and phone number');
      return;
    }

    if (isCustomerRegistered(regEmail.trim())) {
      setRegError('An account with this email is already registered. Please proceed to Login.');
      return;
    }

    const res = customerRegister({
      name: regName,
      email: regEmail,
      phone: regPhone,
      city: regCity,
      address: regAddress,
      password: regPassword,
    });

    if (res.success && res.user) {
      onCustomerChange(res.user);
      setRegSuccess('Account created successfully! You are now logged in.');
      setTimeout(() => {
        onClose();
      }, 1200);
    } else {
      setRegError(res.error || 'Failed to register');
    }
  };

  const handleLogout = () => {
    customerLogout();
    onCustomerChange(null);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-stone-900/40 backdrop-blur-xs transition-opacity"
      />

      {/* Modal Dialog (Apple Clean Light UI) */}
      <div className="relative bg-white rounded-2xl border border-stone-200/90 shadow-2xl w-full max-w-md overflow-hidden z-10 animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-6 pb-4 border-b border-stone-100 flex items-center justify-between bg-[#FAF8F5]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-700">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-stone-900 text-base font-serif-display">
                Customer Account
              </h3>
              <p className="text-xs text-stone-500">Track COD orders & doorstep deliveries</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-200/60 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* ALREADY LOGGED IN VIEW */}
        {currentCustomer ? (
          <div className="p-6 space-y-5">
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200/80 flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-100 border border-emerald-300 flex items-center justify-center text-emerald-700 shrink-0">
                <User className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700">
                  Signed In As Customer
                </span>
                <h4 className="font-bold text-stone-900 text-sm mt-0.5">{currentCustomer.name}</h4>
                <p className="text-xs text-stone-600">{currentCustomer.email}</p>
                <p className="text-xs text-stone-500 mt-1">{currentCustomer.phone}</p>
              </div>
            </div>

            <div className="space-y-2.5 pt-2">
              {onOpenCustomerPortal && (
                <button
                  onClick={() => {
                    onClose();
                    onOpenCustomerPortal();
                  }}
                  className="w-full py-2.5 px-4 bg-stone-900 hover:bg-stone-800 text-white rounded-lg text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Package className="w-4 h-4 text-amber-400" />
                  <span>View My Orders & Track Delivery</span>
                </button>
              )}

              <button
                onClick={handleLogout}
                className="w-full py-2.5 px-4 bg-stone-100 hover:bg-rose-50 hover:text-rose-700 text-stone-700 rounded-lg text-xs font-semibold transition-all border border-stone-200 flex items-center justify-center gap-2 cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>Log Out of Account</span>
              </button>
            </div>
          </div>
        ) : (
          /* NOT LOGGED IN: TABS FOR LOGIN & REGISTER */
          <div>
            {/* Segmented Control Tabs */}
            <div className="flex border-b border-stone-200 bg-stone-50/70 p-1 m-4 rounded-lg text-xs font-semibold">
              <button
                type="button"
                onClick={() => {
                  setActiveTab('login');
                  setLoginError(null);
                }}
                className={`flex-1 py-2 rounded-md transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  activeTab === 'login'
                    ? 'bg-white text-stone-900 shadow-2xs'
                    : 'text-stone-500 hover:text-stone-900'
                }`}
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Customer Login</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveTab('register');
                  setRegError(null);
                }}
                className={`flex-1 py-2 rounded-md transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  activeTab === 'register'
                    ? 'bg-white text-stone-900 shadow-2xs'
                    : 'text-stone-500 hover:text-stone-900'
                }`}
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Register Account</span>
              </button>
            </div>

            {/* TAB 1: LOGIN FORM */}
            {activeTab === 'login' && (
              <form onSubmit={handleLoginSubmit} className="p-5 pt-1 space-y-4">
                {restrictionMessage && (
                  <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-2.5">
                    <Lock className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                    <p className="leading-relaxed font-medium">{restrictionMessage}</p>
                  </div>
                )}

                {loginError && (
                  <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-900 text-xs flex items-start gap-2.5">
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    <div className="leading-relaxed">
                      <strong>Access Denied:</strong> {loginError}
                      <div className="mt-1">
                        <button
                          type="button"
                          onClick={() => {
                            setActiveTab('register');
                            setRegEmail(loginEmail);
                          }}
                          className="underline font-bold text-rose-950 hover:text-rose-800 cursor-pointer"
                        >
                          Click here to register your account →
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Customer Email Address <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-stone-400">
                      <Mail className="w-4 h-4" />
                    </div>
                    <input
                      type="email"
                      required
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      placeholder="your.email@example.com"
                      className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-lg border border-stone-300 focus:outline-none focus:border-stone-900"
                    />
                  </div>
                  <p className="text-[11px] text-stone-400 mt-1">
                    Only registered customers can log in. Without register, login is denied.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Password <span className="text-stone-400 font-normal">(Optional)</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-stone-400">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      type="password"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-lg border border-stone-300 focus:outline-none focus:border-stone-900"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 px-4 bg-stone-900 hover:bg-stone-800 active:scale-[0.99] text-white rounded-lg text-xs sm:text-sm font-bold transition-all shadow-xs cursor-pointer"
                >
                  Log In to Customer Account
                </button>
              </form>
            )}

            {/* TAB 2: REGISTER FORM */}
            {activeTab === 'register' && (
              <form onSubmit={handleRegisterSubmit} className="p-5 pt-1 space-y-3.5">
                {regError && (
                  <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-900 text-xs flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    <span>{regError}</span>
                  </div>
                )}

                {regSuccess && (
                  <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{regSuccess}</span>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Full Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    placeholder="e.g. Jessica Alba"
                    className="w-full px-3 py-2 text-xs sm:text-sm rounded-lg border border-stone-300 focus:outline-none focus:border-stone-900"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Email Address <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      placeholder="jessica@email.com"
                      className="w-full px-3 py-2 text-xs sm:text-sm rounded-lg border border-stone-300 focus:outline-none focus:border-stone-900"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Phone Number <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="tel"
                      required
                      value={regPhone}
                      onChange={(e) => setRegPhone(e.target.value)}
                      placeholder="+1 (555) 000-0000"
                      className="w-full px-3 py-2 text-xs sm:text-sm rounded-lg border border-stone-300 focus:outline-none focus:border-stone-900"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      City
                    </label>
                    <input
                      type="text"
                      value={regCity}
                      onChange={(e) => setRegCity(e.target.value)}
                      placeholder="e.g. Austin"
                      className="w-full px-3 py-2 text-xs sm:text-sm rounded-lg border border-stone-300 focus:outline-none focus:border-stone-900"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Password
                    </label>
                    <input
                      type="password"
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-3 py-2 text-xs sm:text-sm rounded-lg border border-stone-300 focus:outline-none focus:border-stone-900"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 px-4 bg-stone-900 hover:bg-stone-800 text-white rounded-lg text-xs sm:text-sm font-bold transition-all shadow-xs cursor-pointer mt-2"
                >
                  Create Account & Register
                </button>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
