import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import AdminLayout from '@/components/AdminLayout';

export const metadata = {
  title: 'RUCHI Admin Portal - Platform Governance & Food Safety',
  description: 'Administrative portal for managing customers, home cooks, food donors, orders, and food safety.',
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
      <body className="antialiased" suppressHydrationWarning>
        <AuthProvider>
          <AdminLayout>{children}</AdminLayout>
        </AuthProvider>
      </body>
    </html>
  );
}
