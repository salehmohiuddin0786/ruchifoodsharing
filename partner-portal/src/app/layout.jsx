import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import PartnerLayout from '@/components/PartnerLayout';

export const metadata = {
  title: 'RUCHI Partner Portal - Home Cooks & Food Donors',
  description: 'Manage home cooking pre-orders, cooking schedules, and surplus food donations.',
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
          <PartnerLayout>{children}</PartnerLayout>
        </AuthProvider>
      </body>
    </html>
  );
}
