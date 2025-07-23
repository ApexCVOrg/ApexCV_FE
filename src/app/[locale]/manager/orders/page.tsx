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
  size: string | { _id: string; size: string; sku: string; stock: number };
  color: string | { _id: string; color: string; sku: string; stock: number };
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
  user?: {
    _id: string;
    username: string;
    email: string;
  } | null;
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
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error' | 'warning' | 'info',
  });
  const [formData, setFormData] = useState<OrderFormData>({
    orderStatus: 'pending',
    isPaid: false,
    isDelivered: false,
    shippingPrice: 0,
    taxPrice: 0,
  });

  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const filterOrders = () => {
    return orders.filter(order => {
      const matchesSearch = searchTerm === '' || 
        order._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.user?.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.user?.email?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || order.orderStatus === statusFilter;
      
      return matchesSearch && matchesStatus;
    });
  };

  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
  };

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await api.get<Order[]>(API_ENDPOINTS.MANAGER.ORDERS);
      if (response.data) {
        setOrders(response.data);
        setTotalPages(Math.ceil(response.data.length / 10));
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      setSnackbar({
        open: true,
        message: 'Failed to fetch orders',
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
  };

  const handleSelectChange = (e: React.ChangeEvent<HTMLInputElement> | { target: { name: string; value: string | string[] } }) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name as string]: name === 'isPaid' || name === 'isDelivered' ? value === 'true' : value,
    }));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'shippingPrice' || name === 'taxPrice' ? parseFloat(value) || 0 : value,
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
      await api.put(`${API_ENDPOINTS.MANAGER.ORDERS}/${selectedOrder._id}`, formData);
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

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this order?')) return;
    try {
      await api.delete(`${API_ENDPOINTS.MANAGER.ORDERS}/${id}`);
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

  const getSizeDisplay = (size: string | { _id: string; size: string; sku: string; stock: number }) => {
    return typeof size === 'object' ? size.size : size;
  };

  const getColorDisplay = (color: string | { _id: string; color: string; sku: string; stock: number }) => {
    return typeof color === 'object' ? color.color : color;
  };

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h6">Loading orders...</Typography>
      </Box>
    );
  }

  const filteredOrders = filterOrders();

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" fontWeight={700} mb={3}>
        Orders Management
      </Typography>

      {/* Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center">
            <TextField
              label="Search Orders"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              size="small"
              sx={{ minWidth: 200 }}
              InputProps={{
                startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
              }}
            />
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Status</InputLabel>
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                label="Status"
              >
                <MenuItem value="all">All Status</MenuItem>
                <MenuItem value="pending">Pending</MenuItem>
                <MenuItem value="paid">Paid</MenuItem>
                <MenuItem value="shipped">Shipped</MenuItem>
                <MenuItem value="delivered">Delivered</MenuItem>
                <MenuItem value="cancelled">Cancelled</MenuItem>
              </Select>
            </FormControl>
            <Button
              variant="outlined"
              onClick={clearFilters}
              startIcon={<ClearIcon />}
            >
              Clear Filters
            </Button>
          </Stack>
        </CardContent>
      </Card>

      {/* Orders Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Order ID</TableCell>
              <TableCell>Customer</TableCell>
              <TableCell>Items</TableCell>
              <TableCell>Total</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Payment</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredOrders.map((order) => (
              <TableRow key={order._id}>
                <TableCell>
                  <Typography variant="body2" fontWeight={600}>
                    {order._id.slice(-8)}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">
                    {order.user?.username || 'Guest'}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {order.user?.email}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">
                    {getTotalItems(order.orderItems)} items
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" fontWeight={600}>
                    {formatPrice(order.totalPrice)}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Chip
                    icon={getStatusIcon(order.orderStatus)}
                    label={order.orderStatus}
                    color={getStatusColor(order.orderStatus) as 'success' | 'error' | 'warning' | 'default'}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <Chip
                    label={order.isPaid ? 'Paid' : 'Unpaid'}
                    color={order.isPaid ? 'success' : 'warning'}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <Typography variant="body2">
                    {formatDate(order.createdAt)}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Stack direction="row" spacing={1}>
                    <Tooltip title="View Details">
                      <IconButton
                        size="small"
                        onClick={() => handleOpenDialog(order)}
                      >
                        <VisibilityIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Edit Order">
                      <IconButton
                        size="small"
                        onClick={() => handleOpenDialog(order)}
                      >
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete Order">
                      <IconButton
                        size="small"
                        onClick={() => handleDelete(order._id)}
                        color="error"
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

      {/* Order Details Dialog */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Order Details - {selectedOrder?._id.slice(-8)}
        </DialogTitle>
        <DialogContent>
          {selectedOrder && (
            <Box>
              {/* Order Info */}
              <Typography variant="h6" gutterBottom>
                Order Information
              </Typography>
              <Stack direction="row" spacing={2} mb={2}>
                <Typography variant="body2">
                  <strong>Customer:</strong> {selectedOrder.user?.username || 'Guest'}
                </Typography>
                <Typography variant="body2">
                  <strong>Email:</strong> {selectedOrder.user?.email || 'N/A'}
                </Typography>
                <Typography variant="body2">
                  <strong>Date:</strong> {formatDate(selectedOrder.createdAt)}
                </Typography>
              </Stack>

              {/* Shipping Address */}
              <Typography variant="h6" gutterBottom>
                Shipping Address
              </Typography>
              <Typography variant="body2" mb={2}>
                {selectedOrder.shippingAddress.recipientName}<br />
                {selectedOrder.shippingAddress.street}<br />
                {selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state} {selectedOrder.shippingAddress.postalCode}<br />
                {selectedOrder.shippingAddress.country}<br />
                Phone: {selectedOrder.shippingAddress.phone}
              </Typography>

              {/* Order Items */}
              <Typography variant="h6" gutterBottom>
                Order Items
              </Typography>
              <TableContainer component={Paper} sx={{ mb: 2 }}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Product</TableCell>
                      <TableCell>Size</TableCell>
                      <TableCell>Color</TableCell>
                      <TableCell>Qty</TableCell>
                      <TableCell>Price</TableCell>
                      <TableCell>Total</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {selectedOrder.orderItems.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          <Typography variant="body2">{item.product.name}</Typography>
                        </TableCell>
                        <TableCell>{getSizeDisplay(item.size)}</TableCell>
                        <TableCell>{getColorDisplay(item.color)}</TableCell>
                        <TableCell>{item.quantity}</TableCell>
                        <TableCell>{formatPrice(item.price)}</TableCell>
                        <TableCell>{formatPrice(item.price * item.quantity)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

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
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
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
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
        <Pagination count={totalPages} page={page} onChange={handlePageChange} color="primary" />
      </Box>
    </Box>
  );
}
