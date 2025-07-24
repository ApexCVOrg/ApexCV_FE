'use client';
import { useEffect, useState, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  CircularProgress,
  Container,
  Paper,
  Typography,
  Alert,
  Button,
  Box,
  Stack,
  Chip,
  Card,
  CardContent,
  IconButton,
  Snackbar,
  useTheme as useMuiTheme
} from '@mui/material';
import { useRouter } from 'next/navigation';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import ReceiptIcon from '@mui/icons-material/Receipt';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import HomeIcon from '@mui/icons-material/Home';
import PrintIcon from '@mui/icons-material/Print';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { Inter, Roboto } from 'next/font/google';
import { useCartContext } from '@/context/CartContext';
import { useTheme } from '@/hooks/useTheme';
import { THEME } from '@/lib/constants/constants';

// Khởi tạo font cho tiếng Việt
const inter = Inter({ 
  subsets: ['latin', 'vietnamese'],
  weight: ['300', '400', '500', '600', '700', '800', '900'],
  display: 'swap',
  variable: '--font-inter'
});

const roboto = Roboto({ 
  subsets: ['latin', 'vietnamese'],
  weight: ['300', '400', '500', '700'],
  display: 'swap',
  variable: '--font-roboto'
});

interface OrderItem {
  index: number;
  productName: string;
  quantity: number;
  size: string;
  color: string;
  price: number;
  totalItemPrice: number;
}

interface OrderData {
  _id: string;
  orderNumber: string;
  totalItems: number;
  totalPrice: number;
  orderStatus: string;
  paymentStatus: string;
  items: OrderItem[];
  shippingAddress: {
    fullName: string;
    phone: string;
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  paymentMethod: string;
  createdAt: string;
}

export default function VnpayReturnPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { theme: currentTheme } = useTheme();
  const muiTheme = useMuiTheme();
  const [status, setStatus] = useState<'pending' | 'success' | 'fail'>('pending');
  const [message, setMessage] = useState<string>('');
  const [orderData, setOrderData] = useState<OrderData | null>(null);
  const [copied, setCopied] = useState(false);
  const calledRef = useRef(false);
  const { refreshCart } = useCartContext();

  const isDarkMode = currentTheme === THEME.DARK;

