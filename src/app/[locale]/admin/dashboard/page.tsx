'use client';

import React from 'react';
import { Card, Typography, Box, TableContainer, Table, TableHead, TableRow, TableCell, TableBody, Paper } from '@mui/material';
import {
  Person as PersonIcon,
  Description as DescriptionIcon,
  CheckCircle as CheckCircleIcon,
  ArrowUpward as ArrowUpwardIcon,
} from '@mui/icons-material';

const stats = [
  {
    title: 'Total Users',
    value: 1128,
    icon: <PersonIcon fontSize="large" sx={{ color: '#000' }} />,
    percent: 12,
  },
  {
    title: 'Total CVs',
    value: 93,
    icon: <DescriptionIcon fontSize="large" sx={{ color: '#000' }} />,
    percent: 8,
  },
  {
    title: 'Active Subscriptions',
    value: 56,
    icon: <CheckCircleIcon fontSize="large" sx={{ color: '#000' }} />,
    percent: 15,
  },
];

const recentActivities = [
  { key: '1', user: 'John Doe', action: 'Created a new CV', time: '2 hours ago' },
  { key: '2', user: 'Jane Smith', action: 'Updated profile', time: '3 hours ago' },
  { key: '3', user: 'Mike Johnson', action: 'Purchased Premium', time: '5 hours ago' },
];

export default function DashboardPage() {
  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' }, gap: 3, mb: 4 }}>
        {stats.map(({ title, value, icon, percent }) => (
          <Box key={title}>
            <Card
              sx={{
                display: 'flex',
                alignItems: 'center',
                p: 3,
                gap: 2,
                boxShadow: '0 0 10px rgba(0,0,0,0.1)',
                borderRadius: 2,
                cursor: 'default',
                '&:hover': { boxShadow: '0 0 15px rgba(0,0,0,0.2)' },
              }}
            >
              <Box>{icon}</Box>
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#555' }}>
                  {title.toUpperCase()}
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 900, color: '#111' }}>
                  {value}
                  <Box
                    component="span"
                    sx={{
                      ml: 1,
                      color: '#0a0',
                      fontWeight: 'bold',
                      display: 'inline-flex',
                      alignItems: 'center',
                      fontSize: '0.8rem',
                    }}
                  >
                    <ArrowUpwardIcon fontSize="small" />
                    {percent}%
                  </Box>
                </Typography>
              </Box>
            </Card>
          </Box>
        ))}
      </Box>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '2fr 1fr' }, gap: 3 }}>
        <Box>
          <Card sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
              Recent Activities
            </Typography>
            <TableContainer component={Paper}>
              <Table size="small" aria-label="recent activities">
                <TableHead sx={{ bgcolor: '#eee' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold' }}>User</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Action</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Time</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {recentActivities.map(({ key, user, action, time }) => (
                    <TableRow key={key} hover>
                      <TableCell>{user}</TableCell>
                      <TableCell>{action}</TableCell>
                      <TableCell>{time}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Card>
        </Box>

        <Box>
          <Card sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
              System Status
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography>Server</Typography>
                <Typography sx={{ color: 'green', fontWeight: 'bold' }}>Online</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography>Database</Typography>
                <Typography sx={{ color: 'green', fontWeight: 'bold' }}>Connected</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography>Last Backup</Typography>
                <Typography>2 hours ago</Typography>
              </Box>
            </Box>
          </Card>
        </Box>
      </Box>
    </Box>
  );
}