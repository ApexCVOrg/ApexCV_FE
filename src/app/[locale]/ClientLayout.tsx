'use client';
import React, { useEffect, useRef, useState } from 'react';
import { Box } from '@mui/material';
import Header from '@/components/layout/Header';
import dynamic from 'next/dynamic';
const Footer = dynamic(() => import('@/components/layout/Footer'), { ssr: false });
import PageTransitionOverlay from '@/components/ui/PageTransitionOverlay';
import { NextIntlClientProvider } from 'next-intl';
import { messages } from '@/lib/i18n/messages';
import { usePathname } from 'next/navigation';
import { ThemeProvider } from '@/context/ThemeContext';
import { FavoritesProvider } from '@/context/FavoritesContext';
import ChatBox from '@/components/ChatBox';
import AutoLogoutNotification from '@/components/ui/AutoLogoutNotification';

interface ClientLayoutProps {
  locale: string;
  children: React.ReactNode;
}

const ClientLayout: React.FC<ClientLayoutProps> = ({ locale, children }) => {
  const pathname = usePathname();
  const [showOverlay, setShowOverlay] = useState(false);
  const [fadeType, setFadeType] = useState<'in' | 'out'>('in');
  const prevPathname = useRef(pathname);
  const isManagerPage = pathname?.includes('/manager') || pathname?.includes('/admin');

  useEffect(() => {
    if (prevPathname.current !== pathname) {
      setFadeType('out');
      setShowOverlay(true);

      const timer = setTimeout(() => {
        setFadeType('in');
        setShowOverlay(false);
        prevPathname.current = pathname;
      }, 300);

      return () => clearTimeout(timer);
    }
  }, [pathname]);

  return (
    <ThemeProvider>
      <NextIntlClientProvider locale={locale} messages={messages[locale as keyof typeof messages]}>
        <FavoritesProvider>
          <PageTransitionOverlay show={showOverlay} fadeType={fadeType} />
          <Box
            className="app-container"
            suppressHydrationWarning
            sx={{
              bgcolor: '#fff',
              minHeight: '100vh',
              display: 'flex',
              flexDirection: 'column',
              '@media screen and (width: 1440px) and (height: 1920px)': {
                fontSize: '1.1rem',
              },
            }}
          >
            <Header />
            <Box
              component="main"
              className="main-content"
              suppressHydrationWarning
              sx={{
                bgcolor: '#fff',
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                width: '100%',
                maxWidth: 'none',
                px: 0,
                // Add responsive padding-top to prevent header overlap
                pt: { xs: '64px', sm: '64px', md: '64px' }, // Match header height
                '@media screen and (width: 1440px) and (height: 1920px)': {
                  fontSize: '1.1rem',
                },
              }}
            >
              {children}
              <ChatBox />
            </Box>
            {typeof window !== 'undefined' && !isManagerPage && <Footer />}
            <AutoLogoutNotification inactivityLimit={15} warningTime={2} />
          </Box>
        </FavoritesProvider>
      </NextIntlClientProvider>
    </ThemeProvider>
  );
};

export default ClientLayout;
