'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { curryRiceCustomerApi, customerApi } from '@/lib/api';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { useFavourites } from '@/context/FavouritesContext';
import {
  Search,
  Filter,
  ShoppingCart,
  Star,
  Plus,
  Minus,
  Heart,
  Share2,
  X,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Gift,
  Utensils,
  CookingPot,
  Flame,
  LayoutGrid,
  Clock,
  MapPin,
  Check,
  Bike,
  Vote,
} from 'lucide-react';

export default function CustomerHomePage() {
  const router = useRouter();
  const { user } = useAuth();
  const { addToCart, cartCount } = useCart();
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
  const [homemadeItems, setHomemadeItems] = useState([]);
  const [foodPosts, setFoodPosts] = useState([]);
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [dietaryFilter, setDietaryFilter] = useState('ALL'); // ALL, VEG, NON_VEG
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);

  // Quick View Modal
  const [quickViewItem, setQuickViewItem] = useState(null);
  const [selectedSize, setSelectedSize] = useState('Plate');
  const [modalQty, setModalQty] = useState(1);
  const [toastMessage, setToastMessage] = useState('');

  // Fallback homemade meals (district-neutral)
  const defaultItems = [
    {
      id: 'demo-1',
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
      id: 'demo-2',
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
      id: 'demo-3',
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
      id: 'demo-4',
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
      id: 'demo-5',
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
      id: 'demo-6',
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
  }, []);

  const loadAllData = async () => {
    setLoading(true);
    try {
      const [crRes, fpRes, dRes] = await Promise.allSettled([
        curryRiceCustomerApi.getItems(),
        customerApi.getFoodPosts(),
        customerApi.getDonations(),
      ]);

      if (crRes.status === 'fulfilled' && crRes.value?.items?.length) {
        setHomemadeItems(crRes.value.items);
      } else {
        setHomemadeItems(defaultItems);
      }

      if (fpRes.status === 'fulfilled') {
        setFoodPosts(fpRes.value?.posts || []);
      }
      if (dRes.status === 'fulfilled') {
        setDonations(dRes.value?.donations || []);
      }
    } catch (err) {
      console.error('Error fetching homepage data:', err);
      setHomemadeItems(defaultItems);
    } finally {
      setLoading(false);
    }
  };

  // Categories under Homemade Meals
  const categories = [
    { id: 'ALL', label: 'All Meals', icon: LayoutGrid },
    { id: 'CURRY', label: 'Curries', icon: CookingPot },
    { id: 'RICE', label: 'Rice Dishes', icon: Flame },
    { id: 'CURRY_RICE', label: 'Combo Meals', icon: Sparkles },
    { id: 'DAILY_MEAL', label: 'Daily Tiffins', icon: Utensils },
    { id: 'FREE_FOOD', label: 'Free Food', icon: Gift },
  ];

  // Filtered items logic
  const getFilteredItems = () => {
    let list = [...homemadeItems];

    if (selectedCategory === 'FREE_FOOD') {
      return donations.map((d) => ({
        id: `donation-${d.id}`,
        food_name: d.title || d.food_name || 'Community Donation Meal',
        partner_name: d.donor_name || 'Community Donor',
        food_category: 'FREE_FOOD',
        dietary_type: d.dietary_type || 'VEG',
        price: 0,
        serving_size: `${d.quantity_available || d.servings || 1} Servings`,
        stock_quantity: d.quantity_available || 5,
        rating: 5.0,
        reviews_count: 50,
        description: d.description || 'Nutritious homestyle food prepared with care, offered free for collection or delivery.',
        image_url: d.image_url || 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=600&auto=format&fit=crop&q=80',
        is_free: true,
      }));
    }

    if (selectedCategory !== 'ALL') {
      list = list.filter((item) => item.food_category === selectedCategory);
    }

    if (dietaryFilter !== 'ALL') {
      list = list.filter((item) => item.dietary_type === dietaryFilter);
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (item) =>
          item.food_name?.toLowerCase().includes(q) ||
          item.partner_name?.toLowerCase().includes(q) ||
          item.description?.toLowerCase().includes(q)
      );
    }

    return list;
  };

  const filteredItems = getFilteredItems();

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

    if (quickViewItem.is_free) {
      router.push('/free-food');
      return;
    }

    addToCart(quickViewItem, modalQty);
    setToastMessage(`Added ${modalQty}x ${quickViewItem.food_name} to cart!`);
    setTimeout(() => setToastMessage(''), 3000);
    handleCloseQuickView();
  };

  const handleQuickAdd = (e, item) => {
    e.stopPropagation();
    if (item.is_free) {
      router.push('/free-food');
      return;
    }
    addToCart(item, 1);
    setToastMessage(`Added ${item.food_name} to cart!`);
    setTimeout(() => setToastMessage(''), 2500);
  };

  return (
    <div className="relative min-h-screen bg-[#0B132B] text-slate-100 overflow-hidden pb-24 md:pb-16">
      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6 space-y-6 sm:space-y-8">
        
        {/* Toast Notification */}
        {toastMessage && (
          <div className="fixed top-24 right-4 sm:right-8 z-50 flex items-center space-x-2.5 px-4 py-2.5 rounded-xl bg-[#16203A] border border-white/15 shadow-xl text-xs sm:text-sm font-semibold text-white">
            <CheckCircle2 className="w-4 h-4 text-[#D97706]" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* 1. HERO CARD */}
        <div className="relative rounded-3xl overflow-hidden bg-[#16203A] border border-white/10 p-6 sm:p-8 md:p-10 shadow-sm">
          <div className="relative z-10 grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
            {/* Left Content */}
            <div className="md:col-span-7 space-y-4">
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#0B132B] border border-white/10">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                <span className="text-xs text-slate-300 font-medium">
                  100% home cooked • zero preservatives
                </span>
              </div>

              <div>
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-white leading-tight">
                  Goodness in <br className="hidden sm:inline" />
                  <span className="text-[#F4D6B0]">
                    every bite
                  </span>
                </h1>
                <p className="mt-2 text-xs sm:text-sm text-slate-300 max-w-lg leading-relaxed">
                  Wholesome homemade meals, authentic curries, fragrant rice combos, daily tiffins and free community food sharing. Express Rapido bike delivery and self-pickup options available.
                </p>
              </div>

              {/* Quick Action Buttons */}
              <div className="pt-2 flex flex-wrap gap-2.5">
                <Link
                  href="/vote"
                  className="px-4 py-2.5 bg-[#D97706] hover:bg-[#B45309] text-white text-xs font-semibold rounded-xl shadow-sm transition flex items-center gap-2"
                >
                  <Vote className="w-3.5 h-3.5" />
                  <span>Vote for today's dish</span>
                </Link>
                <Link
                  href="/homemade-food"
                  className="px-4 py-2.5 bg-[#0B132B] hover:bg-white/5 text-white text-xs font-medium rounded-xl border border-white/10 hover:border-white/20 transition flex items-center gap-1.5"
                >
                  <Utensils className="w-3.5 h-3.5 text-[#F4D6B0]" />
                  <span>Order homemade meals</span>
                </Link>
                <Link
                  href="/free-food"
                  className="px-4 py-2.5 bg-[#0B132B] hover:bg-white/5 text-[#5BC0DE] text-xs font-medium rounded-xl border border-white/10 transition flex items-center gap-1.5"
                >
                  <Gift className="w-3.5 h-3.5 text-[#5BC0DE]" />
                  <span>Free food sharing</span>
                </Link>
              </div>
            </div>

            {/* Right Product Food Visual */}
            <div className="md:col-span-5 flex justify-center md:justify-end">
              <div className="relative">
                <div className="relative w-48 h-48 sm:w-60 sm:h-60 rounded-full p-1.5 bg-[#0B132B] border border-white/10 shadow-lg flex items-center justify-center overflow-hidden">
                  <img
                    src="https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?w=600&auto=format&fit=crop&q=80"
                    alt="Ruchi Signature Dish"
                    className="w-full h-full object-cover rounded-full"
                  />
                  <div className="absolute bottom-3 bg-[#0B132B]/95 px-3 py-1 rounded-full border border-white/10 text-[10px] font-semibold text-[#F4D6B0] shadow flex items-center gap-1">
                    <Star className="w-3 h-3 text-[#D97706] fill-[#D97706]" />
                    <span>4.9 Chef Special</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 2. SEARCH & FILTER BAR */}
        <div className="relative flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search for curries, rice dishes, thali meals, or cooks..."
              className="w-full pl-11 pr-4 py-3.5 rounded-2xl bg-[#1C2541]/70 border border-white/10 text-white placeholder-slate-400 text-xs sm:text-sm focus:outline-none focus:border-[#D97706] focus:ring-1 focus:ring-[#D97706] backdrop-blur-md transition"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Filter Trigger Button */}
          <div className="relative">
            <button
              onClick={() => setShowFilterDropdown(!showFilterDropdown)}
              className={`w-full sm:w-auto px-4 py-3.5 rounded-2xl border text-xs font-bold flex items-center justify-center gap-2 transition ${
                dietaryFilter !== 'ALL'
                  ? 'bg-[#D97706] text-black border-[#D97706]'
                  : 'bg-[#1C2541]/70 text-slate-200 border-white/10 hover:border-white/20'
              }`}
            >
              <Filter className="w-4 h-4" />
              <span>{dietaryFilter === 'ALL' ? 'Filter' : dietaryFilter}</span>
            </button>

            {showFilterDropdown && (
              <div className="absolute right-0 mt-2 w-44 rounded-2xl bg-[#1C2541] border border-white/15 p-2 shadow-2xl z-30 space-y-1 backdrop-blur-xl">
                <button
                  onClick={() => {
                    setDietaryFilter('ALL');
                    setShowFilterDropdown(false);
                  }}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold ${
                    dietaryFilter === 'ALL' ? 'bg-[#D97706] text-black' : 'text-slate-300 hover:bg-white/5'
                  }`}
                >
                  All Food
                </button>
                <button
                  onClick={() => {
                    setDietaryFilter('VEG');
                    setShowFilterDropdown(false);
                  }}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 ${
                    dietaryFilter === 'VEG' ? 'bg-[#D97706] text-black' : 'text-slate-300 hover:bg-white/5'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  Pure Veg Only
                </button>
                <button
                  onClick={() => {
                    setDietaryFilter('NON_VEG');
                    setShowFilterDropdown(false);
                  }}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 ${
                    dietaryFilter === 'NON_VEG' ? 'bg-[#D97706] text-black' : 'text-slate-300 hover:bg-white/5'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                  Non-Veg Dishes
                </button>
              </div>
            )}
          </div>
        </div>

        {/* 3. HOMEMADE MEALS CATEGORIES PILLS */}
        <div>
          <div className="flex items-center space-x-2.5 overflow-x-auto pb-2 scrollbar-none no-scrollbar">
            {categories.map((cat) => {
              const Icon = cat.icon;
              const isActive = selectedCategory === cat.id;

              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`flex-shrink-0 flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition ${
                    isActive
                      ? 'bg-[#D97706] text-white shadow-sm'
                      : 'bg-[#16203A] text-slate-300 hover:text-white border border-white/5 hover:border-white/10'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-[#F4D6B0]'}`} />
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* COMMUNITY DISH VOTING SPOTLIGHT BANNER */}
        <div className="p-5 sm:p-6 rounded-2xl bg-[#16203A] border border-white/10 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center space-x-3.5">
            <div className="w-11 h-11 rounded-xl bg-[#0B132B] text-amber-500 flex items-center justify-center flex-shrink-0 border border-white/10">
              <Vote className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[11px] font-medium text-[#F4D6B0]">
                  Daily community poll
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              </div>
              <h3 className="text-base sm:text-lg font-bold text-white mt-0.5">
                Vote for tomorrow's dish
              </h3>
              <p className="text-xs text-slate-300">
                Participate in live kitchen polls. Top-voted dish gets cooked fresh for pre-order.
              </p>
            </div>
          </div>

          <Link
            href="/vote"
            className="self-start md:self-auto px-4 py-2 bg-[#D97706] hover:bg-[#B45309] text-white font-semibold text-xs rounded-xl shadow-sm transition flex items-center gap-1.5 flex-shrink-0"
          >
            <span>Vote now</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* 4. "TOP PICKS FOR YOU" HOMEMADE MEALS */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
                <span>Homemade meal picks</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-white/5 text-slate-300 border border-white/10 font-medium">
                  {filteredItems.length}
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Freshly cooked today by verified home kitchens • Rapido delivery & pickup
              </p>
            </div>

            <Link
              href="/homemade-food"
              className="text-xs font-semibold text-[#F4D6B0] hover:text-[#D97706] flex items-center gap-1 transition"
            >
              <span>View all</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Responsive Dish Grid: 2 cols on mobile, 3 on tablet, 4 on desktop */}
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((n) => (
                <div
                  key={n}
                  className="rounded-2xl bg-[#16203A] border border-white/5 h-64 animate-pulse p-4 space-y-3"
                >
                  <div className="w-24 h-24 rounded-full bg-slate-700 mx-auto" />
                  <div className="h-4 bg-slate-700 rounded w-3/4 mx-auto" />
                  <div className="h-3 bg-slate-700/60 rounded w-1/2 mx-auto" />
                </div>
              ))}
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="text-center py-16 rounded-2xl bg-[#16203A] border border-white/5 space-y-3">
              <CookingPot className="w-10 h-10 text-slate-500 mx-auto" />
              <p className="text-sm font-semibold text-slate-300">No dishes found in this category.</p>
              <button
                onClick={() => {
                  setSelectedCategory('ALL');
                  setDietaryFilter('ALL');
                  setSearch('');
                }}
                className="text-xs text-[#D97706] font-semibold underline"
              >
                Reset filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5 sm:gap-4">
              {filteredItems.map((item) => {
                const isVeg = item.dietary_type === 'VEG';

                return (
                  <div
                    key={item.id}
                    onClick={() => handleOpenQuickView(item)}
                    className="group relative cursor-pointer rounded-2xl bg-[#16203A] hover:bg-[#1a2542] border border-white/5 hover:border-white/15 p-3.5 sm:p-4 flex flex-col justify-between transition-colors shadow-sm"
                  >
                    {/* Top Badges */}
                    <div className="flex items-center justify-between z-10">
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                          isVeg
                            ? 'bg-emerald-950/70 text-emerald-300 border-emerald-500/30'
                            : 'bg-rose-950/70 text-rose-300 border-rose-500/30'
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
                              ? 'bg-rose-500/20 border-rose-500/40 text-rose-400'
                              : 'bg-[#0B132B]/80 border-white/10 text-slate-400 hover:text-rose-400'
                          }`}
                        >
                          <Heart
                            className={`w-3 h-3 ${
                              isFavourite(item.id) ? 'fill-rose-500 text-rose-500' : ''
                            }`}
                          />
                        </button>

                        <div className="flex items-center space-x-1 text-[11px] font-semibold text-[#F4D6B0]">
                          <Star className="w-3 h-3 text-[#D97706] fill-[#D97706]" />
                          <span>{item.rating || '4.8'}</span>
                        </div>
                      </div>
                    </div>

                    {/* Circular Dish Image */}
                    <div className="relative my-3 flex justify-center">
                      <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full p-1 bg-[#0B132B] border border-white/10 overflow-hidden">
                        <img
                          src={
                            item.image_url ||
                            'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=600&auto=format&fit=crop&q=80'
                          }
                          alt={item.food_name}
                          className="w-full h-full object-cover rounded-full"
                        />
                      </div>
                    </div>

                    {/* Dish Info */}
                    <div className="space-y-1">
                      <h3 className="text-xs sm:text-sm font-semibold text-white group-hover:text-[#F4D6B0] transition-colors line-clamp-1">
                        {item.food_name}
                      </h3>
                      <p className="text-[11px] text-slate-400 line-clamp-1">
                        {item.partner_name || 'Home Cook'}
                      </p>
                    </div>

                    {/* Price & Mini Add-to-Cart Button */}
                    <div className="mt-3 pt-2.5 border-t border-white/5 flex items-center justify-between">
                      <div>
                        {item.is_free ? (
                          <span className="text-xs sm:text-sm font-bold text-emerald-400">
                            FREE
                          </span>
                        ) : (
                          <div className="flex items-baseline space-x-1">
                            <span className="text-xs sm:text-sm font-bold text-[#F4D6B0] font-mono">
                              ₹{item.price}
                            </span>
                            <span className="text-[10px] text-slate-400">
                              /{item.serving_size ? item.serving_size.split(' ')[0] : 'plate'}
                            </span>
                          </div>
                        )}
                      </div>

                      <button
                        onClick={(e) => handleQuickAdd(e, item)}
                        title="Add to Cart"
                        className="w-8 h-8 rounded-xl bg-white/10 hover:bg-[#D97706] text-white flex items-center justify-center transition shadow-sm active:scale-95"
                      >
                        <ShoppingCart className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* 5. PROMO BANNER: HOMEMADE MEALS DEALS */}
        <div className="rounded-2xl overflow-hidden bg-[#16203A] border border-white/10 p-5 sm:p-6 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-1.5 text-center sm:text-left">
            <span className="text-xs font-medium text-[#5BC0DE] flex items-center gap-1.5 justify-center sm:justify-start">
              <Bike className="w-3.5 h-3.5 text-[#5BC0DE]" />
              <span>Express Rapido bike delivery available</span>
            </span>
            <h3 className="text-lg sm:text-xl font-bold text-white">
              Save more on homemade meal combos
            </h3>
            <p className="text-xs text-slate-300 max-w-md">
              Flat 15% off on meal combos above ₹499 with coupon code <span className="font-semibold text-[#F4D6B0]">RUCHI15</span>.
            </p>
          </div>

          <Link
            href="/homemade-food"
            className="px-5 py-2.5 rounded-xl bg-[#D97706] hover:bg-[#B45309] text-white font-semibold text-xs shadow-sm transition"
          >
            Explore meals
          </Link>
        </div>

      </div>

      {/* 6. QUICK VIEW / DISH DETAIL MODAL */}
      {quickViewItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-md rounded-3xl bg-[#1C2541] border border-white/10 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            
            {/* Modal Header Actions */}
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

            {/* Scrollable Content */}
            <div className="overflow-y-auto p-6 pt-16 space-y-5">
              <div className="relative flex justify-center py-2">
                <div className="relative w-44 h-44 rounded-full p-1 bg-[#0B132B] border border-white/10 shadow-md overflow-hidden">
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

              {/* Title & Cook Information */}
              <div className="text-center space-y-1">
                <h2 className="text-lg sm:text-xl font-bold text-white">
                  {quickViewItem.food_name}
                </h2>
                <p className="text-xs text-slate-400">
                  Cooked by {quickViewItem.partner_name || 'Verified Chef'}
                </p>

                <div className="flex items-center justify-center space-x-1 pt-1 text-xs text-[#F4D6B0]">
                  <Star className="w-3.5 h-3.5 text-[#D97706] fill-[#D97706]" />
                  <span className="font-semibold">{quickViewItem.rating || '4.9'}</span>
                  <span className="text-slate-400">
                    ({quickViewItem.reviews_count || 120} reviews)
                  </span>
                </div>
              </div>

              {/* Price & Badge */}
              <div className="flex items-center justify-center space-x-3">
                <div className="flex items-baseline space-x-1">
                  <span className="text-xl sm:text-2xl font-bold text-[#F4D6B0] font-mono">
                    {quickViewItem.is_free ? 'FREE' : `₹${quickViewItem.price}`}
                  </span>
                  {!quickViewItem.is_free && (
                    <span className="text-xs text-slate-400">
                      /{quickViewItem.serving_size || 'plate'}
                    </span>
                  )}
                </div>
                {!quickViewItem.is_free && (
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[10px] font-medium">
                    Freshly Prepared
                  </span>
                )}
              </div>

              {/* Delivery badges */}
              <div className="flex items-center justify-center gap-2 text-[10px] text-slate-400">
                <span className="px-2 py-0.5 rounded-lg bg-[#0B132B] border border-white/5 flex items-center gap-1">
                  <Bike className="w-3 h-3 text-[#D97706]" /> Rapido Delivery Available
                </span>
                <span className="px-2 py-0.5 rounded-lg bg-[#0B132B] border border-white/5">
                  Self Pickup (Free)
                </span>
              </div>

              {/* Description */}
              <p className="text-xs text-slate-300 text-center leading-relaxed px-2">
                {quickViewItem.description}
              </p>

              {/* Serving / Size Selector */}
              {!quickViewItem.is_free && (
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-300">Select Serving / Size</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { size: 'Plate', label: '1 Plate', price: quickViewItem.price },
                      { size: '500ml', label: '500 ml Box', price: Math.round(quickViewItem.price * 1.45) },
                      { size: '1kg', label: '1 kg Family', price: Math.round(quickViewItem.price * 2.7) },
                    ].map((s) => (
                      <button
                        key={s.size}
                        onClick={() => setSelectedSize(s.size)}
                        className={`p-2.5 rounded-xl border text-center transition ${
                          selectedSize === s.size
                            ? 'bg-[#16203A] border-[#D97706] text-white'
                            : 'bg-[#0B132B] border-white/5 text-slate-400 hover:border-white/15'
                        }`}
                      >
                        <div className="text-[11px] font-semibold">{s.label}</div>
                        <div className="text-[10px] text-[#F4D6B0] font-mono">₹{s.price}</div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity Stepper */}
              {!quickViewItem.is_free && (
                <div className="flex items-center justify-between pt-2">
                  <span className="text-xs font-semibold text-slate-300">Quantity</span>
                  <div className="flex items-center space-x-3 bg-[#0B132B] px-3 py-1.5 rounded-xl border border-white/10">
                    <button
                      onClick={() => setModalQty(Math.max(1, modalQty - 1))}
                      className="p-1 text-slate-300 hover:text-white"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="text-xs font-bold text-white w-4 text-center font-mono">
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
              )}

              {/* Action Button: Add to Cart */}
              <div className="pt-2">
                <button
                  onClick={handleAddToCartFromModal}
                  className="w-full py-3 rounded-xl bg-[#D97706] hover:bg-[#B45309] text-white font-semibold text-xs shadow-sm flex items-center justify-center gap-2 transition active:scale-[0.99]"
                >
                  <ShoppingCart className="w-4 h-4" />
                  <span>
                    {quickViewItem.is_free
                      ? 'Claim Free Meal'
                      : `Add to Cart • ₹${(quickViewItem.price * modalQty).toFixed(0)}`}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
