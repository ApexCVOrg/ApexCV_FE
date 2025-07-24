import { Inter, Be_Vietnam_Pro } from 'next/font/google';
import { notFound } from 'next/navigation';
import { routing } from '@/lib/i18n/routing';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Box, Container } from '@mui/material';
import { AuthProvider } from '@/context/AuthContext';
import { CartProvider } from '@/context/CartContext';
import { HomeCartProvider } from '@/context/HomeCartContext';
import { ToastProvider } from '@/components/ui/Toast';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { messages } from '@/lib/i18n/messages';
import { hasLocale } from 'next-intl';
import ClientLayout from './ClientLayout';

const inter = Inter({ subsets: ['latin'] });
const beVietnamPro = Be_Vietnam_Pro({ 
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800', '900'],
  variable: '--font-be-vietnam-pro',
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
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body
        className={`${inter.className} ${beVietnamPro.variable}`}
        style={{
          backgroundColor: '#000', // Set dark background to prevent white showing behind transparent header
          minHeight: '100vh',
          margin: 0,
          padding: 0,
        }}
      >
        <AuthProvider>
          <CartProvider>
            <HomeCartProvider>
              <ToastProvider>
                <ClientLayout locale={locale}>{children}</ClientLayout>
              </ToastProvider>
            </HomeCartProvider>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
