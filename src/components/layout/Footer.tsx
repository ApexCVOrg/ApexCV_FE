'use client';

import Link from 'next/link';
import { useTheme } from '@/hooks/useTheme';
import { ROUTES } from '@/lib/constants/constants';
import { Box, Container, Typography, Stack } from '@mui/material';

const Footer = () => {
  const { theme } = useTheme();
  const currentYear = new Date().getFullYear();

  const linkStyle = {
    textDecoration: 'none',
    color: theme === 'dark' ? '#eee' : '#111',
    fontWeight: 600,
    '&:hover': { color: theme === 'dark' ? '#fff' : '#000' },
  };

  return (
    <Box
      component="footer"
      sx={{
        bgcolor: theme === 'dark' ? '#111' : '#f5f5f5',
        color: theme === 'dark' ? '#ccc' : '#444',
        pt: 6,
        pb: 4,
        mt: 'auto',
        borderTop: `1px solid ${theme === 'dark' ? '#222' : '#ddd'}`,
      }}
    >
      <Container maxWidth="lg">
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: 'repeat(4, 1fr)' }, gap: 4 }}>
          <Box>
            <Typography
              variant="h5"
              sx={{ fontWeight: '900', mb: 2, letterSpacing: 2, fontFamily: "'Anton', sans-serif" }}
            >
              NIDAS
            </Typography>
            <Typography variant="body2" sx={{ lineHeight: 1.6 }}>
              The brand with the 3 stripes. Experience sport-inspired style and performance.
            </Typography>
          </Box>

          <Box>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
              SHOP
            </Typography>
            <Stack spacing={1}>
              <Link href={ROUTES.MEN.ROOT} style={linkStyle}>Men</Link>
              <Link href={ROUTES.WOMEN.ROOT} style={linkStyle}>Women</Link>
              <Link href={ROUTES.KIDS.ROOT} style={linkStyle}>Kids</Link>
              <Link href={ROUTES.ACCESSORIES.ROOT} style={linkStyle}>Accessories</Link>
              <Link href={ROUTES.SALE.ROOT} style={linkStyle}>Sale</Link>
            </Stack>
          </Box>

          <Box>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
              CUSTOMER SERVICE
            </Typography>
            <Stack spacing={1}>
              <Link href="/help" style={linkStyle}>Help Center</Link>
              <Link href="/shipping" style={linkStyle}>Shipping & Returns</Link>
              <Link href="/contact" style={linkStyle}>Contact Us</Link>
              <Link href="/privacy" style={linkStyle}>Privacy Policy</Link>
            </Stack>
          </Box>

          <Box>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
              FOLLOW US
            </Typography>
            <Stack spacing={1}>
              <Typography variant="body2" sx={{ cursor: 'pointer' }}>Instagram</Typography>
              <Typography variant="body2" sx={{ cursor: 'pointer' }}>Facebook</Typography>
              <Typography variant="body2" sx={{ cursor: 'pointer' }}>Twitter</Typography>
              <Typography variant="body2" sx={{ cursor: 'pointer' }}>YouTube</Typography>
            </Stack>
          </Box>
        </Box>

        <Box sx={{ textAlign: 'center', mt: 6, fontSize: '0.875rem', color: theme === 'dark' ? '#666' : '#999' }}>
          &copy; {currentYear} NIDAS. All rights reserved.
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;
