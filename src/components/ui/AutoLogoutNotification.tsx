'use client';

import React, { useState, useEffect } from 'react';
import { Snackbar, Alert, Button, Box, Typography } from '@mui/material';
import { useAuth } from '@/hooks/useAuth';

interface AutoLogoutNotificationProps {
  inactivityLimit?: number; // in minutes
  warningTime?: number; // in minutes before logout
}

const AutoLogoutNotification: React.FC<AutoLogoutNotificationProps> = ({
  inactivityLimit = 15,
  warningTime = 2
}) => {
  const [showWarning, setShowWarning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(warningTime * 60);
  const { updateActivity } = useAuth();

  useEffect(() => {
    let warningTimeout: NodeJS.Timeout;
    let countdownInterval: NodeJS.Timeout;

    const startWarningTimer = () => {
      const warningDelay = (inactivityLimit - warningTime) * 60 * 1000; // Convert to milliseconds
      warningTimeout = setTimeout(() => {
        setShowWarning(true);
        setTimeLeft(warningTime * 60);
        
        // Start countdown
        countdownInterval = setInterval(() => {
          setTimeLeft(prev => {
            if (prev <= 1) {
              // Auto logout
              localStorage.removeItem('auth_token');
              localStorage.removeItem('refresh_token');
              // Only redirect if not already on login page
              const currentPath = window.location.pathname;
              if (!currentPath.includes('/auth/login')) {
                const currentLocale = window.location.pathname.split('/')[1];
                const loginUrl = currentLocale === 'en' || currentLocale === 'vi' 
                  ? `/${currentLocale}/auth/login` 
                  : '/vi/auth/login';
                window.location.href = loginUrl;
              }
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      }, warningDelay);
    };

    // Reset timer on user activity
    const resetTimer = () => {
      clearTimeout(warningTimeout);
      clearInterval(countdownInterval);
      setShowWarning(false);
      setTimeLeft(warningTime * 60);
      updateActivity();
      startWarningTimer();
    };

    // Track user activity
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    
    events.forEach(event => {
      document.addEventListener(event, resetTimer, true);
    });

    // Start initial timer
    startWarningTimer();

    return () => {
      clearTimeout(warningTimeout);
      clearInterval(countdownInterval);
      events.forEach(event => {
        document.removeEventListener(event, resetTimer, true);
      });
    };
  }, [inactivityLimit, warningTime, updateActivity]);

  const handleStayLoggedIn = () => {
    setShowWarning(false);
    setTimeLeft(warningTime * 60);
    updateActivity();
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Snackbar
      open={showWarning}
      anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      sx={{ zIndex: 9999 }}
    >
      <Alert 
        severity="warning" 
        sx={{ 
          width: '100%',
          minWidth: 400,
          '& .MuiAlert-message': {
            width: '100%'
          }
        }}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          <Typography variant="body1" fontWeight="bold">
            Phiên đăng nhập sắp hết hạn
          </Typography>
          <Typography variant="body2">
            Bạn sẽ bị đăng xuất sau {formatTime(timeLeft)} do không hoạt động.
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
            <Button 
              variant="contained" 
              size="small" 
              onClick={handleStayLoggedIn}
              sx={{ minWidth: 100 }}
            >
              Tiếp tục
            </Button>
            <Button 
              variant="outlined" 
              size="small" 
              onClick={() => {
                localStorage.removeItem('auth_token');
                localStorage.removeItem('refresh_token');
                // Only redirect if not already on login page
                const currentPath = window.location.pathname;
                if (!currentPath.includes('/auth/login')) {
                  const currentLocale = window.location.pathname.split('/')[1];
                  const loginUrl = currentLocale === 'en' || currentLocale === 'vi' 
                    ? `/${currentLocale}/auth/login` 
                    : '/vi/auth/login';
                  window.location.href = loginUrl;
                }
              }}
              sx={{ minWidth: 100 }}
            >
              Đăng xuất
            </Button>
          </Box>
        </Box>
      </Alert>
    </Snackbar>
  );
};

export default AutoLogoutNotification; 