  useEffect(() => {
    if (calledRef.current) return;
    calledRef.current = true;
    // Gửi toàn bộ query lên backend để xác thực
    const fetchStatus = async () => {
      const params = Object.fromEntries(searchParams.entries());
      const query = new URLSearchParams(params).toString();
      const token = localStorage.getItem("auth_token");
      try {
        const res = await fetch(`/api/payment/vnpay/return?${query}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        });
        const json = await res.json();
        // Kiểm tra lỗi đặc biệt
        if (
          res.status === 400 &&
          (json.message?.includes('No session and no user token found') ||
           json.message?.includes('Order data required'))
        ) {
          setStatus('fail');
          setMessage('Đơn hàng đã được xử lý hoặc phiên thanh toán đã hết hạn.');
          return;
        }
        
        // Kiểm tra response code từ VNPay
        const responseCode = searchParams.get('vnp_ResponseCode');
        console.log('VNPay Response Code:', responseCode);
        
        if (json.status === 'success' || json.result?.isSuccess) {
          setStatus('success');
          if (json.order) {
            setOrderData(json.order);
          }
        } else if (json.status === 'fail' || responseCode !== '00') {
          setStatus('fail');
          // Xử lý thông báo lỗi cụ thể dựa trên response code
          if (responseCode === '24') {
            setMessage('Khách hàng hủy giao dịch');
          } else if (responseCode === '07') {
            setMessage('Giao dịch bị nghi ngờ gian lận');
          } else if (responseCode === '09') {
            setMessage('Giao dịch không thành công do: Thẻ/Tài khoản bị khóa');
          } else if (responseCode === '10') {
            setMessage('Giao dịch không thành công do: Khách hàng chưa kích hoạt thẻ');
          } else if (responseCode === '11') {
            setMessage('Giao dịch không thành công do: Thẻ/Tài khoản chưa đăng ký dịch vụ');
          } else if (responseCode === '12') {
            setMessage('Giao dịch không thành công do: Thẻ/Tài khoản bị khóa');
          } else if (responseCode === '13') {
            setMessage('Giao dịch không thành công do: Nhập sai mật khẩu xác thực giao dịch');
          } else if (responseCode === '51') {
            setMessage('Giao dịch không thành công do: Tài khoản của quý khách không đủ số dư');
          } else if (responseCode === '65') {
            setMessage('Giao dịch không thành công do: Tài khoản của quý khách đã vượt quá hạn mức cho phép');
          } else if (responseCode === '75') {
            setMessage('Giao dịch không thành công do: Ngân hàng thanh toán đang bảo trì');
          } else if (responseCode === '79') {
            setMessage('Giao dịch không thành công do: Khách hàng nhập sai mật khẩu thanh toán quá số lần quy định');
          } else if (responseCode === '99') {
            setMessage('Giao dịch không thành công do: Lỗi khác');
          } else {
            setMessage(json.message || 'Thanh toán không thành công');
          }
        } else {
          setStatus('fail');
          setMessage(json.message || 'Không có thông tin chi tiết');
        }

        // Set message with fallback
        setMessage(json.message || json.result?.message || 'Không có thông tin chi tiết');
      } catch (err) {
        setStatus('fail');
        setMessage('Lỗi xác thực kết quả thanh toán!');
        console.error('Error fetching payment status:', err);
      }
    };
    fetchStatus();
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    if (status === 'success') {
      refreshCart();
    }
  }, [status]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handlePrint = () => {
    // Add print-specific styles
    const printStyles = `
      @media print {
        body { margin: 0; padding: 20px; }
        .no-print { display: none !important; }
        .print-only { display: block !important; }
        .MuiContainer-root { max-width: none !important; }
        .MuiPaper-root { box-shadow: none !important; border: 1px solid #000 !important; }
        .MuiButton-root { display: none !important; }
        .MuiAlert-root { border: 1px solid #000 !important; }
      }
    `;

    const styleSheet = document.createElement('style');
    styleSheet.innerText = printStyles;
    document.head.appendChild(styleSheet);

    window.print();

    // Clean up
    setTimeout(() => {
      document.head.removeChild(styleSheet);
    }, 1000);
  };

  const handleCopyOrderId = () => {
    if (orderData?._id) {
      navigator.clipboard
        .writeText(orderData._id)
        .then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 2000); // Hide after 2 seconds
        })
        .catch(err => {
          console.error('Failed to copy order ID:', err);
        });
    }
  };

  return (
    <Box
      className={`${inter.variable} ${roboto.variable}`}
      sx={{
        minHeight: '100vh',
        background: isDarkMode 
          ? 'linear-gradient(135deg, #0f0f23 0%, #1a1a2e 50%, #16213e 100%)'
          : 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 50%, #dee2e6 100%)',
        pt: 8,
        pb: 4,
        fontFamily: 'var(--font-inter), -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
      }}
    >
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Paper
          elevation={8}
          sx={{
            p: 4,
            borderRadius: 3,
            overflow: 'hidden',
            background: isDarkMode ? '#1e1e2e' : '#ffffff',
            backdropFilter: 'blur(10px)',
            border: `1px solid ${isDarkMode ? '#2d2d44' : '#e0e0e0'}`,
            fontFamily: 'var(--font-inter), -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
          }}
        >
        {/* Header */}
        <Box
          sx={{
            background: isDarkMode 
              ? 'linear-gradient(135deg, #0a0a1a 0%, #1a1a2e 100%)'
              : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            p: 3,
            textAlign: 'center',
            borderBottom: `1px solid ${isDarkMode ? '#2d2d44' : '#e0e0e0'}`,
            borderRadius: 3,
            mb: 4
          }}
        >
          <ReceiptIcon sx={{ fontSize: 40, mb: 1, color: '#4a9eff' }} />
          <Typography
            variant="h4"
            sx={{
              fontWeight: 900,
              mb: 1,
              color: 'white',
              fontFamily: 'var(--font-inter), -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
              letterSpacing: '-0.02em',
              textTransform: 'uppercase'
            }}
          >
            Kết quả thanh toán
          </Typography>
          <Typography
            variant="body1"
            sx={{
              opacity: 0.8,
              color: '#b8b8b8',
              fontFamily: 'var(--font-roboto), -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
              fontWeight: 400,
              textTransform: 'uppercase',
              letterSpacing: '0.1em'
            }}
          >
            VNPAY Payment Result
          </Typography>
        </Box>

        {/* Status Section */}
        {status === 'pending' && (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <CircularProgress sx={{ color: '#4a9eff', mb: 2 }} size={60} />
            <Typography 
              variant="h6" 
              sx={{ 
                fontWeight: 600, 
                mb: 1,
                color: isDarkMode ? 'white' : '#1a1a1a',
                fontFamily: 'var(--font-roboto), -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
              }}
            >
              Đang xử lý thanh toán...
            </Typography>
            <Typography 
              variant="body2" 
              sx={{ 
                color: isDarkMode ? '#b8b8b8' : 'gray',
                fontFamily: 'var(--font-roboto), -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
              }}
            >
              Vui lòng chờ trong giây lát
            </Typography>
          </Box>
        )}

        {status === 'success' && (
          <>
            {/* Success Alert */}
            <Alert
              severity="success"
              sx={{
                mb: 4,
                borderRadius: 2,
                bgcolor: isDarkMode ? '#1b3a1b' : '#f1f8e9',
                color: isDarkMode ? '#4caf50' : '#2e7d32',
                fontWeight: 700,
                fontSize: '1.1rem',
                border: `1px solid ${isDarkMode ? '#2d5a2d' : '#4caf50'}`,
                '& .MuiAlert-icon': { fontSize: 28, color: '#4caf50' }
              }}
              icon={<CheckCircleIcon sx={{ fontSize: 28 }} />}
            >
              <Box>
                <Typography 
                  variant="h6" 
                  sx={{ 
                    fontWeight: 900, 
                    mb: 1,
                    fontFamily: 'var(--font-inter), -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
                  }}
                >
                  {message || 'Thanh toán thành công!'}
                </Typography>
                {orderData && (
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      fontWeight: 600,
                      fontFamily: 'var(--font-roboto), -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
                    }}
                  >
                    Đơn hàng #{orderData._id?.slice(-8) || 'N/A'} -{' '}
                    {orderData.items && Array.isArray(orderData.items) ? orderData.items.length : 0}{' '}
                    sản phẩm
                  </Typography>
                )}
              </Box>
            </Alert>

            {/* Order Details */}
            {orderData && (
              <Box sx={{ mb: 4 }}>
                <Typography
                  variant="h5"
                  sx={{
                    fontWeight: 900,
                    mb: 3,
                    textTransform: 'uppercase',
                    letterSpacing: '0.02em',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    color: isDarkMode ? 'white' : '#1a1a1a',
                    fontFamily: 'var(--font-inter), -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
                  }}
                >
                  <ReceiptIcon sx={{ fontSize: 28, color: '#4a9eff' }} />
                  Thông tin đơn hàng
                </Typography>

                {/* Order Summary */}
                <Card sx={{ 
                  mb: 3, 
                  borderRadius: 2, 
                  border: `1px solid ${isDarkMode ? '#2d2d44' : '#e0e0e0'}`,
                  bgcolor: isDarkMode ? '#2a2a3e' : '#f8f9fa'
                }}>
                  <CardContent>
                    <Box
                      sx={{
                        display: 'flex',
                        flexDirection: { xs: 'column', md: 'row' },
                        gap: { xs: 2, md: 3 },
                      }}
                    >
                      <Box sx={{ flex: 1 }}>
                        <Typography 
                          variant="h6" 
                          sx={{ 
                            fontWeight: 700, 
                            mb: 1,
                            color: isDarkMode ? 'white' : '#1a1a1a',
                            fontFamily: 'var(--font-roboto), -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
                          }}
                        >
                          Mã đơn hàng
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Typography
                            variant="body1"
                            sx={{
                              fontFamily: 'monospace',
                              fontSize: { xs: '0.9rem', md: '1.1rem' },
                              bgcolor: isDarkMode ? '#1e1e2e' : '#f5f5f5',
                              color: isDarkMode ? 'white' : '#1a1a1a',
                              px: 2,
                              py: 1,
                              borderRadius: 2,
                              border: `1px solid ${isDarkMode ? '#2d2d44' : '#ddd'}`,
                              flex: 1,
                              wordBreak: 'break-all',
                            }}
                          >
                            {orderData._id || 'N/A'}
                          </Typography>
                          {orderData._id && (
                            <IconButton
                              onClick={handleCopyOrderId}
                              size="small"
                              sx={{
                                ml: 1,
                                border: `1px solid ${isDarkMode ? '#2d2d44' : '#ddd'}`,
                                borderRadius: 2,
                                color: isDarkMode ? 'white' : '#1a1a1a',
                                '&:hover': {
                                  bgcolor: '#4a9eff',
                                  color: 'white',
                                },
                              }}
                            >
                              {copied ? (
                                <CheckCircleIcon sx={{ color: '#4caf50', fontSize: 20 }} />
                              ) : (
                                <ContentCopyIcon sx={{ fontSize: 20 }} />
                              )}
                            </IconButton>
                          )}
                        </Box>
                      </Box>
                      <Box sx={{ flex: 1 }}>
                        <Typography 
                          variant="h6" 
                          sx={{ 
                            fontWeight: 700, 
                            mb: 1,
                            color: isDarkMode ? 'white' : '#1a1a1a',
                            fontFamily: 'var(--font-roboto), -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
                          }}
                        >
                          Ngày đặt hàng
                        </Typography>
                        <Typography 
                          variant="body1"
                          sx={{
                            color: isDarkMode ? '#b8b8b8' : '#1a1a1a',
                            fontFamily: 'var(--font-roboto), -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
                          }}
                        >
                          {orderData.createdAt ? formatDate(orderData.createdAt) : 'N/A'}
                        </Typography>
                      </Box>
                      <Box sx={{ flex: 1 }}>
                        <Typography 
                          variant="h6" 
                          sx={{ 
                            fontWeight: 700, 
                            mb: 1,
                            color: isDarkMode ? 'white' : '#1a1a1a',
                            fontFamily: 'var(--font-roboto), -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
                          }}
                        >
                          Tổng sản phẩm
                        </Typography>
                        <Typography 
                          variant="body1"
                          sx={{
                            color: isDarkMode ? '#b8b8b8' : '#1a1a1a',
                            fontFamily: 'var(--font-roboto), -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
                          }}
                        >
                          {orderData.items && Array.isArray(orderData.items)
                            ? orderData.items.length
                            : 0}{' '}
                          sản phẩm
                        </Typography>
                      </Box>
                      <Box sx={{ flex: 1 }}>
                        <Typography 
                          variant="h6" 
                          sx={{ 
                            fontWeight: 700, 
                            mb: 1,
                            color: isDarkMode ? 'white' : '#1a1a1a',
                            fontFamily: 'var(--font-roboto), -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
                          }}
                        >
                          Tổng tiền
                        </Typography>
                        <Typography 
                          variant="h5" 
                          sx={{ 
                            fontWeight: 900, 
                            color: isDarkMode ? '#4a9eff' : '#1a1a1a',
                            fontFamily: 'var(--font-inter), -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
                          }}
                        >
                          {formatCurrency(orderData.totalPrice || 0)}
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>

                {/* Order Items */}
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 700,
                    mb: 2,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    color: isDarkMode ? 'white' : '#1a1a1a',
                    fontFamily: 'var(--font-inter), -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
                  }}
                >
                  <ShoppingCartIcon sx={{ color: '#4a9eff' }} />
                  Chi tiết sản phẩm
                </Typography>

                <Stack spacing={2} sx={{ mb: 4 }}>
                  {orderData.items &&
                  Array.isArray(orderData.items) &&
                  orderData.items.length > 0 ? (
                    orderData.items.map((item, index) => (
                      <Card key={index} sx={{ 
                        borderRadius: 2, 
                        border: `1px solid ${isDarkMode ? '#2d2d44' : '#ddd'}`,
                        bgcolor: isDarkMode ? '#2a2a3e' : '#ffffff'
                      }}>
                        <CardContent>
                          <Box
                            sx={{
                              display: 'flex',
                              flexDirection: { xs: 'column', md: 'row' },
                              gap: 2,
                              alignItems: { md: 'center' },
                            }}
                          >
                            <Box sx={{ flex: { md: 6 } }}>
                              <Typography 
                                variant="h6" 
                                sx={{ 
                                  fontWeight: 700, 
                                  mb: 1,
                                  color: isDarkMode ? 'white' : '#1a1a1a',
                                  fontFamily: 'var(--font-inter), -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
                                }}
                              >
                                {item.productName}
                              </Typography>
                              <Stack direction="row" spacing={1}>
                                <Chip
                                  label={`Size: ${item.size}`}
                                  size="small"
                                  sx={{ 
                                    borderRadius: 2, 
                                    fontWeight: 600,
                                    bgcolor: isDarkMode ? '#1e1e2e' : '#f5f5f5',
                                    color: isDarkMode ? 'white' : '#1a1a1a',
                                    border: `1px solid ${isDarkMode ? '#2d2d44' : '#ddd'}`
                                  }}
                                />
                                <Chip
                                  label={`Màu: ${item.color}`}
                                  size="small"
                                  sx={{ 
                                    borderRadius: 2, 
                                    fontWeight: 600,
                                    bgcolor: isDarkMode ? '#1e1e2e' : '#f5f5f5',
                                    color: isDarkMode ? 'white' : '#1a1a1a',
                                    border: `1px solid ${isDarkMode ? '#2d2d44' : '#ddd'}`
                                  }}
                                />
                              </Stack>
                            </Box>
                            <Box sx={{ flex: { md: 2 }, textAlign: { xs: 'left', md: 'center' } }}>
                              <Typography 
                                variant="body2" 
                                sx={{ 
                                  fontWeight: 600,
                                  color: isDarkMode ? '#b8b8b8' : '#1a1a1a',
                                  fontFamily: 'var(--font-roboto), -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
                                }}
                              >
                                Số lượng
                              </Typography>
                              <Typography 
                                variant="h6" 
                                sx={{ 
                                  fontWeight: 700,
                                  color: isDarkMode ? 'white' : '#1a1a1a',
                                  fontFamily: 'var(--font-inter), -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
                                }}
                              >
                                {item.quantity}
                              </Typography>
                            </Box>
                            <Box sx={{ flex: { md: 2 }, textAlign: { xs: 'left', md: 'center' } }}>
                              <Typography 
                                variant="body2" 
                                sx={{ 
                                  fontWeight: 600,
                                  color: isDarkMode ? '#b8b8b8' : '#1a1a1a',
                                  fontFamily: 'var(--font-roboto), -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
                                }}
                              >
                                Đơn giá
                              </Typography>
                              <Typography 
                                variant="body1" 
                                sx={{ 
                                  fontWeight: 700,
                                  color: isDarkMode ? 'white' : '#1a1a1a',
                                  fontFamily: 'var(--font-roboto), -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
                                }}
                              >
                                {formatCurrency(item.price)}
                              </Typography>
                            </Box>
                            <Box sx={{ flex: { md: 2 }, textAlign: { xs: 'left', md: 'center' } }}>
                              <Typography 
                                variant="body2" 
                                sx={{ 
                                  fontWeight: 600,
                                  color: isDarkMode ? '#b8b8b8' : '#1a1a1a',
                                  fontFamily: 'var(--font-roboto), -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
                                }}
                              >
                                Thành tiền
                              </Typography>
                              <Typography 
                                variant="h6" 
                                sx={{ 
                                  fontWeight: 900, 
                                  color: isDarkMode ? '#4a9eff' : '#1a1a1a',
                                  fontFamily: 'var(--font-inter), -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
                                }}
                              >
                                {formatCurrency(item.totalItemPrice)}
                              </Typography>
                            </Box>
                          </Box>
                        </CardContent>
                      </Card>
                    ))
                  ) : (
                    <Card sx={{ borderRadius: 0, border: '1px solid #ddd', bgcolor: '#f8f9fa' }}>
                      <CardContent>
                        <Typography
                          variant="body1"
                          sx={{ textAlign: 'center', color: 'gray', fontStyle: 'italic' }}
                        >
                          Không có thông tin chi tiết sản phẩm
                        </Typography>
                      </CardContent>
                    </Card>
                  )}
                </Stack>

                {/* Shipping Address */}
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 700,
                    mb: 2,
                    textTransform: 'uppercase',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    color: isDarkMode ? 'white' : '#1a1a1a',
                    fontFamily: 'var(--font-inter), -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
                  }}
                >
                  <ReceiptIcon sx={{ color: '#4a9eff' }} />
                  ĐỊA CHỈ GIAO HÀNG
                </Typography>

                <Card sx={{ 
                  mb: 4, 
                  borderRadius: 2, 
                  border: `1px solid ${isDarkMode ? '#2d2d44' : '#e0e0e0'}`,
                  bgcolor: isDarkMode ? '#2a2a3e' : '#ffffff'
                }}>
                  <CardContent>
                    {orderData.shippingAddress ? (
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                        <Box
                          sx={{
                            display: 'flex',
                            flexDirection: { xs: 'column', sm: 'row' },
                            alignItems: { xs: 'flex-start', sm: 'center' },
                            gap: 1,
                          }}
                        >
                          <Typography
                            variant="body2"
                            sx={{
                              fontWeight: 700,
                              minWidth: { xs: 'auto', sm: 80 },
                              width: { xs: '100%', sm: 'auto' },
                              color: isDarkMode ? 'white' : '#1a1a1a',
                              fontFamily: 'var(--font-roboto), -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
                            }}
                          >
                            Họ tên:
                          </Typography>
                          <Typography 
                            variant="body1" 
                            sx={{ 
                              fontWeight: 600,
                              color: isDarkMode ? 'white' : '#1a1a1a',
                              fontFamily: 'var(--font-roboto), -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
                            }}
                          >
                            {orderData.shippingAddress.fullName || 'N/A'}
                          </Typography>
                        </Box>

                        <Box
                          sx={{
                            display: 'flex',
                            flexDirection: { xs: 'column', sm: 'row' },
                            alignItems: { xs: 'flex-start', sm: 'center' },
                            gap: 1,
                          }}
                        >
                          <Typography
                            variant="body2"
                            sx={{
                              fontWeight: 700,
                              minWidth: { xs: 'auto', sm: 80 },
                              width: { xs: '100%', sm: 'auto' },
                              color: isDarkMode ? 'white' : '#1a1a1a',
                              fontFamily: 'var(--font-roboto), -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
                            }}
                          >
                            Điện thoại:
                          </Typography>
                          <Typography 
                            variant="body1" 
                            sx={{ 
                              fontWeight: 600,
                              color: isDarkMode ? 'white' : '#1a1a1a',
                              fontFamily: 'var(--font-roboto), -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
                            }}
                          >
                            {orderData.shippingAddress.phone || 'N/A'}
                          </Typography>
                        </Box>

                        <Box
                          sx={{
                            display: 'flex',
                            flexDirection: { xs: 'column', sm: 'row' },
                            alignItems: { xs: 'flex-start', sm: 'center' },
                            gap: 1,
                          }}
                        >
                          <Typography
                            variant="body2"
                            sx={{
                              fontWeight: 700,
                              minWidth: { xs: 'auto', sm: 80 },
                              width: { xs: '100%', sm: 'auto' },
                              color: isDarkMode ? 'white' : '#1a1a1a',
                              fontFamily: 'var(--font-roboto), -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
                            }}
                          >
                            Địa chỉ:
                          </Typography>
                          <Typography 
                            variant="body1" 
                            sx={{ 
                              fontWeight: 600,
                              color: isDarkMode ? 'white' : '#1a1a1a',
                              fontFamily: 'var(--font-roboto), -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
                            }}
                          >
                            {orderData.shippingAddress.street || 'N/A'}
                          </Typography>
                        </Box>

                        <Box
                          sx={{
                            display: 'flex',
                            flexDirection: { xs: 'column', sm: 'row' },
                            alignItems: { xs: 'flex-start', sm: 'center' },
                            gap: 1,
                          }}
                        >
                          <Typography
                            variant="body2"
                            sx={{
                              fontWeight: 700,
                              minWidth: { xs: 'auto', sm: 80 },
                              width: { xs: '100%', sm: 'auto' },
                              color: isDarkMode ? 'white' : '#1a1a1a',
                              fontFamily: 'var(--font-roboto), -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
                            }}
                          >
                            Thành phố:
                          </Typography>
                          <Typography 
                            variant="body1" 
                            sx={{ 
                              fontWeight: 600,
                              color: isDarkMode ? 'white' : '#1a1a1a',
                              fontFamily: 'var(--font-roboto), -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
                            }}
                          >
                            {orderData.shippingAddress.city || 'N/A'}
                          </Typography>
                        </Box>

                        <Box
                          sx={{
                            display: 'flex',
                            flexDirection: { xs: 'column', sm: 'row' },
                            alignItems: { xs: 'flex-start', sm: 'center' },
                            gap: 1,
                          }}
                        >
                          <Typography
                            variant="body2"
                            sx={{
                              fontWeight: 700,
                              minWidth: { xs: 'auto', sm: 80 },
                              width: { xs: '100%', sm: 'auto' },
                              color: isDarkMode ? 'white' : '#1a1a1a',
                              fontFamily: 'var(--font-roboto), -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
                            }}
                          >
                            Quận/Huyện:
                          </Typography>
                          <Typography 
                            variant="body1" 
                            sx={{ 
                              fontWeight: 600,
                              color: isDarkMode ? 'white' : '#1a1a1a',
                              fontFamily: 'var(--font-roboto), -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
                            }}
                          >
                            {orderData.shippingAddress.state || 'N/A'}
                          </Typography>
                        </Box>

                        <Box
                          sx={{
                            display: 'flex',
                            flexDirection: { xs: 'column', sm: 'row' },
                            alignItems: { xs: 'flex-start', sm: 'center' },
                            gap: 1,
                          }}
                        >
                          <Typography
                            variant="body2"
                            sx={{
                              fontWeight: 700,
                              minWidth: { xs: 'auto', sm: 80 },
                              width: { xs: '100%', sm: 'auto' },
                              color: isDarkMode ? 'white' : '#1a1a1a',
                              fontFamily: 'var(--font-roboto), -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
                            }}
                          >
                            Mã bưu điện:
                          </Typography>
                          <Typography 
                            variant="body1" 
                            sx={{ 
                              fontWeight: 600,
                              color: isDarkMode ? 'white' : '#1a1a1a',
                              fontFamily: 'var(--font-roboto), -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
                            }}
                          >
                            {orderData.shippingAddress.postalCode || 'N/A'}
                          </Typography>
                        </Box>

                        <Box
                          sx={{
                            display: 'flex',
                            flexDirection: { xs: 'column', sm: 'row' },
                            alignItems: { xs: 'flex-start', sm: 'center' },
                            gap: 1,
                          }}
                        >
                          <Typography
                            variant="body2"
                            sx={{
                              fontWeight: 700,
                              minWidth: { xs: 'auto', sm: 80 },
                              width: { xs: '100%', sm: 'auto' },
                              color: isDarkMode ? 'white' : '#1a1a1a',
                              fontFamily: 'var(--font-roboto), -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
                            }}
                          >
                            Quốc gia:
                          </Typography>
                          <Typography 
                            variant="body1" 
                            sx={{ 
                              fontWeight: 600,
                              color: isDarkMode ? 'white' : '#1a1a1a',
                              fontFamily: 'var(--font-roboto), -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
                            }}
                          >
                            {orderData.shippingAddress.country || 'N/A'}
                          </Typography>
                        </Box>
                      </Box>
                    ) : (
                      <Typography
                        variant="body1"
                        sx={{ 
                          textAlign: 'center', 
                          color: isDarkMode ? '#b8b8b8' : 'gray', 
                          fontStyle: 'italic',
                          fontFamily: 'var(--font-roboto), -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
                        }}
                      >
                        Không có thông tin địa chỉ giao hàng
                      </Typography>
                    )}
                  </CardContent>
                </Card>

                {/* Payment Info */}
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 700,
                    mb: 2,
                    textTransform: 'uppercase',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    color: isDarkMode ? 'white' : '#1a1a1a',
                    fontFamily: 'var(--font-inter), -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
                  }}
                >
                  <ReceiptIcon sx={{ color: '#4a9eff' }} />
                  Thông tin thanh toán
                </Typography>

                <Card
                  sx={{ 
                    mb: 4, 
                    borderRadius: 2, 
                    border: `1px solid ${isDarkMode ? '#2d2d44' : '#e0e0e0'}`,
                    bgcolor: isDarkMode ? '#2a2a3e' : '#ffffff'
                  }}
                >
                  <CardContent>
                    <Box
                      sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2 }}
                    >
                      <Box sx={{ flex: 1 }}>
                        <Typography 
                          variant="h6" 
                          sx={{ 
                            fontWeight: 700, 
                            mb: 1,
                            color: isDarkMode ? 'white' : '#1a1a1a',
                            fontFamily: 'var(--font-roboto), -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
                          }}
                        >
                          Phương thức thanh toán
                        </Typography>
                        <Chip
                          label={orderData.paymentMethod || 'N/A'}
                          sx={{
                            borderRadius: 2,
                            fontWeight: 700,
                            bgcolor: isDarkMode ? '#1e1e2e' : '#f5f5f5',
                            color: isDarkMode ? 'white' : '#1a1a1a',
                            border: `1px solid ${isDarkMode ? '#2d2d44' : '#ddd'}`,
                            '&:hover': {
                              bgcolor: isDarkMode ? '#2d2d44' : '#e0e0e0'
                            }
                          }}
                        />
                      </Box>
                      <Box sx={{ flex: 1 }}>
                        <Typography 
                          variant="h6" 
                          sx={{ 
                            fontWeight: 700, 
                            mb: 1,
                            color: isDarkMode ? 'white' : '#1a1a1a',
                            fontFamily: 'var(--font-roboto), -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
                          }}
                        >
                          Trạng thái thanh toán
                        </Typography>
                        <Chip
                          label={orderData.paymentStatus || 'N/A'}
                          color="success"
                          sx={{ 
                            borderRadius: 2, 
                            fontWeight: 700,
                            bgcolor: isDarkMode ? '#1b3a1b' : '#4caf50',
                            color: isDarkMode ? '#4caf50' : 'white',
                            border: `1px solid ${isDarkMode ? '#2d5a2d' : '#4caf50'}`
                          }}
                        />
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Box>
            )}
          </>
        )}

        {status === 'fail' && (
          <Alert
            severity="error"
            sx={{
              mb: 4,
              borderRadius: 2,
              bgcolor: isDarkMode ? '#2d1b1b' : '#ffebee',
              color: isDarkMode ? '#ff6b6b' : '#d32f2f',
              fontWeight: 700,
              fontSize: '1.1rem',
              border: `1px solid ${isDarkMode ? '#4a1f1f' : '#d32f2f'}`,
              '& .MuiAlert-icon': { fontSize: 28, color: '#ff6b6b' }
            }}
            icon={<ErrorIcon sx={{ fontSize: 28 }} />}
          >
            <Box>
              <Typography 
                variant="h6" 
                sx={{ 
                  fontWeight: 900, 
                  mb: 1,
                  fontFamily: 'var(--font-inter), -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
                }}
              >
                {message || 'Thanh toán thất bại!'}
              </Typography>
              <Typography 
                variant="body2" 
                sx={{ 
                  fontWeight: 600,
                  fontFamily: 'var(--font-roboto), -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
                }}
              >
                Vui lòng kiểm tra lại thông tin thanh toán hoặc liên hệ hỗ trợ
              </Typography>
            </Box>
          </Alert>
        )}

        {/* Action Buttons */}
        <Box sx={{ textAlign: 'center', mt: 4 }} className="no-print">
          <Stack direction="row" spacing={2} justifyContent="center" flexWrap="wrap">
            <Button
              variant="contained"
              startIcon={<HomeIcon />}
              onClick={() => router.push('/')}
              sx={{
                borderRadius: 2,
                fontWeight: 700,
                bgcolor: isDarkMode ? '#4a9eff' : '#1a1a1a',
                color: 'white',
                '&:hover': { 
                  bgcolor: isDarkMode ? '#3a8eef' : '#2a2a2a' 
                },
                textTransform: 'uppercase',
                px: 3,
                py: 1.5,
                fontFamily: 'var(--font-inter), -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
              }}
            >
              Về trang chủ
            </Button>

            {status === 'success' && orderData && (
              <Button
                variant="outlined"
                startIcon={<PrintIcon />}
                onClick={handlePrint}
                sx={{
                  borderRadius: 2,
                  fontWeight: 700,
                  borderColor: isDarkMode ? '#4a9eff' : '#1a1a1a',
                  color: isDarkMode ? '#4a9eff' : '#1a1a1a',
                  '&:hover': {
                    borderColor: isDarkMode ? '#4a9eff' : '#1a1a1a',
                    bgcolor: isDarkMode ? '#4a9eff' : '#1a1a1a',
                    color: 'white',
                  },
                  textTransform: 'uppercase',
                  px: 3,
                  py: 1.5,
                  fontFamily: 'var(--font-inter), -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
                }}
              >
                In hóa đơn
              </Button>
            )}

            {status === 'fail' && (
              <Button
                variant="outlined"
                onClick={() => router.push('/cart')}
                sx={{
                  borderRadius: 2,
                  fontWeight: 700,
                  borderColor: '#ff6b6b',
                  color: '#ff6b6b',
                  '&:hover': {
                    borderColor: '#ff6b6b',
                    bgcolor: '#ff6b6b',
                    color: 'white',
                  },
                  textTransform: 'uppercase',
                  px: 3,
                  py: 1.5,
                  fontFamily: 'var(--font-inter), -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
                }}
              >
                Thử lại
              </Button>
            )}
          </Stack>
        </Box>

        {/* Debug Info (only in development) - COMMENTED OUT */}
        {/* {process.env.NODE_ENV === 'development' && (
          <Box sx={{ mt: 4, p: 2, bgcolor: "#f5f5f5", borderRadius: 0 }} className="no-print">
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
              Debug Information
            </Typography>
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                Status: {status}
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                Has Order Data: {orderData ? 'Yes' : 'No'}
              </Typography>
              {orderData && (
                <>
                  <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                    Items Count: {orderData.items?.length || 0}
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                    Total Items (from backend): {orderData.totalItems || 0}
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                    Has Shipping Address: {orderData.shippingAddress ? 'Yes' : 'No'}
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                    Total Price: {formatCurrency(orderData.totalPrice || 0)}
                  </Typography>
                </>
              )}
            </Box>
            <pre style={{ 
              textAlign: "left", 
              background: "#fff", 
              padding: 12, 
              borderRadius: 0, 
              fontSize: 12,
              border: "1px solid #ddd",
              overflow: "auto",
              maxHeight: "300px"
            }}>
          {JSON.stringify(detail, null, 2)}
        </pre>
          </Box>
        )} */}
      </Paper>

      {/* Snackbar for copy notification */}
      <Snackbar
        open={copied}
        autoHideDuration={2000}
        onClose={() => setCopied(false)}
        message="Đã copy mã đơn hàng!"
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        sx={{
          '& .MuiSnackbarContent-root': {
            bgcolor: isDarkMode ? '#1e1e2e' : 'black',
            color: 'white',
            fontWeight: 600,
            borderRadius: 0,
          },
        }}
      />
    </Container>
  </Box>
  );
}
