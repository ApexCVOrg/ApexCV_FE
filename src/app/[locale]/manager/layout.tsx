"use client";

import React, { useState, ReactNode, useEffect } from "react";
import {
    CssBaseline,
    Box,
    Drawer,
    List,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    AppBar,
    Toolbar,
    Typography,
    Avatar,
    IconButton,
    useTheme,
    Divider,
    Button,
    Stack,
} from "@mui/material";
import { useTranslations } from "next-intl";
import { usePathname, useRouter } from "next/navigation";
import { useTheme as useCustomTheme } from "@/hooks/useTheme";
import { ROUTES, MANAGER } from "@/lib/constants/constants";
import DashboardIcon from "@mui/icons-material/Dashboard";
import PeopleIcon from "@mui/icons-material/People";
import SettingsIcon from "@mui/icons-material/Settings";
import MenuIcon from "@mui/icons-material/Menu";
import InventoryIcon from "@mui/icons-material/Inventory";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import CategoryIcon from "@mui/icons-material/Category";
import NotificationsIcon from "@mui/icons-material/Notifications";
import LogoutIcon from "@mui/icons-material/Logout";
import ThemeToggle from "@/components/ui/ThemeToggle";

// Các ngôn ngữ hỗ trợ
const LANGUAGES = ['en', 'vi'] as const;
type Language = typeof LANGUAGES[number];

interface RootLayoutProps {
    children: ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
    const [mobileOpen, setMobileOpen] = useState(false);
    const t = useTranslations("manager.layout");
    const theme = useTheme();
    const { theme: currentTheme } = useCustomTheme();
    const pathname = usePathname();
    const router = useRouter();
    const [language, setLanguage] = useState<Language>('en');

    // Lấy ngôn ngữ hiện tại từ URL
    const getCurrentLanguage = (): Language => {
        const pathParts = pathname?.split('/') || [];
        if (pathParts[1] && LANGUAGES.includes(pathParts[1] as Language)) {
            return pathParts[1] as Language;
        }
        return 'en';
    };

    useEffect(() => {
        setLanguage(getCurrentLanguage());
    }, [pathname]);

