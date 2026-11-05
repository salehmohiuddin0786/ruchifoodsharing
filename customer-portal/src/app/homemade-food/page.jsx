'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { customerApi, curryRiceCustomerApi } from '@/lib/api';
import { useCart } from '@/context/CartContext';
import { useFavourites } from '@/context/FavouritesContext';
import {
  UtensilsCrossed,
  Clock,
  MapPin,
  ShieldCheck,
  Search,
  Filter,
  Sparkles,
  Star,
  Plus,
  Minus,
  ShoppingCart,
  CheckCircle2,
  Heart,
  Share2,
  X,
  Bike,
  CookingPot,
  Flame,
  LayoutGrid,
  Calendar,
} from 'lucide-react';

export default function HomemadeFoodPage() {
  const { addToCart, cartCount, subtotal } = useCart();
  const { isFavourite, toggleFavourite } = useFavourites();

  const handleToggleFav = (e, item) => {
    if (e && e.stopPropagation) e.stopPropagation();
    const wasFav = isFavourite(item.id);
    toggleFavourite(item);
    setToastMessage(
      wasFav
        ? `Removed ${item.food_name || item.name} from Favourites`
        : `Added ${item.food_name || item.name} to Favourites! ❤️`
    );
    setTimeout(() => setToastMessage(''), 2500);
  };

  // State
  const [posts, setPosts] = useState([]);
  const [curryRiceItems, setCurryRiceItems] = useState([]);
  const [dietary, setDietary] = useState('all');
  const [area, setArea] = useState('all');
  const [selectedPicksCategory, setSelectedPicksCategory] = useState('ALL');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  // Quick View Modal
  const [quickViewItem, setQuickViewItem] = useState(null);
  const [selectedSize, setSelectedSize] = useState('Plate');
  const [modalQty, setModalQty] = useState(1);
  const [toastMessage, setToastMessage] = useState('');

  // Default meal picks fallback
  const defaultPicks = [
    {
      id: 'pick-1',
      food_name: 'Royal Dum Biryani Platter',
      partner_name: 'Chef Fatima Kitchen',
      food_category: 'RICE',
      dietary_type: 'NON_VEG',
      price: 189,
      serving_size: 'Plate (450g)',
      stock_quantity: 15,
      rating: 4.9,
      reviews_count: 142,
      description: 'Slow-cooked aromatic basmati rice layered with tender spiced chicken, saffron, and caramelized onions.',
      image_url: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=600&auto=format&fit=crop&q=80',
    },
    {
      id: 'pick-2',
      food_name: 'Velvet Butter Chicken Curry',
      partner_name: 'Aunty Sunita Homestyle',
      food_category: 'CURRY',
      dietary_type: 'NON_VEG',
      price: 169,
      serving_size: 'Bowl (350ml)',
      stock_quantity: 12,
      rating: 4.8,
      reviews_count: 98,
      description: 'Rich, creamy tomato gravy with velvety butter and succulent tandoori boneless chicken.',
      image_url: 'https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?w=600&auto=format&fit=crop&q=80',
    },
    {
      id: 'pick-3',
      food_name: 'Paneer Butter Masala + Jeera Rice',
      partner_name: 'Shree Krishna Rasoi',
      food_category: 'CURRY_RICE',
      dietary_type: 'VEG',
      price: 199,
      serving_size: 'Combo Platter',
      stock_quantity: 20,
      rating: 5.0,
      reviews_count: 210,
      description: 'Cottage cheese cubes simmered in a luscious cashew-tomato sauce, paired with cumin-scented basmati rice.',
      image_url: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=600&auto=format&fit=crop&q=80',
    },
    {
      id: 'pick-4',
      food_name: 'Homestyle Veg Thali Daily Meal',
      partner_name: 'Lakshmi Home Kitchen',
      food_category: 'DAILY_MEAL',
      dietary_type: 'VEG',
      price: 149,
      serving_size: 'Full Meal',
      stock_quantity: 18,
      rating: 4.9,
      reviews_count: 85,
      description: 'Wholesome balanced meal: 2 Phulkas, Dal Tadka, Seasonal Sabzi, Steamed Rice, and Sweet Kheer.',
      image_url: 'https://images.unsplash.com/photo-1610057099443-fde8c4d50f91?w=600&auto=format&fit=crop&q=80',
    },
    {
      id: 'pick-5',
      food_name: 'Spicy Roasted Mutton Curry',
      partner_name: 'Amma Kitchen',
      food_category: 'CURRY',
      dietary_type: 'NON_VEG',
      price: 249,
      serving_size: 'Bowl (400ml)',
      stock_quantity: 8,
      rating: 4.9,
      reviews_count: 76,
      description: 'Authentic fiery curry roasted with stone-ground peppercorns, star anise, and fresh coconut.',
      image_url: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=600&auto=format&fit=crop&q=80',
    },
    {
      id: 'pick-6',
      food_name: 'Dal Makhani + Garlic Naan Set',
      partner_name: 'Punjab Dhaba Home',
      food_category: 'CURRY_RICE',
      dietary_type: 'VEG',
      price: 179,
      serving_size: 'Combo Set',
      stock_quantity: 14,
      rating: 4.7,
      reviews_count: 112,
      description: 'Slow-simmered black lentils overnight with butter and fresh cream, served with 2 soft garlic naans.',
      image_url: 'https://images.unsplash.com/photo-1546833998-877b37c2e5c6?w=600&auto=format&fit=crop&q=80',
    },
  ];

  useEffect(() => {
    loadAllData();
  }, [dietary, area]);

  const loadAllData = async () => {
    try {
      setLoading(true);
      const params = {};
      if (dietary !== 'all') params.dietary = dietary;
      if (area !== 'all') params.area = area;
      if (search) params.search = search;

      const [pRes, crRes] = await Promise.allSettled([
        customerApi.getFoodPosts(params),
        curryRiceCustomerApi.getItems(params),
      ]);

      if (pRes.status === 'fulfilled') {
        setPosts(pRes.value?.posts || []);
      }

      if (crRes.status === 'fulfilled' && crRes.value?.items?.length) {
        setCurryRiceItems(crRes.value.items);
      } else {
        setCurryRiceItems(defaultPicks);
      }
    } catch (e) {
      console.error(e);
      setCurryRiceItems(defaultPicks);
    } finally {
      setLoading(false);
    }
  };

  const pickCategories = [
    { id: 'ALL', label: 'All Picks', icon: LayoutGrid },
    { id: 'CURRY', label: 'Curries', icon: CookingPot },
    { id: 'RICE', label: 'Rice Pots', icon: Flame },
    { id: 'CURRY_RICE', label: 'Combos', icon: Sparkles },
    { id: 'DAILY_MEAL', label: 'Daily Thalis', icon: UtensilsCrossed },
  ];

  const filteredPicks = curryRiceItems.filter((item) => {
    if (selectedPicksCategory !== 'ALL' && item.food_category !== selectedPicksCategory) {
      return false;
    }
    if (dietary !== 'all' && item.dietary_type !== dietary) {
      return false;
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        item.food_name?.toLowerCase().includes(q) ||
        item.partner_name?.toLowerCase().includes(q) ||
        item.description?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleOpenQuickView = (item) => {
    setQuickViewItem(item);
    setSelectedSize('Plate');
    setModalQty(1);
  };

  const handleCloseQuickView = () => {
    setQuickViewItem(null);
  };

  const handleAddToCartFromModal = () => {
    if (!quickViewItem) return;
    addToCart(quickViewItem, modalQty);
    setToastMessage(`Added ${modalQty}x ${quickViewItem.food_name} to cart!`);
    setTimeout(() => setToastMessage(''), 3000);
    handleCloseQuickView();
  };

  const handleQuickAdd = (e, item) => {
    e.stopPropagation();
    addToCart(item, 1);
    setToastMessage(`Added ${item.food_name} to cart!`);
    setTimeout(() => setToastMessage(''), 2500);
  };

  return (
    <div className="min-h-screen bg-[#0B132B] text-slate-100 py-8 px-4 sm:px-6 lg:px-8 space-y-10 pb-28 md:pb-16 relative">
      {/* Ambient background halos */}
      <div className="absolute top-0 left-[-10%] w-[500px] h-[500px] rounded-full bg-[#D97706]/10 blur-[130px] pointer-events-none" />
      <div className="absolute top-[40%] right-[-10%] w-[550px] h-[550px] rounded-full bg-[#5BC0DE]/10 blur-[140px] pointer-events-none" />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-24 right-4 sm:right-8 z-50 flex items-center space-x-2.5 px-5 py-3 rounded-2xl bg-[#1C2541]/95 border border-[#D97706]/50 shadow-2xl backdrop-blur-xl animate-bounce">
          <CheckCircle2 className="w-5 h-5 text-[#D97706]" />
          <span className="text-xs sm:text-sm font-bold text-white">{toastMessage}</span>
        </div>
      )}

      <div className="max-w-7xl mx-auto space-y-8 relative z-10">
        
        {/* Top Header & Filters */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 bg-[#3A506B]/40 border border-white/10 text-[#F4D6B0] text-[11px] font-bold rounded-full uppercase tracking-wider mb-2">
              <Sparkles className="w-3.5 h-3.5 text-[#D97706]" />
              <span>Homestyle Kitchens & Meals</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
              Homemade Meals & Daily Tiffins
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-xl">
              Fresh authentic dishes prepared in neighborhood home kitchens. Reserve advance cooking slots or order hot meal picks for express delivery.
            </p>
          </div>

          {/* Dietary & Service Area Filters */}
          <div className="flex flex-wrap items-center gap-2.5">
            <select
              value={dietary}
              onChange={(e) => setDietary(e.target.value)}
              className="px-3.5 py-2.5 bg-[#1C2541] border border-white/10 rounded-2xl text-xs font-semibold text-slate-200 focus:outline-none focus:border-[#D97706]"
            >
              <option value="all">All Diets</option>
              <option value="VEG">VEG (Vegetarian)</option>
              <option value="NON_VEG">NON_VEG (Non-Veg)</option>
              <option value="VEGAN">VEGAN</option>
              <option value="JAIN">JAIN</option>
            </select>

            <select
              value={area}
              onChange={(e) => setArea(e.target.value)}
              className="px-3.5 py-2.5 bg-[#1C2541] border border-white/10 rounded-2xl text-xs font-semibold text-slate-200 focus:outline-none focus:border-[#D97706]"
            >
              <option value="all">All Service Areas</option>
              <option value="Central Zone">Central Zone</option>
              <option value="North Zone">North Zone</option>
              <option value="South Zone">South Zone</option>
              <option value="East Zone">East Zone</option>
              <option value="West Zone">West Zone</option>
            </select>
          </div>
        </div>

        {/* ============================================================== */}
        {/* 1. ADVANCE HOMESTYLE BOOKINGS (NOW FIRST ON TOP AS REQUESTED)  */}
        {/* ============================================================== */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
                <span>Advance Homestyle Bookings</span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#5BC0DE]/20 text-[#5BC0DE] border border-[#5BC0DE]/30 font-bold">
                  {posts.length} Live Schedules
                </span>
              </h2>
              <p className="text-[11px] sm:text-xs text-slate-400">
                Fresh batches cooked to order. Pre-orders strictly close 30 minutes before kitchen cooking starts.
              </p>
            </div>
          </div>

          {loading ? (
            <div className="p-20 text-center text-xs text-slate-400">Loading homemade dishes...</div>
          ) : posts.length === 0 ? (
            <div className="p-16 text-center bg-[#1C2541]/50 rounded-3xl border border-white/5 space-y-3">
              <UtensilsCrossed className="w-10 h-10 text-slate-500 mx-auto" />
              <h3 className="font-bold text-white text-sm">No advance slots open right now</h3>
              <p className="text-xs text-slate-400">Check back soon or explore our Homemade Meal Picks below.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {posts.map((post) => (
                <div
                  key={post.id}
                  className="bg-[#1C2541]/85 rounded-3xl border border-white/10 overflow-hidden shadow-2xl hover:border-[#D97706]/40 transition-all duration-300 flex flex-col justify-between backdrop-blur-xl hover:-translate-y-1"
                >
                  <div>
                    <div className="h-48 bg-[#0B132B] relative overflow-hidden">
                      <img
                        src={post.image_url || 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800'}
                        alt={post.dish_name}
                        className="w-full h-full object-cover hover:scale-105 transition duration-500"
                      />
                      <div className="absolute top-3 left-3 flex gap-1.5">
                        <span className="bg-[#0B132B]/85 border border-white/10 text-white font-bold text-[10px] px-2.5 py-0.5 rounded-full shadow">
                          {post.dietary}
                        </span>
                        <span className="bg-gradient-to-r from-[#D97706] to-[#F59E0B] text-black font-black text-[10px] px-2.5 py-0.5 rounded-full shadow">
                          ₹{post.price_per_plate}
                        </span>
                      </div>
                      <div className="absolute bottom-2 left-2 right-2 bg-[#0B132B]/85 backdrop-blur-md px-3 py-1.5 rounded-xl text-white text-[11px] flex items-center justify-between border border-white/10">
                        <span className="flex items-center gap-1 text-[#F4D6B0] font-semibold">
                          <Clock className="w-3.5 h-3.5 text-[#D97706]" />
                          Cutoff: {new Date(post.order_closes_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        <span className="text-emerald-400 font-bold">{post.remaining_plates} left</span>
                      </div>
                    </div>

                    <div className="p-5 space-y-3">
                      <h3 className="font-bold text-base text-white leading-snug">{post.dish_name}</h3>
                      <p className="text-xs text-slate-300 line-clamp-2">{post.description}</p>
                      <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-white/5">
                        <span className="font-semibold text-slate-200">{post.cook_name}</span>
                        <span className="flex items-center gap-1 text-emerald-400 font-semibold text-[11px]">
                          <ShieldCheck className="w-3.5 h-3.5" /> FSSAI Certified
                        </span>
                      </div>

                      {/* 4 Customer slot status */}
                      <div className="pt-2">
                        <div className="flex justify-between text-[11px] mb-1">
                          <span className="text-slate-400">Customer Slot Limit:</span>
                          <span className="font-bold text-[#F4D6B0]">{post.slots_remaining} of 4 slots open</span>
                        </div>
                        <div className="grid grid-cols-4 gap-1 h-1.5">
                          {[1, 2, 3, 4].map((s) => (
                            <div
                              key={s}
                              className={`rounded-full ${
                                s <= post.active_customer_bookings_count ? 'bg-[#D97706]' : 'bg-[#0B132B]'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-5 pt-0">
                    <Link
                      href={`/food/${post.id}`}
                      className="w-full block py-3 bg-gradient-to-r from-[#D97706] to-[#F59E0B] text-black rounded-2xl text-center text-xs font-black uppercase tracking-wider transition shadow hover:scale-[1.02] active:scale-[0.98]"
                    >
                      View Details & Pre-Order
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ============================================================== */}
        {/* 2. HOMEMADE MEAL PICKS (FOLLOWS BELOW ADVANCE BOOKINGS)        */}
        {/* ============================================================== */}
        <div className="rounded-3xl bg-[#1C2541]/75 border border-white/10 p-5 sm:p-7 shadow-2xl backdrop-blur-xl space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  Homemade Meal Picks
                </h2>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#D97706]/20 text-[#F4D6B0] border border-[#D97706]/40 font-bold">
                  {filteredPicks.length} Dishes
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-slate-400 mt-0.5">
                Top chef recommendations, hot curries, fragrant rice bowls & daily thalis
              </p>
            </div>

            {/* Category filter pills for picks */}
            <div className="flex items-center space-x-2 overflow-x-auto pb-1 scrollbar-none">
              {pickCategories.map((cat) => {
                const Icon = cat.icon;
                const isActive = selectedPicksCategory === cat.id;

                return (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedPicksCategory(cat.id)}
                    className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition flex-shrink-0 ${
                      isActive
                        ? 'bg-gradient-to-r from-[#D97706] to-[#F59E0B] text-black shadow'
                        : 'bg-[#0B132B]/80 text-slate-300 hover:text-white border border-white/5'
                    }`}
                  >
                    <Icon className="w-3 h-3" />
                    <span>{cat.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Picks Grid (2 cols mobile, 3 cols tablet, 4 cols desktop) */}
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5 sm:gap-5">
            {filteredPicks.map((item) => {
              const isVeg = item.dietary_type === 'VEG';

              return (
                <div
                  key={item.id}
                  onClick={() => handleOpenQuickView(item)}
                  className="group relative cursor-pointer rounded-3xl bg-[#1C2541]/90 hover:bg-[#1C2541] border border-white/5 hover:border-[#D97706]/40 p-3.5 sm:p-4.5 flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-amber-500/10 backdrop-blur-md"
                >
                  <div className="flex items-center justify-between z-10">
                    <span
                      className={`text-[9px] sm:text-[10px] font-black px-2 py-0.5 rounded-full border ${
                        isVeg
                          ? 'bg-emerald-950/60 text-emerald-400 border-emerald-500/30'
                          : 'bg-rose-950/60 text-rose-400 border-rose-500/30'
                      }`}
                    >
                      {isVeg ? 'VEG' : 'NON-VEG'}
                    </span>

                    <div className="flex items-center space-x-1.5">
                      <button
                        type="button"
                        onClick={(e) => handleToggleFav(e, item)}
                        title={isFavourite(item.id) ? 'Remove from Favourites' : 'Add to Favourites'}
                        className={`w-6 h-6 rounded-full flex items-center justify-center transition border ${
                          isFavourite(item.id)
                            ? 'bg-rose-500/25 border-rose-500/50 text-rose-400 shadow-sm shadow-rose-500/20'
                            : 'bg-[#0B132B]/70 border-white/10 text-slate-400 hover:text-rose-400 hover:border-rose-400/30'
                        }`}
                      >
                        <Heart
                          className={`w-3 h-3 ${
                            isFavourite(item.id) ? 'fill-rose-500 text-rose-500' : ''
                          }`}
                        />
                      </button>

                      <div className="flex items-center space-x-1 text-[10px] font-bold text-[#F4D6B0]">
                        <Star className="w-3 h-3 text-[#D97706] fill-[#D97706]" />
                        <span>{item.rating || '4.9'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="relative my-3 flex justify-center">
                    <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full p-1 bg-[#0B132B] border border-white/10 group-hover:border-[#D97706]/50 shadow-inner overflow-hidden transition-all duration-300">
                      <img
                        src={
                          item.image_url ||
                          'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=600&auto=format&fit=crop&q=80'
                        }
                        alt={item.food_name}
                        className="w-full h-full object-cover rounded-full group-hover:scale-110 transition duration-500"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <h3 className="text-xs sm:text-sm font-black text-white group-hover:text-[#F4D6B0] transition line-clamp-1">
                      {item.food_name}
                    </h3>
                    <p className="text-[10px] sm:text-[11px] text-slate-400 line-clamp-1">
                      {item.partner_name || 'Home Cook'}
                    </p>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-white/5 flex items-center justify-between">
                    <div className="flex items-baseline space-x-1">
                      <span className="text-xs sm:text-sm font-black text-[#F4D6B0]">
                        ₹{item.price}
                      </span>
                      <span className="text-[9px] text-slate-400">
                        /{item.serving_size ? item.serving_size.split(' ')[0] : 'plate'}
                      </span>
                    </div>

                    <button
                      onClick={(e) => handleQuickAdd(e, item)}
                      title="Add to Cart"
                      className="w-8 h-8 rounded-xl bg-[#3A506B]/50 hover:bg-[#D97706] text-white hover:text-black flex items-center justify-center transition shadow-md active:scale-95"
                    >
                      <ShoppingCart className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* QUICK VIEW / DISH DETAIL MODAL */}
      {quickViewItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-md rounded-3xl bg-[#1C2541] border border-white/10 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            
            <div className="absolute top-4 left-4 right-4 z-20 flex items-center justify-between">
              <button
                onClick={handleCloseQuickView}
                className="w-9 h-9 rounded-full bg-[#0B132B]/80 hover:bg-[#0B132B] text-white flex items-center justify-center backdrop-blur-md border border-white/10 transition"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={(e) => handleToggleFav(e, quickViewItem)}
                  title={isFavourite(quickViewItem.id) ? 'Remove from Favourites' : 'Add to Favourites'}
                  className={`w-9 h-9 rounded-full flex items-center justify-center backdrop-blur-md border transition ${
                    isFavourite(quickViewItem.id)
                      ? 'bg-rose-500/25 border-rose-500/50 text-rose-400 shadow-md shadow-rose-500/30'
                      : 'bg-[#0B132B]/80 hover:bg-[#0B132B] text-slate-300 border-white/10 hover:text-rose-400'
                  }`}
                >
                  <Heart
                    className={`w-4 h-4 ${
                      isFavourite(quickViewItem.id) ? 'fill-rose-500 text-rose-500' : ''
                    }`}
                  />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (typeof navigator !== 'undefined' && navigator.share) {
                      navigator.share({
                        title: quickViewItem.food_name,
                        text: `Check out ${quickViewItem.food_name} on Ruchi Bazaar!`,
                        url: window.location.href,
                      });
                    } else if (typeof navigator !== 'undefined' && navigator.clipboard) {
                      navigator.clipboard.writeText(window.location.href);
                      setToastMessage('Link copied to clipboard!');
                      setTimeout(() => setToastMessage(''), 2500);
                    }
                  }}
                  className="w-9 h-9 rounded-full bg-[#0B132B]/80 hover:bg-[#0B132B] text-slate-300 flex items-center justify-center backdrop-blur-md border border-white/10 transition"
                  title="Share"
                >
                  <Share2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="overflow-y-auto p-6 pt-16 space-y-5">
              <div className="relative flex justify-center py-2">
                <div className="absolute w-44 h-44 rounded-full bg-[#D97706]/20 blur-2xl" />
                <div className="relative w-48 h-48 rounded-full p-2 bg-[#0B132B] border-2 border-[#D97706]/50 shadow-2xl overflow-hidden">
                  <img
                    src={
                      quickViewItem.image_url ||
                      'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=600&auto=format&fit=crop&q=80'
                    }
                    alt={quickViewItem.food_name}
                    className="w-full h-full object-cover rounded-full"
                  />
                </div>
              </div>

              <div className="text-center space-y-1">
                <h2 className="text-xl font-black text-white">
                  {quickViewItem.food_name}
                </h2>
                <p className="text-xs text-slate-400">
                  Cooked by {quickViewItem.partner_name || 'Verified Chef'}
                </p>

                <div className="flex items-center justify-center space-x-1 pt-1 text-xs text-[#F4D6B0]">
                  <Star className="w-3.5 h-3.5 text-[#D97706] fill-[#D97706]" />
                  <span className="font-bold">{quickViewItem.rating || '4.9'}</span>
                  <span className="text-slate-400">
                    ({quickViewItem.reviews_count || 120} reviews)
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-center space-x-3">
                <div className="flex items-baseline space-x-1">
                  <span className="text-2xl font-black text-[#F4D6B0]">
                    ₹{quickViewItem.price}
                  </span>
                  <span className="text-xs text-slate-400">
                    /{quickViewItem.serving_size || 'plate'}
                  </span>
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-[#D97706]/20 text-[#D97706] border border-[#D97706]/30 text-[10px] font-black uppercase">
                  Fresh Homestyle
                </span>
              </div>

              <div className="flex items-center justify-center gap-2 text-[10px] text-slate-400">
                <span className="px-2 py-0.5 rounded-lg bg-[#0B132B] border border-white/5 flex items-center gap-1">
                  <Bike className="w-3 h-3 text-[#D97706]" /> Rapido Delivery Available
                </span>
                <span className="px-2 py-0.5 rounded-lg bg-[#0B132B] border border-white/5">
                  Self Pickup (Free)
                </span>
              </div>

              <p className="text-xs text-slate-300 text-center leading-relaxed px-2">
                {quickViewItem.description}
              </p>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-300">Select Serving / Size</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { size: 'Plate', label: '1 Plate', price: quickViewItem.price },
                    { size: '500ml', label: '500 ml Box', price: Math.round(quickViewItem.price * 1.45) },
                    { size: '1kg', label: '1 kg Family', price: Math.round(quickViewItem.price * 2.7) },
                  ].map((s) => (
                    <button
                      key={s.size}
                      onClick={() => setSelectedSize(s.size)}
                      className={`p-2.5 rounded-2xl border text-center transition ${
                        selectedSize === s.size
                          ? 'bg-[#3A506B]/50 border-[#D97706] text-white'
                          : 'bg-[#0B132B]/60 border-white/5 text-slate-400 hover:border-white/20'
                      }`}
                    >
                      <div className="text-[11px] font-bold">{s.label}</div>
                      <div className="text-[10px] text-[#F4D6B0] font-black">₹{s.price}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="text-xs font-bold text-slate-300">Quantity</span>
                <div className="flex items-center space-x-3 bg-[#0B132B]/80 px-3 py-1.5 rounded-2xl border border-white/10">
                  <button
                    onClick={() => setModalQty(Math.max(1, modalQty - 1))}
                    className="p-1 text-slate-300 hover:text-white"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="text-xs font-black text-white w-4 text-center">
                    {modalQty}
                  </span>
                  <button
                    onClick={() =>
                      setModalQty(
                        Math.min(quickViewItem.stock_quantity || 10, modalQty + 1)
                      )
                    }
                    className="p-1 text-slate-300 hover:text-white"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={handleAddToCartFromModal}
                  className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#D97706] via-[#F59E0B] to-[#D97706] hover:from-[#B45309] hover:to-[#D97706] text-black font-black text-xs uppercase tracking-wider shadow-lg shadow-amber-500/25 flex items-center justify-center gap-2 transition active:scale-[0.98]"
                >
                  <ShoppingCart className="w-4 h-4" />
                  <span>Add to Cart • ₹{(quickViewItem.price * modalQty).toFixed(0)}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Floating Bottom Cart Bar */}
      {cartCount > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 w-11/12 max-w-xl bg-[#0B132B]/95 text-white rounded-3xl p-4 shadow-2xl border border-white/10 backdrop-blur-xl flex items-center justify-between animate-in fade-in slide-in-from-bottom-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-r from-[#D97706] to-[#F59E0B] text-black flex items-center justify-center font-black text-sm shadow">
              {cartCount}
            </div>
            <div>
              <p className="text-xs font-bold text-[#F4D6B0]">Your Food Cart</p>
              <p className="text-sm font-black text-white">Subtotal: ₹{subtotal.toFixed(2)}</p>
            </div>
          </div>

          <Link
            href="/cart"
            className="px-5 py-2.5 bg-gradient-to-r from-[#D97706] to-[#F59E0B] text-black text-xs font-black rounded-2xl transition shadow-lg flex items-center space-x-1.5"
          >
            <span>Proceed to Checkout</span>
            <ShoppingCart className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}
    </div>
  );
}
