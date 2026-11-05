'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import {
  Home,
  UtensilsCrossed,
  Gift,
  ShoppingCart,
  ShoppingBag,
  User,
} from 'lucide-react';

export default function MobileBottomNav() {
  const pathname = usePathname();
  const { user } = useAuth();
  const { cartCount } = useCart();

  const navItems = [
    { label: 'Home', href: '/', icon: Home },
    { label: 'Meals', href: '/homemade-food', icon: UtensilsCrossed },
    { label: 'Free Food', href: '/free-food', icon: Gift },
    { label: 'Orders', href: '/orders', icon: ShoppingBag },
    { label: 'Cart', href: '/cart', icon: ShoppingCart, badge: cartCount },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#0B132B]/95 backdrop-blur-2xl border-t border-white/10 px-2 py-2 shadow-[0_-5px_25px_rgba(0,0,0,0.5)]">
      <div className="flex items-center justify-around max-w-md mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            item.href === '/'
              ? pathname === '/'
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className="relative flex flex-col items-center py-1 px-2 group flex-1"
            >
              <div
                className={`relative p-1.5 rounded-2xl transition-all duration-200 ${
                  isActive
                    ? 'bg-gradient-to-tr from-[#D97706]/30 to-[#F59E0B]/20 text-[#F4D6B0] shadow-[0_0_15px_rgba(217,119,6,0.3)]'
                    : 'text-gray-400 group-hover:text-gray-200'
                }`}
              >
                <Icon className="w-5 h-5" />
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#D97706] text-[#0B132B] font-black text-[9px] rounded-full flex items-center justify-center shadow">
                    {item.badge}
                  </span>
                )}
              </div>

              <span
                className={`text-[10px] font-bold mt-0.5 tracking-tight transition-colors ${
                  isActive ? 'text-[#F4D6B0]' : 'text-gray-400'
                }`}
              >
                {item.label}
              </span>

              {/* Active dot below icon */}
              {isActive && (
                <span className="w-1 h-1 rounded-full bg-[#D97706] mt-0.5 shadow-[0_0_6px_#D97706]" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
