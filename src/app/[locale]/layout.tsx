import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { notFound } from 'next/navigation';
import { routing } from '@/lib/i18n/routing';
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
      <body className={inter.className} style={{ backgroundColor: '#fff', minHeight: '100vh', margin: 0 }}>
        <ClientLayout locale={locale}>{children}</ClientLayout>
      </body>
    </html>
  );
}