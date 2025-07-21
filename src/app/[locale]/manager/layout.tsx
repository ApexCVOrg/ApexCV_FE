"use client";

import React, { useState, ReactNode, useEffect, useCallback } from "react";
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
    Menu,
    MenuItem,
    Tooltip,
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
import PersonIcon from "@mui/icons-material/Person";
import HomeIcon from "@mui/icons-material/Home";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import ThemeToggle from "@/components/ui/ThemeToggle";
import ChatIcon from "@mui/icons-material/Chat";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
// Các ngôn ngữ hỗ trợ
const LANGUAGES = ['en', 'vi'] as const;
type Language = typeof LANGUAGES[number];

interface RootLayoutProps {
    children: ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
    const [mobileOpen, setMobileOpen] = useState(false);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const t = useTranslations("manager.layout");
    const theme = useTheme();
    const { theme: currentTheme } = useCustomTheme();
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

    useEffect(() => {
        const handleOpenSidebar = () => setMobileOpen(true);
        window.addEventListener('open-manager-sidebar', handleOpenSidebar);
        return () => window.removeEventListener('open-manager-sidebar', handleOpenSidebar);
    }, []);

    const handleDrawerToggle = () => {
        setMobileOpen((prev) => {
            if (prev) {
                window.dispatchEvent(new CustomEvent('close-manager-sidebar'));
            }
            return !prev;
        });
    };

    const handleSidebarToggle = () => {
        setSidebarCollapsed(!sidebarCollapsed);
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
        { icon: <HomeIcon />, text: t("home"), href: ROUTES.HOME },
        { icon: <DashboardIcon />, text: t("dashboard"), href: ROUTES.MANAGER.DASHBOARD },
        { icon: <InventoryIcon />, text: t("products"), href: ROUTES.MANAGER.PRODUCTS },
        { icon: <CategoryIcon />, text: t("categories"), href: ROUTES.MANAGER.CATEGORIES },
        { icon: <LocalShippingIcon />, text: t("orders"), href: ROUTES.MANAGER.ORDERS },
        { icon: <PeopleIcon />, text: t("customers"), href: ROUTES.MANAGER.CUSTOMERS },
        { icon: <ChatIcon />, text: t("chat"), href: ROUTES.MANAGER.CHAT },
        { icon: <SettingsIcon />, text: t("settings"), href: ROUTES.MANAGER.SETTINGS },
    ];

    const drawerWidth = sidebarCollapsed ? 80 : MANAGER.DRAWER_WIDTH;

    const drawer = (
        <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
            <Toolbar
                sx={{
                    fontWeight: 900,
                    fontSize: sidebarCollapsed ? 20 : 28,
                    p: sidebarCollapsed ? 2 : 3,
                    fontFamily: "'Anton', sans-serif",
                    letterSpacing: 2,
                    color: theme.palette.primary.main,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                }}
            >
                {!sidebarCollapsed && "NIDAS"}
                <IconButton
                    onClick={handleSidebarToggle}
                    sx={{
                        color: theme.palette.primary.main,
                        '&:hover': {
                            backgroundColor: 'rgba(25, 118, 210, 0.04)',
                        },
                    }}
                >
                    {sidebarCollapsed ? <ChevronRightIcon /> : <ChevronLeftIcon />}
                </IconButton>
            </Toolbar>
            <Divider />
            <List sx={{ flexGrow: 1, px: sidebarCollapsed ? 1 : 2 }}>
                {menuItems.map((item) => (
                    <ListItemButton
                        key={item.text}
                        href={item.href}
                        sx={{
                            borderRadius: 2,
                            mb: 1,
                            minHeight: 48,
                            justifyContent: sidebarCollapsed ? 'center' : 'flex-start',
                            "&:hover": {
                                backgroundColor: "rgba(0, 0, 0, 0.04)",
                            },
                        }}
                    >
                        <ListItemIcon 
                            sx={{ 
                                minWidth: sidebarCollapsed ? 0 : 40,
                                justifyContent: 'center',
                            }}
                        >
                            {item.icon}
                        </ListItemIcon>
                        {!sidebarCollapsed && (
                            <ListItemText
                                primary={item.text}
                                primaryTypographyProps={{
                                    fontWeight: 500,
                                    fontSize: "0.95rem",
                                }}
                            />
                        )}
                    </ListItemButton>
                ))}
            </List>
            <Divider />
            <List sx={{ px: sidebarCollapsed ? 1 : 2 }}>
                <ListItemButton
                    sx={{
                        borderRadius: 2,
                        color: theme.palette.error.main,
                        minHeight: 48,
                        justifyContent: sidebarCollapsed ? 'center' : 'flex-start',
                        "&:hover": {
                            backgroundColor: "rgba(211, 47, 47, 0.04)",
                        },
                    }}
                >
                    <ListItemIcon 
                        sx={{ 
                            minWidth: sidebarCollapsed ? 0 : 40,
                            color: "inherit",
                            justifyContent: 'center',
                        }}
                    >
                        <LogoutIcon />
                    </ListItemIcon>
                    {!sidebarCollapsed && (
                        <ListItemText
                            primary={t("logout")}
                            primaryTypographyProps={{
                                fontWeight: 500,
                                fontSize: "0.95rem",
                            }}
                        />
                    )}
                </ListItemButton>
            </List>
        </Box>
    );

