"use client";
import React, { useEffect, useRef, useState } from 'react';
import { Box, Container } from '@mui/material';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import ChatBox from '@/components/ChatBox';
import { AuthProvider } from '@/context/AuthContext';
import PageTransitionOverlay from '@/components/ui/PageTransitionOverlay';
import { NextIntlClientProvider } from 'next-intl';
import { messages } from '@/lib/i18n/messages';
import { usePathname } from 'next/navigation';
import { ThemeProvider } from '@/context/ThemeContext';

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
  // Header scrollY state
  const [scrollY, setScrollY] = useState(0);

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

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isManagerPage = typeof window !== 'undefined' ? window.location.pathname.startsWith(`/${locale}/manager`) : false;

  return (
    <ThemeProvider>
      <NextIntlClientProvider locale={locale} messages={messages[locale as keyof typeof messages]}>
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
          <Header scrollY={scrollY} />
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
            <AuthProvider>{children}</AuthProvider>
          </Box>
          {typeof window !== 'undefined' && !isManagerPage && <Footer />}
          {/* ChatBox - hiển thị trên mọi trang */}
          <ChatBox userId="guest-123" />
        </Box>
      </NextIntlClientProvider>
    </ThemeProvider>
  );
};

export default ClientLayout; 