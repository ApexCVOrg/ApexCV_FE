import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { ThemeProvider } from '@/context/ThemeContext';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import '@/styles/global.scss';
import { NextIntlClientProvider, hasLocale } from 'next-intl';
import { notFound } from 'next/navigation';
import { routing } from '@/lib/i18n/routing';
import { Box, Container } from '@mui/material';
import { AuthProvider } from '@/context/AuthContext';
import { messages } from '@/lib/i18n/messages';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Nidas - Choose your style',
  description: 'Nidas - Choose your style',
};

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
      <body className={inter.className} style={{ backgroundColor: '#fff', minHeight: '100vh', margin: 0 }}>
        <ThemeProvider>
          <NextIntlClientProvider locale={locale} messages={messages[locale as keyof typeof messages]}>
            <Box className="app-container" sx={{ bgcolor: '#fff', minHeight: '100vh' }}>
              <Header />
              <Container component="main" className="main-content" sx={{ bgcolor: '#fff' }}>
                <AuthProvider>
                  {children}
                </AuthProvider>
              </Container>
              <Footer />
            </Box>
          </NextIntlClientProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}