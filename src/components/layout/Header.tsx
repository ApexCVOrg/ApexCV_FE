'use client';

import Link from 'next/link';
import { useTheme } from '@/hooks/useTheme';
import { ROUTES } from '@/lib/constants/constants';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Stack,
  IconButton,
  Badge,
  useMediaQuery,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
} from '@mui/material';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import MenuIcon from '@mui/icons-material/Menu';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import ThemeToggle from '@/components/ui/ThemeToggle';
import { usePathname, useRouter } from 'next/navigation';
import React, { useState, useEffect } from 'react';

const NAV_LINKS = [
  { title: 'Men', href: ROUTES.MEN },
  { title: 'Women', href: ROUTES.WOMEN },
  { title: 'Kids', href: ROUTES.KIDS },
  { title: 'Accessories', href: ROUTES.ACCESSORIES },
  { title: 'Sale', href: ROUTES.SALE },
];

// Các ngôn ngữ hỗ trợ
const LANGUAGES = ['en', 'vi'] as const;
type Language = typeof LANGUAGES[number];

const Header = () => {
  const { theme } = useTheme();
  const pathname = usePathname();
  const router = useRouter();
  const isMobile = useMediaQuery('(max-width:900px)');
  const [drawerOpen, setDrawerOpen] = useState(false);

  const [language, setLanguage] = useState<Language>('en');

  useEffect(() => {
    const getCurrentLanguage = (): Language => {
      const pathParts = pathname?.split('/') || [];
      if (pathParts[1] && LANGUAGES.includes(pathParts[1] as Language)) {
        return pathParts[1] as Language;
      }
      return 'en'; // mặc định là English nếu không có prefix
    };

    setLanguage(getCurrentLanguage());
  }, [pathname]);

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
          bgcolor: theme === 'dark' ? '#000' : '#fff',
          color: theme === 'dark' ? '#fff' : '#000',
          borderBottom: '1px solid',
          borderColor: theme === 'dark' ? 'grey.800' : 'grey.300',
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
          {/* Logo Adidas style */}
          <Link href={ROUTES.HOME} style={{ textDecoration: 'none', color: 'inherit' }}>
            <Typography
              variant="h4"
              sx={{
                fontWeight: 900,
                letterSpacing: 6,
                cursor: 'pointer',
                fontFamily: "'Anton', sans-serif",
              }}
            >
              NIDAS
            </Typography>
          </Link>

          {/* Desktop Nav */}
          {!isMobile && (
            <Stack direction="row" spacing={4} sx={{ flexGrow: 1, ml: 6 }}>
              {NAV_LINKS.map(({ title, href }) => (
                <Button
                  key={title}
                  component={Link}
                  href={href}
                  color="inherit"
                  sx={{
                    fontWeight: pathname.startsWith(href) ? 'bold' : 'normal',
                    fontSize: '1rem',
                    textTransform: 'uppercase',
                    '&:hover': {
                      borderBottom: '3px solid',
                      borderColor: theme === 'dark' ? 'white' : 'black',
                      fontWeight: 'bold',
                    },
                  }}
                >
                  {title}
                </Button>
              ))}
            </Stack>
          )}

          {/* Right icons */}
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
                  borderColor: theme === 'dark' ? 'white' : 'black',
                  backgroundColor: theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
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
          </Stack>
        </Toolbar>
      </AppBar>

      {/* Drawer Mobile */}
      <Drawer anchor="right" open={drawerOpen} onClose={toggleDrawer(false)}>
        <Box
          sx={{ width: 240, bgcolor: theme === 'dark' ? '#111' : '#fff', height: '100%' }}
          role="presentation"
          onClick={toggleDrawer(false)}
          onKeyDown={toggleDrawer(false)}
        >
          <List>
            {NAV_LINKS.map(({ title, href }) => (
              <ListItem key={title} disablePadding>
                <ListItemButton component={Link} href={href}>
                  <ListItemText
                    primary={title}
                    primaryTypographyProps={{
                      fontWeight: pathname.startsWith(href) ? 'bold' : 'normal',
                      textTransform: 'uppercase',
                    }}
                  />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Box>
      </Drawer>
    </>
  );
};

export default Header;
