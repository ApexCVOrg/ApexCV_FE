"use client";

import React, { useEffect } from "react";
import { Paper, Typography, Box, useTheme, Button } from "@mui/material";
import { useTranslations } from "next-intl";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import PeopleIcon from "@mui/icons-material/People";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import { useRouter } from 'next/navigation';

interface Stat {
    label: string;
    value: string;
    icon: React.ReactNode;
    color: string;
}

export default function DashboardPage() {
    const t = useTranslations("manager.dashboard");
    const theme = useTheme();
    const router = useRouter();

    const stats: Stat[] = [
        {
            label: t("totalSales"),
            value: "$125,000",
            icon: <TrendingUpIcon sx={{ fontSize: 40 }} />,
            color: theme.palette.primary.main,
        },
        {
            label: t("activeUsers"),
            value: "1,240",
            icon: <PeopleIcon sx={{ fontSize: 40 }} />,
            color: theme.palette.success.main,
        },
        {
            label: t("pendingOrders"),
            value: "34",
            icon: <ShoppingCartIcon sx={{ fontSize: 40 }} />,
            color: theme.palette.warning.main,
        },
        {
            label: t("newCustomers"),
            value: "120",
            icon: <PersonAddIcon sx={{ fontSize: 40 }} />,
            color: theme.palette.info.main,
        },
    ];

    useEffect(() => {
        const token = localStorage.getItem('auth_token');
        if (token) {
            // Giả sử JWT, decode payload để lấy role
            try {
                const payload = JSON.parse(atob(token.split('.')[1]));
                console.log('User role:', payload.role);
            } catch (e) {
                console.log('Cannot decode token:', e);
            }
        } else {
            console.log('No token found');
        }
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('auth_token');
        router.push('/auth/login');
    };

    return (
        <Box>
            <Typography
                variant="h4"
                gutterBottom
                sx={{
                    fontWeight: 900,
                    letterSpacing: 2,
                    fontFamily: "'Anton', sans-serif",
                    mb: 4
                }}
            >
                {t("overview")}
            </Typography>
            <Box
                sx={{
                    display: 'grid',
                    gridTemplateColumns: {
                        xs: '1fr',
                        sm: 'repeat(2, 1fr)',
                        md: 'repeat(4, 1fr)',
                    },
                    gap: 3,
                }}
            >
                {stats.map(({ label, value, icon, color }) => (
                    <Box key={label}>
                        <Paper
                            elevation={3}
                            sx={{
                                p: 3,
                                height: '100%',
                                display: 'flex',
                                flexDirection: 'column',
                                transition: 'transform 0.2s ease-in-out',
                                '&:hover': {
                                    transform: 'translateY(-4px)',
                                },
                                borderTop: `4px solid ${color}`,
                            }}
                        >
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                <Typography
                                    variant="h6"
                                    color="text.secondary"
                                    sx={{
                                        fontWeight: 600,
                                        fontSize: '1rem',
                                        textTransform: 'uppercase',
                                        letterSpacing: 1
                                    }}
                                >
                                    {label}
                                </Typography>
                                <Box sx={{ color }}>
                                    {icon}
                                </Box>
                            </Box>
                            <Typography
                                variant="h4"
                                sx={{
                                    fontWeight: 900,
                                    letterSpacing: 1,
                                    fontFamily: "'Anton', sans-serif",
                                }}
                            >
                                {value}
                            </Typography>
                        </Paper>
                    </Box>
                ))}
            </Box>
            <Button variant="outlined" color="error" onClick={handleLogout} sx={{ position: 'absolute', top: 16, right: 16 }}>
                Logout
            </Button>
        </Box>
    );
}
