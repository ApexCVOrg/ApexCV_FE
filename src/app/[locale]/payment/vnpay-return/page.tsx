'use client';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  CircularProgress,
  Container,
  Paper,
  Typography,
  Alert,
  Button,
  Box,
  Divider,
  Stack,
  Chip,
  Card,
  CardContent,
  IconButton,
  Snackbar,
} from '@mui/material';
import { useRouter } from 'next/navigation';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import ReceiptIcon from '@mui/icons-material/Receipt';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import HomeIcon from '@mui/icons-material/Home';
import PrintIcon from '@mui/icons-material/Print';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';

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
  const [status, setStatus] = useState<'pending' | 'success' | 'fail'>('pending');
  const [detail, setDetail] = useState<any>(null);
  const [message, setMessage] = useState<string>('');
  const [orderData, setOrderData] = useState<OrderData | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // Gửi toàn bộ query lên backend để xác thực
    const fetchStatus = async () => {
      const params = Object.fromEntries(searchParams.entries());
      const query = new URLSearchParams(params).toString();
      try {
        const res = await fetch(`/api/payment/vnpay/return?${query}`);
        const json = await res.json();
        setDetail(json.result || json.error || json);

        // Kiểm tra response code từ VNPay
        const responseCode = searchParams.get('vnp_ResponseCode');
        console.log('VNPay Response Code:', responseCode);

        if (json.status === 'success' && json.result?.isSuccess) {
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
            setMessage(
              'Giao dịch không thành công do: Tài khoản của quý khách đã vượt quá hạn mức cho phép'
            );
          } else if (responseCode === '75') {
            setMessage('Giao dịch không thành công do: Ngân hàng thanh toán đang bảo trì');
          } else if (responseCode === '79') {
            setMessage(
              'Giao dịch không thành công do: Khách hàng nhập sai mật khẩu thanh toán quá số lần quy định'
            );
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
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper
        elevation={3}
        sx={{
          p: 4,
          borderRadius: 0,
          border: '2px solid black',
          bgcolor: 'white',
        }}
      >
        {/* Header */}
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Typography
            variant="h3"
            sx={{
              fontWeight: 900,
              mb: 1,
              textTransform: 'uppercase',
              letterSpacing: '0.02em',
            }}
          >
            Kết quả thanh toán
          </Typography>
          <Typography
            variant="h6"
            sx={{
              color: 'gray',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              fontWeight: 600,
            }}
          >
            VNPAY Payment Result
          </Typography>
        </Box>

        {/* Status Section */}
        {status === 'pending' && (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <CircularProgress sx={{ color: 'black', mb: 2 }} size={60} />
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
              Đang xử lý thanh toán...
            </Typography>
            <Typography variant="body2" sx={{ color: 'gray' }}>
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
                borderRadius: 0,
                border: '2px solid #4caf50',
                bgcolor: '#f1f8e9',
                color: '#2e7d32',
                fontWeight: 700,
                fontSize: '1.1rem',
              }}
              icon={<CheckCircleIcon sx={{ fontSize: 28 }} />}
            >
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 900, mb: 1 }}>
                  {message || 'Thanh toán thành công!'}
                </Typography>
                {orderData && (
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
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
                  }}
                >
                  <ReceiptIcon sx={{ fontSize: 28 }} />
                  Thông tin đơn hàng
                </Typography>

                {/* Order Summary */}
                <Card sx={{ mb: 3, borderRadius: 0, border: '2px solid black' }}>
                  <CardContent>
                    <Box
                      sx={{
                        display: 'flex',
                        flexDirection: { xs: 'column', md: 'row' },
                        gap: { xs: 2, md: 3 },
                      }}
                    >
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                          Mã đơn hàng
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Typography
                            variant="body1"
                            sx={{
                              fontFamily: 'monospace',
                              fontSize: { xs: '0.9rem', md: '1.1rem' },
                              bgcolor: '#f5f5f5',
                              px: 2,
                              py: 1,
                              borderRadius: 0,
                              border: '1px solid #ddd',
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
                                border: '1px solid #ddd',
                                borderRadius: 0,
                                '&:hover': {
                                  bgcolor: 'black',
                                  color: 'white',
                                },
                              }}
                            >
                              {copied ? (
                                <CheckCircleIcon sx={{ color: 'green', fontSize: 20 }} />
                              ) : (
                                <ContentCopyIcon sx={{ fontSize: 20 }} />
                              )}
                            </IconButton>
                          )}
                        </Box>
                      </Box>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                          Ngày đặt hàng
                        </Typography>
                        <Typography variant="body1">
                          {orderData.createdAt ? formatDate(orderData.createdAt) : 'N/A'}
                        </Typography>
                      </Box>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                          Tổng sản phẩm
                        </Typography>
                        <Typography variant="body1">
                          {orderData.items && Array.isArray(orderData.items)
                            ? orderData.items.length
                            : 0}{' '}
                          sản phẩm
                        </Typography>
                      </Box>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                          Tổng tiền
                        </Typography>
                        <Typography variant="h5" sx={{ fontWeight: 900, color: 'black' }}>
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
                  }}
                >
                  <ShoppingCartIcon />
                  Chi tiết sản phẩm
                </Typography>

                <Stack spacing={2} sx={{ mb: 4 }}>
                  {orderData.items &&
                  Array.isArray(orderData.items) &&
                  orderData.items.length > 0 ? (
                    orderData.items.map((item, index) => (
                      <Card key={index} sx={{ borderRadius: 0, border: '1px solid #ddd' }}>
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
                              <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                                {item.productName}
                              </Typography>
                              <Stack direction="row" spacing={1}>
                                <Chip
                                  label={`Size: ${item.size}`}
                                  size="small"
                                  sx={{ borderRadius: 0, fontWeight: 600 }}
                                />
                                <Chip
                                  label={`Màu: ${item.color}`}
                                  size="small"
                                  sx={{ borderRadius: 0, fontWeight: 600 }}
                                />
                              </Stack>
                            </Box>
                            <Box sx={{ flex: { md: 2 }, textAlign: { xs: 'left', md: 'center' } }}>
                              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                Số lượng
                              </Typography>
                              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                                {item.quantity}
                              </Typography>
                            </Box>
                            <Box sx={{ flex: { md: 2 }, textAlign: { xs: 'left', md: 'center' } }}>
                              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                Đơn giá
                              </Typography>
                              <Typography variant="body1" sx={{ fontWeight: 700 }}>
                                {formatCurrency(item.price)}
                              </Typography>
                            </Box>
                            <Box sx={{ flex: { md: 2 }, textAlign: { xs: 'left', md: 'center' } }}>
                              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                Thành tiền
                              </Typography>
                              <Typography variant="h6" sx={{ fontWeight: 900, color: 'black' }}>
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
                  }}
                >
                  Địa chỉ giao hàng
                </Typography>

                <Card sx={{ mb: 4, borderRadius: 0, border: '2px solid black' }}>
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
                            }}
                          >
                            Họ tên:
                          </Typography>
                          <Typography variant="body1" sx={{ fontWeight: 600 }}>
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
                            }}
                          >
                            Điện thoại:
                          </Typography>
                          <Typography variant="body1" sx={{ fontWeight: 600 }}>
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
                            }}
                          >
                            Địa chỉ:
                          </Typography>
                          <Typography variant="body1" sx={{ fontWeight: 600 }}>
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
                            }}
                          >
                            Thành phố:
                          </Typography>
                          <Typography variant="body1" sx={{ fontWeight: 600 }}>
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
                            }}
                          >
                            Quận/Huyện:
                          </Typography>
                          <Typography variant="body1" sx={{ fontWeight: 600 }}>
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
                            }}
                          >
                            Mã bưu điện:
                          </Typography>
                          <Typography variant="body1" sx={{ fontWeight: 600 }}>
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
                            }}
                          >
                            Quốc gia:
                          </Typography>
                          <Typography variant="body1" sx={{ fontWeight: 600 }}>
                            {orderData.shippingAddress.country || 'N/A'}
                          </Typography>
                        </Box>
                      </Box>
                    ) : (
                      <Typography
                        variant="body1"
                        sx={{ textAlign: 'center', color: 'gray', fontStyle: 'italic' }}
                      >
                        Không có thông tin địa chỉ giao hàng
                      </Typography>
                    )}
                  </CardContent>
                </Card>

                {/* Payment Info */}
                <Card
                  sx={{ mb: 4, borderRadius: 0, border: '2px solid black', bgcolor: '#f8f9fa' }}
                >
                  <CardContent>
                    <Box
                      sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2 }}
                    >
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                          Phương thức thanh toán
                        </Typography>
                        <Chip
                          label={orderData.paymentMethod || 'N/A'}
                          sx={{
                            borderRadius: 0,
                            fontWeight: 700,
                            bgcolor: 'black',
                            color: 'white',
                          }}
                        />
                      </Box>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                          Trạng thái thanh toán
                        </Typography>
                        <Chip
                          label={orderData.paymentStatus || 'N/A'}
                          color="success"
                          sx={{ borderRadius: 0, fontWeight: 700 }}
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
              borderRadius: 0,
              border: '2px solid #d32f2f',
              bgcolor: '#ffebee',
              color: '#d32f2f',
              fontWeight: 700,
              fontSize: '1.1rem',
            }}
            icon={<ErrorIcon sx={{ fontSize: 28 }} />}
          >
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 900, mb: 1 }}>
                {message || 'Thanh toán thất bại!'}
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
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
                borderRadius: 0,
                fontWeight: 700,
                bgcolor: 'black',
                color: 'white',
                '&:hover': { bgcolor: 'gray.800' },
                textTransform: 'uppercase',
                px: 3,
                py: 1.5,
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
                  borderRadius: 0,
                  fontWeight: 700,
                  borderColor: 'black',
                  color: 'black',
                  '&:hover': {
                    borderColor: 'black',
                    bgcolor: 'black',
                    color: 'white',
                  },
                  textTransform: 'uppercase',
                  px: 3,
                  py: 1.5,
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
                  borderRadius: 0,
                  fontWeight: 700,
                  borderColor: '#d32f2f',
                  color: '#d32f2f',
                  '&:hover': {
                    borderColor: '#d32f2f',
                    bgcolor: '#d32f2f',
                    color: 'white',
                  },
                  textTransform: 'uppercase',
                  px: 3,
                  py: 1.5,
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
            bgcolor: 'black',
            color: 'white',
            fontWeight: 600,
            borderRadius: 0,
          },
        }}
      />
    </Container>
  );
}
