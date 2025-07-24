'use client';

import React, { useState, ReactNode, useEffect, useCallback } from 'react';
import {
  CssBaseline,
  Box,
  AppBar,
  Toolbar,
  Typography,
  Avatar,
  IconButton,
  Button,
  Stack,
  Menu,
  MenuItem,
  Tooltip,
  Container,
  Tabs,
  Tab,
} from '@mui/material';
import { useTranslations } from 'next-intl';
import { usePathname, useRouter } from 'next/navigation';
import { ROUTES } from '@/lib/constants/constants';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import SettingsIcon from '@mui/icons-material/Settings';
import InventoryIcon from '@mui/icons-material/Inventory';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import CategoryIcon from '@mui/icons-material/Category';
import NotificationsIcon from '@mui/icons-material/Notifications';
import LogoutIcon from '@mui/icons-material/Logout';
import PersonIcon from '@mui/icons-material/Person';
import HomeIcon from '@mui/icons-material/Home';
import ThemeToggle from '@/components/ui/ThemeToggle';
import ChatIcon from '@mui/icons-material/Chat';

// Các ngôn ngữ hỗ trợ
const LANGUAGES = ['en', 'vi'] as const;
type Language = (typeof LANGUAGES)[number];

interface RootLayoutProps {
  children: ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  const t = useTranslations('manager.layout');
  const pathname = usePathname();
  const router = useRouter();
  const [language, setLanguage] = useState<Language>('en');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  // Lấy ngôn ngữ hiện tại từ URL
  const getCurrentLanguage = useCallback((): Language => {
    const pathParts = pathname?.split('/') || [];
    if (pathParts[1] && LANGUAGES.includes(pathParts[1] as Language)) {
      return pathParts[1] as Language;
    }
    return 'en';
  }, [pathname]);

  useEffect(() => {
    setLanguage(getCurrentLanguage());
  }, [pathname, getCurrentLanguage]);

  const toggleLanguage = () => {
    const newLang: Language = language === 'en' ? 'vi' : 'en';
    const pathParts = pathname.split('/');

    if (LANGUAGES.includes(pathParts[1] as Language)) {
      pathParts[1] = newLang;
    } else {
      pathParts.splice(1, 0, newLang);
    }

    const newPath = pathParts.join('/') || '/';
    setLanguage(newLang);
    router.push(newPath);
  };

