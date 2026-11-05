'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { curryRiceCustomerApi } from '@/lib/api';
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  MapPin,
  Phone,
  User,
  ShoppingBag,
  RefreshCw,
  AlertCircle,
  ChefHat,
  PackageCheck,
  CheckCheck,
  XCircle,
} from 'lucide-react';

export default function OrderTrackingPage() {
  const params = useParams();
  const orderId = params.id;

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchOrder = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await curryRiceCustomerApi.getOrderById(orderId);
      setOrder(data.order);
    } catch (err) {
      setError(err.message || 'Failed to fetch order details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (orderId) fetchOrder();
  }, [orderId]);

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto py-24 text-center">
        <div className="w-10 h-10 border-4 border-gray-200 border-t-[#D97706] rounded-full animate-spin mx-auto mb-3"></div>
        <p className="text-xs text-gray-500 font-bold">Loading order status...</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="max-w-md mx-auto py-24 text-center space-y-4">
        <div className="p-4 bg-red-50 text-red-700 rounded-2xl text-xs font-bold border border-red-200">
          {error || 'Order not found'}
        </div>
        <Link href="/curry-rice" className="text-xs font-bold text-[#1C2541] underline inline-flex items-center space-x-1">
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Curry & Rice Store</span>
        </Link>
      </div>
    );
  }

  const steps = [
    { key: 'PENDING', label: 'Order Placed', icon: Clock },
    { key: 'ACCEPTED', label: 'Accepted by Cook', icon: CheckCircle2 },
    { key: 'PREPARING', label: 'In the Kitchen', icon: ChefHat },
    { key: 'READY_FOR_PICKUP', label: 'Ready for Collection', icon: PackageCheck },
    { key: 'COMPLETED', label: 'Delivered / Completed', icon: CheckCheck },
  ];

  const statusOrder = ['PENDING', 'ACCEPTED', 'PREPARING', 'READY_FOR_PICKUP', 'COMPLETED'];
  const currentStepIndex = statusOrder.indexOf(order.status);
  const isRejected = order.status === 'REJECTED';

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 pb-20">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <Link href="/curry-rice" className="p-2 hover:bg-gray-100 rounded-xl text-gray-500 transition">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-xl font-black text-gray-900">Order Tracking & Status</h1>
            <p className="text-xs text-gray-500 font-mono">Order Number: #{order.order_number}</p>
          </div>
        </div>

        <button
          onClick={fetchOrder}
          className="px-3 py-1.5 bg-white border border-gray-200 hover:bg-gray-50 text-xs font-semibold rounded-xl flex items-center space-x-1.5 text-gray-700 self-start sm:self-auto"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Live Refresh</span>
        </button>
      </div>

      {/* Status Progress Stepper */}
      <div className="bg-white rounded-3xl border border-gray-200 p-6 md:p-8 shadow-sm space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-gray-100">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Current Status:</span>
            <p className="text-lg font-black text-[#1C2541] mt-0.5">
              {isRejected
                ? 'Order Rejected by Cook'
                : order.status === 'READY_FOR_PICKUP'
                ? 'Packed & Ready for Collection!'
                : order.status.replace(/_/g, ' ')}
            </p>
          </div>

          <span
            className={`px-3 py-1 text-xs font-black rounded-xl uppercase tracking-wider shadow-sm ${
              isRejected
                ? 'bg-red-100 text-red-800'
                : order.status === 'COMPLETED'
                ? 'bg-emerald-100 text-emerald-800'
                : 'bg-amber-100 text-amber-900'
            }`}
          >
            {order.status}
          </span>
        </div>

        {/* Stepper Timeline */}
        {!isRejected ? (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 pt-2">
            {steps.map((st, idx) => {
              const Icon = st.icon;
              const isPastOrCurrent = currentStepIndex >= idx;
              const isCurrent = currentStepIndex === idx;

              return (
                <div
                  key={st.key}
                  className={`p-3.5 rounded-2xl border flex flex-col items-center text-center space-y-2 transition ${
                    isCurrent
                      ? 'border-[#D97706] bg-amber-50/50 shadow-sm ring-2 ring-[#D97706]/20'
                      : isPastOrCurrent
                      ? 'border-emerald-500 bg-emerald-50/40 text-emerald-950'
                      : 'border-gray-200 bg-gray-50/40 text-gray-400 opacity-60'
                  }`}
                >
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                      isCurrent
                        ? 'bg-[#D97706] text-white animate-pulse'
                        : isPastOrCurrent
                        ? 'bg-emerald-600 text-white'
                        : 'bg-gray-200 text-gray-400'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-[11px] font-black leading-snug">{st.label}</span>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-xs flex items-center space-x-2">
            <XCircle className="w-5 h-5 flex-shrink-0" />
            <span>
              This order was rejected: {order.rejection_reason || 'Cook kitchen at capacity'}. Any deducted items were restored to stock.
            </span>
          </div>
        )}
      </div>

      {/* Cook & Kitchen Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-3xl border border-gray-200 p-6 shadow-sm space-y-3">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Home Cook / Seller Details</p>
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-2xl bg-[#0B132B] text-[#F4D6B0] font-black flex items-center justify-center text-base">
              {order.cook_name?.charAt(0) || 'C'}
            </div>
            <div>
              <p className="text-sm font-black text-gray-900">{order.cook_name}</p>
              <p className="text-xs text-gray-500">{order.business_name || 'Home Kitchen'}</p>
            </div>
          </div>

          <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-xs">
            <div className="flex items-center space-x-1.5 text-gray-700">
              <Phone className="w-4 h-4 text-gray-400" />
              <span>{order.cook_phone || '+91 98480 12345'}</span>
            </div>
            <a
              href={`tel:${order.cook_phone}`}
              className="px-3 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-lg font-bold"
            >
              Call Kitchen
            </a>
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-gray-200 p-6 shadow-sm space-y-3">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Collection / Delivery Info</p>
          <div className="flex items-start space-x-2 text-xs text-gray-700">
            <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-gray-900">
                {order.fulfillment_type === 'DELIVERY' ? 'Doorstep Delivery' : 'Kitchen Self-Pickup'}
              </p>
              <p className="text-gray-500 mt-0.5">
                {order.fulfillment_type === 'DELIVERY'
                  ? order.delivery_address || 'Address provided at checkout'
                  : order.kitchen_address || 'Verified Home Kitchen Location'}
              </p>
            </div>
          </div>

          {order.customer_note && (
            <p className="text-[11px] text-amber-800 bg-amber-50 p-2.5 rounded-xl border border-amber-100">
              💬 Instructions: "{order.customer_note}"
            </p>
          )}
        </div>
      </div>

      {/* Ordered Items List */}
      <div className="bg-white rounded-3xl border border-gray-200 p-6 shadow-sm space-y-4">
        <p className="text-xs font-bold text-gray-800 uppercase tracking-wider">Ordered Items</p>

        <div className="divide-y divide-gray-100 border border-gray-100 rounded-2xl overflow-hidden">
          {order.items?.map((item) => (
            <div key={item.id} className="p-4 flex items-center justify-between text-xs bg-white">
              <div className="space-y-0.5">
                <span className="font-bold text-gray-900 text-sm">{item.item_name}</span>
                <p className="text-gray-500">
                  {item.item_category} • {item.serving_size}
                </p>
              </div>

              <div className="text-right">
                <span className="text-gray-600 font-medium">
                  {item.quantity} × ₹{parseFloat(item.unit_price).toFixed(2)}
                </span>
                <span className="block font-black text-gray-900 text-sm">
                  ₹{parseFloat(item.total_price).toFixed(2)}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Pricing Totals */}
        <div className="pt-2 flex flex-col items-end space-y-1.5 text-xs text-gray-600">
          <div className="flex justify-between w-64">
            <span>Fulfillment Fee:</span>
            <span className="font-bold text-gray-900">₹{parseFloat(order.delivery_fee).toFixed(2)}</span>
          </div>
          <div className="flex justify-between w-64 pt-2 border-t border-gray-100 text-sm font-black text-gray-900">
            <span>Total Paid:</span>
            <span className="text-[#D97706] text-base">₹{parseFloat(order.total_amount).toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
