'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Stack,
  Popover,
  MenuItem,
  useMediaQuery,
  IconButton,
  Drawer,
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Badge,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  TextField,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  InputAdornment,
  Menu,
  ListItemIcon,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import Logout from '@mui/icons-material/Logout';
import Person from '@mui/icons-material/Person';
import { usePathname, useRouter } from 'next/navigation';
import { ROUTES } from '@/lib/constants/constants';
import ThemeToggle from '@/components/ui/ThemeToggle';
import { useAuth } from '@/hooks/useAuth';
import { useTranslations } from 'next-intl';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import DashboardIcon from '@mui/icons-material/Dashboard';
import { useCartContext } from '@/context/CartContext';
import FavoriteIcon from '@mui/icons-material/Favorite';
import { useFavorites } from '@/hooks/useFavorites';
import HeaderMenuShoes from './HeaderMenuShoes';
import { useTheme } from '@/hooks/useTheme';
import { THEME } from '@/lib/constants/constants';

const LANGUAGES = ['en', 'vi'] as const;
type Language = (typeof LANGUAGES)[number];

type OutletSubmenuGroup = {
  title: string;
  children: { title: string; href: string }[];
};
type OutletSubmenuItem = { title: string; href: string };
type OutletSubmenu = (OutletSubmenuGroup | OutletSubmenuItem)[];

interface User {
  id: number;
  email: string;
  fullName: string;
  role: 'admin' | 'manager' | 'user';
}