    return (
        <>
            <CssBaseline />
            <Box sx={{ display: "flex", minHeight: '100vh', backgroundColor: currentTheme === 'dark' ? '#000' : '#f5f5f5' }}>
                <AppBar
                    position="fixed"
                    sx={{
                        zIndex: (theme) => theme.zIndex.drawer + 1,
                        backgroundColor: currentTheme === 'dark' ? '#000' : '#fff',
                        color: currentTheme === 'dark' ? '#fff' : '#000',
                        boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                        width: { sm: `calc(100vw - ${drawerWidth}px)` },
                        ml: { sm: `${drawerWidth}px` },
                        transition: 'width 0.5s cubic-bezier(.4,2,.6,1), margin-left 0.5s cubic-bezier(.4,2,.6,1)',
                        height: 64,
                        display: 'flex',
                        justifyContent: 'center',
                    }}
                >
                    <Toolbar sx={{ px: { xs: 2, sm: 3 }, minHeight: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            {/* Nút back chỉ hiện ở trang messages */}
                            {pathname?.includes('/manager/messages') && (
                                <IconButton onClick={() => router.back()} sx={{ mr: 1 }}>
                                    <ArrowBackIcon />
                                </IconButton>
                            )}
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
                                    fontWeight: 700,
                                    fontSize: "1.15rem",
                                    letterSpacing: 1,
                                    minWidth: 200,
                                }}
                            >
                                {t("managerDashboard")}
                            </Typography>
                        </Box>
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
                            <Tooltip title="Change Language">
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
                                        borderRadius: 2,
                                        '&:hover': {
                                            borderColor: currentTheme === 'dark' ? 'white' : 'black',
                                            backgroundColor: currentTheme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
                                        },
                                    }}
                                >
                                    {language.toUpperCase()}
                                </Button>
                            </Tooltip>
                            <Tooltip title="Notifications">
                                <IconButton
                                    sx={{
                                        width: 40,
                                        height: 40,
                                        color: 'inherit',
                                        borderRadius: 2,
                                        '&:hover': {
                                            backgroundColor: currentTheme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
                                        },
                                    }}
                                >
                                    <NotificationsIcon />
                                </IconButton>
                            </Tooltip>
                            <Tooltip title="Account">
                                <IconButton onClick={handleAvatarClick} sx={{ ml: 2, borderRadius: 2 }}>
                                    <Avatar />
                                </IconButton>
                            </Tooltip>
                        </Stack>
                    </Toolbar>
                </AppBar>
                <Box
                    component="nav"
                    sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
                    aria-label="sidebar folders"
                >
                    <Drawer
                        variant="permanent"
                        sx={{
                            display: { xs: "none", sm: "block" },
                            "& .MuiDrawer-paper": {
                                boxSizing: "border-box",
                                width: drawerWidth,
                                borderRight: "1px solid rgba(0, 0, 0, 0.12)",
                                backgroundColor: currentTheme === 'dark' ? '#111' : '#fff',
                                color: currentTheme === 'dark' ? '#fff' : '#000',
                                boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                                transition: 'width 0.5s cubic-bezier(.4,2,.6,1)',
                                overflowX: 'hidden',
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                py: 1,
                            },
                        }}
                        open
                    >
                        <Box sx={{ width: '100%' }}>{drawer}</Box>
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
                        width: { xs: '100vw', sm: `calc(100vw - ${drawerWidth}px)` },
                        pt: '64px',
                        color: currentTheme === 'dark' ? '#fff' : '#000',
                        minHeight: 'calc(100vh - 64px)',
                        boxSizing: 'border-box',
                        overflowX: 'auto',
                        p: { xs: 2, md: 3 },
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        transition: 'width 0.5s cubic-bezier(.4,2,.6,1)',
                    }}
                >
                    <Box
                        sx={{
                            width: '100%',
                            maxWidth: '1200px',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                        }}
                    >
                        <Menu
                            anchorEl={anchorEl}
                            open={open}
                            onClose={handleClose}
                            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                            transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                        >
                            <MenuItem onClick={handleHome}>
                                <ListItemIcon>
                                    <HomeIcon fontSize="small" />
                                </ListItemIcon>
                                Home
                            </MenuItem>
                            <MenuItem onClick={handleClose}>
                                <ListItemIcon>
                                    <PersonIcon fontSize="small" />
                                </ListItemIcon>
                                Account
                            </MenuItem>
                            <MenuItem onClick={handleLogout}>
                                <ListItemIcon>
                                    <LogoutIcon fontSize="small" />
                                </ListItemIcon>
                                Logout
                            </MenuItem>
                        </Menu>
                        {children}
                    </Box>
                </Box>
            </Box>
        </>
    );
}