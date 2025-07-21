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
  size: string;
  color: string;
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
    <Box sx={{ width: '100%', maxWidth: 1400, mx: 'auto', p: { xs: 1, md: 3 }, overflowX: 'auto' }}>
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        mb={3}
        sx={{ flexWrap: 'wrap' }}
      >
        <Typography variant="h4" component="h1">
          Orders Management
        </Typography>
      </Stack>

      {/* Search and Filter Section */}
      <Paper sx={{ p: 2, mb: 3, maxWidth: '100%', overflowX: 'auto' }}>
        <Stack spacing={2}>
          {/* Search Bar */}
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <TextField
              placeholder="Search orders by customer name, email, order ID, or recipient name..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              sx={{ flexGrow: 1 }}
              InputProps={{
                startAdornment: <SearchIcon sx={{ color: 'text.secondary', mr: 1 }} />,
              }}
            />
            <Button
              variant="outlined"
              startIcon={<ClearIcon />}
              onClick={clearFilters}
              disabled={!searchTerm && statusFilter === 'all' && paymentFilter === 'all'}
            >
              Clear
            </Button>
          </Box>

          {/* Filter Row */}
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <FormControl sx={{ minWidth: 150 }}>
              <InputLabel>Order Status</InputLabel>
              <Select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                label="Order Status"
              >
                <MenuItem value="all">All Status</MenuItem>
                <MenuItem value="pending">Pending</MenuItem>
                <MenuItem value="paid">Paid</MenuItem>
                <MenuItem value="shipped">Shipped</MenuItem>
                <MenuItem value="delivered">Delivered</MenuItem>
                <MenuItem value="cancelled">Cancelled</MenuItem>
              </Select>
            </FormControl>

            <FormControl sx={{ minWidth: 120 }}>
              <InputLabel>Payment</InputLabel>
              <Select
                value={paymentFilter}
                onChange={e => setPaymentFilter(e.target.value)}
                label="Payment"
              >
                <MenuItem value="all">All Payment</MenuItem>
                <MenuItem value="paid">Paid</MenuItem>
                <MenuItem value="unpaid">Unpaid</MenuItem>
              </Select>
            </FormControl>

            {/* Results Count */}
            <Box sx={{ display: 'flex', alignItems: 'center', ml: 'auto' }}>
              <Typography variant="body2" color="text.secondary">
                {filteredOrders.length} of {orders.length} orders
              </Typography>
            </Box>
          </Box>
        </Stack>
      </Paper>

      {/* Orders Summary Cards */}
      <Box
        sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, mb: 3, width: '100%', overflowX: 'auto' }}
      >
        <Box sx={{ flex: '1 1 200px', minWidth: '200px' }}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Orders
              </Typography>
              <Typography variant="h4">{filteredOrders.length}</Typography>
            </CardContent>
          </Card>
        </Box>
        <Box sx={{ flex: '1 1 200px', minWidth: '200px' }}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Pending Orders
              </Typography>
              <Typography variant="h4" color="warning.main">
                {filteredOrders.filter(order => order.orderStatus === 'pending').length}
              </Typography>
            </CardContent>
          </Card>
        </Box>
        <Box sx={{ flex: '1 1 200px', minWidth: '200px' }}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Paid Orders
              </Typography>
              <Typography variant="h4" color="info.main">
                {filteredOrders.filter(order => order.isPaid).length}
              </Typography>
            </CardContent>
          </Card>
        </Box>
        <Box sx={{ flex: '1 1 200px', minWidth: '200px' }}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Delivered Orders
              </Typography>
              <Typography variant="h4" color="success.main">
                {filteredOrders.filter(order => order.isDelivered).length}
              </Typography>
            </CardContent>
          </Card>
        </Box>
      </Box>

      {/* Orders Table */}
      <Paper sx={{ width: '100%', overflow: 'hidden' }}>
        <TableContainer>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell>Order ID</TableCell>
                <TableCell>Customer</TableCell>
                <TableCell>Items</TableCell>
                <TableCell>Total</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Payment</TableCell>
                <TableCell>Created</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredOrders.map(order => (
                <TableRow key={order._id} hover>
                  <TableCell>
                    <Typography variant="body2" fontFamily="monospace">
                      {order._id.slice(-8)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Box>
                      <Typography variant="body2" fontWeight="medium">
                        {order.user.username}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        {order.user.email}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{getTotalItems(order.orderItems)} items</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight="medium">
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
                        <Typography variant="caption" display="block" color="textSecondary">
                          {formatDate(order.paidAt)}
                        </Typography>
                      )}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{formatDate(order.createdAt)}</Typography>
                  </TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={1}>
                      <Tooltip title="View Details">
                        <IconButton size="small" onClick={() => handleOpenDialog(order)}>
                          <VisibilityIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Edit Order">
                        <IconButton size="small" onClick={() => handleOpenDialog(order)}>
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete Order">
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleDelete(order._id)}
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
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {selectedOrder ? `Edit Order #${selectedOrder._id.slice(-8)}` : 'Edit Order'}
        </DialogTitle>
        <DialogContent>
          {selectedOrder && (
            <Box sx={{ mt: 2 }}>
              {/* Order Details */}
              <Typography variant="h6" gutterBottom>
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
              <Typography variant="h6" gutterBottom>
                Order Items
              </Typography>
              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Product</TableCell>
                      <TableCell>Size</TableCell>
                      <TableCell>Color</TableCell>
                      <TableCell>Quantity</TableCell>
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
                        <TableCell>{item.size}</TableCell>
                        <TableCell>{item.color}</TableCell>
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
