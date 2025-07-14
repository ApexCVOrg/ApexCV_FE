import { Inter } from 'next/font/google';
import { notFound } from 'next/navigation';
import { routing } from '@/lib/i18n/routing';
import { Box, Container } from '@mui/material';
import { AuthProvider } from '@/context/AuthContext';
import { CartProvider } from '@/context/CartContext';
import { HomeCartProvider } from '@/context/HomeCartContext';
import { messages } from '@/lib/i18n/messages';
import { hasLocale } from 'next-intl';
import ClientLayout from './ClientLayout';

const inter = Inter({ subsets: ['latin'] });

export default async function LocaleLayout({
  children,
  params
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
          backgroundColor: '#fff',
          minHeight: '100vh',
          margin: 0,
        }}
      >
        <AuthProvider>
          <CartProvider>
            <HomeCartProvider>
              <ClientLayout locale={locale}>{children}</ClientLayout>
            </HomeCartProvider>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}