  const handleAvatarClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    handleClose();
    router.push('/auth/login');
  };

  const handleHome = () => {
    handleClose();
    router.push(ROUTES.HOME);
  };

  const menuItems = [
    { icon: <DashboardIcon />, text: t('dashboard'), href: ROUTES.MANAGER.DASHBOARD, value: 'dashboard' },
    { icon: <InventoryIcon />, text: t('products'), href: ROUTES.MANAGER.PRODUCTS, value: 'products' },
    { icon: <CategoryIcon />, text: t('categories'), href: ROUTES.MANAGER.CATEGORIES, value: 'categories' },
    { icon: <LocalShippingIcon />, text: t('orders'), href: ROUTES.MANAGER.ORDERS, value: 'orders' },
    { icon: <PeopleIcon />, text: t('customers'), href: ROUTES.MANAGER.CUSTOMERS, value: 'customers' },
    { icon: <ChatIcon />, text: t('chat'), href: ROUTES.MANAGER.CHAT, value: 'chats' },
    { icon: <SettingsIcon />, text: t('settings'), href: ROUTES.MANAGER.SETTINGS, value: 'settings' },
  ];

  // Determine current tab value based on pathname
  const getCurrentTab = () => {
    const currentPath = pathname;
    if (currentPath?.includes('/dashboard')) return 'dashboard';
    if (currentPath?.includes('/products')) return 'products';
    if (currentPath?.includes('/categories')) return 'categories';
    if (currentPath?.includes('/orders')) return 'orders';
    if (currentPath?.includes('/customers')) return 'customers';
    if (currentPath?.includes('/chats')) return 'chats';
    if (currentPath?.includes('/settings')) return 'settings';
    return 'dashboard';
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: string) => {
    const menuItem = menuItems.find(item => item.value === newValue);
    if (menuItem) {
      router.push(menuItem.href);
    }
  };

  return (
    <>
      <CssBaseline />
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          minHeight: '100vh',
          background: (theme) => theme.palette.mode === 'dark'
            ? 'linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #16213e 100%)'
            : 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
        }}
      >
        {/* Top AppBar */}
        <AppBar
          position="fixed"
          sx={{
            zIndex: theme => theme.zIndex.drawer + 1,
            background: (theme) => theme.palette.mode === 'dark'
              ? 'linear-gradient(135deg, rgba(0,0,0,0.95) 0%, rgba(26,26,46,0.95) 100%)'
              : 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(248,250,252,0.95) 100%)',
            backdropFilter: 'blur(10px)',
            border: (theme) => theme.palette.mode === 'dark'
              ? '1px solid rgba(100, 120, 150, 0.2)'
              : '1px solid rgba(0,0,0,0.08)',
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
          }}
        >
          <Toolbar
            sx={{
              justifyContent: 'space-between',
              px: { xs: 2, md: 4 },
              py: 1,
            }}
          >
            {/* Left - Brand */}
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Typography
                variant="h5"
                noWrap
                component="div"
                sx={{
                  fontWeight: 900,
                  fontSize: { xs: '1.25rem', md: '1.5rem' },
                  fontFamily: "'Inter', 'Roboto', 'Noto Sans', 'Segoe UI', sans-serif",
                  letterSpacing: 2,
                  background: (theme) => theme.palette.mode === 'dark'
                    ? 'linear-gradient(45deg, #64b5f6 30%, #42a5f5 90%)'
                    : 'linear-gradient(45deg, #1976d2 30%, #1565c0 90%)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                NIDAS
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  ml: 2,
                  fontWeight: 600,
                  color: 'text.secondary',
                  fontFamily: "'Inter', 'Roboto', 'Noto Sans', 'Segoe UI', sans-serif",
                  display: { xs: 'none', md: 'block' },
                }}
              >
                {t('managerDashboard')}
              </Typography>
            </Box>

            {/* Right - Controls */}
            <Stack
              direction="row"
              spacing={2}
              alignItems="center"
            >
              <Box sx={{ 
                '& .MuiIconButton-root': { 
                  color: 'text.primary',
                  '&:hover': {
                    backgroundColor: 'rgba(25, 118, 210, 0.08)',
                  },
                } 
              }}>
                <ThemeToggle />
              </Box>
              <Tooltip title="Change Language">
                <Button
                  variant="outlined"
                  size="small"
                  onClick={toggleLanguage}
                  sx={{
                    color: 'text.primary',
                    borderColor: 'divider',
                    textTransform: 'uppercase',
                    minWidth: 48,
                    height: 36,
                    fontWeight: 'bold',
                    fontSize: '0.75rem',
                    fontFamily: "'Inter', 'Roboto', 'Noto Sans', 'Segoe UI', sans-serif",
                    borderRadius: 2,
                    '&:hover': {
                      borderColor: 'primary.main',
                      backgroundColor: 'rgba(25, 118, 210, 0.08)',
                    },
                  }}
                >
                  {language.toUpperCase()}
                </Button>
              </Tooltip>
              <Tooltip title="Notifications">
                <IconButton
                  sx={{
                    color: 'text.primary',
                    '&:hover': {
                      backgroundColor: 'rgba(25, 118, 210, 0.08)',
                    },
                  }}
                >
                  <NotificationsIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Account">
                <IconButton onClick={handleAvatarClick}>
                  <Avatar 
                    sx={{ 
                      width: 32, 
                      height: 32,
                      backgroundColor: 'primary.main',
                    }}
                  />
                </IconButton>
              </Tooltip>
            </Stack>
          </Toolbar>

          {/* Navigation Tabs */}
          <Box sx={{ 
            borderTop: (theme) => theme.palette.mode === 'dark'
              ? '1px solid rgba(100, 120, 150, 0.2)'
              : '1px solid rgba(0,0,0,0.08)',
          }}>
            <Container maxWidth="xl">
              <Tabs
                value={getCurrentTab()}
                onChange={handleTabChange}
                variant="scrollable"
                scrollButtons="auto"
                sx={{
                  '& .MuiTabs-indicator': {
                    backgroundColor: 'primary.main',
                    height: 3,
                  },
                  '& .MuiTab-root': {
                    minHeight: 48,
                    textTransform: 'none',
                    fontWeight: 600,
                    fontSize: '0.875rem',
                    fontFamily: "'Inter', 'Roboto', 'Noto Sans', 'Segoe UI', sans-serif",
                    color: 'text.secondary',
                    '&.Mui-selected': {
                      color: 'primary.main',
                    },
                    '&:hover': {
                      color: 'primary.main',
                      backgroundColor: 'rgba(25, 118, 210, 0.04)',
                    },
                  },
                }}
              >
                {menuItems.map((item) => (
                  <Tab
                    key={item.value}
                    label={item.text}
                    value={item.value}
                    icon={item.icon}
                    iconPosition="start"
                    sx={{ 
                      minWidth: 120,
                      px: 2,
                    }}
                  />
                ))}
              </Tabs>
            </Container>
          </Box>
        </AppBar>

        {/* Main Content */}
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            pt: '112px', // Account for AppBar height + tabs
            minHeight: '100vh',
            width: '100%',
          }}
        >
          {children}
        </Box>

        {/* Account Menu */}
        <Menu
          anchorEl={anchorEl}
          open={open}
          onClose={handleClose}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          transformOrigin={{ vertical: 'top', horizontal: 'right' }}
          PaperProps={{
            sx: {
              background: (theme) => theme.palette.mode === 'dark'
                ? 'linear-gradient(135deg, rgba(26,26,46,0.95) 0%, rgba(0,0,0,0.95) 100%)'
                : 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(248,250,252,0.95) 100%)',
              backdropFilter: 'blur(10px)',
              border: (theme) => theme.palette.mode === 'dark'
                ? '1px solid rgba(100, 120, 150, 0.2)'
                : '1px solid rgba(0,0,0,0.08)',
              borderRadius: 2,
              boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
            },
          }}
        >
          <MenuItem 
            onClick={handleHome}
            sx={{
              fontFamily: "'Inter', 'Roboto', 'Noto Sans', 'Segoe UI', sans-serif",
              '&:hover': {
                backgroundColor: 'rgba(25, 118, 210, 0.08)',
              },
            }}
          >
            <HomeIcon sx={{ mr: 2 }} />
            Home
          </MenuItem>
          <MenuItem 
            onClick={handleClose}
            sx={{
              fontFamily: "'Inter', 'Roboto', 'Noto Sans', 'Segoe UI', sans-serif",
              '&:hover': {
                backgroundColor: 'rgba(25, 118, 210, 0.08)',
              },
            }}
          >
            <PersonIcon sx={{ mr: 2 }} />
            Account
          </MenuItem>
          <MenuItem 
            onClick={handleLogout}
            sx={{
              fontFamily: "'Inter', 'Roboto', 'Noto Sans', 'Segoe UI', sans-serif",
              color: 'error.main',
              '&:hover': {
                backgroundColor: 'rgba(211, 47, 47, 0.08)',
              },
            }}
          >
            <LogoutIcon sx={{ mr: 2 }} />
            Logout
          </MenuItem>
        </Menu>
      </Box>
    </>
  );
}