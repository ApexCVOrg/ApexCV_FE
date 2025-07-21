"use client";
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
import { useAuth } from '@/hooks/useAuth';
import { FavoritesProvider } from '@/context/FavoritesContext';
import ChatBox from '@/components/ChatBox';
import AutoLogoutNotification from '@/components/ui/AutoLogoutNotification';

interface ClientLayoutProps {
  locale: string;
  children: React.ReactNode;
}

const ClientLayout: React.FC<ClientLayoutProps> = ({ locale, children }) => {
  // Overlay state
  const [showOverlay, setShowOverlay] = useState(false);
  const [fadeType, setFadeType] = useState<'in' | 'out'>('in');
  const pathname = usePathname();
  const prevPath = useRef<string | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const auth = useAuth();
  const currentUser = auth.getCurrentUser ? auth.getCurrentUser() : null;
  const userId = currentUser?.id ? String(currentUser.id) : (currentUser?.email || 'guest-guest');

  useEffect(() => {
    if (prevPath.current !== null && prevPath.current !== pathname) {
      setShowOverlay(true);
      setFadeType('in');
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
        setFadeType('out');
        timeoutRef.current = setTimeout(() => {
          setShowOverlay(false);
        }, 600);
      }, 400);
    }
    prevPath.current = pathname;
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [pathname]);

  const isManagerPage = typeof window !== 'undefined' ? window.location.pathname.startsWith(`/${locale}/manager`) : false;

  return (
    <ThemeProvider>
      <NextIntlClientProvider locale={locale} messages={messages[locale as keyof typeof messages]}>
        <FavoritesProvider>
          <PageTransitionOverlay show={showOverlay} fadeType={fadeType} />
          <Box
            className="app-container"
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
              sx={{
                bgcolor: '#fff',
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                width: '100%',
                maxWidth: 'none',
                px: 0,
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