'use client';
import React, { useEffect, useState } from 'react';
import { Box, Typography, Card, Button, Stack, Snackbar, useMediaQuery } from '@mui/material';
import { styled, useTheme } from '@mui/material/styles';

interface Coupon {
  code: string;
  type: 'percentage' | 'fixed';
  value: number;
  minOrderValue: number;
  maxUsage: number;
  used: number;
  expiresAt: string;
  isActive: boolean;
}

// Styled components for high contrast, minimalism
const CouponCard = styled(Card)(({ theme }) => ({
  background: theme.palette.mode === 'dark' ? '#111' : '#fff',
  border: `2px solid #111`,
  boxShadow: '0 2px 12px 0 rgba(0,0,0,0.04)',
  borderRadius: 16,
  transition: 'transform 0.15s, box-shadow 0.15s, border-color 0.15s',
  '&:hover, &:focus-within': {
    transform: 'scale(1.015)',
    boxShadow: '0 4px 24px 0 rgba(0,0,0,0.10)',
    borderColor: '#cfd9df', // Polite Rumors
  },
  minWidth: 0,
}));

const CodeBox = styled(Box)(() => ({
  background: '#111',
  color: '#fff',
  fontWeight: 700,
  fontSize: 22,
  letterSpacing: 2,
  borderRadius: 8,
  padding: '8px 20px',
  display: 'inline-block',
  marginBottom: 8,
  userSelect: 'all',
}));

const CopyButton = styled(Button)(({ theme }) => ({
  background: '#111',
  color: '#fff',
  borderRadius: 24,
  fontWeight: 600,
  fontSize: 16,
  minWidth: 120,
  minHeight: 44,
  boxShadow: 'none',
  textTransform: 'none',
  transition: 'background 0.2s, box-shadow 0.2s, transform 0.1s',
  '&:hover, &:focus': {
    background: theme.palette.grey[900],
    boxShadow: '0 2px 8px 0 rgba(0,0,0,0.10)',
    transform: 'scale(1.04)',
  },
  outline: 'none',
}));

// Format date to dd/MM/yyyy
function formatDate(dateString: string) {
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;
  return date.toLocaleDateString('vi-VN');
}

export default function CouponPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [snackbar, setSnackbar] = useState({ open: false, message: '' });
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  useEffect(() => {
          fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://apexcv-be.onrender.com'}/coupons`)
      .then(res => res.json())
      .then(data => setCoupons(data.data || []));
  }, []);

  const handleCopy = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setSnackbar({ open: true, message: `Đã sao chép mã: ${code}` });
    } catch {
      setSnackbar({ open: true, message: 'Không thể sao chép mã.' });
    }
  };

  return (
    <Box
      sx={{
        maxWidth: 600,
        mx: 'auto',
        py: { xs: 3, sm: 6 },
        px: { xs: 1, sm: 2 },
        minHeight: '100vh',
        bgcolor: theme.palette.mode === 'dark' ? '#111' : '#fff',
      }}
    >
      <Typography
        variant={isMobile ? 'h4' : 'h3'}
        fontWeight={800}
        mb={4}
        mt={{ xs: 4, sm: 8 }}
        textAlign="center"
        color="#111"
        sx={{
          letterSpacing: 1,
          fontFamily: `"Be Vietnam Pro", "Inter", "Roboto", "Arial", sans-serif`,
        }}
      >
        Coupon Ưu Đãi
      </Typography>
      <Stack spacing={3}>
        {coupons.length === 0 && (
          <Typography textAlign="center" color="text.secondary" fontSize={18}>
            Hiện chưa có coupon nào.
          </Typography>
        )}
        {coupons.map(coupon => (
          <CouponCard
            key={coupon.code}
            tabIndex={0}
            aria-label={`Coupon ${coupon.code}`}
            sx={{
              p: { xs: 2, sm: 3 },
              width: '100%',
              outline: 'none',
            }}
          >
            <Box
              sx={{
                display: 'flex',
                flexDirection: { xs: 'column', sm: 'row' },
                alignItems: { xs: 'flex-start', sm: 'center' },
                gap: { xs: 2, sm: 3 },
              }}
            >
              <Box sx={{ minWidth: 120, flexShrink: 0 }}>
                <CodeBox>{coupon.code}</CodeBox>
              </Box>
              <Box sx={{ flex: 1 }}>
                <Typography
                  variant="body1"
                  fontWeight={500}
                  color="#111"
                  fontSize={18}
                  mb={0.5}
                  sx={{ wordBreak: 'break-word' }}
                >
                  {coupon.type === 'percentage'
                    ? `Giảm ${coupon.value}%`
                    : `Giảm ${coupon.value.toLocaleString()}đ`}
                </Typography>
                <Typography variant="body2" color="text.secondary" fontSize={16} sx={{ mt: 0.5 }}>
                  Đơn hàng tối thiểu: {coupon.minOrderValue.toLocaleString()}đ
                </Typography>
                <Typography variant="body2" color="text.secondary" fontSize={16} sx={{ mt: 0.5 }}>
                  Hạn sử dụng: {formatDate(coupon.expiresAt)}
                </Typography>
              </Box>
              <Box sx={{ minWidth: { xs: '100%', sm: 120 }, mt: { xs: 1, sm: 0 } }}>
                <CopyButton
                  aria-label={`Sao chép mã ${coupon.code}`}
                  fullWidth={isMobile}
                  onClick={() => handleCopy(coupon.code)}
                >
                  Sao chép mã
                </CopyButton>
              </Box>
            </Box>
          </CouponCard>
        ))}
      </Stack>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={2000}
        onClose={() => setSnackbar({ open: false, message: '' })}
        message={<span style={{ fontSize: 18, fontWeight: 600 }}>{snackbar.message}</span>}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        ContentProps={{
          sx: {
            bgcolor: '#111',
            color: '#fff',
            borderRadius: 2,
            boxShadow: '0 2px 8px 0 rgba(0,0,0,0.15)',
            minWidth: 280,
            textAlign: 'center',
          },
        }}
      />
    </Box>
  );
}