const Header = () => {
  const pathname = usePathname();
  const router = useRouter();
  const isMobile = useMediaQuery('(max-width:900px)');
  const tHeader = useTranslations('header');
  const { isAuthenticated, logout, getCurrentUser } = useAuth();
  const [isUserAuthenticated, setIsUserAuthenticated] = useState(false);
  const { cartItemCount } = useCartContext();
  const t = useTranslations('login');
  const tRegister = useTranslations('register');
  const { favoritesCount } = useFavorites();
  const [userRole, setUserRole] = useState<User['role'] | null>(null);
  const [anchorElMenu, setAnchorElMenu] = useState<null | HTMLElement>(null);
  const [openMenuIndex, setOpenMenuIndex] = useState<number | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [language, setLanguage] = useState<Language>('en');
  const [mounted, setMounted] = useState(false);
  const [anchorElProfile, setAnchorElProfile] = useState<null | HTMLElement>(null);
  const openProfile = Boolean(anchorElProfile);
  // Thêm state cho mega menu shoes
  const [showShoesMenu, setShowShoesMenu] = useState(false);
  const [hideHeader, setHideHeader] = useState(false);
  const { theme } = useTheme();

  // Check if we're on the main page (homepage)
  const isMainPage = pathname === '/' || pathname === '/en' || pathname === '/vi' || pathname.endsWith('/page');

  // Tính background header dựa vào scrollY
  const bannerHeight = 400; // hoặc 60vh, tuỳ ý

  // --- NEW HEADER SHOW/HIDE LOGIC ---
  useEffect(() => {
    let lastY = window.scrollY;
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const currentY = window.scrollY;
          if (currentY < bannerHeight) {
            setHideHeader(false); // Always show header above banner
          } else {
            if (currentY > lastY) {
              setHideHeader(true); // Scrolling down, hide
            } else if (currentY < lastY) {
              setHideHeader(false); // Scrolling up, show
            }
          }
          lastY = currentY;
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [bannerHeight]);

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

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    // Check authentication status
    const authStatus = isAuthenticated();
    setIsUserAuthenticated(authStatus);

    const user = getCurrentUser() as User | null;
    if (user) {
      setUserRole(user.role);
    } else {
      // If no user in context, try to get from token
      if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
        const token = localStorage.getItem('auth_token');
        if (token) {
          try {
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(
              atob(base64)
                .split('')
                .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                .join('')
            );
            const payload = JSON.parse(jsonPayload);
            setUserRole(payload.role);
          } catch {
            setUserRole(null);
          }
        } else {
          setUserRole(null);
        }
      } else {
        setUserRole(null);
      }
    }
  }, [pathname, getCurrentUser, isAuthenticated]);



  const NAV_LINKS = [
    {
      title: tHeader('shoes.title'),
      href: ROUTES.SHOES.ROOT,
      submenu: [
        { title: tHeader('shoes.samba'), href: ROUTES.SHOES.SAMBA },
        { title: tHeader('shoes.gazelle'), href: ROUTES.SHOES.GAZELLE },
        { title: tHeader('shoes.sl72'), href: ROUTES.SHOES.SL_72 },
        { title: tHeader('shoes.superstar'), href: ROUTES.SHOES.SUPERSTAR },
        { title: tHeader('shoes.spezial'), href: ROUTES.SHOES.SPEZIAL },
        { title: tHeader('shoes.adizero'), href: ROUTES.SHOES.ADIZERO },
        { title: tHeader('shoes.air_force'), href: ROUTES.SHOES.AIR_FORCE },
        { title: tHeader('shoes.air_max'), href: ROUTES.SHOES.AIR_MAX },
      ],
    },
    {
      title: tHeader('men.title'),
      href: ROUTES.MEN.ROOT,
      submenu: [
        { title: tHeader('men.jersey'), href: ROUTES.MEN.JERSEY },
        { title: tHeader('men.hoodie'), href: ROUTES.MEN.HOODIE },
        { title: tHeader('men.short_trouser'), href: ROUTES.MEN.SHORT_TROUSER },
        { title: tHeader('men.jacket'), href: ROUTES.MEN.JACKET },
        { title: tHeader('men.team_sneaker'), href: ROUTES.MEN.TEAM_SNEAKER },
      ],
    },
    {
      title: tHeader('women.title'),
      href: ROUTES.WOMEN.ROOT,
      submenu: [
        { title: tHeader('women.jersey'), href: ROUTES.WOMEN.JERSEY },
        { title: tHeader('women.hoodie'), href: ROUTES.WOMEN.HOODIE },
        { title: tHeader('women.jacket'), href: ROUTES.WOMEN.JACKET },
        { title: tHeader('women.short_trouser'), href: ROUTES.WOMEN.SHORT_TROUSER },
        { title: tHeader('women.team_sneaker'), href: ROUTES.WOMEN.TEAM_SNEAKER },
      ],
    },
    {
      title: tHeader('kids.title'),
      href: ROUTES.KIDS.ROOT,
      submenu: [
        { title: tHeader('kids.jersey'), href: ROUTES.KIDS.JERSEY },
        { title: tHeader('kids.tracksuits'), href: ROUTES.KIDS.TRACKSUITS },
        { title: tHeader('kids.smiley'), href: ROUTES.KIDS.SMILEY },
      ],
    },
    {
      title: tHeader('accessories.title'),
      href: ROUTES.ACCESSORIES.ROOT,
      submenu: [
        { title: tHeader('accessories.bags'), href: ROUTES.ACCESSORIES.BAGS },
        { title: tHeader('accessories.hats'), href: ROUTES.ACCESSORIES.HATS },
        { title: tHeader('accessories.socks'), href: ROUTES.ACCESSORIES.SOCKS },
        { title: tHeader('accessories.eyewear'), href: ROUTES.ACCESSORIES.EYEWEAR },
      ]
    },
    {
      title: tHeader('outlet.title'),
      href: ROUTES.OUTLET.ROOT,
    },
  ];

  const handleMenuHover = (
    event: React.MouseEvent<HTMLElement>,
    index: number,
    hasSubmenu: boolean
  ) => {
    if (hasSubmenu) {
      setAnchorElMenu(event.currentTarget);
      setOpenMenuIndex(index);
    }
  };

  const handleMenuClick = (index: number, href: string) => {
    setAnchorElMenu(null);
    setOpenMenuIndex(null);
    router.push(href);
  };

  const handleMenuClose = () => {
    setAnchorElMenu(null);
    setOpenMenuIndex(null);
  };

  const toggleDrawer = (open: boolean) => () => {
    setDrawerOpen(open);
  };

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

  const handleClickProfile = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElProfile(event.currentTarget);
  };

  const handleCloseProfile = () => {
    setAnchorElProfile(null);
  };

  const handleLogout = () => {
    handleCloseProfile();
    logout();
  };

  const handleProfile = () => {
    handleCloseProfile();
    router.push(ROUTES.PROFILE);
  };

  const handleAdminDashboard = () => {
    handleCloseProfile();
    router.push(ROUTES.ADMIN_DASHBOARD);
  };

  const handleManagerDashboard = () => {
    handleCloseProfile();
    router.push(ROUTES.MANAGER_DASHBOARD);
  };

  if (!mounted) {
    return null;
  }

  return (
    <>
      <AppBar
        position="fixed"
        suppressHydrationWarning
        sx={{
          bgcolor: 'transparent !important',
          color: theme === THEME.LIGHT && isMainPage ? '#fff' : theme === THEME.LIGHT ? '#000' : '#fff',
          borderBottom: 'none',
          boxShadow: 'none !important',
          px: 0,
          py: 0,
          m: 0,
          width: '100%',
          left: 0,
          top: 0,
          zIndex: 1000,
          height: { xs: '64px', sm: '64px', md: '64px' }, // Responsive height
          transition: 'background 0.4s, box-shadow 0.4s, transform 0.4s cubic-bezier(.4,1.2,.6,1)',
          transform: hideHeader ? 'translateY(-100%)' : 'translateY(0)',
          '& .MuiToolbar-root': {
            bgcolor: 'transparent !important',
            boxShadow: 'none !important',
            border: 'none !important',
          },
          '& .MuiPaper-root': {
            bgcolor: 'transparent !important',
            boxShadow: 'none !important',
          },
          '&::before, &::after': {
            display: 'none !important',
          },
        }}
        elevation={0}
        style={{
          backgroundColor: 'transparent',
          boxShadow: 'none',
          border: 'none',
          margin: 0,
          padding: 0,
        }}
      >
        <Toolbar
          suppressHydrationWarning
          sx={{
            minHeight: { xs: '64px !important', sm: '64px !important', md: '64px !important' },
            height: { xs: '64px', sm: '64px', md: '64px' },
            px: { xs: 1, md: 2 },
            py: 0,
            m: 0,
            width: '100%',
            maxWidth: 1920,
            mx: 'auto',
            bgcolor: 'transparent !important',
            boxShadow: 'none !important',
            border: 'none !important',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
          }}
        >
          {/* Logo - Left */}
          <Box sx={{ display: 'flex', alignItems: 'center', minWidth: 120 }}>
            <Typography
              variant="h4"
              component={Link}
              href={ROUTES.HOME}
              sx={{
                textDecoration: 'none',
                color: 'inherit',
                fontWeight: 900,
                letterSpacing: 6,
                fontFamily: "'Anton', sans-serif",
                cursor: 'pointer',
              }}
            >
              NIDAS
            </Typography>
          </Box>

          {/* Menu - Center */}
          {!isMobile && (
            <Box
              sx={{
                position: 'absolute',
                left: '50%',
                top: 0,
                transform: 'translateX(-50%)',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                zIndex: 1,
                minWidth: 0,
                flexWrap: 'wrap',
              }}
            >
              <Stack direction="row" spacing={2} sx={{ flexWrap: 'wrap', minWidth: 0 }}>
                {NAV_LINKS.map(({ title, href, submenu }, i) => {
                  return i === 0 ? (
                    <Box
                      key={title}
                      sx={{ position: 'relative', display: 'inline-block' }}
                      onMouseEnter={() => setShowShoesMenu(true)}
                      onMouseLeave={() => setShowShoesMenu(false)}
                    >
                      <Button
                        color="inherit"
                        onClick={() => handleMenuClick(i, href as string)}
                        sx={{
                          fontWeight: pathname.startsWith(href as string) ? 'bold' : 'normal',
                          fontSize: '1rem',
                          textTransform: 'uppercase',
                          cursor: 'pointer',
                          position: 'relative',
                          '&::after': {
                            content: '""',
                            position: 'absolute',
                            bottom: 0,
                          },
                        }}
                      >
                        {title}
                      </Button>
                      {showShoesMenu && (
                        <Box
                          sx={{
                            position: 'absolute',
                            left: 0,
                            top: '100%',
                            zIndex: 2000,
                            mt: 0,
                          }}
                        >
                          <HeaderMenuShoes />
                        </Box>
                      )}
                    </Box>
                  ) : (
                    <Box
                      key={title}
                      sx={{
                        position: 'relative',
                        '&:hover': {
                          '& .MuiPopover-root': {
                            pointerEvents: 'auto',
                          },
                        },
                      }}
                      onMouseEnter={e => handleMenuHover(e, i, !!submenu)}
                      onMouseLeave={handleMenuClose}
                    >
                      <Button
                        color="inherit"
                        onClick={() => handleMenuClick(i, href as string)}
                        sx={{
                          fontWeight: pathname.startsWith(href as string) ? 'bold' : 'normal',
                          fontSize: '1rem',
                          textTransform: 'uppercase',
                          cursor: 'pointer',
                          position: 'relative',
                          '&::after': {
                            content: '""',
                            position: 'absolute',
                            bottom: 0,
                          },
                        }}
                      >
                        {title}
                      </Button>
                      {submenu && (
                        <Popover
                          open={openMenuIndex === i}
                          anchorEl={anchorElMenu}
                          onClose={handleMenuClose}
                          anchorOrigin={{
                            vertical: 'bottom',
                            horizontal: 'left',
                          }}
                          transformOrigin={{
                            vertical: 'top',
                            horizontal: 'left',
                          }}
                          PaperProps={{
                            sx: {
                              left: 0,
                              right: 0,
                              width: '100vw',
                              maxWidth: 'none',
                              borderRadius: 0,
                              boxShadow: 2,
                              px: 0,
                              mt: 0,
                            },
                          }}
                          sx={{
                            pointerEvents: 'none',
                            '& .MuiPopover-paper': {
                              pointerEvents: 'auto',
                            },
                          }}
                          slotProps={{
                            paper: {
                              onMouseEnter: () => setAnchorElMenu(anchorElMenu),
                              onMouseLeave: handleMenuClose,
                            },
                          }}
                        >
                          {href === ROUTES.OUTLET.ROOT ? (
                            <Box sx={{ p: 2, display: 'flex', gap: 4, maxWidth: 1200, mx: 'auto' }}>
                              {(submenu as OutletSubmenu).map(group =>
                                'children' in group ? (
                                  <Box key={group.title}>
                                    <Typography sx={{ fontWeight: 'bold', mb: 1 }}>
                                      {group.title}
                                    </Typography>
                                    {group.children.map(item => (
                                      <MenuItem
                                        key={item.title}
                                        component={Link}
                                        href={item.href}
                                        onClick={handleMenuClose}
                                        sx={{ minWidth: 180 }}
                                      >
                                        {item.title}
                                      </MenuItem>
                                    ))}
                                  </Box>
                                ) : (
                                  <Box key={group.title}>
                                    <MenuItem
                                      component={Link}
                                      href={group.href}
                                      onClick={handleMenuClose}
                                      sx={{ minWidth: 180 }}
                                    >
                                      {group.title}
                                    </MenuItem>
                                  </Box>
                                )
                              )}
                            </Box>
                          ) : (
                            <Box sx={{ p: 1 }}>
                              {submenu
                                .filter((item): item is OutletSubmenuItem => 'href' in item)
                                .map(item => (
                                  <MenuItem
                                    key={item.title}
                                    component={Link}
                                    href={item.href}
                                    onClick={handleMenuClose}
                                    sx={{
                                      textTransform: 'capitalize',
                                      minWidth: 200,
                                    }}
                                  >
                                    {item.title}
                                  </MenuItem>
                                ))}
                            </Box>
                          )}
                        </Popover>
                      )}
                    </Box>
                  );
                })}
              </Stack>
            </Box>
          )}

          {/* Right - Search + Icon */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              minWidth: 0,
              ml: 'auto',
              mr: { xs: 0, md: 4 },
              position: 'relative',
              zIndex: 1200,
              flexWrap: 'wrap',
              gap: { xs: 1, md: 2 },
              width: { xs: '100%', sm: 'auto' },
              maxWidth: '100vw',
            }}
          >
            <ThemeToggle />
            {/* Nút đổi ngôn ngữ */}
            <Button
              variant="outlined"
              size="small"
              onClick={toggleLanguage}
              sx={{
                color: theme === THEME.LIGHT && isMainPage ? '#fff' : theme === THEME.LIGHT ? '#000' : '#fff',
                borderColor: theme === THEME.LIGHT && isMainPage ? '#fff' : theme === THEME.LIGHT ? '#000' : '#fff',
                textTransform: 'uppercase',
                minWidth: 48,
                fontWeight: 'bold',
                fontSize: '0.875rem',
                '&:hover': {
                  borderColor: theme === THEME.LIGHT && isMainPage ? '#fff' : theme === THEME.LIGHT ? '#000' : '#fff',
                  backgroundColor: theme === THEME.LIGHT && isMainPage ? 'rgba(255,255,255,0.1)' : theme === THEME.LIGHT ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.1)',
                },
              }}
            >
              {language.toUpperCase()}
            </Button>
            <IconButton
              aria-label="cart"
              color="inherit"
              size="large"
              onClick={() => router.push(ROUTES.CART)}
              sx={{ color: theme === THEME.LIGHT && isMainPage ? '#fff' : theme === THEME.LIGHT ? '#000' : '#fff' }}
            >
              <Badge badgeContent={cartItemCount} color="secondary">
                <ShoppingCartIcon />
              </Badge>
            </IconButton>

            {/* Mobile menu button */}
            {isUserAuthenticated ? (
              <Box sx={{ position: 'relative' }}>
                <IconButton
                  onClick={handleClickProfile}
                  size="small"
                  sx={{ ml: 2, mr: 10, color: theme === THEME.LIGHT && isMainPage ? '#fff' : theme === THEME.LIGHT ? '#000' : '#fff' }}
                  aria-controls={openProfile ? 'account-menu' : undefined}
                  aria-haspopup="true"
                  aria-expanded={openProfile ? 'true' : undefined}
                >
                  <AccountCircleIcon />
                </IconButton>
                <Menu
                  anchorEl={anchorElProfile}
                  id="account-menu"
                  open={openProfile}
                  onClose={handleCloseProfile}
                  onClick={handleCloseProfile}
                  transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                  anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                  sx={{
                    '& .MuiPaper-root': {
                      mt: 1.5,
                      minWidth: 180,
                      boxShadow: 3,
                    },
                  }}
                >
                  <MenuItem onClick={handleProfile}>
                    <ListItemIcon>
                      <Person fontSize="small" />
                    </ListItemIcon>
                    {t('profile')}
                  </MenuItem>
                  {/* Thêm menu coupon */}
                  <MenuItem
                    onClick={() => {
                      handleCloseProfile();
                      router.push(`/${language}/voucher`);
                    }}
                  >
                    <ListItemIcon>
                      <span role="img" aria-label="coupon">
                        🎟️
                      </span>
                    </ListItemIcon>
                    Coupon
                  </MenuItem>
                  <MenuItem onClick={() => router.push('/favorites')}>
                    <ListItemIcon>
                      <FavoriteIcon fontSize="small" />
                    </ListItemIcon>
                    Favorites
                    {favoritesCount > 0 && (
                      <Box
                        sx={{
                          ml: 'auto',
                          bgcolor: 'error.main',
                          color: 'white',
                          borderRadius: '50%',
                          width: 20,
                          height: 20,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '0.75rem',
                          fontWeight: 'bold',
                        }}
                      >
                        {favoritesCount > 99 ? '99+' : favoritesCount}
                      </Box>
                    )}
                  </MenuItem>
                  <MenuItem
                    onClick={() => {
                      handleCloseProfile();
                      router.push(`/${language}/order-history`);
                    }}
                  >
                    <ListItemIcon>
                      <span role="img" aria-label="history">🕑</span>
                    </ListItemIcon>
                    Lịch sử
                  </MenuItem>
                  {userRole === 'admin' && (
                    <MenuItem onClick={handleAdminDashboard}>
                      <ListItemIcon>
                        <AdminPanelSettingsIcon fontSize="small" />
                      </ListItemIcon>
                      Admin Dashboard
                    </MenuItem>
                  )}
                  {userRole === 'manager' && (
                    <MenuItem onClick={handleManagerDashboard}>
                      <ListItemIcon>
                        <DashboardIcon fontSize="small" />
                      </ListItemIcon>
                      Manager Dashboard
                    </MenuItem>
                  )}
                  <MenuItem onClick={handleLogout}>
                    <ListItemIcon>
                      <Logout fontSize="small" />
                    </ListItemIcon>
                    {t('logout')}
                  </MenuItem>
                </Menu>
              </Box>
            ) : (
              <Stack direction="row" spacing={1}>
                <Button
                  variant="outlined"
                  color="inherit"
                  onClick={() => router.push(ROUTES.LOGIN)}
                  sx={{ 
                    color: theme === THEME.LIGHT && isMainPage ? '#fff' : theme === THEME.LIGHT ? '#000' : '#fff', 
                    borderColor: theme === THEME.LIGHT && isMainPage ? '#fff' : theme === THEME.LIGHT ? '#000' : '#fff',
                    '&:hover': {
                      borderColor: theme === THEME.LIGHT && isMainPage ? '#fff' : theme === THEME.LIGHT ? '#000' : '#fff',
                      backgroundColor: theme === THEME.LIGHT && isMainPage ? 'rgba(255,255,255,0.1)' : theme === THEME.LIGHT ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.1)',
                    }
                  }}
                >
                  {t('loginButton')}
                </Button>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => router.push(ROUTES.REGISTER)}
                >
                  {tRegister('register')}
                </Button>
              </Stack>
            )}

            {/* Mobile Menu Icon */}
            {isMobile && (
              <IconButton
                aria-label="menu"
                color="inherit"
                size="large"
                onClick={toggleDrawer(true)}
                sx={{ color: theme === THEME.LIGHT && isMainPage ? '#fff' : theme === THEME.LIGHT ? '#000' : '#fff' }}
              >
                <MenuIcon />
              </IconButton>
            )}
          </Box>
        </Toolbar>
      </AppBar>

      {/* Mobile Drawer */}
      <Drawer anchor="right" open={drawerOpen} onClose={toggleDrawer(false)}>
        <Box
          sx={{ width: '70vw', maxWidth: 320 }}
          role="presentation"
          onClick={toggleDrawer(false)}
          onKeyDown={toggleDrawer(false)}
        >
          <List>
            {NAV_LINKS.map(({ title, href, submenu }) => (
              <React.Fragment key={title}>
                <ListItem disablePadding>
                  <ListItemButton
                    component={Link}
                    href={href as string}
                    onClick={() => setDrawerOpen(false)}
                  >
                    <ListItemText
                      primary={title}
                      primaryTypographyProps={{ textTransform: 'uppercase' }}
                    />
                  </ListItemButton>
                </ListItem>
                {submenu &&
                  (submenu as OutletSubmenu).map(sub =>
                    'children' in sub
                      ? sub.children.map(item => (
                          <ListItem key={item.title} sx={{ pl: 4 }} disablePadding>
                            <ListItemButton
                              component={Link}
                              href={item.href}
                              onClick={() => setDrawerOpen(false)}
                            >
                              <ListItemText primary={item.title} />
                            </ListItemButton>
                          </ListItem>
                        ))
                      : 'href' in sub && (
                          <ListItem key={sub.title} sx={{ pl: 4 }} disablePadding>
                            <ListItemButton
                              component={Link}
                              href={sub.href}
                              onClick={() => setDrawerOpen(false)}
                            >
                              <ListItemText primary={sub.title} />
                            </ListItemButton>
                          </ListItem>
                        )
                  )}
              </React.Fragment>
            ))}
          </List>
        </Box>
      </Drawer>
    </>
  );
};

export default Header;
