import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { ThemeProvider } from '@/context/ThemeContext';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import '@/styles/global.scss';
import { NextIntlClientProvider, hasLocale } from 'next-intl';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import { Box, Container } from '@mui/material';

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
      <body className={inter.className}>
        <ThemeProvider>
          <NextIntlClientProvider locale={locale}>
            <Box className="app-container">
              <Header />
              <Container component="main" className="main-content">
                {children}
              </Container>
              <Footer />
            </Box>
          </NextIntlClientProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}