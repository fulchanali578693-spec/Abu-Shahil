import React, { useState } from 'react';
import {
  AlertCircle,
  ArrowLeft,
  Banknote,
  CheckCircle2,
  Clock,
  KeyRound,
  Lock,
  LogOut,
  MapPin,
  Navigation,
  Phone,
  ShieldCheck,
  Truck,
  User,
} from 'lucide-react';
import { SyncedStoreState, syncedStore, DeliveryAgent } from '../lib/syncedStore';
import { OrderRecord, OrderStatus } from '../lib/supabase';

interface DeliveryBoyViewProps {
  state: SyncedStoreState;
  onExit: () => void;
}

export const DeliveryBoyView: React.FC<DeliveryBoyViewProps> = ({ state, onExit }) => {
  // Saved logged delivery agent ID
  const [loggedAgentId, setLoggedAgentId] = useState<string | null>(() => {
    return sessionStorage.getItem('dealkart_courier_logged_id');
  });

  // Login form states
  const [deliveryIdInput, setDeliveryIdInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [showCredentialsHelper, setShowCredentialsHelper] = useState(true);

  // Deliver & Collect Cash confirmation modal
  const [orderToDeliver, setOrderToDeliver] = useState<OrderRecord | null>(null);

  const activeAgent: DeliveryAgent | undefined = state.deliveryAgents.find(
    (a) => a.id === loggedAgentId
  );

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);

    const agent = syncedStore.authenticateDeliveryAgent(deliveryIdInput, passwordInput);
    if (agent) {
      setLoggedAgentId(agent.id);
      sessionStorage.setItem('dealkart_courier_logged_id', agent.id);
      setDeliveryIdInput('');
      setPasswordInput('');
    } else {
      setLoginError('Invalid Delivery ID or Password. Credentials are auto-generated from Admin Panel.');
    }
  };

  const handleLogout = () => {
    setLoggedAgentId(null);
    sessionStorage.removeItem('dealkart_courier_logged_id');
  };

  const handleQuickFill = (agent: DeliveryAgent) => {
    setDeliveryIdInput(agent.deliveryId);
    setPasswordInput(agent.password);
    setLoginError(null);
  };

  // Orders assigned to this courier, or pending unassigned orders in their zone
  const assignedOrders = activeAgent
    ? state.orders.filter(
        (o) => o.delivery_agent_id === activeAgent.id || (!o.delivery_agent_id && o.status === 'confirmed')
      )
    : [];

  const handleUpdateStatus = async (orderId: string | number, newStatus: OrderStatus) => {
    if (!activeAgent) return;
    await syncedStore.updateOrderStatus(orderId, newStatus, activeAgent.id);
    setActionSuccess(`Order #${orderId} updated to ${newStatus.replace('_', ' ')}!`);
    setTimeout(() => setActionSuccess(null), 3000);
  };

  const handleConfirmDeliverCash = async () => {
    if (!orderToDeliver || !activeAgent) return;
    await syncedStore.updateOrderStatus(orderToDeliver.id, 'delivered', activeAgent.id);
    setActionSuccess(`Delivered! Cash of ${state.currencySymbol}${(orderToDeliver.total_price || 79).toFixed(2)} collected from ${orderToDeliver.customer_name}.`);
    setOrderToDeliver(null);
    setTimeout(() => setActionSuccess(null), 4000);
  };

  // ==========================================
  // VIEW 1: COURIER LOGIN SCREEN
  // ==========================================
  if (!activeAgent) {
    return (
      <div className="min-h-screen bg-[#F5F5F7] flex flex-col justify-between text-stone-900">
        {/* Top Navbar */}
        <header className="bg-white/80 backdrop-blur-md border-b border-stone-200/80 px-4 sm:px-6 py-3.5">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <button
              onClick={onExit}
              className="p-1.5 rounded-lg text-stone-600 hover:text-stone-900 hover:bg-stone-100 transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-semibold"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Storefront</span>
            </button>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-stone-900 text-amber-400 flex items-center justify-center font-bold text-xs">
                <Truck className="w-4 h-4" />
              </div>
              <span className="font-bold text-sm tracking-tight text-stone-900">
                Courier Delivery System
              </span>
            </div>
            <div className="w-20" />
          </div>
        </header>

        {/* Login Form Container */}
        <main className="flex-1 flex items-center justify-center p-4 sm:p-6 my-8">
          <div className="max-w-md w-full space-y-6">
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/80 shadow-sm space-y-6">
              <div className="text-center space-y-2">
                <div className="w-14 h-14 rounded-2xl bg-amber-500/10 text-amber-700 flex items-center justify-center mx-auto mb-3 shadow-inner">
                  <Truck className="w-7 h-7" />
                </div>
                <h1 className="text-2xl font-bold font-serif-display text-stone-900">
                  Courier Delivery Portal
                </h1>
                <p className="text-xs text-stone-500 leading-relaxed">
                  Enter your auto-generated <strong>Delivery ID</strong> and <strong>Password</strong> provided by your administrator.
                </p>
              </div>

              {loginError && (
                <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs font-medium flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{loginError}</span>
                </div>
              )}

              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1.5">
                    Delivery ID (Auto-Generated)
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
                    <input
                      type="text"
                      required
                      value={deliveryIdInput}
                      onChange={(e) => setDeliveryIdInput(e.target.value)}
                      placeholder="e.g. DEL-101"
                      className="w-full pl-10 pr-3 py-2.5 text-xs sm:text-sm uppercase font-mono rounded-xl border border-stone-300 focus:outline-none focus:border-stone-900 tracking-wider"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1.5">
                    Courier Password
                  </label>
                  <div className="relative">
                    <KeyRound className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
                    <input
                      type="password"
                      required
                      value={passwordInput}
                      onChange={(e) => setPasswordInput(e.target.value)}
                      placeholder="Enter courier password"
                      className="w-full pl-10 pr-3 py-2.5 text-xs sm:text-sm rounded-xl border border-stone-300 focus:outline-none focus:border-stone-900"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs sm:text-sm rounded-xl transition-all shadow-sm cursor-pointer flex items-center justify-center gap-2"
                >
                  <Lock className="w-4 h-4 text-amber-400" />
                  <span>Sign In as Delivery Boy</span>
                </button>
              </form>
            </div>

            {/* Helper Card showing auto-generated courier credentials for fast testing */}
            {showCredentialsHelper && state.deliveryAgents.length > 0 && (
              <div className="bg-amber-50/70 border border-amber-200/80 rounded-2xl p-4 sm:p-5 text-xs space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-amber-950 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-amber-700" />
                    <span>Active Couriers (Auto-Generated by Admin)</span>
                  </span>
                  <button
                    onClick={() => setShowCredentialsHelper(false)}
                    className="text-[11px] text-amber-700 hover:underline cursor-pointer"
                  >
                    Dismiss
                  </button>
                </div>
                <p className="text-[11px] text-amber-800 leading-relaxed">
                  Admins can add new delivery boys with auto-generated credentials anytime in the <strong>Admin Dashboard → Delivery Boys</strong> tab. Click any courier below to autofill:
                </p>
                <div className="space-y-2 pt-1">
                  {state.deliveryAgents.map((agent) => (
                    <div
                      key={agent.id}
                      onClick={() => handleQuickFill(agent)}
                      className="bg-white p-2.5 rounded-xl border border-amber-200/60 hover:border-amber-400 flex items-center justify-between cursor-pointer transition-all hover:shadow-2xs group"
                    >
                      <div>
                        <div className="font-bold text-stone-900">{agent.name}</div>
                        <div className="text-[11px] text-stone-500">{agent.zone} · {agent.vehicle}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-mono text-amber-900 font-bold bg-amber-50 px-2 py-0.5 rounded text-[11px] group-hover:bg-amber-100">
                          {agent.deliveryId}
                        </div>
                        <div className="text-[10px] text-stone-400 font-mono mt-0.5">
                          Pass: {agent.password}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </main>

        {/* Footer */}
        <footer className="text-center py-4 text-xs text-stone-400">
          {state.appName} Courier Dispatch & Logistics System · Connected to Supabase
        </footer>
      </div>
    );
  }

  // ==========================================
  // VIEW 2: LOGGED-IN COURIER WORKSPACE
  // ==========================================
  return (
    <div className="min-h-screen bg-[#F5F5F7] text-stone-900 pb-16">
      {/* Top Apple-Style Glass Navbar */}
      <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-stone-200/80 px-4 sm:px-6 py-3.5">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={onExit}
              className="p-1.5 rounded-lg text-stone-600 hover:text-stone-900 hover:bg-stone-100 transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-semibold"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Storefront</span>
            </button>
            <div className="h-4 w-px bg-stone-300 hidden sm:block" />
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-stone-900 text-amber-400 flex items-center justify-center font-bold text-xs">
                <Truck className="w-4 h-4" />
              </div>
              <span className="font-bold text-sm tracking-tight text-stone-900 hidden sm:inline">
                Courier Portal
              </span>
            </div>
          </div>

          {/* Courier Info & Log Out */}
          <div className="flex items-center gap-3">
            <div className="text-right">
              <span className="text-xs font-bold text-stone-900 block leading-tight">
                {activeAgent.name}
              </span>
              <span className="text-[10px] text-amber-700 font-mono font-bold">
                ID: {activeAgent.deliveryId}
              </span>
            </div>
            <button
              onClick={handleLogout}
              className="p-2 rounded-lg text-stone-500 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
              title="Log Out of Courier Account"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Courier Workspace */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 pt-6 space-y-6">
        {/* Toast / Notification */}
        {actionSuccess && (
          <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900 text-xs font-medium flex items-center gap-2 animate-in fade-in duration-200">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{actionSuccess}</span>
          </div>
        )}

        {/* Courier KPI Card (Light Apple Style) */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-stone-200/80 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-100">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
                  Active Dispatch Courier
                </span>
                <span className="px-2 py-0.5 rounded-full bg-stone-900 text-amber-300 font-mono font-bold text-[10px]">
                  {activeAgent.deliveryId}
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-stone-900 mt-1">
                {activeAgent.name}
              </h1>
              <p className="text-xs text-stone-500 mt-0.5">
                Assigned Route: <span className="font-semibold text-stone-700">{activeAgent.zone}</span> · Vehicle: <span className="font-semibold text-stone-700">{activeAgent.vehicle}</span> · Phone: {activeAgent.phone}
              </p>
            </div>

            <div className="flex items-center gap-2 bg-emerald-50 text-emerald-800 px-3 py-1.5 rounded-xl border border-emerald-200/80 text-xs font-bold self-start sm:self-auto">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              <span>Active on Route</span>
            </div>
          </div>

          {/* Courier Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-1">
            <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-stone-200/60">
              <span className="text-xs text-stone-500 block">Assigned Parcels</span>
              <span className="text-2xl sm:text-3xl font-black tabular-nums text-stone-900 font-serif-display">
                {assignedOrders.length}
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/60">
              <span className="text-xs text-amber-800 block font-medium">Cash in Hand</span>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl sm:text-3xl font-black tabular-nums text-amber-950 font-serif-display">
                  {state.currencySymbol}{activeAgent.cashCollectedToday.toFixed(2)}
                </span>
                <span className="text-[11px] text-amber-700">collected</span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-stone-200/60 col-span-2 sm:col-span-1">
              <span className="text-xs text-stone-500 block">Pending Doorstep Handover</span>
              <span className="text-2xl sm:text-3xl font-black tabular-nums text-stone-900 font-serif-display">
                {assignedOrders.filter((o) => o.status !== 'delivered').length} Parcels
              </span>
            </div>
          </div>
        </div>

        {/* Assigned Parcels List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-stone-900 flex items-center gap-2">
              <Navigation className="w-5 h-5 text-amber-600" />
              <span>Assigned Deliveries ({assignedOrders.length})</span>
            </h2>
            <span className="text-xs text-stone-500">Live Delivery Route</span>
          </div>

          {assignedOrders.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-3xl border border-stone-200/80 space-y-3">
              <div className="w-12 h-12 rounded-full bg-stone-100 flex items-center justify-center mx-auto text-stone-400">
                <Truck className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-stone-800 text-sm">No Parcels Assigned Currently</h3>
              <p className="text-xs text-stone-500 max-w-sm mx-auto">
                Orders assigned by the Administrator will appear here in real time.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {assignedOrders.map((order) => {
                const isDelivered = order.status === 'delivered';
                const isCod = !order.payment_method || order.payment_method.toLowerCase().includes('cod') || order.payment_method.toLowerCase().includes('cash');

                return (
                  <div
                    key={order.id}
                    className={`bg-white rounded-3xl p-5 sm:p-6 border transition-all space-y-4 ${
                      isDelivered ? 'border-emerald-200 bg-emerald-50/20' : 'border-stone-200/80 shadow-xs'
                    }`}
                  >
                    {/* Header Row */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-stone-100">
                      <div className="flex items-center gap-3">
                        <span className="px-2.5 py-1 rounded-lg bg-stone-100 font-mono text-xs font-bold text-stone-800">
                          Order #{order.id}
                        </span>
                        <span className="text-xs text-stone-400">
                          {order.created_at ? new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Recent'}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span
                          className={`text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                            order.status === 'delivered'
                              ? 'bg-emerald-100 text-emerald-800'
                              : order.status === 'out_for_delivery'
                              ? 'bg-amber-100 text-amber-900'
                              : 'bg-blue-100 text-blue-800'
                          }`}
                        >
                          {order.status.replace('_', ' ')}
                        </span>
                      </div>
                    </div>

                    {/* Customer & Address Details */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-stone-400" />
                          <span className="font-bold text-sm text-stone-900">{order.customer_name}</span>
                        </div>

                        <div className="flex items-start gap-2 text-xs text-stone-600">
                          <MapPin className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                          <div>
                            <span className="font-medium text-stone-800 block">{order.address}</span>
                            <span className="text-stone-500">{order.city}, {order.country || 'USA'}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 text-xs">
                          <Phone className="w-4 h-4 text-emerald-600" />
                          <a
                            href={`tel:${order.phone}`}
                            className="font-bold text-emerald-700 hover:underline"
                          >
                            {order.phone} (Call Customer)
                          </a>
                        </div>
                      </div>

                      {/* Package & Payment Summary */}
                      <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200/60 space-y-2 text-xs">
                        <div className="flex justify-between items-start">
                          <span className="text-stone-500">Package:</span>
                          <span className="font-bold text-stone-900 text-right truncate max-w-[200px]">
                            {order.product_name}
                          </span>
                        </div>

                        <div className="flex justify-between">
                          <span className="text-stone-500">Variant & Qty:</span>
                          <span className="font-medium text-stone-800">
                            {order.product_variant || 'Default'} × {order.quantity || 1}
                          </span>
                        </div>

                        <div className="flex justify-between items-center pt-2 border-t border-stone-200/60">
                          <span className="font-bold text-stone-700">
                            {isCod ? 'Cash to Collect (COD):' : 'Payment Status:'}
                          </span>
                          <span
                            className={`font-black text-sm tabular-nums ${
                              isCod ? 'text-amber-950 font-serif-display' : 'text-emerald-700'
                            }`}
                          >
                            {isCod
                              ? `${state.currencySymbol}${(order.total_price || 79).toFixed(2)}`
                              : 'Paid Online / QR'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Courier Action Buttons */}
                    <div className="pt-2 flex flex-wrap gap-2 sm:justify-end">
                      {order.status !== 'out_for_delivery' && !isDelivered && (
                        <button
                          onClick={() => handleUpdateStatus(order.id, 'out_for_delivery')}
                          className="px-3.5 py-2 bg-amber-500/10 hover:bg-amber-500/20 text-amber-900 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
                        >
                          <Truck className="w-3.5 h-3.5 text-amber-700" />
                          <span>Mark Out for Delivery</span>
                        </button>
                      )}

                      {!isDelivered ? (
                        <button
                          onClick={() => setOrderToDeliver(order)}
                          className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold rounded-xl transition-all shadow-xs cursor-pointer flex items-center gap-1.5"
                        >
                          <Banknote className="w-3.5 h-3.5 text-amber-400" />
                          <span>
                            {isCod
                              ? `Deliver & Collect ${state.currencySymbol}${(order.total_price || 79).toFixed(2)}`
                              : 'Mark Delivered'}
                          </span>
                        </button>
                      ) : (
                        <div className="text-emerald-700 text-xs font-bold flex items-center gap-1.5 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          <span>Delivered & Handed Over</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      {/* Confirmation Modal: Deliver & Collect Cash */}
      {orderToDeliver && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
          <div
            onClick={() => setOrderToDeliver(null)}
            className="fixed inset-0 bg-stone-900/60 backdrop-blur-xs"
          />
          <div className="relative bg-white rounded-3xl p-6 sm:p-7 max-w-md w-full space-y-4 shadow-2xl border border-stone-200 z-10 animate-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-800 flex items-center justify-center mx-auto">
              <Banknote className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="text-xl font-bold font-serif-display text-stone-900">
                Confirm Doorstep Handover
              </h3>
              <p className="text-xs text-stone-500">
                Order #{orderToDeliver.id} for <strong>{orderToDeliver.customer_name}</strong>
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 text-center space-y-1">
              <span className="text-xs text-amber-800 font-semibold uppercase tracking-wider block">
                Cash Received from Customer:
              </span>
              <div className="text-3xl font-black tabular-nums text-amber-950 font-serif-display">
                {state.currencySymbol}{(orderToDeliver.total_price || 79).toFixed(2)}
              </div>
              <span className="text-[11px] text-amber-700 block">
                Cash will be added to {activeAgent.name}'s daily collection total.
              </span>
            </div>

            <div className="flex gap-2.5 pt-2">
              <button
                onClick={handleConfirmDeliverCash}
                className="flex-1 py-3 bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Confirm Payment & Handover</span>
              </button>
              <button
                onClick={() => setOrderToDeliver(null)}
                className="px-4 py-3 bg-stone-100 hover:bg-stone-200 text-stone-700 font-semibold text-xs rounded-xl transition-all cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
