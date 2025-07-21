import React, { useEffect, useState } from 'react';
import { Box, Typography } from '@mui/material';
import useTheme from '@/hooks/useTheme';

interface PageTransitionOverlayProps {
  show: boolean;
  fadeType: 'in' | 'out';
}

const PageTransitionOverlay: React.FC<PageTransitionOverlayProps> = ({ show, fadeType }) => {
  const { theme } = useTheme();
  const [textVisible, setTextVisible] = useState(false);

  useEffect(() => {
    if (show && fadeType === 'in') {
      // Delay để chữ fade in sau khi overlay hiện
      const t = setTimeout(() => setTextVisible(true), 80);
      return () => clearTimeout(t);
    } else if (!show || fadeType === 'out') {
      setTextVisible(false);
    }
  }, [show, fadeType]);

  return (
    <Box
      sx={{
        position: 'fixed',
        zIndex: 2000,
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        display: show ? 'flex' : 'none',
        alignItems: 'center',
        justifyContent: 'center',
        background: theme === 'dark' ? '#111' : '#fff',
        transition: 'opacity 0.6s cubic-bezier(0.4,0,0.2,1)',
        opacity: fadeType === 'in' ? 1 : 0,
        pointerEvents: 'all',
      }}
      aria-hidden={!show}
    >
      <Typography
        sx={{
          color: theme === 'dark' ? '#fff' : '#111',
          fontWeight: 900,
          fontSize: '3rem',
          letterSpacing: '0.2em',
          fontFamily: 'Anton, Arial, sans-serif',
          textShadow: theme === 'dark' ? '0 2px 8px #000' : '0 2px 8px #fff',
          userSelect: 'none',
          opacity: textVisible ? 1 : 0,
          transition: 'opacity 0.7s cubic-bezier(0.4,0,0.2,1)',
        }}
      >
        NIDAS
      </Typography>
    </Box>
  );
};

export default PageTransitionOverlay;