    const handleDrawerToggle = () => {
        setMobileOpen(!mobileOpen);
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

    const menuItems = [
        { icon: <DashboardIcon />, text: t("dashboard"), href: ROUTES.MANAGER.DASHBOARD },
        { icon: <InventoryIcon />, text: t("products"), href: ROUTES.MANAGER.PRODUCTS },
        { icon: <CategoryIcon />, text: t("categories"), href: ROUTES.MANAGER.CATEGORIES },
        { icon: <LocalShippingIcon />, text: t("orders"), href: ROUTES.MANAGER.ORDERS },
        { icon: <PeopleIcon />, text: t("customers"), href: ROUTES.MANAGER.CUSTOMERS },
        { icon: <SettingsIcon />, text: t("settings"), href: ROUTES.MANAGER.SETTINGS },
    ];

    const drawer = (
        <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
            <Toolbar
                sx={{
                    fontWeight: 900,
                    fontSize: 28,
                    p: 3,
                    fontFamily: "'Anton', sans-serif",
                    letterSpacing: 2,
                    color: theme.palette.primary.main
                }}
            >
                NIDAS
            </Toolbar>
            <Divider />
            <List sx={{ flexGrow: 1, px: 2 }}>
                {menuItems.map((item) => (
                    <ListItemButton
                        key={item.text}
                        href={item.href}
                        sx={{
                            borderRadius: 2,
                            mb: 1,
                            "&:hover": {
                                backgroundColor: "rgba(0, 0, 0, 0.04)",
                            },
                        }}
                    >
                        <ListItemIcon sx={{ minWidth: 40 }}>{item.icon}</ListItemIcon>
                        <ListItemText
                            primary={item.text}
                            primaryTypographyProps={{
                                fontWeight: 500,
                                fontSize: "0.95rem",
                            }}
                        />
                    </ListItemButton>
                ))}
            </List>
            <Divider />
            <List sx={{ px: 2 }}>
                <ListItemButton
                    sx={{
                        borderRadius: 2,
                        color: theme.palette.error.main,
                        "&:hover": {
                            backgroundColor: "rgba(211, 47, 47, 0.04)",
                        },
                    }}
                >
                    <ListItemIcon sx={{ minWidth: 40, color: "inherit" }}>
                        <LogoutIcon />
                    </ListItemIcon>
                    <ListItemText
                        primary={t("logout")}
                        primaryTypographyProps={{
                            fontWeight: 500,
                            fontSize: "0.95rem",
                        }}
                    />
                </ListItemButton>
            </List>
        </Box>
    );

    return (
        <>
            <CssBaseline />
            <Box sx={{ display: "flex" }}>
                <AppBar
                    position="fixed"
                    sx={{
                        zIndex: (theme) => theme.zIndex.drawer + 1,
                        backgroundColor: currentTheme === 'dark' ? '#000' : '#fff',
                        color: currentTheme === 'dark' ? '#fff' : '#000',
                        boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                    }}
                >
                    <Toolbar sx={{ px: { xs: 2, sm: 3 } }}>
                        <IconButton
                            color="inherit"
                            aria-label="open drawer"
                            edge="start"
                            onClick={handleDrawerToggle}
                            sx={{
                                mr: 2,
                                display: { sm: "none" },
                                width: 40,
                                height: 40,
                            }}
                        >
                            <MenuIcon />
                        </IconButton>
                        <Typography
                            variant="h6"
                            noWrap
                            component="div"
                            sx={{
                                flexGrow: 1,
                                fontWeight: 600,
                                fontSize: "1.1rem",
                                minWidth: 200,
                            }}
                        >
                            {t("managerDashboard")}
                        </Typography>
                        <Stack
                            direction="row"
                            spacing={2}
                            alignItems="center"
                            sx={{
                                minWidth: 300,
                                justifyContent: 'flex-end',
                            }}
                        >
                            <ThemeToggle />
                            <Button
                                variant="outlined"
                                size="small"
                                onClick={toggleLanguage}
                                sx={{
                                    color: 'inherit',
                                    borderColor: 'inherit',
                                    textTransform: 'uppercase',
                                    minWidth: 48,
                                    height: 36,
                                    fontWeight: 'bold',
                                    fontSize: '0.875rem',
                                    px: 2,
                                    '&:hover': {
                                        borderColor: currentTheme === 'dark' ? 'white' : 'black',
                                        backgroundColor: currentTheme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
                                    },
                                }}
                            >
                                {language.toUpperCase()}
                            </Button>
                            <IconButton
                                sx={{
                                    width: 40,
                                    height: 40,
                                    color: 'inherit',
                                    '&:hover': {
                                        backgroundColor: currentTheme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
                                    },
                                }}
                            >
                                <NotificationsIcon />
                            </IconButton>
                            <Box
                                sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 1,
                                    minWidth: 160,
                                    justifyContent: 'flex-end',
                                }}
                            >
                                <Typography
                                    sx={{
                                        fontWeight: 500,
                                        fontSize: '0.95rem',
                                        whiteSpace: 'nowrap',
                                    }}
                                >
                                    {t("helloManager")}
                                </Typography>
                                <Avatar
                                    alt="Manager"
                                    src="/avatar.png"
                                    sx={{
                                        width: 35,
                                        height: 35,
                                        border: `2px solid ${theme.palette.primary.main}`,
                                    }}
                                />
                            </Box>
                        </Stack>
                    </Toolbar>
                </AppBar>
                <Box
                    component="nav"
                    sx={{ width: { sm: MANAGER.DRAWER_WIDTH }, flexShrink: { sm: 0 } }}
                    aria-label="sidebar folders"
                >
                    <Drawer
                        variant="permanent"
                        sx={{
                            display: { xs: "none", sm: "block" },
                            "& .MuiDrawer-paper": {
                                boxSizing: "border-box",
                                width: MANAGER.DRAWER_WIDTH,
                                borderRight: "1px solid rgba(0, 0, 0, 0.12)",
                                backgroundColor: currentTheme === 'dark' ? '#111' : '#fff',
                                color: currentTheme === 'dark' ? '#fff' : '#000',
                            },
                        }}
                        open
                    >
                        {drawer}
                    </Drawer>
                    <Drawer
                        variant="temporary"
                        open={mobileOpen}
                        onClose={handleDrawerToggle}
                        ModalProps={{
                            keepMounted: true,
                        }}
                        sx={{
                            display: { xs: "block", sm: "none" },
                            "& .MuiDrawer-paper": {
                                boxSizing: "border-box",
                                width: MANAGER.DRAWER_WIDTH,
                                backgroundColor: currentTheme === 'dark' ? '#111' : '#fff',
                                color: currentTheme === 'dark' ? '#fff' : '#000',
                            },
                        }}
                    >
                        {drawer}
                    </Drawer>
                </Box>
                <Box
                    component="main"
                    sx={{
                        flexGrow: 1,
                        p: 3,
                        width: { sm: `calc(100% - ${MANAGER.DRAWER_WIDTH}px)` },
                        mt: 8,
                        backgroundColor: currentTheme === 'dark' ? '#000' : '#f5f5f5',
                        minHeight: "100vh",
                        color: currentTheme === 'dark' ? '#fff' : '#000',
                    }}
                >
                    {children}
                </Box>
            </Box>
        </>
    );
}
