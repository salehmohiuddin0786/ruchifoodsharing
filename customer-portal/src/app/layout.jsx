import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { CartProvider } from '@/context/CartContext';
import { FavouritesProvider } from '@/context/FavouritesContext';
import { NotificationProvider } from '@/context/NotificationContext';
import CustomerHeader from '@/components/CustomerHeader';
import MobileBottomNav from '@/components/MobileBottomNav';
import FacebookSDK from '@/components/FacebookSDK';
import NotificationToast from '@/components/NotificationToast';

export const metadata = {
  title: 'Ruchi Bazaar - Your Cravings, Our Priority!',
  description: 'Pre-order authentic homemade meals from verified neighborhood home cooks or collect surplus food from local banquets and donors.',
  icons: {
    icon: '/ruchi-logo.png',
    apple: '/ruchi-logo.png',
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className="antialiased min-h-screen flex flex-col bg-[#0B132B] text-slate-100 selection:bg-[#D97706] selection:text-[#0B132B]"
        suppressHydrationWarning
      >
        <FacebookSDK />
        <AuthProvider>
          <CartProvider>
            <FavouritesProvider>
              <NotificationProvider>
                <NotificationToast />
                <CustomerHeader />
                <main className="flex-1 pb-24 md:pb-0">{children}</main>
                <footer className="bg-[#070D1F] text-white py-12 px-4 border-t border-white/5 mt-16 text-center text-xs">
              <div className="max-w-7xl mx-auto space-y-4">
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                  <div className="w-12 h-12 rounded-full p-0.5 bg-gradient-to-tr from-[#D97706] to-[#F59E0B] shadow-md shadow-amber-500/20 overflow-hidden flex-shrink-0">
                    <img
                      src="/ruchi-logo.png"
                      alt="Ruchi Bazaar Logo"
                      className="w-full h-full object-contain rounded-full bg-white p-0.5"
                    />
                  </div>
                  <div className="text-center sm:text-left">
                    <div className="flex items-center justify-center sm:justify-start space-x-2">
                      <span className="text-xl font-black tracking-tight text-[#F4D6B0]">RUCHI BAZAAR</span>
                      <span className="bg-[#D97706] text-[#0B132B] text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                        Official Store
                      </span>
                    </div>
                    <p className="text-[10px] text-[#F4D6B0] font-medium tracking-wider uppercase">
                      Your Cravings, Our Priority!
                    </p>
                  </div>
                </div>
                <p className="text-[#F4D6B0]/70 max-w-lg mx-auto leading-relaxed text-xs">
                  Authentic homemade meals, daily thali subscriptions, express delivery, and zero-waste community food sharing from verified neighborhood cooks.
                </p>
                <div className="pt-4 border-t border-white/5 space-y-1">
                  <p className="text-xs text-slate-400 font-semibold tracking-wide">
                    © 2026{' '}
                    <a
                      href="https://digitalcrowdtech.in/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#F4D6B0] hover:text-[#D97706] hover:underline transition-colors font-bold"
                    >
                      Digital Crowd Technologies
                    </a>
                    . All rights reserved.
                  </p>
                  <p className="text-[11px] text-slate-600">
                    Shared Node.js Backend & MySQL Database System
                  </p>
                </div>
              </div>
            </footer>
            {/* Native App-Style Mobile & Tablet Bottom Navigation Bar */}
            <MobileBottomNav />
            </NotificationProvider>
          </FavouritesProvider>
        </CartProvider>
      </AuthProvider>
      </body>
    </html>
  );
}
