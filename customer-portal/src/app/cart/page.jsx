'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { curryRiceCustomerApi } from '@/lib/api';
import {
  ShoppingCart,
  Trash2,
  Plus,
  Minus,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Truck,
  Package,
  Clock,
  MapPin,
  Sparkles,
  Lock,
  Tag,
  Check,
  Bike,
  Zap,
} from 'lucide-react';

export default function CartCheckoutPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { items, updateQuantity, removeFromCart, clearCart, subtotal, cartCount } = useCart();

  // Fulfillment: 'PICKUP', 'DELIVERY', or 'RAPIDO'
  const [fulfillmentType, setFulfillmentType] = useState('PICKUP');
  const [deliveryAddress, setDeliveryAddress] = useState(
    user?.profile?.default_delivery_address || ''
  );
  const [deliveryPhone, setDeliveryPhone] = useState(user?.phone || '');
  const [orderType, setOrderType] = useState('INSTANT'); // 'INSTANT' or 'ADVANCE'
  const [scheduledTime, setScheduledTime] = useState('');
  const [customerNote, setCustomerNote] = useState('');

  // Promo code
  const [promoCode, setPromoCode] = useState('');
  const [appliedPromo, setAppliedPromo] = useState(null);
  const [promoError, setPromoError] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [orderPlacedData, setOrderPlacedData] = useState(null);

  // Delivery fee calculation
  const deliveryFee =
    fulfillmentType === 'RAPIDO' ? 45.0 : fulfillmentType === 'DELIVERY' ? 35.0 : 0.0;

  const discountAmount = appliedPromo
    ? Math.round((subtotal * appliedPromo.percent) / 100)
    : 0;

  const grandTotal = Math.max(0, subtotal - discountAmount + deliveryFee);

  const handleApplyPromo = (e) => {
    e.preventDefault();
    setPromoError('');
    const code = promoCode.trim().toUpperCase();
    if (code === 'RUCHI15') {
      setAppliedPromo({ code: 'RUCHI15', percent: 15 });
    } else if (code === 'WELCOME20') {
      setAppliedPromo({ code: 'WELCOME20', percent: 20 });
    } else {
      setPromoError('Invalid promo code. Try RUCHI15 or WELCOME20.');
    }
  };

  const handleCheckout = async (e) => {
    e.preventDefault();
    setError('');

    if (!user) {
      router.push('/auth/login?redirect=/cart');
      return;
    }

    if (items.length === 0) {
      setError('Your cart is empty.');
      return;
    }

    if (
      (fulfillmentType === 'DELIVERY' || fulfillmentType === 'RAPIDO') &&
      !deliveryAddress.trim()
    ) {
      setError('Please provide a complete delivery address.');
      return;
    }

    setLoading(true);
    try {
      const orderPayload = {
        items: items.map((i) => ({ itemId: i.id, quantity: i.quantity })),
        fulfillmentType: fulfillmentType === 'RAPIDO' ? 'DELIVERY' : fulfillmentType,
        deliveryService: fulfillmentType === 'RAPIDO' ? 'RAPIDO_EXPRESS' : 'STANDARD',
        deliveryAddress:
          fulfillmentType !== 'PICKUP'
            ? `${deliveryAddress} (Phone: ${deliveryPhone})`
            : null,
        orderType,
        scheduledTime: orderType === 'ADVANCE' && scheduledTime ? scheduledTime : null,
        customerNote:
          fulfillmentType === 'RAPIDO'
            ? `[RAPIDO EXPRESS BIKE DELIVERY] ${customerNote}`
            : customerNote,
      };

      const res = await curryRiceCustomerApi.placeOrder(orderPayload);
      clearCart();
      setOrderPlacedData({
        orderId: res.orderId,
        fulfillmentType,
      });
    } catch (err) {
      setError(err.message || 'Failed to place order. Some items may be out of stock.');
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0 && !orderPlacedData) {
    return (
      <div className="min-h-screen bg-[#0B132B] flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center space-y-6 p-8 rounded-3xl bg-[#1C2541]/70 border border-white/10 backdrop-blur-xl shadow-2xl">
          <div className="w-20 h-20 rounded-full bg-[#D97706]/20 text-[#D97706] flex items-center justify-center mx-auto shadow-[0_0_20px_rgba(217,119,6,0.3)]">
            <ShoppingCart className="w-9 h-9" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-black text-white">Your Cart is Empty</h2>
            <p className="text-xs text-slate-300">
              Browse our freshly cooked homemade meals, daily tiffins, and wholesome dishes.
            </p>
          </div>
          <Link
            href="/homemade-food"
            className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-[#D97706] to-[#F59E0B] text-black font-black text-xs uppercase tracking-wider rounded-2xl shadow-lg shadow-amber-500/25 hover:scale-105 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Explore Homemade Meals</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B132B] text-slate-100 py-6 px-4 sm:px-6 lg:px-8 pb-28 md:pb-16 relative">
      <div className="absolute top-0 right-[-10%] w-[500px] h-[500px] rounded-full bg-[#D97706]/10 blur-[130px] pointer-events-none" />
      <div className="absolute bottom-0 left-[-10%] w-[550px] h-[550px] rounded-full bg-[#5BC0DE]/10 blur-[140px] pointer-events-none" />

      <div className="max-w-4xl mx-auto space-y-6 relative z-10">
        
        {/* Top Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Link
              href="/homemade-food"
              className="w-10 h-10 rounded-2xl bg-[#1C2541] hover:bg-[#3A506B]/50 border border-white/10 flex items-center justify-center text-slate-300 hover:text-white transition"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-2xl font-black text-white">My Food Cart</h1>
              <p className="text-xs text-slate-400">{cartCount} items selected from local home kitchens</p>
            </div>
          </div>

          <button
            onClick={clearCart}
            className="text-xs font-bold text-slate-400 hover:text-rose-400 transition"
          >
            Clear All
          </button>
        </div>

        {error && (
          <div className="p-4 bg-rose-950/60 border border-rose-500/30 rounded-2xl flex items-center space-x-2 text-rose-300 text-xs font-semibold backdrop-blur-md">
            <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        {/* List of Cart Items */}
        <div className="rounded-3xl bg-[#1C2541]/75 border border-white/10 p-5 sm:p-6 shadow-2xl backdrop-blur-xl space-y-4">
          <div className="divide-y divide-white/5">
            {items.map((item) => (
              <div
                key={item.id}
                className="py-4 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="flex items-center space-x-3.5">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full p-1 bg-[#0B132B] border border-white/10 shadow-inner overflow-hidden flex-shrink-0">
                    <img
                      src={
                        item.image_url ||
                        'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=600&auto=format&fit=crop&q=80'
                      }
                      alt={item.food_name || item.name}
                      className="w-full h-full object-cover rounded-full"
                    />
                  </div>
                  <div className="space-y-0.5">
                    <h3 className="font-bold text-white text-sm">
                      {item.food_name || item.name}
                    </h3>
                    <p className="text-[11px] text-slate-400">
                      {item.serving_size || 'Standard Portion'}
                    </p>
                    <span className="text-xs font-black text-[#F4D6B0]">
                      ₹{item.price.toFixed(2)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end space-x-4">
                  <div className="flex items-center space-x-2 bg-[#0B132B]/80 px-2.5 py-1.5 rounded-2xl border border-white/10">
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="p-1 text-slate-300 hover:text-white"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-5 text-center font-black text-xs text-white">
                      {item.quantity}
                    </span>
                    <button
                      type="button"
                      disabled={item.quantity >= (item.stock_quantity || 99)}
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="p-1 text-slate-300 hover:text-white disabled:opacity-30"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <span className="font-black text-sm text-[#F4D6B0] min-w-[4.5rem] text-right">
                    ₹{(item.price * item.quantity).toFixed(2)}
                  </span>

                  <button
                    type="button"
                    onClick={() => removeFromCart(item.id)}
                    className="p-2 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Fulfillment Options with Rapido Option */}
        <div className="rounded-3xl bg-[#1C2541]/75 border border-white/10 p-5 sm:p-6 shadow-2xl backdrop-blur-xl space-y-4">
          <h2 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
            Choose Fulfillment Method
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* 1. Self Pickup */}
            <button
              type="button"
              onClick={() => setFulfillmentType('PICKUP')}
              className={`p-4 rounded-2xl border text-left transition flex flex-col justify-between ${
                fulfillmentType === 'PICKUP'
                  ? 'border-[#D97706] bg-[#3A506B]/30 shadow-lg'
                  : 'border-white/5 bg-[#0B132B]/50 hover:border-white/15'
              }`}
            >
              <div>
                <Package className="w-5 h-5 text-[#F4D6B0] mb-2" />
                <p className="text-xs font-black text-white">Self Pickup (Free)</p>
                <p className="text-[10px] text-slate-400 mt-0.5">Collect hot food directly from the cook</p>
              </div>
              <span className="text-[10px] text-emerald-400 font-bold mt-2">₹0 Fee</span>
            </button>

            {/* 2. Standard Doorstep Delivery */}
            <button
              type="button"
              onClick={() => setFulfillmentType('DELIVERY')}
              className={`p-4 rounded-2xl border text-left transition flex flex-col justify-between ${
                fulfillmentType === 'DELIVERY'
                  ? 'border-[#D97706] bg-[#3A506B]/30 shadow-lg'
                  : 'border-white/5 bg-[#0B132B]/50 hover:border-white/15'
              }`}
            >
              <div>
                <Truck className="w-5 h-5 text-[#5BC0DE] mb-2" />
                <p className="text-xs font-black text-white">Standard Delivery</p>
                <p className="text-[10px] text-slate-400 mt-0.5">Standard scheduled courier to doorstep</p>
              </div>
              <span className="text-[10px] text-[#F4D6B0] font-bold mt-2">+₹35 Delivery</span>
            </button>

            {/* 3. Rapido Express Bike Delivery */}
            <button
              type="button"
              onClick={() => setFulfillmentType('RAPIDO')}
              className={`p-4 rounded-2xl border text-left transition flex flex-col justify-between relative overflow-hidden ${
                fulfillmentType === 'RAPIDO'
                  ? 'border-[#D97706] bg-gradient-to-br from-[#D97706]/15 via-[#3A506B]/30 to-[#0B132B] shadow-lg ring-1 ring-[#D97706]'
                  : 'border-white/5 bg-[#0B132B]/50 hover:border-white/15'
              }`}
            >
              <div className="absolute top-2 right-2 bg-gradient-to-r from-[#D97706] to-[#F59E0B] text-black text-[9px] font-black px-1.5 py-0.5 rounded-full uppercase">
                Fastest
              </div>
              <div>
                <div className="flex items-center space-x-1.5 mb-2">
                  <Bike className="w-5 h-5 text-[#D97706]" />
                  <Zap className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                </div>
                <p className="text-xs font-black text-white">Rapido Express</p>
                <p className="text-[10px] text-slate-400 mt-0.5">Priority express bike courier</p>
              </div>
              <span className="text-[10px] text-[#F4D6B0] font-bold mt-2">+₹45 Delivery</span>
            </button>
          </div>

          {/* Delivery Address if Delivery or Rapido */}
          {(fulfillmentType === 'DELIVERY' || fulfillmentType === 'RAPIDO') && (
            <div className="space-y-3 pt-2">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">
                  {fulfillmentType === 'RAPIDO' ? 'Rapido Drop-off Address' : 'Delivery Address'}
                </label>
                <input
                  type="text"
                  required
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                  placeholder="Flat/House No, Building Name, Street & Landmark"
                  className="w-full p-3 rounded-2xl bg-[#0B132B]/80 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#D97706]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">
                  Contact Phone for Rider / Driver
                </label>
                <input
                  type="tel"
                  value={deliveryPhone}
                  onChange={(e) => setDeliveryPhone(e.target.value)}
                  placeholder="Primary contact phone number"
                  className="w-full p-3 rounded-2xl bg-[#0B132B]/80 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#D97706]"
                />
              </div>
            </div>
          )}
        </div>

        {/* Promo Code Box */}
        <div className="rounded-3xl bg-[#1C2541]/75 border border-white/10 p-4 sm:p-5 shadow-xl backdrop-blur-xl">
          <form onSubmit={handleApplyPromo} className="flex items-center gap-2">
            <div className="relative flex-1">
              <Tag className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value)}
                placeholder="Enter Promo Code (e.g. RUCHI15, WELCOME20)"
                className="w-full pl-10 pr-3 py-2.5 rounded-2xl bg-[#0B132B]/80 border border-white/10 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-[#D97706] uppercase font-mono"
              />
            </div>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-[#D97706] to-[#F59E0B] text-black font-black text-xs uppercase tracking-wider shadow hover:scale-105 active:scale-95 transition"
            >
              Apply
            </button>
          </form>

          {appliedPromo && (
            <p className="mt-2 text-xs text-emerald-400 font-bold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Coupon {appliedPromo.code} applied ({appliedPromo.percent}% OFF)!</span>
            </p>
          )}

          {promoError && (
            <p className="mt-2 text-xs text-rose-400 font-bold">{promoError}</p>
          )}
        </div>

        {/* Price Breakdown & Proceed to Checkout */}
        <div className="rounded-3xl bg-[#1C2541]/85 border border-white/10 p-5 sm:p-6 shadow-2xl backdrop-blur-xl space-y-4">
          <div className="space-y-2.5 text-xs text-slate-300">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span className="font-bold text-white">₹{subtotal.toFixed(2)}</span>
            </div>

            {appliedPromo && (
              <div className="flex justify-between text-emerald-400 font-bold">
                <span>Discount ({appliedPromo.percent}%)</span>
                <span>- ₹{discountAmount.toFixed(2)}</span>
              </div>
            )}

            <div className="flex justify-between items-center">
              <span>
                Fulfillment ({fulfillmentType === 'RAPIDO' ? 'Rapido Express' : fulfillmentType === 'DELIVERY' ? 'Standard Delivery' : 'Self Pickup'})
              </span>
              <span className="font-bold text-white">
                {deliveryFee === 0 ? 'FREE' : `₹${deliveryFee.toFixed(2)}`}
              </span>
            </div>

            <div className="pt-3 border-t border-white/10 flex justify-between items-baseline text-base sm:text-lg font-black text-white">
              <span>Total Amount</span>
              <span className="text-xl sm:text-2xl text-[#F4D6B0]">
                ₹{grandTotal.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Golden Proceed to Checkout Button */}
          <button
            onClick={handleCheckout}
            disabled={loading}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#D97706] via-[#F59E0B] to-[#D97706] hover:from-[#B45309] hover:to-[#D97706] text-black font-black text-xs sm:text-sm uppercase tracking-wider shadow-lg shadow-amber-500/30 flex items-center justify-center gap-2 transition active:scale-[0.98] disabled:opacity-50"
          >
            <Lock className="w-4 h-4" />
            <span>
              {loading
                ? 'Confirming Order...'
                : fulfillmentType === 'RAPIDO'
                ? 'Confirm & Dispatch with Rapido'
                : 'Confirm & Place Order'}
            </span>
          </button>
        </div>

      </div>

      {/* Celebration Modal: Order Placed */}
      {orderPlacedData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="w-full max-w-sm rounded-3xl bg-[#1C2541] border border-white/10 p-6 text-center space-y-4 shadow-2xl">
            <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-[#D97706] to-[#F59E0B] text-black flex items-center justify-center mx-auto shadow-[0_0_25px_rgba(217,119,6,0.6)]">
              <Check className="w-8 h-8 stroke-[3]" />
            </div>

            <div className="space-y-1">
              <h3 className="text-2xl font-black text-white">Order Confirmed!</h3>
              <p className="text-xs text-slate-300">
                {orderPlacedData.fulfillmentType === 'RAPIDO'
                  ? 'Your order has been assigned to a Rapido bike rider. Fresh food is on its way!'
                  : 'Thank you for your order. The home cook is preparing your delicious meal.'}
              </p>
            </div>

            <div className="py-2 px-3 rounded-xl bg-[#0B132B]/80 border border-white/10 text-xs font-mono text-[#F4D6B0]">
              Order ID: #{orderPlacedData.orderId || 'DF12345678'}
            </div>

            <div className="space-y-2 pt-2">
              <button
                onClick={() => {
                  setOrderPlacedData(null);
                  router.push('/orders');
                }}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-[#D97706] to-[#F59E0B] text-black font-black text-xs uppercase tracking-wider block transition shadow"
              >
                View My Orders
              </button>
              <button
                onClick={() => {
                  setOrderPlacedData(null);
                  router.push('/homemade-food');
                }}
                className="w-full py-2.5 rounded-2xl bg-[#3A506B]/40 hover:bg-[#3A506B]/60 text-slate-200 text-xs font-bold transition"
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
