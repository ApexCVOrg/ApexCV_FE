'use client';

import React, { useState, useEffect } from 'react';
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
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import { usePathname, useRouter } from 'next/navigation';
import { ROUTES } from '@/lib/constants/constants';
import ThemeToggle from '@/components/ui/ThemeToggle';

// Các ngôn ngữ hỗ trợ
const LANGUAGES = ['en', 'vi'] as const;
type Language = typeof LANGUAGES[number];

const NAV_LINKS = [
  {
    title: 'Men',
    href: ROUTES.MEN.ROOT,
    submenu: [
      { title: 'Áo Thun & Polo', href: ROUTES.MEN.THUN_POLO },
      { title: 'Áo Jersey', href: ROUTES.MEN.JERSEY },
      { title: 'Áo hoodie', href: ROUTES.MEN.HOODIE },
      { title: 'Bộ đồ thể thao', href: ROUTES.MEN.SPORTSET },
      { title: 'Quần', href: ROUTES.MEN.TROUSERS },
      { title: 'Quần bó', href: ROUTES.MEN.TIGHT_PANTS },
      { title: 'Quần short', href: ROUTES.MEN.SHORT_TROUSER },
      { title: 'Sportswear', href: ROUTES.MEN.SPORTSWEAR },
      { title: 'Áo khoác', href: ROUTES.MEN.JACKET },
      { title: 'Cơ bản', href: ROUTES.MEN.BASIC },
      { title: 'Tracksuits', href: ROUTES.MEN.TRACKSUITS },
    ],
  },
  {
    title: 'Women',
    href: ROUTES.WOMEN.ROOT,
    submenu: [
      { title: 'Thun & croptop', href: ROUTES.WOMEN.THUN_CROPTOP },
      { title: 'Áo nỉ', href: ROUTES.WOMEN.SWEATSHIRT },
      { title: 'Áo ngực thể thao', href: ROUTES.WOMEN.SPORTS_BRA },
      { title: 'Áo Jersey', href: ROUTES.WOMEN.JERSEY },
      { title: 'Áo hoodie', href: ROUTES.WOMEN.HOODIE },
      { title: 'Áo khoác', href: ROUTES.WOMEN.JACKET },
      { title: 'Quần', href: ROUTES.WOMEN.TROUSERS },
      { title: 'Quần short', href: ROUTES.WOMEN.SHORT_TROUSER },
      { title: 'Leggings', href: ROUTES.WOMEN.LEGGINGS },
      { title: 'Đầm', href: ROUTES.WOMEN.DRESS },
      { title: 'Chân váy', href: ROUTES.WOMEN.SKIRT },
      { title: 'Sportswear', href: ROUTES.WOMEN.SPORTSWEAR },
      { title: 'Cơ bản', href: ROUTES.WOMEN.BASIC },
      { title: 'Tracksuits', href: ROUTES.WOMEN.TRACKSUITS },
    ],
  },
  {
    title: 'Kids',
    href: ROUTES.KIDS.ROOT,
    submenu: [
      { title: 'Quần áo bé trai', href: ROUTES.KIDS.CLOTHES_BOYS },
      { title: 'Quần áo bé gái', href: ROUTES.KIDS.CLOTHES_GIRLS },
    ],
  },
  {
    title: 'Accessories',
    href: ROUTES.ACCESSORIES.ROOT,
    submenu: [
      { title: 'Túi xách', href: ROUTES.ACCESSORIES.BAGS },
      { title: 'Mũ', href: ROUTES.ACCESSORIES.HATS },
      { title: 'Vớ', href: ROUTES.ACCESSORIES.SOCKS },
      { title: 'Phụ kiện thể thao', href: ROUTES.ACCESSORIES.SPORTS_ACCESSORIES },
      { title: 'Balo', href: ROUTES.ACCESSORIES.BACKPACKS },
    ],
  },
  {
    title: 'Sale',
    href: ROUTES.SALE.ROOT,
    submenu: [
      { title: 'Men Sale', href: ROUTES.SALE.MEN_SALE },
      { title: 'Women Sale', href: ROUTES.SALE.WOMEN_SALE },
      { title: 'Kids Sale', href: ROUTES.SALE.KIDS_SALE },
      { title: 'Accessories Sale', href: ROUTES.SALE.ACCESSORIES_SALE },
      { title: 'Flash Sale', href: ROUTES.SALE.FLASH_SALE },
    ],
  },
];

const Header = () => {
  const pathname = usePathname();
  const router = useRouter();
  const isMobile = useMediaQuery('(max-width:900px)');
  const muiTheme = useTheme();
  const isDarkMode = muiTheme.palette.mode === 'dark';

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [openMenuIndex, setOpenMenuIndex] = useState<number | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [language, setLanguage] = useState<Language>('en');

  // Lấy ngôn ngữ hiện tại từ URL (prefix đầu tiên)
  const getCurrentLanguage = (): Language => {
    const pathParts = pathname?.split('/') || [];
    if (pathParts[1] && LANGUAGES.includes(pathParts[1] as Language)) {
      return pathParts[1] as Language;
    }
    return 'en'; // mặc định là English nếu không có prefix
  };

  useEffect(() => {
    setLanguage(getCurrentLanguage());
  }, [pathname]);

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
            maxWidth: 1200,
            mx: 'auto',
            width: '100%',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            py: 1,
          }}
        >
          {/* Logo */}
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

          {/* Desktop Navigation */}
          {!isMobile && (
            <Stack direction="row" spacing={4} sx={{ flexGrow: 1, ml: 6 }}>
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
                      sx={{
                        pointerEvents: 'none',
                        '& .MuiPopover-paper': {
                          pointerEvents: 'auto',
                          mt: 1,
                        },
                      }}
                    >
                      <Box sx={{ p: 1 }}>
                        {submenu.map(({ title: subTitle, href: subHref }) => (
                          <MenuItem
                            key={subTitle}
                            component={Link}
                            href={subHref}
                            onClick={handleMenuClose}
                            sx={{ 
                              textTransform: 'capitalize',
                              minWidth: 200,
                            }}
                          >
                            {subTitle}
                          </MenuItem>
                        ))}
                      </Box>
                    </Popover>
                  )}
                </Box>
              ))}
            </Stack>
          )}

          {/* Right Icons */}
          <Stack direction="row" spacing={1} alignItems="center">
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
            <IconButton aria-label="profile" color="inherit" size="large" onClick={() => router.push(ROUTES.PROFILE)}>
              <AccountCircleIcon />
            </IconButton>

            {/* Mobile menu button */}
            {isMobile && (
              <IconButton aria-label="menu" color="inherit" size="large" onClick={toggleDrawer(true)}>
                <MenuIcon />
              </IconButton>
            )}
          </Stack>
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
                  submenu.map((sub) => (
                    <ListItem key={sub.title} sx={{ pl: 4 }} disablePadding>
                      <ListItemButton
                        component={Link}
                        href={sub.href as string}
                        onClick={() => setDrawerOpen(false)}
                      >
                        <ListItemText primary={sub.title} />
                      </ListItemButton>
                    </ListItem>
                  ))}
              </React.Fragment>
            ))}
          </List>
        </Box>
      </Drawer>
    </>
  );
};

export default Header;
