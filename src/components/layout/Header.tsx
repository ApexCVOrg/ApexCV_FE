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
  useTheme,
  TextField,
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
import SearchIcon from '@mui/icons-material/Search';
import { useAuth } from '@/hooks/useAuth';
import { useTranslations } from 'next-intl';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import DashboardIcon from '@mui/icons-material/Dashboard';

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
  const muiTheme = useTheme();
  const isDarkMode = muiTheme.palette.mode === 'dark';
  const tHeader = useTranslations('header');
  const { isAuthenticated, logout, getCurrentUser } = useAuth();
  const t = useTranslations('login');
  const tRegister = useTranslations('register');
  const [userRole, setUserRole] = useState<User['role'] | null>(null);
  const [anchorElMenu, setAnchorElMenu] = useState<null | HTMLElement>(null);
  const [openMenuIndex, setOpenMenuIndex] = useState<number | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [language, setLanguage] = useState<Language>('en');
  const [mounted, setMounted] = useState(false);
  const [anchorElProfile, setAnchorElProfile] = useState<null | HTMLElement>(null);
  const openProfile = Boolean(anchorElProfile);

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
    const user = getCurrentUser() as User | null;
    if (user) {
      setUserRole(user.role);
    } else {
      // If no user in context, try to get from token
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
        } catch (e) {
          console.error('Error decoding token:', e);
          setUserRole(null);
        }
      } else {
        setUserRole(null);
      }
    }
  }, [pathname, getCurrentUser]);

  const NAV_LINKS = [
    {
      title: tHeader('men.title'),
      href: ROUTES.MEN.ROOT,
      submenu: [
        { title: tHeader('men.thun_polo'), href: ROUTES.MEN.THUN_POLO },
        { title: tHeader('men.jersey'), href: ROUTES.MEN.JERSEY },
        { title: tHeader('men.hoodie'), href: ROUTES.MEN.HOODIE },
        { title: tHeader('men.sportset'), href: ROUTES.MEN.SPORTSET },
        { title: tHeader('men.trousers'), href: ROUTES.MEN.TROUSERS },
        { title: tHeader('men.tight_pants'), href: ROUTES.MEN.TIGHT_PANTS },
        { title: tHeader('men.short_trouser'), href: ROUTES.MEN.SHORT_TROUSER },
        { title: tHeader('men.sportswear'), href: ROUTES.MEN.SPORTSWEAR },
        { title: tHeader('men.jacket'), href: ROUTES.MEN.JACKET },
        { title: tHeader('men.basic'), href: ROUTES.MEN.BASIC },
        { title: tHeader('men.tracksuits'), href: ROUTES.MEN.TRACKSUITS }
      ]
    },
    {
      title: tHeader('women.title'),
      href: ROUTES.WOMEN.ROOT,
      submenu: [
        { title: tHeader('women.thun_croptop'), href: ROUTES.WOMEN.THUN_CROPTOP },
        { title: tHeader('women.sweatshirt'), href: ROUTES.WOMEN.SWEATSHIRT },
        { title: tHeader('women.sports_bra'), href: ROUTES.WOMEN.SPORTS_BRA },
        { title: tHeader('women.jersey'), href: ROUTES.WOMEN.JERSEY },
        { title: tHeader('women.hoodie'), href: ROUTES.WOMEN.HOODIE },
        { title: tHeader('women.jacket'), href: ROUTES.WOMEN.JACKET },
        { title: tHeader('women.trousers'), href: ROUTES.WOMEN.TROUSERS },
        { title: tHeader('women.short_trouser'), href: ROUTES.WOMEN.SHORT_TROUSER },
        { title: tHeader('women.leggings'), href: ROUTES.WOMEN.LEGGINGS },
        { title: tHeader('women.dress'), href: ROUTES.WOMEN.DRESS },
        { title: tHeader('women.skirt'), href: ROUTES.WOMEN.SKIRT },
        { title: tHeader('women.sportswear'), href: ROUTES.WOMEN.SPORTSWEAR },
        { title: tHeader('women.basic'), href: ROUTES.WOMEN.BASIC },
        { title: tHeader('women.tracksuits'), href: ROUTES.WOMEN.TRACKSUITS }
      ]
    },
    {
      title: tHeader('kids.title'),
      href: ROUTES.KIDS.ROOT,
      submenu: [
        { title: tHeader('kids.clothes_boys'), href: ROUTES.KIDS.CLOTHES_BOYS },
        { title: tHeader('kids.clothes_girls'), href: ROUTES.KIDS.CLOTHES_GIRLS }
      ]
    },
    {
      title: tHeader('accessories.title'),
      href: ROUTES.ACCESSORIES.ROOT,
      submenu: [
        { title: tHeader('accessories.bags'), href: ROUTES.ACCESSORIES.BAGS },
        { title: tHeader('accessories.hats'), href: ROUTES.ACCESSORIES.HATS },
        { title: tHeader('accessories.socks'), href: ROUTES.ACCESSORIES.SOCKS },
        { title: tHeader('accessories.sports_accessories'), href: ROUTES.ACCESSORIES.SPORTS_ACCESSORIES },
        { title: tHeader('accessories.backpacks'), href: ROUTES.ACCESSORIES.BACKPACKS }
      ]
    },
    {
      title: tHeader('sale.title'),
      href: ROUTES.SALE.ROOT,
      submenu: [
        { title: tHeader('sale.men'), href: ROUTES.SALE.MEN_SALE },
        { title: tHeader('sale.women'), href: ROUTES.SALE.WOMEN_SALE },
        { title: tHeader('sale.kids'), href: ROUTES.SALE.KIDS_SALE },
        { title: tHeader('sale.accessories'), href: ROUTES.SALE.ACCESSORIES_SALE },
        { title: tHeader('sale.flash'), href: ROUTES.SALE.FLASH_SALE }
      ]
    },
    {
      title: tHeader('outlet.title'),
      href: ROUTES.OUTLET.ROOT,
      submenu: [
        {
          title: tHeader('outlet.men.title'),
          children: [
            { title: tHeader('outlet.men.shoes'), href: ROUTES.OUTLET.MEN_SHOES },
            { title: tHeader('outlet.men.clothing'), href: ROUTES.OUTLET.MEN_CLOTHING },
            { title: tHeader('outlet.men.accessories'), href: ROUTES.OUTLET.MEN_ACCESSORIES },
            { title: tHeader('outlet.men.all'), href: ROUTES.OUTLET.MEN }
          ]
        },
        {
          title: tHeader('outlet.women.title'),
          children: [
            { title: tHeader('outlet.women.shoes'), href: ROUTES.OUTLET.WOMEN_SHOES },
            { title: tHeader('outlet.women.clothing'), href: ROUTES.OUTLET.WOMEN_CLOTHING },
            { title: tHeader('outlet.women.accessories'), href: ROUTES.OUTLET.WOMEN_ACCESSORIES },
            { title: tHeader('outlet.women.all'), href: ROUTES.OUTLET.WOMEN }
          ]
        },
        {
          title: tHeader('outlet.kids.title'),
          children: [
            { title: tHeader('outlet.kids.shoes'), href: ROUTES.OUTLET.KIDS_SHOES },
            { title: tHeader('outlet.kids.clothing'), href: ROUTES.OUTLET.KIDS_CLOTHING },
            { title: tHeader('outlet.kids.accessories'), href: ROUTES.OUTLET.KIDS_ACCESSORIES },
            { title: tHeader('outlet.kids.all'), href: ROUTES.OUTLET.KIDS }
          ]
        }
      ]
    }
  ];

  const handleMenuHover = (event: React.MouseEvent<HTMLElement>, index: number, hasSubmenu: boolean) => {
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
        position="sticky"
        sx={{
          bgcolor: isDarkMode ? '#000' : '#fff',
          color: isDarkMode ? '#fff' : '#000',
          borderBottom: '1px solid',
          borderColor: isDarkMode ? 'grey.800' : 'grey.300',
          px: 2,
        }}
        elevation={0}
      >
        <Toolbar
          sx={{
            position: 'relative',
            minHeight: 64,
            px: 2,
            width: '100%',
            maxWidth: 1920,
            mx: 'auto',
            bgcolor: isDarkMode ? '#000' : '#fff',
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
              }}
            >
              <Stack direction="row" spacing={4}>
                {NAV_LINKS.map(({ title, href, submenu }, i) => (
                  <Box 
                    key={title} 
                    sx={{ 
                      position: 'relative',
                      '&:hover': {
                        '& .MuiPopover-root': {
                          pointerEvents: 'auto',
                        }
                      }
                    }}
                    onMouseEnter={(e) => handleMenuHover(e, i, !!submenu)}
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
                          left: 0,
                          width: '100%',
                          height: '3px',
                          backgroundColor: 'black',
                          transform: 'scaleX(0)',
                          transition: 'transform 0.3s ease',
                          transformOrigin: 'bottom',
                        },
                        '&:hover': {
                          backgroundColor: 'transparent',
                          '&::after': {
                            transform: 'scaleX(1)',
                          },
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
                          }
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
                          }
                        }}
                      >
                        {href === ROUTES.OUTLET.ROOT ? (
                          <Box sx={{ p: 2, display: 'flex', gap: 4, maxWidth: 1200, mx: 'auto' }}>
                            {(submenu as OutletSubmenu).map((group) =>
                              'children' in group ? (
                                <Box key={group.title}>
                                  <Typography sx={{ fontWeight: 'bold', mb: 1 }}>{group.title}</Typography>
                                  {group.children.map((item) => (
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
                              .map((item) => (
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
                ))}
              </Stack>
            </Box>
          )}

          {/* Right - Search + Icon */}
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            minWidth: 320, 
            ml: 'auto',
            position: 'relative',
            zIndex: 1200 // Đảm bảo menu profile luôn hiển thị trên cùng
          }}>
            {/* Search Bar */}
            <Box sx={{ mx: 2, width: 200 }}>
              <TextField
                size="small"
                placeholder="Tìm kiếm"
                fullWidth
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                  sx: { borderRadius: 5, bgcolor: isDarkMode ? '#222' : '#f5f5f5' }
                }}
                variant="outlined"
              />
            </Box>
            <ThemeToggle />
            {/* Nút đổi ngôn ngữ */}
            <Button
              variant="outlined"
              size="small"
              onClick={toggleLanguage}
              sx={{
                color: 'inherit',
                borderColor: 'inherit',
                textTransform: 'uppercase',
                minWidth: 48,
                fontWeight: 'bold',
                fontSize: '0.875rem',
                '&:hover': {
                  borderColor: isDarkMode ? 'white' : 'black',
                  backgroundColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
                },
              }}
            >
              {language.toUpperCase()}
            </Button>
            <IconButton aria-label="cart" color="inherit" size="large" onClick={() => router.push(ROUTES.CART)}>
              <Badge badgeContent={0} color="secondary">
                <ShoppingCartIcon />
              </Badge>
            </IconButton>

            {/* Mobile menu button */}
            {isAuthenticated ? (
              <Box sx={{ position: 'relative' }}>
                <IconButton
                  onClick={handleClickProfile}
                  size="small"
                  sx={{ ml: 2 }}
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
                    }
                  }}
                >
                  <MenuItem onClick={handleProfile}>
                    <ListItemIcon>
                      <Person fontSize="small" />
                    </ListItemIcon>
                    {t('profile')}
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
          sx={{ width: 240 }}
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
                  (submenu as OutletSubmenu).map((sub) =>
                    'children' in sub
                      ? sub.children.map((item) => (
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
                      : (
                        'href' in sub && (
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
