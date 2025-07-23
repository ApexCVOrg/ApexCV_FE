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
import { FavoritesProvider } from '@/context/FavoritesContext';
import ChatBox from '@/components/ChatBox';
import AutoLogoutNotification from '@/components/ui/AutoLogoutNotification';
import { useTheme } from '@/hooks/useTheme';
import { THEME } from '@/lib/constants/constants';

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
  const { theme } = useTheme();

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
    <NextIntlClientProvider locale={locale} messages={messages[locale as keyof typeof messages]}>
      <FavoritesProvider>
        <PageTransitionOverlay show={showOverlay} fadeType={fadeType} />
        <Box
          className="app-container"
          suppressHydrationWarning
          sx={{
            // Only set background for non-manager pages to avoid overriding manager layout backgrounds
            ...(isManagerPage ? {} : {
              bgcolor: theme === THEME.LIGHT ? '#fff' : '#000',
            }),
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            '@media screen and (width: 1440px) and (height: 1920px)': {
              fontSize: '1.1rem',
            },
          }}
        >
          {/* Only show Header for non-manager pages */}
          {!isManagerPage && <Header />}
          <Box
            component="main"
            className="main-content"
            suppressHydrationWarning
            sx={{
              // Only set background for non-manager pages
              ...(isManagerPage ? {} : {
                bgcolor: theme === THEME.LIGHT ? '#fff' : '#000',
              }),
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              width: '100%',
              maxWidth: 'none',
              px: 0,
              pt: isManagerPage ? 0 : 0, // No padding top for manager pages since they have their own header
              '@media screen and (width: 1440px) and (height: 1920px)': {
                fontSize: '1.1rem',
              },
            }}
          >
            {children}
            {/* Only show ChatBox for non-manager pages */}
            {!isManagerPage && <ChatBox />}
          </Box>
          {typeof window !== 'undefined' && !isManagerPage && <Footer />}
          <AutoLogoutNotification inactivityLimit={15} warningTime={2} />
        </Box>
      </FavoritesProvider>
    </NextIntlClientProvider>
  );
};

export default ClientLayout;
