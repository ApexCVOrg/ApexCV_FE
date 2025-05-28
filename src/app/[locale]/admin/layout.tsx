'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  AppBar,
  Toolbar,
  Typography,
  Box,
  IconButton,
  Avatar,
  Badge,
  InputBase,
  ListItemButton,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  BarChart as BarChartIcon,
  ShoppingCart as ShoppingCartIcon,
  People as PeopleIcon,
  CalendarToday as CalendarIcon,
  Person as PersonIcon,
  Task as TaskIcon,
  Description as DescriptionIcon,
  TableChart as TableChartIcon,
  Pages as PagesIcon,
  Message as MessageIcon,
  Inbox as InboxIcon,
  Receipt as ReceiptIcon,
  Settings as SettingsIcon,
  Logout as LogoutIcon,
  ExpandMore as ExpandMoreIcon,
  Notifications as NotificationsIcon,
  Search as SearchIcon,
} from '@mui/icons-material';

const drawerWidth = 260;

const navItems = [
  { label: 'Dashboard', href: '/admin', icon: <DashboardIcon /> },
  { label: 'Analytics', href: '/admin/analytics', icon: <BarChartIcon /> },
  { label: 'Marketing', href: '/admin/marketing', icon: <ShoppingCartIcon /> },
  { label: 'CRM', href: '/admin/crm', icon: <PeopleIcon /> },
  { label: 'Calendar', href: '/admin/calendar', icon: <CalendarIcon /> },
  { label: 'Profile', href: '/admin/profile', icon: <PersonIcon /> },
  { label: 'Tasks', href: '/admin/tasks', icon: <TaskIcon /> },
  { label: 'Forms', href: '/admin/forms', icon: <DescriptionIcon /> },
  { label: 'Tables', href: '/admin/tables', icon: <TableChartIcon /> },
  { label: 'Pages', href: '/admin/pages', icon: <PagesIcon /> },
  { label: 'Messages', href: '/admin/messages', icon: <MessageIcon />, badge: '5' },
  { label: 'Inbox', href: '/admin/inbox', icon: <InboxIcon /> },
  { label: 'Invoice', href: '/admin/invoice', icon: <ReceiptIcon /> },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#fff', color: '#111' }}>
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
            bgcolor: '#000',
            color: '#fff',
            borderRight: 'none',
          },
        }}
      >
        <Toolbar sx={{ height: 64, px: 3, display: 'flex', alignItems: 'center' }}>
          <Typography
            variant="h5"
            sx={{ fontWeight: '900', letterSpacing: 4, fontFamily: "'Anton', sans-serif" }}
          >
            NIDAS
          </Typography>
        </Toolbar>
        <List>
          {navItems.map(({ label, href, icon, badge }) => {
            const active = pathname === href;
            return (
              <ListItem
                key={label}
                component={Link}
                href={href}
                sx={{
                  bgcolor: active ? '#fff' : 'transparent',
                  color: active ? '#000' : '#fff',
                  px: 3,
                  py: 1.5,
                  fontWeight: active ? 'bold' : 'normal',
                  cursor: 'pointer',
                  '&:hover': {
                    bgcolor: '#222',
                    color: '#fff',
                  },
                }}
              >
                <ListItemIcon sx={{ color: 'inherit', minWidth: 40 }}>{icon}</ListItemIcon>
                <ListItemText primary={label} />
                {badge && (
                  <Box
                    sx={{
                      ml: 'auto',
                      bgcolor: '#d0011b',
                      borderRadius: '12px',
                      px: 1,
                      py: '2px',
                      fontSize: '0.75rem',
                      fontWeight: 'bold',
                      color: '#fff',
                      userSelect: 'none',
                    }}
                  >
                    {badge}
                  </Box>
                )}
              </ListItem>
            );
          })}
        </List>
        <Box sx={{ flexGrow: 1 }} />
        <List>
          <ListItemButton sx={{ px: 3, py: 1.5, color: '#fff', '&:hover': { bgcolor: '#222' } }}>
            <ListItemIcon sx={{ color: 'inherit', minWidth: 40 }}>
              <LogoutIcon />
            </ListItemIcon>
            <ListItemText primary="Logout" />
          </ListItemButton>
        </List>
      </Drawer>

      <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        <AppBar
          position="sticky"
          elevation={0}
          sx={{ bgcolor: '#fff', color: '#000', borderBottom: '1px solid #eee', zIndex: 1300 }}
        >
          <Toolbar sx={{ justifyContent: 'space-between' }}>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                bgcolor: '#f5f5f5',
                px: 2,
                py: 0.5,
                borderRadius: 1,
                width: '40%',
                maxWidth: 400,
              }}
            >
              <SearchIcon sx={{ color: '#999' }} />
              <InputBase
                placeholder="Search..."
                sx={{ ml: 1, flex: 1, fontSize: 14, color: '#333' }}
                inputProps={{ 'aria-label': 'search' }}
              />
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <IconButton>
                <SettingsIcon sx={{ color: '#555' }} />
              </IconButton>
              <IconButton>
                <Badge color="error" variant="dot">
                  <NotificationsIcon sx={{ color: '#555' }} />
                </Badge>
              </IconButton>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Avatar
                  src="https://randomuser.me/api/portraits/men/32.jpg"
                  sx={{ width: 32, height: 32 }}
                />
                <Typography sx={{ fontWeight: '600', fontSize: 14 }}>Thomas Anree</Typography>
                <ExpandMoreIcon sx={{ color: '#999' }} />
              </Box>
            </Box>
          </Toolbar>
        </AppBar>
        <Box sx={{ p: 4, bgcolor: '#fafafa', flexGrow: 1 }}>{children}</Box>
      </Box>
    </Box>
  );
}
