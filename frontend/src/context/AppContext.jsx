'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { HYDERABAD_NEIGHBORHOODS } from '@/lib/constants';
import * as api from '@/lib/api';

const AppContext = createContext();

export const INITIAL_DEMO_USERS = [
  {
    id: 'usr_customer_1',
    name: 'Aarav Sharma',
    email: 'aarav.sharma@example.in',
    phone: '+91 98765 43210',
    role: 'customer',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=160&q=80',
    area: 'Madhapur',
    city: 'Hyderabad',
    latitude: 17.4483,
    longitude: 78.3915,
  },
  {
    id: 'usr_cook_1',
    name: 'Smt. Lakshmi Rao',
    email: 'lakshmi.rao@example.in',
    phone: '+91 98480 12345',
    role: 'cook',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=160&q=80',
    area: 'Banjara Hills',
    city: 'Hyderabad',
    latitude: 17.4156,
    longitude: 78.4357,
    isVerifiedCook: true,
    fssaiNumber: '23623032000845',
  },
  {
    id: 'usr_cook_2',
    name: 'Farhan & Zoya Ahmed',
    email: 'farhan.kitchen@example.in',
    phone: '+91 98850 67890',
    role: 'cook',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=160&q=80',
    area: 'Jubilee Hills',
    city: 'Hyderabad',
    latitude: 17.4319,
    longitude: 78.4073,
    isVerifiedCook: true,
    fssaiNumber: '23624011000912',
  },
  {
    id: 'usr_donor_1',
    name: 'Rajesh Varma (Kakatiya Caterers)',
    email: 'rajesh.caterers@example.in',
    phone: '+91 94400 55443',
    role: 'donor',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=160&q=80',
    area: 'Begumpet',
    city: 'Hyderabad',
    latitude: 17.4447,
    longitude: 78.4664,
  },
  {
    id: 'usr_admin_1',
    name: 'RUCHI Trust & Safety Admin',
    email: 'admin@ruchi-food.org',
    phone: '+91 90000 00001',
    role: 'admin',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=160&q=80',
    area: 'Hitec City',
    city: 'Hyderabad',
    latitude: 17.4435,
    longitude: 78.3772,
  },
];

