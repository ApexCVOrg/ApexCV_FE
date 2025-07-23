import { Inter } from 'next/font/google';
import { notFound } from 'next/navigation';
import { routing } from '@/lib/i18n/routing';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Box, Container } from '@mui/material';
import { AuthProvider } from '@/context/AuthContext';
import { CartProvider } from '@/context/CartContext';
import { HomeCartProvider } from '@/context/HomeCartContext';
import { ToastProvider } from '@/components/ui/Toast';
import { ThemeProvider } from '@/context/ThemeContext';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { messages } from '@/lib/i18n/messages';
import { hasLocale } from 'next-intl';
import ClientLayout from './ClientLayout';

const inter = Inter({ 
  subsets: ['latin', 'vietnamese'],
  display: 'swap',
  variable: '--font-inter',
});

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  return (
    <html lang={locale}>
      <body
        className={inter.className}
        style={{
          // Remove hardcoded background to let layouts control their own backgrounds
          minHeight: '100vh',
          margin: 0,
          padding: 0,
        }}
      >
        <ThemeProvider>
          <AuthProvider>
            <CartProvider>
              <HomeCartProvider>
                <ToastProvider>
                  <ClientLayout locale={locale}>{children}</ClientLayout>
                </ToastProvider>
              </HomeCartProvider>
            </CartProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
