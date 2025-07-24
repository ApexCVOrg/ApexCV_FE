'use client';
import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Stack,
  Typography,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Snackbar,
  Alert,
  Chip,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Tooltip,
   
  Card,
  CardContent,
  Divider,
  Pagination,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import PaymentIcon from '@mui/icons-material/Payment';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import PendingIcon from '@mui/icons-material/Pending';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import api from '@/services/api';
import { API_ENDPOINTS, SUCCESS_MESSAGES, ERROR_MESSAGES } from '@/lib/constants/constants';

interface OrderItem {
  _id: string;
  product: {
    _id: string;
    name: string;
    images?: string[];
  };
  size: string | { size?: string; name?: string };
  color: string | { color?: string; name?: string };
  quantity: number;
  price: number;
}

interface ShippingAddress {
  recipientName: string;
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone: string;
}

interface PaymentResult {
  id: string;
  status: string;
  update_time: string;
  email_address: string;
}

interface Order {
  _id: string;
  user: {
    _id: string;
    username: string;
    email: string;
  };
  orderItems: OrderItem[];
  shippingAddress: ShippingAddress;
  paymentMethod: string;
  paymentResult?: PaymentResult;
  taxPrice: number;
  shippingPrice: number;
  totalPrice: number;
  isPaid: boolean;
  paidAt?: string;
  isDelivered: boolean;
  deliveredAt?: string;
  orderStatus: 'pending' | 'paid' | 'shipped' | 'delivered' | 'cancelled';
  createdAt: string;
}

interface OrderFormData {
  orderStatus: 'pending' | 'paid' | 'shipped' | 'delivered' | 'cancelled';
  isPaid: boolean;
  isDelivered: boolean;
  shippingPrice: number;
  taxPrice: number;
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Pagination states
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [totalOrders, setTotalOrders] = useState(0);

  // Search and filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [paymentFilter, setPaymentFilter] = useState<string>('all');

  const [formData, setFormData] = useState<OrderFormData>({
    orderStatus: 'pending',
    isPaid: false,
    isDelivered: false,
    shippingPrice: 0,
    taxPrice: 0,
  });
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({
    open: false,
    message: '',
    severity: 'success',
  });

  // Search and filter function
  const filterOrders = () => {
    let filtered = orders || [];

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        order =>
          order.user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.shippingAddress.recipientName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by order status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(order => order.orderStatus === statusFilter);
    }

    // Filter by payment status
    if (paymentFilter !== 'all') {
      filtered = filtered.filter(order => {
        if (paymentFilter === 'paid') return order.isPaid;
        if (paymentFilter === 'unpaid') return !order.isPaid;
        return true;
      });
    }