export function AppProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(INITIAL_DEMO_USERS[0]);
  const [selectedNeighborhood, setSelectedNeighborhood] = useState(HYDERABAD_NEIGHBORHOODS[0]); // Madhapur
  const [radiusFilter, setRadiusFilter] = useState(10); // 2km, 5km, 10km
  const [dietaryFilter, setDietaryFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'preorders', 'donations', 'dashboard', 'admin', 'safety'

  const [preorders, setPreorders] = useState([]);
  const [donations, setDonations] = useState([]);
  const [orders, setOrders] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4500);
  };

  // Load live data from Node.js Express backend
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [preordersRes, donationsRes] = await Promise.all([
        api.fetchPreorders({
          userLat: selectedNeighborhood.latitude,
          userLon: selectedNeighborhood.longitude,
          dietary: dietaryFilter,
          category: categoryFilter === 'All' ? '' : categoryFilter,
          search: searchQuery,
        }),
        api.fetchDonations({
          dietary: dietaryFilter,
          category: categoryFilter === 'All' ? '' : categoryFilter,
          search: searchQuery,
        }),
      ]);

      if (preordersRes && preordersRes.success) {
        setPreorders(preordersRes.posts || []);
      }
      if (donationsRes && donationsRes.success) {
        setDonations(donationsRes.posts || []);
      }

      // Load user notifications
      if (currentUser && currentUser.id) {
        const notifRes = await api.fetchNotificationsApi(currentUser.id);
        if (notifRes && notifRes.success) {
          setNotifications(notifRes.notifications || []);
        }

        // Load customer or cook orders
        if (currentUser.role === 'customer') {
          const ordRes = await api.fetchCustomerOrdersApi(currentUser.id);
          if (ordRes && ordRes.success) setOrders(ordRes.orders || []);
        } else if (currentUser.role === 'cook') {
          const ordRes = await api.fetchCookOrdersApi(currentUser.id);
          if (ordRes && ordRes.success) setOrders(ordRes.orders || []);
        }
      }
    } catch (err) {
      console.error('Error loading API data:', err);
    } finally {
      setLoading(false);
    }
  }, [selectedNeighborhood, dietaryFilter, categoryFilter, searchQuery, currentUser]);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 12000); // Poll every 12s for real-time cutoff updates
    return () => clearInterval(interval);
  }, [loadData]);

  // Switch role between customer, cook, donor, admin, guest
  const switchRole = (role) => {
    const user = INITIAL_DEMO_USERS.find((u) => u.role === role);
    if (user) {
      setCurrentUser(user);
      const hood = HYDERABAD_NEIGHBORHOODS.find((h) => h.name.toLowerCase() === user.area.toLowerCase());
      if (hood) setSelectedNeighborhood(hood);
      showToast(`Switched view to ${user.name} (${role.toUpperCase()})`);
    } else if (role === 'guest') {
      setCurrentUser({
        id: 'usr_guest',
        name: 'Guest Visitor',
        role: 'guest',
        area: selectedNeighborhood.name,
        city: 'Hyderabad',
      });
      showToast('Browsing as Guest');
    }
  };

  // Facebook OAuth Login simulation
  const loginWithFacebook = (profile) => {
    const fbUser = {
      id: `usr_fb_${Date.now()}`,
      name: profile?.name || 'Priya Reddy (FB Verified)',
      email: profile?.email || 'priya.reddy@example.in',
      phone: '+91 99887 76655',
      role: 'customer',
      avatar: profile?.avatar || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=160&q=80',
      area: selectedNeighborhood.name,
      city: 'Hyderabad',
      latitude: selectedNeighborhood.latitude,
      longitude: selectedNeighborhood.longitude,
    };
    setCurrentUser(fbUser);
    showToast('Signed in securely via Facebook Login!');
  };

  // Phone OTP Login fallback
  const loginWithPhoneOtp = (phone) => {
    const phoneUser = {
      id: `usr_phone_${Date.now()}`,
      name: `User ${phone.slice(-4)}`,
      email: `user_${phone.slice(-4)}@ruchifood.in`,
      phone,
      role: 'customer',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=160&q=80',
      area: selectedNeighborhood.name,
      city: 'Hyderabad',
      latitude: selectedNeighborhood.latitude,
      longitude: selectedNeighborhood.longitude,
    };
    setCurrentUser(phoneUser);
    showToast(`Signed in with verified phone OTP (${phone})`);
  };

  // STRICT PRE-ORDER BOOKING HANDLER
  const bookPreOrder = async (postId, plateQuantity, fulfillmentType, deliveryAddress) => {
    if (currentUser.role === 'guest') {
      showToast('Please sign in with Facebook or Phone to book meals.', 'error');
      return { success: false, message: 'Please sign in first.' };
    }

    const payload = {
      customerId: currentUser.id,
      customerName: currentUser.name,
      customerPhone: currentUser.phone || '+91 98765 43210',
      plateQuantity: parseInt(plateQuantity, 10),
      fulfillmentType,
      deliveryAddress,
      paymentMethod: 'upi',
    };

    const res = await api.bookPreOrderApi(postId, payload);

    if (res && res.success) {
      showToast(res.message, 'success');
      loadData();
      return { success: true, order: res.order };
    } else {
      const errorMsg = res?.error || 'Order could not be confirmed.';
      showToast(errorMsg, 'error');
      return { success: false, message: errorMsg };
    }
  };

  // RESERVE FREE SURPLUS FOOD
  const reserveDonation = async (donationId, servings) => {
    if (currentUser.role === 'guest') {
      showToast('Please sign in to reserve free surplus food.', 'error');
      return { success: false, message: 'Please sign in first.' };
    }

    const res = await api.reserveDonationApi(donationId, {
      claimantId: currentUser.id,
      servings: parseInt(servings, 10),
    });

    if (res && res.success) {
      showToast(res.message, 'success');
      loadData();
      return { success: true };
    } else {
      const errorMsg = res?.error || 'Reservation could not be completed.';
      showToast(errorMsg, 'error');
      return { success: false, message: errorMsg };
    }
  };

  // CREATE PRE-ORDER (Cook)
  const createPreOrder = async (postData) => {
    const payload = {
      ...postData,
      cookId: currentUser.id,
      area: postData.area || selectedNeighborhood.name,
      latitude: selectedNeighborhood.latitude,
      longitude: selectedNeighborhood.longitude,
    };

    const res = await api.createPreOrderApi(payload);
    if (res && res.success) {
      showToast('Pre-order post created! 30-minute cutoff calculated and active.', 'success');
      loadData();
      return { success: true };
    } else {
      const err = res?.error || 'Failed to create post';
      showToast(err, 'error');
      return { success: false, message: err };
    }
  };

  // CREATE DONATION (Donor)
  const createDonation = async (donationData) => {
    const payload = {
      ...donationData,
      donorId: currentUser.id,
      area: donationData.area || selectedNeighborhood.name,
      latitude: selectedNeighborhood.latitude,
      longitude: selectedNeighborhood.longitude,
    };

    const res = await api.createDonationApi(payload);
    if (res && res.success) {
      showToast('Surplus food post published for free community claim!', 'success');
      loadData();
      return { success: true };
    } else {
      const err = res?.error || 'Failed to create donation';
      showToast(err, 'error');
      return { success: false, message: err };
    }
  };

  // CANCEL PRE-ORDER
  const cancelOrder = async (orderId) => {
    const res = await api.cancelOrderApi(orderId);
    if (res && res.success) {
      showToast(res.message, 'success');
      loadData();
      return { success: true };
    } else {
      showToast(res?.error || 'Failed to cancel order.', 'error');
      return { success: false };
    }
  };

  // UPDATE ORDER STATUS (Cook)
  const updateOrderStatus = async (orderId, newStatus) => {
    const res = await api.updateOrderStatusApi(orderId, newStatus);
    if (res && res.success) {
      showToast(`Order status updated to: ${newStatus.toUpperCase()}`, 'success');
      loadData();
    }
  };

  // SUBMIT TRUST & SAFETY REPORT
  const submitReport = async (targetType, targetId, targetTitle, reason) => {
    const res = await api.submitReportApi({
      reporterId: currentUser.id,
      targetType,
      targetId,
      targetTitle,
      reason,
    });
    if (res && res.success) {
      showToast('Report submitted for admin review.', 'success');
    }
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        selectedNeighborhood,
        setSelectedNeighborhood,
        radiusFilter,
        setRadiusFilter,
        dietaryFilter,
        setDietaryFilter,
        categoryFilter,
        setCategoryFilter,
        searchQuery,
        setSearchQuery,
        activeTab,
        setActiveTab,
        preorders,
        donations,
        orders,
        notifications,
        reports,
        loading,
        switchRole,
        loginWithFacebook,
        loginWithPhoneOtp,
        bookPreOrder,
        reserveDonation,
        createPreOrder,
        createDonation,
        cancelOrder,
        updateOrderStatus,
        submitReport,
        refreshData: loadData,
      }}
    >
      {children}
      {/* Toast Notification Container */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 max-w-md animate-bounce">
          <div
            className={`px-5 py-3 rounded-xl shadow-2xl flex items-center gap-3 border text-sm font-semibold ${
              toast.type === 'error'
                ? 'bg-red-50 text-red-900 border-red-300'
                : 'bg-ruchi-forest text-white border-ruchi-fresh'
            }`}
          >
            <span>{toast.type === 'error' ? '⚠️' : '✅'}</span>
            <span>{toast.message}</span>
          </div>
        </div>
      )}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
}
