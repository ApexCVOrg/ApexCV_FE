'use client';
import React, { useEffect, useState } from 'react';
import { Box, Typography, Card, Button, Stack, Snackbar, useMediaQuery, Container } from '@mui/material';
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

// Styled components with proper theming
const CouponCard = styled(Card)(({ theme }) => ({
  background: theme.palette.background.paper,
  border: `2px solid ${theme.palette.divider}`,
  boxShadow: theme.shadows[2],
  borderRadius: 16,
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: theme.shadows[8],
    borderColor: theme.palette.primary.main,
  },
  minWidth: 0,
}));

const CodeBox = styled(Box)(({ theme }) => ({
  background: theme.palette.primary.main,
  color: theme.palette.primary.contrastText,
  fontWeight: 700,
  fontSize: 22,
  letterSpacing: 2,
  borderRadius: 8,
  padding: '12px 24px',
  display: 'inline-block',
  marginBottom: 8,
  userSelect: 'all',
  boxShadow: theme.shadows[2],
}));

const CopyButton = styled(Button)(({ theme }) => ({
  background: theme.palette.primary.main,
  color: theme.palette.primary.contrastText,
  borderRadius: 24,
  fontWeight: 600,
  fontSize: 16,
  minWidth: 120,
  minHeight: 44,
  boxShadow: theme.shadows[2],
  textTransform: 'none',
  transition: 'all 0.2s ease',
  '&:hover': {
    background: theme.palette.primary.dark,
    boxShadow: theme.shadows[4],
    transform: 'scale(1.02)',
  },
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
    fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://nidas-be.onrender.com/api'}/coupon`)
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
        minHeight: '100vh',
        bgcolor: 'background.default',
        py: { xs: 4, md: 6 },
        px: { xs: 2, md: 4 },
      }}
    >
      <Container maxWidth="md">
        <Typography
          variant={isMobile ? 'h4' : 'h3'}
          fontWeight={800}
          mb={6}
          textAlign="center"
          color="text.primary"
          sx={{
            letterSpacing: 1,
            fontFamily: `"Be Vietnam Pro", "Inter", "Roboto", "Arial", sans-serif`,
            background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            mb: 4,
          }}
        >
          Coupon Ưu Đãi
        </Typography>
        
        <Typography
          variant="body1"
          textAlign="center"
          color="text.secondary"
          mb={4}
          sx={{ fontSize: 18, maxWidth: 600, mx: 'auto' }}
        >
          Khám phá các mã giảm giá hấp dẫn để tiết kiệm chi phí mua sắm của bạn
        </Typography>

        <Stack spacing={3}>
          {coupons.length === 0 && (
            <Card
              sx={{
                p: 4,
                textAlign: 'center',
                bgcolor: 'background.paper',
                border: `2px dashed ${theme.palette.divider}`,
              }}
            >
              <Typography variant="h6" color="text.secondary" mb={2}>
                Hiện chưa có coupon nào
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Hãy quay lại sau để khám phá các ưu đãi mới nhất!
              </Typography>
            </Card>
          )}
          
          {coupons.map(coupon => (
            <CouponCard
              key={coupon.code}
              tabIndex={0}
              aria-label={`Coupon ${coupon.code}`}
              sx={{
                p: { xs: 3, sm: 4 },
                width: '100%',
                outline: 'none',
              }}
            >
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: { xs: 'column', sm: 'row' },
                  alignItems: { xs: 'flex-start', sm: 'center' },
                  gap: { xs: 3, sm: 4 },
                }}
              >
                <Box sx={{ minWidth: 140, flexShrink: 0 }}>
                  <CodeBox>{coupon.code}</CodeBox>
                </Box>
                
                <Box sx={{ flex: 1 }}>
                  <Typography
                    variant="h6"
                    fontWeight={600}
                    color="text.primary"
                    mb={1}
                    sx={{ wordBreak: 'break-word' }}
                  >
                    {coupon.type === 'percentage'
                      ? `Giảm ${coupon.value}%`
                      : `Giảm ${coupon.value.toLocaleString()}đ`}
                  </Typography>
                  
                  <Stack spacing={1}>
                    <Typography variant="body2" color="text.secondary">
                      <strong>Đơn hàng tối thiểu:</strong> {coupon.minOrderValue.toLocaleString()}đ
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      <strong>Hạn sử dụng:</strong> {formatDate(coupon.expiresAt)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      <strong>Đã sử dụng:</strong> {coupon.used}/{coupon.maxUsage}
                    </Typography>
                  </Stack>
                </Box>
                
                <Box sx={{ minWidth: { xs: '100%', sm: 140 }, mt: { xs: 2, sm: 0 } }}>
                  <CopyButton
                    aria-label={`Sao chép mã ${coupon.code}`}
                    fullWidth={isMobile}
                    onClick={() => handleCopy(coupon.code)}
                    variant="contained"
                  >
                    Sao chép mã
                  </CopyButton>
                </Box>
              </Box>
            </CouponCard>
          ))}
        </Stack>
      </Container>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ open: false, message: '' })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Box
          sx={{
            bgcolor: 'success.main',
            color: 'success.contrastText',
            px: 3,
            py: 2,
            borderRadius: 2,
            boxShadow: theme.shadows[4],
            minWidth: 280,
            textAlign: 'center',
            fontSize: 16,
            fontWeight: 600,
          }}
        >
          {snackbar.message}
        </Box>
      </Snackbar>
    </Box>
  );
}
