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
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import { usePathname, useRouter } from 'next/navigation';
import { ROUTES } from '@/lib/constants/constants';
import ThemeToggle from '@/components/ui/ThemeToggle';
import SearchIcon from '@mui/icons-material/Search';
import { useTranslations } from 'next-intl';

const LANGUAGES = ['en', 'vi'] as const;
type Language = typeof LANGUAGES[number];

type OutletSubmenuGroup = {
  title: string;
  children: { title: string; href: string }[];
};
type OutletSubmenuItem = { title: string; href: string };
type OutletSubmenu = (OutletSubmenuGroup | OutletSubmenuItem)[];

const Header = () => {
  const pathname = usePathname();
  const router = useRouter();
  const isMobile = useMediaQuery('(max-width:900px)');
  const muiTheme = useTheme();
  const isDarkMode = muiTheme.palette.mode === 'dark';
  const t = useTranslations('header');

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [openMenuIndex, setOpenMenuIndex] = useState<number | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [language, setLanguage] = useState<Language>('en');

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

  const NAV_LINKS = [
    {
      title: t('men.title'),
      href: ROUTES.MEN.ROOT,
      submenu: [
        { title: t('men.thun_polo'), href: ROUTES.MEN.THUN_POLO },
        { title: t('men.jersey'), href: ROUTES.MEN.JERSEY },
        { title: t('men.hoodie'), href: ROUTES.MEN.HOODIE },
        { title: t('men.sportset'), href: ROUTES.MEN.SPORTSET },
        { title: t('men.trousers'), href: ROUTES.MEN.TROUSERS },
        { title: t('men.tight_pants'), href: ROUTES.MEN.TIGHT_PANTS },
        { title: t('men.short_trouser'), href: ROUTES.MEN.SHORT_TROUSER },
        { title: t('men.sportswear'), href: ROUTES.MEN.SPORTSWEAR },
        { title: t('men.jacket'), href: ROUTES.MEN.JACKET },
        { title: t('men.basic'), href: ROUTES.MEN.BASIC },
        { title: t('men.tracksuits'), href: ROUTES.MEN.TRACKSUITS }
      ]
    },
    {
      title: t('women.title'),
      href: ROUTES.WOMEN.ROOT,
      submenu: [
        { title: t('women.thun_croptop'), href: ROUTES.WOMEN.THUN_CROPTOP },
        { title: t('women.sweatshirt'), href: ROUTES.WOMEN.SWEATSHIRT },
        { title: t('women.sports_bra'), href: ROUTES.WOMEN.SPORTS_BRA },
        { title: t('women.jersey'), href: ROUTES.WOMEN.JERSEY },
        { title: t('women.hoodie'), href: ROUTES.WOMEN.HOODIE },
        { title: t('women.jacket'), href: ROUTES.WOMEN.JACKET },
        { title: t('women.trousers'), href: ROUTES.WOMEN.TROUSERS },
        { title: t('women.short_trouser'), href: ROUTES.WOMEN.SHORT_TROUSER },
        { title: t('women.leggings'), href: ROUTES.WOMEN.LEGGINGS },
        { title: t('women.dress'), href: ROUTES.WOMEN.DRESS },
        { title: t('women.skirt'), href: ROUTES.WOMEN.SKIRT },
        { title: t('women.sportswear'), href: ROUTES.WOMEN.SPORTSWEAR },
        { title: t('women.basic'), href: ROUTES.WOMEN.BASIC },
        { title: t('women.tracksuits'), href: ROUTES.WOMEN.TRACKSUITS }
      ]
    },
    {
      title: t('kids.title'),
      href: ROUTES.KIDS.ROOT,
      submenu: [
        { title: t('kids.clothes_boys'), href: ROUTES.KIDS.CLOTHES_BOYS },
        { title: t('kids.clothes_girls'), href: ROUTES.KIDS.CLOTHES_GIRLS }
      ]
    },
    {
      title: t('accessories.title'),
      href: ROUTES.ACCESSORIES.ROOT,
      submenu: [
        { title: t('accessories.bags'), href: ROUTES.ACCESSORIES.BAGS },
        { title: t('accessories.hats'), href: ROUTES.ACCESSORIES.HATS },
        { title: t('accessories.socks'), href: ROUTES.ACCESSORIES.SOCKS },
        { title: t('accessories.sports_accessories'), href: ROUTES.ACCESSORIES.SPORTS_ACCESSORIES },
        { title: t('accessories.backpacks'), href: ROUTES.ACCESSORIES.BACKPACKS }
      ]
    },
    {
      title: t('sale.title'),
      href: ROUTES.SALE.ROOT,
      submenu: [
        { title: t('sale.men'), href: ROUTES.SALE.MEN_SALE },
        { title: t('sale.women'), href: ROUTES.SALE.WOMEN_SALE },
        { title: t('sale.kids'), href: ROUTES.SALE.KIDS_SALE },
        { title: t('sale.accessories'), href: ROUTES.SALE.ACCESSORIES_SALE },
        { title: t('sale.flash'), href: ROUTES.SALE.FLASH_SALE }
      ]
    },
    {
      title: t('outlet.title'),
      href: ROUTES.OUTLET.ROOT,
      submenu: [
        {
          title: t('outlet.men.title'),
          children: [
            { title: t('outlet.men.shoes'), href: ROUTES.OUTLET.MEN_SHOES },
            { title: t('outlet.men.clothing'), href: ROUTES.OUTLET.MEN_CLOTHING },
            { title: t('outlet.men.accessories'), href: ROUTES.OUTLET.MEN_ACCESSORIES },
            { title: t('outlet.men.all'), href: ROUTES.OUTLET.MEN }
          ]
        },
        {
          title: t('outlet.women.title'),
          children: [
            { title: t('outlet.women.shoes'), href: ROUTES.OUTLET.WOMEN_SHOES },
            { title: t('outlet.women.clothing'), href: ROUTES.OUTLET.WOMEN_CLOTHING },
            { title: t('outlet.women.accessories'), href: ROUTES.OUTLET.WOMEN_ACCESSORIES },
            { title: t('outlet.women.all'), href: ROUTES.OUTLET.WOMEN }
          ]
        },
        {
          title: t('outlet.kids.title'),
          children: [
            { title: t('outlet.kids.shoes'), href: ROUTES.OUTLET.KIDS_SHOES },
            { title: t('outlet.kids.clothing'), href: ROUTES.OUTLET.KIDS_CLOTHING },
            { title: t('outlet.kids.accessories'), href: ROUTES.OUTLET.KIDS_ACCESSORIES },
            { title: t('outlet.kids.all'), href: ROUTES.OUTLET.KIDS }
          ]
        }
      ]
    }
  ];
  // Xử lý khi hover vào menu
  const handleMenuHover = (event: React.MouseEvent<HTMLElement>, index: number, hasSubmenu: boolean) => {
    if (hasSubmenu) {
      setAnchorEl(event.currentTarget);
      setOpenMenuIndex(index);
    }
  };

  // Xử lý khi click vào menu
  const handleMenuClick = (index: number, href: string) => {
    setAnchorEl(null);
    setOpenMenuIndex(null);
    router.push(href);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setOpenMenuIndex(null);
  };

  const toggleDrawer = (open: boolean) => () => {
    setDrawerOpen(open);
  };

  const toggleLanguage = () => {
    const newLang: Language = language === 'en' ? 'vi' : 'en';

    // Thay đổi URL
    const pathParts = pathname.split('/');

    // Nếu URL hiện tại có prefix ngôn ngữ, thay prefix mới
    if (LANGUAGES.includes(pathParts[1] as Language)) {
      pathParts[1] = newLang;
    } else {
      // Nếu không có prefix, thêm prefix mới vào đầu (bỏ phần đầu rỗng)
      pathParts.splice(1, 0, newLang);
    }

    const newPath = pathParts.join('/') || '/';

    setLanguage(newLang);
    router.push(newPath);
  };

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
                    }}
                    onMouseEnter={(e) => handleMenuHover(e, i, !!submenu)}
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
                        '&:hover': {
                          borderBottom: '3px solid',
                          borderColor: 'black',
                          fontWeight: 'bold',
                        },
                      }}
                    >
                      {title}
                    </Button>

                    {submenu && (
                      <Popover
                        open={openMenuIndex === i}
                        anchorEl={anchorEl}
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
                          }
                        }}
                        sx={{
                          pointerEvents: 'none',
                          '& .MuiPopover-paper': {
                            pointerEvents: 'auto',
                            mt: 1,
                          },
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
          <Box sx={{ display: 'flex', alignItems: 'center', minWidth: 320, ml: 'auto' }}>
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
            <IconButton
              aria-label="profile"
              color="inherit"
              size="large"
              onClick={() => router.push(ROUTES.PROFILE)}
            >
              <AccountCircleIcon />
            </IconButton>
            {/* Mobile menu button */}
            {isMobile && (
              <IconButton aria-label="menu" color="inherit" size="large" onClick={toggleDrawer(true)}>
                <MenuIcon />
              </IconButton>
            )}
          </Box>
        </Toolbar>
      </AppBar>

      {/* Mobile Drawer */}
      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={toggleDrawer(false)}
      >
        <Box sx={{ width: 240 }} role="presentation" onClick={toggleDrawer(false)} onKeyDown={toggleDrawer(false)}>
          <List>
            {NAV_LINKS.map(({ title, href, submenu }) => (
              <React.Fragment key={title}>
                <ListItem disablePadding>
                  <ListItemButton
                    component={Link}
                    href={href as string}
                    onClick={() => setDrawerOpen(false)}
                  >
                    <ListItemText primary={title} primaryTypographyProps={{ textTransform: 'uppercase' }} />
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