    setFilteredOrders(filtered);
  };

  // Apply filters when search terms or filters change
  useEffect(() => {
    filterOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm, statusFilter, paymentFilter, orders]);

  // Clear all filters
  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setPaymentFilter('all');
  };

  // Fetch orders with pagination
  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await api.get<Order[]>(API_ENDPOINTS.ADMIN.ORDERS, {
        params: { page, limit },
      });
      setOrders(res.data);
      setTotalOrders(res.data.length);
      setTotalPages(Math.ceil(res.data.length / limit));
    } catch {
      setSnackbar({ open: true, message: ERROR_MESSAGES.NETWORK_ERROR, severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, limit]);

  // Handle page change
  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
  };

  // Form handlers
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'isPaid' || name === 'isDelivered' ? value === 'true' : value,
    }));
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleSelectChange = (e: any) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'isPaid' || name === 'isDelivered' ? value === 'true' : value,
    }));
  };

  const handleOpenDialog = (order: Order) => {
    setSelectedOrder(order);
    setFormData({
      orderStatus: order.orderStatus,
      isPaid: order.isPaid,
      isDelivered: order.isDelivered,
      shippingPrice: order.shippingPrice,
      taxPrice: order.taxPrice,
    });
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedOrder(null);
    setFormData({
      orderStatus: 'pending',
      isPaid: false,
      isDelivered: false,
      shippingPrice: 0,
      taxPrice: 0,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder) return;

    try {
      await api.put(`${API_ENDPOINTS.ADMIN.ORDERS}/${selectedOrder._id}`, formData);
      setSnackbar({
        open: true,
        message: SUCCESS_MESSAGES.MANAGER.ORDER_UPDATED || 'Order updated successfully',
        severity: 'success',
      });
      handleCloseDialog();
      fetchOrders();
    } catch {
      setSnackbar({
        open: true,
        message: ERROR_MESSAGES.MANAGER.INVALID_ORDER_DATA || 'Failed to update order',
        severity: 'error',
      });
    }
  };

  // Cleanup on component unmount
  useEffect(() => {
    return () => {
      // Remove hide scrollbar style when component unmounts
      const style = document.getElementById('hide-scrollbar-style');
      if (style) {
        style.remove();
      }
    };
  }, []);

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this order?')) return;
    try {
      await api.delete(`${API_ENDPOINTS.ADMIN.ORDERS}/${id}`);
      setSnackbar({
        open: true,
        message: SUCCESS_MESSAGES.MANAGER.ORDER_DELETED || 'Order deleted successfully',
        severity: 'success',
      });
      fetchOrders();
    } catch {
      setSnackbar({ open: true, message: ERROR_MESSAGES.NETWORK_ERROR, severity: 'error' });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'warning';
      case 'paid':
        return 'info';
      case 'shipped':
        return 'primary';
      case 'delivered':
        return 'success';
      case 'cancelled':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <PendingIcon />;
      case 'paid':
        return <PaymentIcon />;
      case 'shipped':
        return <LocalShippingIcon />;
      case 'delivered':
        return <CheckCircleIcon />;
      case 'cancelled':
        return <CancelIcon />;
      default:
        return <PendingIcon />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  const getTotalItems = (orderItems: OrderItem[]) => {
    return orderItems.reduce((total, item) => total + item.quantity, 0);
  };

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h6">Loading orders...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ 
      width: '100%', 
      maxWidth: 1400, 
      mx: 'auto', 
      p: { xs: 2, md: 4 },
      pt: { xs: 4, md: 6 },
      overflowX: 'auto' 
    }}>
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        mb={4}
        sx={{ 
          flexWrap: 'wrap',
          gap: 2,
        }}
      >
        <Typography 
          variant="h4" 
          component="h1" 
          sx={{
            fontWeight: 800,
            fontSize: { xs: '1.75rem', md: '2.25rem' },
            letterSpacing: '0.5px',
            color: 'text.primary',
            fontFamily: "'Inter', 'Roboto', 'Noto Sans', 'Segoe UI', sans-serif",
          }}
        >
          Admin Orders Management
        </Typography>
      </Stack>

      {/* Search and Filter Section */}
      <Paper sx={{ 
        p: 3, 
        mb: 3, 
        maxWidth: '100%', 
        overflowX: 'auto',
        borderRadius: 3,
        boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
        background: (theme) => theme.palette.mode === 'dark' 
          ? 'linear-gradient(135deg, rgba(25, 35, 50, 0.95) 0%, rgba(30, 40, 60, 0.95) 100%)'
          : 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(248,250,252,0.95) 100%)',
        border: (theme) => theme.palette.mode === 'dark'
          ? '1px solid rgba(100, 120, 150, 0.3)'
          : '1px solid rgba(0,0,0,0.06)',
      }}>
        <Stack spacing={3}>
          {/* Search Bar */}
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
            <TextField
              placeholder="Search orders by customer name, email, order ID, or recipient name..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              sx={{ 
                flexGrow: 1,
                minWidth: 250,
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  fontFamily: "'Inter', 'Roboto', 'Noto Sans', 'Segoe UI', sans-serif",
                  '&:hover': {
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'error.main',
                    },
                  },
                },
                '& .MuiInputBase-input': {
                  fontFamily: "'Inter', 'Roboto', 'Noto Sans', 'Segoe UI', sans-serif",
                },
              }}
              InputProps={{
                startAdornment: <SearchIcon sx={{ color: 'text.secondary', mr: 1 }} />,
              }}
            />
            <Button
              variant="outlined"
              startIcon={<ClearIcon />}
              onClick={clearFilters}
              disabled={!searchTerm && statusFilter === 'all' && paymentFilter === 'all'}
              sx={{
                borderRadius: 2,
                px: 3,
                py: 1.5,
                fontWeight: 500,
                textTransform: 'none',
                fontFamily: "'Inter', 'Roboto', 'Noto Sans', 'Segoe UI', sans-serif",
                borderColor: 'error.main',
                color: 'error.main',
                '&:hover': {
                  borderColor: 'error.dark',
                  backgroundColor: 'rgba(211, 47, 47, 0.08)',
                  transform: 'translateY(-1px)',
                },
                transition: 'all 0.2s ease-in-out',
              }}
            >
              Clear
            </Button>
          </Box>

          {/* Filter Row */}
          <Box sx={{ 
            display: 'flex', 
            gap: 3, 
            flexWrap: 'wrap', 
            alignItems: 'center',
            width: '100%',
            overflowX: 'auto',
          }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
              <Typography 
                variant="body2" 
                sx={{ 
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  color: 'text.secondary',
                  mb: 0.5,
                  fontFamily: "'Inter', 'Roboto', 'Noto Sans', 'Segoe UI', sans-serif",
                }}
              >
                Order Status
              </Typography>
              <FormControl sx={{ 
                minWidth: 150,
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  fontFamily: "'Inter', 'Roboto', 'Noto Sans', 'Segoe UI', sans-serif",
                  '&:hover': {
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'error.main',
                    },
                  },
                },
              }}>
              <Select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                  displayEmpty
                  sx={{
                    '& .MuiSelect-select': {
                      fontSize: '0.875rem',
                      fontWeight: 500,
                      py: 1.5,
                      fontFamily: "'Inter', 'Roboto', 'Noto Sans', 'Segoe UI', sans-serif",
                    },
                  }}
              >
                <MenuItem value="all">All Status</MenuItem>
                <MenuItem value="pending">Pending</MenuItem>
                <MenuItem value="paid">Paid</MenuItem>
                <MenuItem value="shipped">Shipped</MenuItem>
                <MenuItem value="delivered">Delivered</MenuItem>
                <MenuItem value="cancelled">Cancelled</MenuItem>
              </Select>
            </FormControl>
            </Box>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
              <Typography 
                variant="body2" 
                sx={{ 
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  color: 'text.secondary',
                  mb: 0.5,
                  fontFamily: "'Inter', 'Roboto', 'Noto Sans', 'Segoe UI', sans-serif",
                }}
              >
                Payment
              </Typography>
              <FormControl sx={{ 
                minWidth: 120,
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  fontFamily: "'Inter', 'Roboto', 'Noto Sans', 'Segoe UI', sans-serif",
                  '&:hover': {
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'error.main',
                    },
                  },
                },
              }}>
              <Select
                value={paymentFilter}
                onChange={e => setPaymentFilter(e.target.value)}
                  displayEmpty
                  sx={{
                    '& .MuiSelect-select': {
                      fontSize: '0.875rem',
                      fontWeight: 500,
                      py: 1.5,
                      fontFamily: "'Inter', 'Roboto', 'Noto Sans', 'Segoe UI', sans-serif",
                    },
                  }}
              >
                <MenuItem value="all">All Payment</MenuItem>
                <MenuItem value="paid">Paid</MenuItem>
                <MenuItem value="unpaid">Unpaid</MenuItem>
              </Select>
            </FormControl>
            </Box>

            {/* Results Count */}
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              ml: 'auto',
              px: 2,
              py: 1,
              borderRadius: 2,
              backgroundColor: (theme) => theme.palette.mode === 'dark' 
                ? 'rgba(255,255,255,0.08)' 
                : 'rgba(0,0,0,0.04)',
            }}>
              <Typography variant="body2" color="text.secondary" sx={{ 
                fontWeight: 500,
                fontFamily: "'Inter', 'Roboto', 'Noto Sans', 'Segoe UI', sans-serif",
              }}>
                {filteredOrders.length} of {orders.length} orders
              </Typography>
            </Box>
          </Box>
        </Stack>
      </Paper>

      {/* Orders Summary Cards */}
      <Box
        sx={{ 
          display: 'flex', 
          flexWrap: 'wrap', 
          gap: 3, 
          mb: 3, 
          width: '100%', 
          overflowX: 'auto',
          justifyContent: 'center',
        }}
      >
        <Box sx={{ flex: '1 1 200px', minWidth: '200px', maxWidth: '250px' }}>
          <Card sx={{
            borderRadius: 3,
            boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
            background: (theme) => theme.palette.mode === 'dark' 
              ? 'linear-gradient(135deg, rgba(25, 35, 50, 0.95) 0%, rgba(30, 40, 60, 0.95) 100%)'
              : 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(248,250,252,0.95) 100%)',
            border: (theme) => theme.palette.mode === 'dark'
              ? '1px solid rgba(100, 120, 150, 0.3)'
              : '1px solid rgba(0,0,0,0.06)',
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
            },
            transition: 'all 0.3s ease-in-out',
          }}>
            <CardContent sx={{ p: 3 }}>
              <Typography 
                color="textSecondary" 
                gutterBottom
                sx={{
                  fontFamily: "'Inter', 'Roboto', 'Noto Sans', 'Segoe UI', sans-serif",
                  fontWeight: 600,
                }}
              >
                Total Orders
              </Typography>
              <Typography 
                variant="h4"
                sx={{
                  fontFamily: "'Inter', 'Roboto', 'Noto Sans', 'Segoe UI', sans-serif",
                  fontWeight: 700,
                }}
              >
                {filteredOrders.length}
              </Typography>
            </CardContent>
          </Card>
        </Box>
        <Box sx={{ flex: '1 1 200px', minWidth: '200px', maxWidth: '250px' }}>
          <Card sx={{
            borderRadius: 3,
            boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
            background: (theme) => theme.palette.mode === 'dark' 
              ? 'linear-gradient(135deg, rgba(25, 35, 50, 0.95) 0%, rgba(30, 40, 60, 0.95) 100%)'
              : 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(248,250,252,0.95) 100%)',
            border: (theme) => theme.palette.mode === 'dark'
              ? '1px solid rgba(100, 120, 150, 0.3)'
              : '1px solid rgba(0,0,0,0.06)',
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
            },
            transition: 'all 0.3s ease-in-out',
          }}>
            <CardContent sx={{ p: 3 }}>
              <Typography 
                color="textSecondary" 
                gutterBottom
                sx={{
                  fontFamily: "'Inter', 'Roboto', 'Noto Sans', 'Segoe UI', sans-serif",
                  fontWeight: 600,
                }}
              >
                Pending Orders
              </Typography>
              <Typography 
                variant="h4" 
                color="warning.main"
                sx={{
                  fontFamily: "'Inter', 'Roboto', 'Noto Sans', 'Segoe UI', sans-serif",
                  fontWeight: 700,
                }}
              >
                {filteredOrders.filter(order => order.orderStatus === 'pending').length}
              </Typography>
            </CardContent>
          </Card>
        </Box>
        <Box sx={{ flex: '1 1 200px', minWidth: '200px', maxWidth: '250px' }}>
          <Card sx={{
            borderRadius: 3,
            boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
            background: (theme) => theme.palette.mode === 'dark' 
              ? 'linear-gradient(135deg, rgba(25, 35, 50, 0.95) 0%, rgba(30, 40, 60, 0.95) 100%)'
              : 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(248,250,252,0.95) 100%)',
            border: (theme) => theme.palette.mode === 'dark'
              ? '1px solid rgba(100, 120, 150, 0.3)'
              : '1px solid rgba(0,0,0,0.06)',
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
            },
            transition: 'all 0.3s ease-in-out',
          }}>
            <CardContent sx={{ p: 3 }}>
              <Typography 
                color="textSecondary" 
                gutterBottom
                sx={{
                  fontFamily: "'Inter', 'Roboto', 'Noto Sans', 'Segoe UI', sans-serif",
                  fontWeight: 600,
                }}
              >
                Paid Orders
              </Typography>
              <Typography 
                variant="h4" 
                color="info.main"
                sx={{
                  fontFamily: "'Inter', 'Roboto', 'Noto Sans', 'Segoe UI', sans-serif",
                  fontWeight: 700,
                }}
              >
                {filteredOrders.filter(order => order.isPaid).length}
              </Typography>
            </CardContent>
          </Card>
        </Box>
        <Box sx={{ flex: '1 1 200px', minWidth: '200px', maxWidth: '250px' }}>
          <Card sx={{
            borderRadius: 3,
            boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
            background: (theme) => theme.palette.mode === 'dark' 
              ? 'linear-gradient(135deg, rgba(25, 35, 50, 0.95) 0%, rgba(30, 40, 60, 0.95) 100%)'
              : 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(248,250,252,0.95) 100%)',
            border: (theme) => theme.palette.mode === 'dark'
              ? '1px solid rgba(100, 120, 150, 0.3)'
              : '1px solid rgba(0,0,0,0.06)',
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
            },
            transition: 'all 0.3s ease-in-out',
          }}>
            <CardContent sx={{ p: 3 }}>
              <Typography 
                color="textSecondary" 
                gutterBottom
                sx={{
                  fontFamily: "'Inter', 'Roboto', 'Noto Sans', 'Segoe UI', sans-serif",
                  fontWeight: 600,
                }}
              >
                Delivered Orders
              </Typography>
              <Typography 
                variant="h4" 
                color="success.main"
                sx={{
                  fontFamily: "'Inter', 'Roboto', 'Noto Sans', 'Segoe UI', sans-serif",
                  fontWeight: 700,
                }}
              >
                {filteredOrders.filter(order => order.isDelivered).length}
              </Typography>
            </CardContent>
          </Card>
        </Box>
      </Box>

      {/* Orders Table */}
      <Paper sx={{ 
        width: '100%', 
        overflow: 'hidden',
        borderRadius: 3,
        boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
        background: (theme) => theme.palette.mode === 'dark' 
          ? 'linear-gradient(135deg, rgba(25, 35, 50, 0.95) 0%, rgba(30, 40, 60, 0.95) 100%)'
          : 'background.paper',
        border: (theme) => theme.palette.mode === 'dark'
          ? '1px solid rgba(100, 120, 150, 0.3)'
          : '1px solid rgba(0,0,0,0.06)',
      }}>
        <TableContainer>
          <Table stickyHeader>
            <TableHead>
              <TableRow sx={{ 
                backgroundColor: (theme) => theme.palette.mode === 'dark' 
                  ? 'rgba(255,255,255,0.08)' 
                  : 'rgba(0,0,0,0.08)' 
              }}>
                <TableCell sx={{ 
                  fontWeight: 700, 
                  fontSize: '0.95rem',
                  color: 'text.primary',
                  borderBottom: (theme) => theme.palette.mode === 'dark'
                    ? '2px solid rgba(255,255,255,0.1)'
                    : '2px solid rgba(0,0,0,0.15)',
                  fontFamily: "'Inter', 'Roboto', 'Noto Sans', 'Segoe UI', sans-serif",
                  backgroundColor: (theme) => theme.palette.mode === 'dark' 
                    ? 'rgba(255,255,255,0.08)' 
                    : 'rgba(0,0,0,0.08)',
                }}>
                  Order ID
                </TableCell>
                <TableCell sx={{ 
                  fontWeight: 700, 
                  fontSize: '0.95rem',
                  color: 'text.primary',
                  borderBottom: (theme) => theme.palette.mode === 'dark'
                    ? '2px solid rgba(255,255,255,0.1)'
                    : '2px solid rgba(0,0,0,0.15)',
                  fontFamily: "'Inter', 'Roboto', 'Noto Sans', 'Segoe UI', sans-serif",
                  backgroundColor: (theme) => theme.palette.mode === 'dark' 
                    ? 'rgba(255,255,255,0.08)' 
                    : 'rgba(0,0,0,0.08)',
                }}>
                  Customer
                </TableCell>
                <TableCell sx={{ 
                  fontWeight: 700, 
                  fontSize: '0.95rem',
                  color: 'text.primary',
                  borderBottom: (theme) => theme.palette.mode === 'dark'
                    ? '2px solid rgba(255,255,255,0.1)'
                    : '2px solid rgba(0,0,0,0.15)',
                  fontFamily: "'Inter', 'Roboto', 'Noto Sans', 'Segoe UI', sans-serif",
                  backgroundColor: (theme) => theme.palette.mode === 'dark' 
                    ? 'rgba(255,255,255,0.08)' 
                    : 'rgba(0,0,0,0.08)',
                }}>
                  Items
                </TableCell>
                <TableCell sx={{ 
                  fontWeight: 700, 
                  fontSize: '0.95rem',
                  color: 'text.primary',
                  borderBottom: (theme) => theme.palette.mode === 'dark'
                    ? '2px solid rgba(255,255,255,0.1)'
                    : '2px solid rgba(0,0,0,0.15)',
                  fontFamily: "'Inter', 'Roboto', 'Noto Sans', 'Segoe UI', sans-serif",
                  backgroundColor: (theme) => theme.palette.mode === 'dark' 
                    ? 'rgba(255,255,255,0.08)' 
                    : 'rgba(0,0,0,0.08)',
                }}>
                  Total
                </TableCell>
                <TableCell sx={{ 
                  fontWeight: 700, 
                  fontSize: '0.95rem',
                  color: 'text.primary',
                  borderBottom: (theme) => theme.palette.mode === 'dark'
                    ? '2px solid rgba(255,255,255,0.1)'
                    : '2px solid rgba(0,0,0,0.15)',
                  fontFamily: "'Inter', 'Roboto', 'Noto Sans', 'Segoe UI', sans-serif",
                  backgroundColor: (theme) => theme.palette.mode === 'dark' 
                    ? 'rgba(255,255,255,0.08)' 
                    : 'rgba(0,0,0,0.08)',
                }}>
                  Status
                </TableCell>
                <TableCell sx={{ 
                  fontWeight: 700, 
                  fontSize: '0.95rem',
                  color: 'text.primary',
                  borderBottom: (theme) => theme.palette.mode === 'dark'
                    ? '2px solid rgba(255,255,255,0.1)'
                    : '2px solid rgba(0,0,0,0.15)',
                  fontFamily: "'Inter', 'Roboto', 'Noto Sans', 'Segoe UI', sans-serif",
                  backgroundColor: (theme) => theme.palette.mode === 'dark' 
                    ? 'rgba(255,255,255,0.08)' 
                    : 'rgba(0,0,0,0.08)',
                }}>
                  Payment
                </TableCell>
                <TableCell sx={{ 
                  fontWeight: 700, 
                  fontSize: '0.95rem',
                  color: 'text.primary',
                  borderBottom: (theme) => theme.palette.mode === 'dark'
                    ? '2px solid rgba(255,255,255,0.1)'
                    : '2px solid rgba(0,0,0,0.15)',
                  fontFamily: "'Inter', 'Roboto', 'Noto Sans', 'Segoe UI', sans-serif",
                  backgroundColor: (theme) => theme.palette.mode === 'dark' 
                    ? 'rgba(255,255,255,0.08)' 
                    : 'rgba(0,0,0,0.08)',
                }}>
                  Created
                </TableCell>
                <TableCell sx={{ 
                  fontWeight: 700, 
                  fontSize: '0.95rem',
                  color: 'text.primary',
                  borderBottom: (theme) => theme.palette.mode === 'dark'
                    ? '2px solid rgba(255,255,255,0.1)'
                    : '2px solid rgba(0,0,0,0.15)',
                  fontFamily: "'Inter', 'Roboto', 'Noto Sans', 'Segoe UI', sans-serif",
                  backgroundColor: (theme) => theme.palette.mode === 'dark' 
                    ? 'rgba(255,255,255,0.08)' 
                    : 'rgba(0,0,0,0.08)',
                }}>
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredOrders.map(order => (
                <TableRow key={order._id} hover>
                  <TableCell>
                    <Typography 
                      variant="body2" 
                      fontFamily="monospace"
                      sx={{
                        fontFamily: "'Inter', 'Roboto', 'Noto Sans', 'Segoe UI', sans-serif",
                      }}
                    >
                      {order._id.slice(-8)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Box>
                      <Typography 
                        variant="body2" 
                        fontWeight="medium"
                        sx={{
                          fontFamily: "'Inter', 'Roboto', 'Noto Sans', 'Segoe UI', sans-serif",
                        }}
                      >
                        {order.user.username}
                      </Typography>
                      <Typography 
                        variant="caption" 
                        color="textSecondary"
                        sx={{
                          fontFamily: "'Inter', 'Roboto', 'Noto Sans', 'Segoe UI', sans-serif",
                        }}
                      >
                        {order.user.email}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography 
                      variant="body2"
                      sx={{
                        fontFamily: "'Inter', 'Roboto', 'Noto Sans', 'Segoe UI', sans-serif",
                      }}
                    >
                      {getTotalItems(order.orderItems)} items
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography 
                      variant="body2" 
                      fontWeight="medium"
                      sx={{
                        fontFamily: "'Inter', 'Roboto', 'Noto Sans', 'Segoe UI', sans-serif",
                      }}
                    >
                      {formatPrice(order.totalPrice)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      icon={getStatusIcon(order.orderStatus)}
                      label={order.orderStatus.toUpperCase()}
                      // eslint-disable-next-line @typescript-eslint/no-explicit-any
                      color={getStatusColor(order.orderStatus) as any}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Box>
                      <Chip
                        label={order.isPaid ? 'Paid' : 'Unpaid'}
                        color={order.isPaid ? 'success' : 'warning'}
                        size="small"
                        sx={{ mb: 0.5 }}
                      />
                      {order.isPaid && order.paidAt && (
                        <Typography 
                          variant="caption" 
                          display="block" 
                          color="textSecondary"
                          sx={{
                            fontFamily: "'Inter', 'Roboto', 'Noto Sans', 'Segoe UI', sans-serif",
                          }}
                        >
                          {formatDate(order.paidAt)}
                        </Typography>
                      )}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography 
                      variant="body2"
                      sx={{
                        fontFamily: "'Inter', 'Roboto', 'Noto Sans', 'Segoe UI', sans-serif",
                      }}
                    >
                      {formatDate(order.createdAt)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={1}>
                      <Tooltip title="View Details">
                        <IconButton 
                          size="small" 
                          onClick={() => handleOpenDialog(order)}
                          sx={{
                            color: 'error.main',
                            '&:hover': {
                              backgroundColor: 'rgba(211, 47, 47, 0.08)',
                              transform: 'scale(1.1)',
                            },
                            transition: 'all 0.2s ease-in-out',
                          }}
                        >
                          <VisibilityIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Edit Order">
                        <IconButton 
                          size="small" 
                          onClick={() => handleOpenDialog(order)}
                          sx={{
                            color: 'error.main',
                            '&:hover': {
                              backgroundColor: 'rgba(211, 47, 47, 0.08)',
                              transform: 'scale(1.1)',
                            },
                            transition: 'all 0.2s ease-in-out',
                          }}
                        >
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete Order">
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleDelete(order._id)}
                          sx={{
                            '&:hover': {
                              backgroundColor: 'rgba(211, 47, 47, 0.08)',
                              transform: 'scale(1.1)',
                            },
                            transition: 'all 0.2s ease-in-out',
                          }}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Edit Order Dialog */}
      <Dialog 
        open={openDialog} 
        onClose={handleCloseDialog} 
        maxWidth="lg" 
        fullWidth
        disableScrollLock={true}
        hideBackdrop={false}
        sx={{
          '& .MuiDialog-container': {
            justifyContent: 'center',
            alignItems: 'flex-start',
            paddingTop: '5vh',
          },
          '& .MuiDialog-paper': {
            margin: 'auto',
          },
          '& .MuiDialog-scrollPaper': {
            alignItems: 'flex-start',
            paddingTop: '5vh',
          }
        }}
        slotProps={{
          backdrop: {
            sx: {
              backdropFilter: 'blur(8px)',
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
            }
          }
        }}

        PaperProps={{
          sx: {
            maxHeight: '85vh',
            height: 'auto',
            width: '100%',
            maxWidth: { xs: '95%', sm: '90%', md: '1000px' },
            margin: { xs: 1, sm: 2, md: 3 },
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            background: (theme) => theme.palette.mode === 'dark'
              ? 'linear-gradient(135deg, rgba(26, 26, 46, 0.98) 0%, rgba(0, 0, 0, 0.98) 100%)'
              : 'linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, rgba(248, 250, 252, 0.98) 100%)',
            backdropFilter: 'blur(10px)',
            border: (theme) => theme.palette.mode === 'dark'
              ? '1px solid rgba(100, 120, 150, 0.3)'
              : '1px solid rgba(0,0,0,0.1)',
            borderRadius: 3,
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
          }
        }}
        scroll="body"
      >
        <DialogTitle sx={{
          background: (theme) => theme.palette.mode === 'dark'
            ? 'linear-gradient(135deg, rgba(25, 35, 50, 0.95) 0%, rgba(30, 40, 60, 0.95) 100%)'
            : 'linear-gradient(135deg, rgba(248, 250, 252, 0.95) 0%, rgba(255, 255, 255, 0.95) 100%)',
          borderBottom: (theme) => theme.palette.mode === 'dark'
            ? '1px solid rgba(100, 120, 150, 0.3)'
            : '1px solid rgba(0,0,0,0.1)',
          py: 3,
          px: 4,
        }}>
          <Typography variant="h5" component="div" sx={{
            fontWeight: 700,
            fontFamily: "'Inter', 'Roboto', 'Noto Sans', 'Segoe UI', sans-serif",
            color: 'text.primary'
          }}>
          {selectedOrder ? `Edit Order #${selectedOrder._id.slice(-8)}` : 'Edit Order'}
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ 
          p: 0,
          flex: 1,
          overflowY: 'auto',
          overflowX: 'hidden',
          '&::-webkit-scrollbar': {
            width: '8px',
          },
          '&::-webkit-scrollbar-track': {
            background: (theme) => theme.palette.mode === 'dark'
              ? 'rgba(30, 40, 60, 0.3)'
              : 'rgba(0, 0, 0, 0.05)',
            borderRadius: '10px',
          },
          '&::-webkit-scrollbar-thumb': {
            background: (theme) => theme.palette.mode === 'dark'
              ? 'linear-gradient(135deg, rgba(211, 47, 47, 0.6) 0%, rgba(183, 28, 28, 0.8) 100%)'
              : 'linear-gradient(135deg, rgba(211, 47, 47, 0.4) 0%, rgba(183, 28, 28, 0.6) 100%)',
            borderRadius: '10px',
            border: (theme) => theme.palette.mode === 'dark'
              ? '1px solid rgba(211, 47, 47, 0.3)'
              : '1px solid rgba(211, 47, 47, 0.3)',
          },
          '&::-webkit-scrollbar-thumb:hover': {
            background: (theme) => theme.palette.mode === 'dark'
              ? 'linear-gradient(135deg, rgba(231, 67, 67, 0.8) 0%, rgba(211, 47, 47, 1) 100%)'
              : 'linear-gradient(135deg, rgba(211, 47, 47, 0.6) 0%, rgba(183, 28, 28, 0.8) 100%)',
          },
          '&::-webkit-scrollbar-thumb:active': {
            background: (theme) => theme.palette.mode === 'dark'
              ? 'linear-gradient(135deg, rgba(251, 87, 87, 1) 0%, rgba(231, 67, 67, 1) 100%)'
              : 'linear-gradient(135deg, rgba(211, 47, 47, 0.8) 0%, rgba(183, 28, 28, 1) 100%)',
          },
          // Firefox scrollbar
          scrollbarWidth: 'thin',
          scrollbarColor: (theme) => theme.palette.mode === 'dark'
            ? 'rgba(211, 47, 47, 0.6) rgba(30, 40, 60, 0.3)'
            : 'rgba(211, 47, 47, 0.4) rgba(0, 0, 0, 0.05)',
        }}>
          {selectedOrder && (
            <Box sx={{ 
              p: 4,
              background: (theme) => theme.palette.mode === 'dark'
                ? 'linear-gradient(135deg, rgba(20, 25, 35, 0.8) 0%, rgba(15, 20, 30, 0.8) 100%)'
                : 'linear-gradient(135deg, rgba(252, 254, 255, 0.8) 0%, rgba(245, 248, 252, 0.8) 100%)',
            }}>
              {/* Order Details */}
              <Typography variant="h6" gutterBottom sx={{ 
                fontWeight: 600,
                color: 'text.primary',
                mb: 2
              }}>
                Order Details
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 3 }}>
                <Box sx={{ flex: '1 1 300px', minWidth: '300px' }}>
                  <Typography variant="body2" color="textSecondary">
                    Customer
                  </Typography>
                  <Typography variant="body1">{selectedOrder.user.username}</Typography>
                </Box>
                <Box sx={{ flex: '1 1 300px', minWidth: '300px' }}>
                  <Typography variant="body2" color="textSecondary">
                    Email
                  </Typography>
                  <Typography variant="body1">{selectedOrder.user.email}</Typography>
                </Box>
                <Box sx={{ flex: '1 1 100%' }}>
                  <Typography variant="body2" color="textSecondary">
                    Shipping Address
                  </Typography>
                  <Typography variant="body1">
                    {selectedOrder.shippingAddress.recipientName}
                    <br />
                    {selectedOrder.shippingAddress.street}
                    <br />
                    {selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state}{' '}
                    {selectedOrder.shippingAddress.postalCode}
                    <br />
                    {selectedOrder.shippingAddress.country}
                    <br />
                    Phone: {selectedOrder.shippingAddress.phone}
                  </Typography>
                </Box>
              </Box>

              <Divider sx={{ my: 2 }} />

              {/* Order Items */}
              <Typography variant="h6" gutterBottom sx={{ 
                fontWeight: 600,
                color: 'text.primary',
                mb: 2
              }}>
                Order Items
              </Typography>
              <Box sx={{ 
                border: (theme) => theme.palette.mode === 'dark'
                  ? '1px solid rgba(100, 120, 150, 0.3)'
                  : '1px solid rgba(0,0,0,0.12)',
                borderRadius: 3,
                background: (theme) => theme.palette.mode === 'dark'
                  ? 'linear-gradient(135deg, rgba(25, 35, 50, 0.8) 0%, rgba(30, 40, 60, 0.8) 100%)'
                  : 'linear-gradient(135deg, rgba(248, 250, 252, 0.9) 0%, rgba(255, 255, 255, 0.9) 100%)',
                p: 3
              }}>
                <Box sx={{ 
                  display: 'flex', 
                  flexDirection: 'column',
                  gap: 3
                }}>
                    {selectedOrder.orderItems.map((item, index) => (
                    <Box key={index} sx={{
                      p: 3,
                      background: (theme) => theme.palette.mode === 'dark'
                        ? 'linear-gradient(135deg, rgba(40, 50, 70, 0.9) 0%, rgba(30, 40, 60, 0.9) 100%)'
                        : 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(250, 252, 255, 0.95) 100%)',
                      border: (theme) => theme.palette.mode === 'dark'
                        ? '1px solid rgba(100, 120, 150, 0.25)'
                        : '1px solid rgba(0,0,0,0.06)',
                      borderRadius: 3,
                      boxShadow: (theme) => theme.palette.mode === 'dark'
                        ? '0 4px 15px rgba(0,0,0,0.25)'
                        : '0 4px 15px rgba(0,0,0,0.08)',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: (theme) => theme.palette.mode === 'dark'
                          ? '0 8px 25px rgba(0,0,0,0.4)'
                          : '0 8px 25px rgba(0,0,0,0.12)',
                      },
                      transition: 'all 0.3s ease-in-out'
                    }}>
                      {/* Product Header */}
                      <Box sx={{ mb: 3 }}>
                        <Typography variant="h6" sx={{ 
                          fontWeight: 700,
                          color: 'text.primary',
                          mb: 1,
                          fontFamily: "'Inter', 'Roboto', 'Noto Sans', 'Segoe UI', sans-serif",
                        }}>
                          {item.product.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{
                          fontStyle: 'italic',
                          fontFamily: "'Inter', 'Roboto', 'Noto Sans', 'Segoe UI', sans-serif",
                        }}>
                          Product #{index + 1}
                        </Typography>
                      </Box>

                      {/* Product Details Grid */}
                      <Box sx={{ 
                        display: 'grid', 
                        gridTemplateColumns: { 
                          xs: 'repeat(2, 1fr)', 
                          sm: 'repeat(4, 1fr)' 
                        },
                        gap: 3,
                        mb: 2
                      }}>
                        {/* Size */}
                        <Box sx={{
                          p: 2,
                          borderRadius: 2,
                          background: (theme) => theme.palette.mode === 'dark'
                            ? 'rgba(211, 47, 47, 0.1)'
                            : 'rgba(211, 47, 47, 0.05)',
                          border: (theme) => theme.palette.mode === 'dark'
                            ? '1px solid rgba(211, 47, 47, 0.3)'
                            : '1px solid rgba(211, 47, 47, 0.15)',
                        }}>
                          <Typography variant="caption" color="text.secondary" sx={{ 
                            fontWeight: 600,
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px',
                            fontFamily: "'Inter', 'Roboto', 'Noto Sans', 'Segoe UI', sans-serif",
                          }}>
                            Size
                          </Typography>
                          <Typography variant="body1" sx={{ 
                            fontWeight: 600,
                            color: 'error.main',
                            mt: 0.5,
                            fontFamily: "'Inter', 'Roboto', 'Noto Sans', 'Segoe UI', sans-serif",
                          }}>
                            {typeof item.size === 'object' && item.size ? 
                              ((item.size as { size?: string; name?: string }).size || (item.size as { size?: string; name?: string }).name || 'Custom') : 
                              (item.size as string) || 'Standard'}
                          </Typography>
                        </Box>
                        
                        {/* Color */}
                        <Box sx={{
                          p: 2,
                          borderRadius: 2,
                          background: (theme) => theme.palette.mode === 'dark'
                            ? 'rgba(156, 39, 176, 0.1)'
                            : 'rgba(156, 39, 176, 0.05)',
                          border: (theme) => theme.palette.mode === 'dark'
                            ? '1px solid rgba(156, 39, 176, 0.3)'
                            : '1px solid rgba(156, 39, 176, 0.15)',
                        }}>
                          <Typography variant="caption" color="text.secondary" sx={{ 
                            fontWeight: 600,
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px',
                            fontFamily: "'Inter', 'Roboto', 'Noto Sans', 'Segoe UI', sans-serif",
                          }}>
                            Color
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                            <Box sx={{
                              width: 20,
                              height: 20,
                              borderRadius: '50%',
                              backgroundColor: typeof item.color === 'object' && item.color ?
                                ((item.color as { color?: string; name?: string }).color || (item.color as { color?: string; name?: string }).name || '#9c27b0') :
                                (item.color as string || '#9c27b0'),
                              border: '2px solid rgba(0,0,0,0.1)',
                              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                            }} />
                            <Typography variant="body1" sx={{ 
                              fontWeight: 600,
                              color: '#9c27b0',
                              fontFamily: "'Inter', 'Roboto', 'Noto Sans', 'Segoe UI', sans-serif",
                            }}>
                              {typeof item.color === 'object' && item.color ? 
                                ((item.color as { color?: string; name?: string }).color || (item.color as { color?: string; name?: string }).name || 'Custom') : 
                                (item.color as string) || 'Default'}
                            </Typography>
                          </Box>
                        </Box>
                        
                        {/* Quantity */}
                        <Box sx={{
                          p: 2,
                          borderRadius: 2,
                          background: (theme) => theme.palette.mode === 'dark'
                            ? 'rgba(255, 152, 0, 0.1)'
                            : 'rgba(255, 152, 0, 0.05)',
                          border: (theme) => theme.palette.mode === 'dark'
                            ? '1px solid rgba(255, 152, 0, 0.3)'
                            : '1px solid rgba(255, 152, 0, 0.15)',
                        }}>
                          <Typography variant="caption" color="text.secondary" sx={{ 
                            fontWeight: 600,
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px',
                            fontFamily: "'Inter', 'Roboto', 'Noto Sans', 'Segoe UI', sans-serif",
                          }}>
                            Quantity
                          </Typography>
                          <Typography variant="h5" sx={{ 
                            fontWeight: 700,
                            color: '#ff9800',
                            mt: 0.5,
                            fontFamily: "'Inter', 'Roboto', 'Noto Sans', 'Segoe UI', sans-serif",
                          }}>
                            {item.quantity}
                          </Typography>
                        </Box>
                        
                        {/* Unit Price */}
                        <Box sx={{
                          p: 2,
                          borderRadius: 2,
                          background: (theme) => theme.palette.mode === 'dark'
                            ? 'rgba(76, 175, 80, 0.1)'
                            : 'rgba(76, 175, 80, 0.05)',
                          border: (theme) => theme.palette.mode === 'dark'
                            ? '1px solid rgba(76, 175, 80, 0.3)'
                            : '1px solid rgba(76, 175, 80, 0.15)',
                        }}>
                          <Typography variant="caption" color="text.secondary" sx={{ 
                            fontWeight: 600,
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px',
                            fontFamily: "'Inter', 'Roboto', 'Noto Sans', 'Segoe UI', sans-serif",
                          }}>
                            Unit Price
                          </Typography>
                          <Typography variant="h6" sx={{ 
                            fontWeight: 700,
                            color: 'success.main',
                            mt: 0.5,
                            fontFamily: "'Inter', 'Roboto', 'Noto Sans', 'Segoe UI', sans-serif",
                          }}>
                            {formatPrice(item.price)}
                          </Typography>
                        </Box>
                      </Box>

                      {/* Total Price Highlight */}
                      <Box sx={{
                        p: 2,
                        borderRadius: 2,
                        background: (theme) => theme.palette.mode === 'dark'
                          ? 'linear-gradient(135deg, rgba(76, 175, 80, 0.15) 0%, rgba(67, 160, 71, 0.15) 100%)'
                          : 'linear-gradient(135deg, rgba(76, 175, 80, 0.08) 0%, rgba(67, 160, 71, 0.08) 100%)',
                        border: (theme) => theme.palette.mode === 'dark'
                          ? '2px solid rgba(76, 175, 80, 0.4)'
                          : '2px solid rgba(76, 175, 80, 0.2)',
                        textAlign: 'center'
                      }}>
                        <Typography variant="caption" color="text.secondary" sx={{ 
                          fontWeight: 600,
                          textTransform: 'uppercase',
                          letterSpacing: '1px',
                          fontFamily: "'Inter', 'Roboto', 'Noto Sans', 'Segoe UI', sans-serif",
                        }}>
                          Item Total
                        </Typography>
                        <Typography variant="h4" sx={{ 
                          fontWeight: 800,
                          color: 'success.main',
                          mt: 0.5,
                          fontFamily: "'Inter', 'Roboto', 'Noto Sans', 'Segoe UI', sans-serif",
                        }}>
                          {formatPrice(item.price * item.quantity)}
                        </Typography>
                      </Box>
                    </Box>
                  ))}
                </Box>
              </Box>

              <Divider sx={{ my: 2 }} />

              {/* Edit Form */}
              <Typography variant="h6" gutterBottom>
                Update Order
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                <Box sx={{ flex: '1 1 300px', minWidth: '300px' }}>
                  <FormControl fullWidth>
                    <InputLabel>Order Status</InputLabel>
                    <Select
                      name="orderStatus"
                      value={formData.orderStatus}
                      onChange={handleSelectChange}
                      label="Order Status"
                    >
                      <MenuItem value="pending">Pending</MenuItem>
                      <MenuItem value="paid">Paid</MenuItem>
                      <MenuItem value="shipped">Shipped</MenuItem>
                      <MenuItem value="delivered">Delivered</MenuItem>
                      <MenuItem value="cancelled">Cancelled</MenuItem>
                    </Select>
                  </FormControl>
                </Box>
                <Box sx={{ flex: '1 1 300px', minWidth: '300px' }}>
                  <FormControl fullWidth>
                    <InputLabel>Payment Status</InputLabel>
                    <Select
                      name="isPaid"
                      value={formData.isPaid.toString()}
                      onChange={handleSelectChange}
                      label="Payment Status"
                    >
                      <MenuItem value="false">Unpaid</MenuItem>
                      <MenuItem value="true">Paid</MenuItem>
                    </Select>
                  </FormControl>
                </Box>
                <Box sx={{ flex: '1 1 300px', minWidth: '300px' }}>
                  <FormControl fullWidth>
                    <InputLabel>Delivery Status</InputLabel>
                    <Select
                      name="isDelivered"
                      value={formData.isDelivered.toString()}
                      onChange={handleSelectChange}
                      label="Delivery Status"
                    >
                      <MenuItem value="false">Not Delivered</MenuItem>
                      <MenuItem value="true">Delivered</MenuItem>
                    </Select>
                  </FormControl>
                </Box>
                <Box sx={{ flex: '1 1 300px', minWidth: '300px' }}>
                  <TextField
                    fullWidth
                    label="Shipping Price"
                    name="shippingPrice"
                    type="number"
                    value={formData.shippingPrice}
                    onChange={handleInputChange}
                    InputProps={{
                      startAdornment: <Typography variant="body2">$</Typography>,
                    }}
                  />
                </Box>
                <Box sx={{ flex: '1 1 300px', minWidth: '300px' }}>
                  <TextField
                    fullWidth
                    label="Tax Price"
                    name="taxPrice"
                    type="number"
                    value={formData.taxPrice}
                    onChange={handleInputChange}
                    InputProps={{
                      startAdornment: <Typography variant="body2">$</Typography>,
                    }}
                  />
                </Box>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{
          flexShrink: 0,
          background: (theme) => theme.palette.mode === 'dark'
            ? 'linear-gradient(135deg, rgba(25, 35, 50, 0.95) 0%, rgba(30, 40, 60, 0.95) 100%)'
            : 'linear-gradient(135deg, rgba(248, 250, 252, 0.95) 0%, rgba(255, 255, 255, 0.95) 100%)',
          borderTop: (theme) => theme.palette.mode === 'dark'
            ? '1px solid rgba(100, 120, 150, 0.3)'
            : '1px solid rgba(0,0,0,0.1)',
          px: 4,
          py: 3,
          gap: 2,
          position: 'sticky',
          bottom: 0,
          zIndex: 1,
        }}>
          <Button 
            onClick={handleCloseDialog}
            variant="outlined"
            sx={{
              px: 3,
              py: 1.5,
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 600,
              fontFamily: "'Inter', 'Roboto', 'Noto Sans', 'Segoe UI', sans-serif",
              borderColor: 'error.main',
              color: 'error.main',
              '&:hover': {
                borderColor: 'error.dark',
                backgroundColor: 'rgba(211, 47, 47, 0.08)',
                transform: 'translateY(-1px)',
              },
              transition: 'all 0.2s ease-in-out'
            }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            variant="contained"
            sx={{
              px: 4,
              py: 1.5,
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 600,
              fontFamily: "'Inter', 'Roboto', 'Noto Sans', 'Segoe UI', sans-serif",
              background: 'linear-gradient(45deg, #f44336 30%, #d32f2f 90%)',
              boxShadow: '0 3px 5px 2px rgba(244, 67, 54, .3)',
              '&:hover': {
                background: 'linear-gradient(45deg, #d32f2f 30%, #b71c1c 90%)',
                transform: 'translateY(-1px)',
                boxShadow: '0 6px 10px 4px rgba(244, 67, 54, .3)',
              },
              transition: 'all 0.2s ease-in-out'
            }}
          >
            Update Order
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

      {/* Pagination */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        mt: 4,
        p: 2,
        borderRadius: 2,
        backgroundColor: (theme) => theme.palette.mode === 'dark' 
          ? 'rgba(255,255,255,0.05)' 
          : 'rgba(0,0,0,0.02)',
      }}>
        <Pagination 
          count={totalPages} 
          page={page} 
          onChange={handlePageChange} 
          color="primary"
          sx={{
            '& .MuiPaginationItem-root': {
              borderRadius: 1,
              fontWeight: 500,
              '&:hover': {
                backgroundColor: 'rgba(211, 47, 47, 0.08)',
              },
            },
          }}
        />
      </Box>
    </Box>
  );
}