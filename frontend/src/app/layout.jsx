import './globals.css';
import { AppProvider } from '@/context/AppContext';

export const metadata = {
  title: 'RUCHI - Food Sharing & Homemade Food Pre-Orders (Hyderabad)',
  description: 'Share Food. Spread Happiness. Hyderabad community food platform with surplus food sharing and home cook advance pre-orders.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-[#FFF9EE] text-[#1A2E24] antialiased">
        <AppProvider>
          {children}
        </AppProvider>
      </body>
    </html>
  );
}
