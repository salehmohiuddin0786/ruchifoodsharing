'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { X, Clock, MapPin, Truck, CheckCircle2, ShieldCheck, AlertCircle } from 'lucide-react';

export default function OrderModal({ post, onClose }) {
  const { currentUser, bookPreOrder } = useApp();

  const [quantity, setQuantity] = useState(1);
  const [fulfillmentType, setFulfillmentType] = useState('pickup');
  const [deliveryAddress, setDeliveryAddress] = useState(currentUser.area + ', Hyderabad');
  const [paymentMethod, setPaymentMethod] = useState('upi');
  const [loading, setLoading] = useState(false);
  const [orderConfirmed, setOrderConfirmed] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  const remainingPlates = post.remaining_plates !== undefined ? post.remaining_plates : post.total_plates;
  const deliveryFee = fulfillmentType === 'delivery' ? parseFloat(post.delivery_fee || 35) : 0;
  const itemsTotal = parseFloat(post.price_per_plate) * quantity;
  const grandTotal = itemsTotal + deliveryFee;

  const handleBooking = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');

    const res = await bookPreOrder(post.id, quantity, fulfillmentType, deliveryAddress);
    setLoading(false);

    if (res.success) {
      setOrderConfirmed(res.order);
    } else {
      setErrorMessage(res.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-gray-100 animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="bg-[#174D36] text-white p-5 flex justify-between items-center">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider bg-[#F5A623] text-black px-2 py-0.5 rounded-full">
              Advance Order
            </span>
            <h2 className="text-lg font-black mt-1">{post.dish_name}</h2>
            <p className="text-xs text-[#A3E5B5]">Prepared by {post.cook_name} in {post.area}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 transition text-white"
          >
            <X size={20} />
          </button>
        </div>

        {orderConfirmed ? (
          /* Confirmation Screen */
          <div className="p-6 text-center space-y-4">
            <div className="w-16 h-16 bg-emerald-100 text-[#174D36] rounded-full flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 size={36} />
            </div>
            <h3 className="text-xl font-black text-gray-900">Pre-Order Confirmed!</h3>
            <p className="text-xs text-gray-600 max-w-sm mx-auto">
              Your reservation for <strong>{quantity} plate(s)</strong> has been secured on the server.
              The cook will begin preparation as scheduled.
            </p>

            <div className="bg-[#FFF9EE] p-4 rounded-2xl border border-[#F5A623]/30 text-xs text-left space-y-2">
              <div className="flex justify-between border-b border-gray-200 pb-1.5">
                <span className="text-gray-500">Order ID:</span>
                <span className="font-mono font-bold">{orderConfirmed.id}</span>
              </div>
              <div className="flex justify-between border-b border-gray-200 pb-1.5">
                <span className="text-gray-500">Customer Slot:</span>
                <span className="font-bold text-[#174D36]">Occupied ({post.active_customer_bookings_count + 1} of 4)</span>
              </div>
              <div className="flex justify-between border-b border-gray-200 pb-1.5">
                <span className="text-gray-500">Total Paid:</span>
                <span className="font-black text-[#174D36]">₹{grandTotal} ({paymentMethod.toUpperCase()})</span>
              </div>
              <div className="flex justify-between pt-1">
                <span className="text-gray-500">Fulfillment:</span>
                <span className="font-semibold capitalize">{fulfillmentType}</span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-full py-3 bg-[#174D36] text-white font-bold rounded-xl shadow-md hover:bg-[#0F3826] transition text-sm"
            >
              Done & View In My Dashboard
            </button>
          </div>
        ) : (
          /* Booking Form */
          <form onSubmit={handleBooking} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
            {/* Rule Callout Banner */}
            <div className="bg-[#FFF9EE] p-3 rounded-2xl border border-[#F5A623]/40 text-xs text-gray-700 space-y-1">
              <div className="font-bold text-[#174D36] flex items-center gap-1.5">
                <ShieldCheck size={14} className="text-[#F5A623]" />
                <span>RUCHI Quality Assurance Rule:</span>
              </div>
              <p className="text-[11px] leading-relaxed text-gray-600">
                To guarantee hygienic, authentic home-kitchen standards, each cooking session is strictly capped at <strong>4 distinct customer bookings</strong>. You can book multiple plates in this order.
              </p>
            </div>

            {errorMessage && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-start gap-2">
                <AlertCircle size={16} className="shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Quantity Selector */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">
                Number of Plates (Available: {remainingPlates})
              </label>
              <div className="flex items-center gap-3">
                <div className="flex items-center border border-gray-300 rounded-xl overflow-hidden bg-gray-50">
                  <button
                    type="button"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-4 py-2 font-black text-gray-600 hover:bg-gray-200"
                  >
                    -
                  </button>
                  <span className="px-4 py-2 font-black text-sm text-gray-900 bg-white">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQuantity(Math.min(remainingPlates, quantity + 1))}
                    className="px-4 py-2 font-black text-gray-600 hover:bg-gray-200"
                  >
                    +
                  </button>
                </div>
                <span className="text-xs text-gray-500">
                  ₹{post.price_per_plate} × {quantity} = <strong>₹{itemsTotal}</strong>
                </span>
              </div>
            </div>

            {/* Fulfillment Type */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">
                Fulfillment Preference
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setFulfillmentType('pickup')}
                  className={`py-2.5 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition ${
                    fulfillmentType === 'pickup'
                      ? 'border-[#174D36] bg-[#E8F5EC] text-[#174D36]'
                      : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <MapPin size={14} />
                  <span>Self Pickup (Free)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setFulfillmentType('delivery')}
                  disabled={!post.delivery_available}
                  className={`py-2.5 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition ${
                    fulfillmentType === 'delivery'
                      ? 'border-[#174D36] bg-[#E8F5EC] text-[#174D36]'
                      : !post.delivery_available
                      ? 'border-gray-100 bg-gray-50 text-gray-300 cursor-not-allowed'
                      : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <Truck size={14} />
                  <span>Delivery (+₹{post.delivery_fee || 35})</span>
                </button>
              </div>
            </div>

            {fulfillmentType === 'delivery' && (
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Delivery Address in Hyderabad
                </label>
                <input
                  type="text"
                  required
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                  placeholder="Street, Landmark, Apartment number..."
                  className="w-full text-xs p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#174D36]"
                />
              </div>
            )}

            {/* Payment Method */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">
                Payment Option
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('upi')}
                  className={`py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 ${
                    paymentMethod === 'upi'
                      ? 'border-[#174D36] bg-[#E8F5EC] text-[#174D36] font-bold'
                      : 'border-gray-200 text-gray-600'
                  }`}
                >
                  <span>⚡ Instant UPI</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod('cash_on_pickup')}
                  className={`py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 ${
                    paymentMethod === 'cash_on_pickup'
                      ? 'border-[#174D36] bg-[#E8F5EC] text-[#174D36] font-bold'
                      : 'border-gray-200 text-gray-600'
                  }`}
                >
                  <span>💵 Cash on Handover</span>
                </button>
              </div>
            </div>

            {/* Price Breakdown */}
            <div className="bg-gray-50 p-3.5 rounded-2xl border border-gray-200 text-xs space-y-1.5">
              <div className="flex justify-between text-gray-600">
                <span>Meal Subtotal ({quantity} plate(s)):</span>
                <span>₹{itemsTotal}</span>
              </div>
              {fulfillmentType === 'delivery' && (
                <div className="flex justify-between text-gray-600">
                  <span>Local Delivery Fee:</span>
                  <span>₹{deliveryFee}</span>
                </div>
              )}
              <div className="flex justify-between text-emerald-700 font-medium">
                <span>RUCHI Community Platform Fee:</span>
                <span className="font-bold">₹0 (Free Pilot)</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-gray-200 font-extrabold text-gray-900 text-sm">
                <span>Total Payable:</span>
                <span className="text-[#174D36] text-base">₹{grandTotal}</span>
              </div>
            </div>

            {/* Confirm Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-[#174D36] hover:bg-[#0F3826] text-white font-extrabold rounded-2xl shadow-lg transition active:scale-98 disabled:opacity-50 text-sm flex items-center justify-center gap-2"
            >
              {loading ? 'Validating Stock & Server Cutoff...' : `Confirm Pre-Order (₹${grandTotal})`}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
