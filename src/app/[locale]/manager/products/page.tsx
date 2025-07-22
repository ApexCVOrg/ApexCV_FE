'use client';

import React, { useState, useEffect } from 'react';
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
  Pagination,
  CircularProgress,
  Avatar,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  Search as SearchIcon,
  Clear as ClearIcon,
  Image as ImageIcon,
} from '@mui/icons-material';
import api from '@/services/api';
import { API_ENDPOINTS, SUCCESS_MESSAGES, ERROR_MESSAGES } from '@/lib/constants/constants';

interface Product {
  _id: string;
  name?: string;
  description?: string;
  price: number;
  discountPrice?: number;
  images: string[];
  sizes: { size: string; stock: number; color?: string }[];
  colors: string[];
  tags: string[];
  brand?: { _id: string; name: string } | null;
  categories?: { _id: string; name: string }[] | null;
  ratingsAverage: number;
  ratingsQuantity: number;
  status: string;
  createdAt: string;
}

interface ProductFormData {
  name: string;
  description: string;
  price: number;
  discountPrice?: number;
  images: string[];
  sizes: { size: string; stock: number; color?: string }[];
  colors: string[];
  tags: string[];
  brand: string;
  categories: string[];
  status: string;
}

interface Category {
  _id: string;
  name: string;
}

interface Brand {
  _id: string;
  name: string;
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);

  // Pagination states
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  // Search and filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [brandFilter, setBrandFilter] = useState<string>('all');

  const [formData, setFormData] = useState<ProductFormData>({
    name: '',
    description: '',
    price: 0,
    discountPrice: 0,
    images: [],
    sizes: [],
    colors: [],
    tags: [],
    brand: '',
    categories: [],
    status: 'active',
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
  const filterProducts = () => {
    let filtered = products || [];

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        product =>
          product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.brand?.name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(product => product.status === statusFilter);
    }

    // Filter by category
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(product => 
        product.categories?.some(cat => cat._id === categoryFilter) || false
      );
    }

    // Filter by brand
    if (brandFilter !== 'all') {
      filtered = filtered.filter(product => product.brand?._id === brandFilter);
    }

    setFilteredProducts(filtered);
  };

  // Apply filters when search terms or filters change
  useEffect(() => {
    filterProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm, statusFilter, categoryFilter, brandFilter, products]);

  // Clear all filters
  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setCategoryFilter('all');
    setBrandFilter('all');
  };

  // Fetch products with pagination
  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await api.get<Product[]>(API_ENDPOINTS.MANAGER.PRODUCTS, {
        params: { page, limit },
      });
      setProducts(res.data);
      setTotalPages(Math.ceil(res.data.length / limit));
    } catch (error) {
      console.error('Error fetching products:', error);
      setSnackbar({ open: true, message: ERROR_MESSAGES.NETWORK_ERROR, severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  // Fetch categories and brands
  const fetchCategoriesAndBrands = async () => {
    try {
      const [categoriesRes, brandsRes] = await Promise.all([
        api.get<Category[]>(API_ENDPOINTS.CATEGORIES),
        api.get<Brand[]>(API_ENDPOINTS.BRANDS),
      ]);
      setCategories(categoriesRes.data);
      setBrands(brandsRes.data);
    } catch (error) {
      console.error('Error fetching categories/brands:', error);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchCategoriesAndBrands();
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
      [name]: value,
    }));
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleSelectChange = (e: any) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name as string]: value,
    }));
  };

  const handleOpenDialog = (product?: Product) => {
    if (product) {
      setSelectedProduct(product);
      setFormData({
        name: product.name || 'Unknown Product',
        description: product.description || '',
        price: product.price,
        discountPrice: product.discountPrice || 0,
        images: product.images,
        sizes: product.sizes,
        colors: product.colors,
        tags: product.tags,
        brand: product.brand?._id || '',
        categories: product.categories?.map(cat => cat._id) || [],
        status: product.status,
      });
    } else {
      setSelectedProduct(null);
      setFormData({
        name: '',
        description: '',
        price: 0,
        discountPrice: 0,
        images: [],
        sizes: [],
        colors: [],
        tags: [],
        brand: '',
        categories: [],
        status: 'active',
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedProduct(null);
    setFormData({
      name: '',
      description: '',
      price: 0,
      discountPrice: 0,
      images: [],
      sizes: [],
      colors: [],
      tags: [],
      brand: '',
      categories: [],
      status: 'active',
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (selectedProduct) {
        // Update existing product
        await api.put(`${API_ENDPOINTS.MANAGER.PRODUCTS}/${selectedProduct._id}`, formData);
        setSnackbar({
          open: true,
          message: SUCCESS_MESSAGES.MANAGER.PRODUCT_UPDATED || 'Product updated successfully',
          severity: 'success',
        });
      } else {
        // Create new product
        await api.post(API_ENDPOINTS.MANAGER.PRODUCTS, formData);
        setSnackbar({
          open: true,
          message: SUCCESS_MESSAGES.MANAGER.PRODUCT_CREATED || 'Product created successfully',
          severity: 'success',
        });
      }
      handleCloseDialog();
      fetchProducts();
    } catch (error) {
      console.error('Error saving product:', error);
      setSnackbar({
        open: true,
        message: ERROR_MESSAGES.MANAGER.INVALID_PRODUCT_DATA || 'Failed to save product',
        severity: 'error',
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    
    try {
      await api.delete(`${API_ENDPOINTS.MANAGER.PRODUCTS}/${id}`);
      setSnackbar({
        open: true,
        message: SUCCESS_MESSAGES.MANAGER.PRODUCT_DELETED || 'Product deleted successfully',
        severity: 'success',
      });
      fetchProducts();
    } catch (error) {
      console.error('Error deleting product:', error);
      setSnackbar({ open: true, message: ERROR_MESSAGES.NETWORK_ERROR, severity: 'error' });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'inactive':
        return 'error';
      case 'draft':
        return 'warning';
      default:
        return 'default';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <CircularProgress />
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
          Products Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
          sx={{ bgcolor: '#000', '&:hover': { bgcolor: '#333' } }}
        >
          Add Product
        </Button>
      </Stack>

      {/* Search and Filter Section */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Stack spacing={2}>
          {/* Search Bar */}
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <TextField
              placeholder="Search products by name, description, ID, or brand..."
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
              disabled={!searchTerm && statusFilter === 'all' && categoryFilter === 'all' && brandFilter === 'all'}
            >
              Clear
            </Button>
          </Box>

          {/* Filter Row */}
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <FormControl sx={{ minWidth: 150 }}>
              <InputLabel>Status</InputLabel>
              <Select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                label="Status"
              >
                <MenuItem value="all">All Status</MenuItem>
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="inactive">Inactive</MenuItem>
                <MenuItem value="draft">Draft</MenuItem>
              </Select>
            </FormControl>

            <FormControl sx={{ minWidth: 150 }}>
              <InputLabel>Category</InputLabel>
              <Select
                value={categoryFilter}
                onChange={e => setCategoryFilter(e.target.value)}
                label="Category"
              >
                <MenuItem value="all">All Categories</MenuItem>
                {categories.map(category => (
                  <MenuItem key={category._id} value={category._id}>
                    {category.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl sx={{ minWidth: 150 }}>
              <InputLabel>Brand</InputLabel>
              <Select
                value={brandFilter}
                onChange={e => setBrandFilter(e.target.value)}
                label="Brand"
              >
                <MenuItem value="all">All Brands</MenuItem>
                {brands.map(brand => (
                  <MenuItem key={brand._id} value={brand._id}>
                    {brand.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Results Count */}
            <Box sx={{ display: 'flex', alignItems: 'center', ml: 'auto' }}>
              <Typography variant="body2" color="text.secondary">
                {filteredProducts.length} of {products.length} products
              </Typography>
            </Box>
          </Box>
        </Stack>
      </Paper>

      {/* Products Summary Cards */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, mb: 3 }}>
        <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 12px)', md: '1 1 calc(25% - 18px)' } }}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Products
              </Typography>
              <Typography variant="h4">{filteredProducts.length}</Typography>
            </CardContent>
          </Card>
        </Box>
        <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 12px)', md: '1 1 calc(25% - 18px)' } }}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Active Products
              </Typography>
              <Typography variant="h4" color="success.main">
                {filteredProducts.filter(product => product.status === 'active').length}
              </Typography>
            </CardContent>
          </Card>
        </Box>
        <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 12px)', md: '1 1 calc(25% - 18px)' } }}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Inactive Products
              </Typography>
              <Typography variant="h4" color="error.main">
                {filteredProducts.filter(product => product.status === 'inactive').length}
              </Typography>
            </CardContent>
          </Card>
        </Box>
        <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 12px)', md: '1 1 calc(25% - 18px)' } }}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Draft Products
              </Typography>
              <Typography variant="h4" color="warning.main">
                {filteredProducts.filter(product => product.status === 'draft').length}
              </Typography>
            </CardContent>
          </Card>
        </Box>
      </Box>

      {/* Products Table */}
      <Paper sx={{ width: '100%', overflow: 'hidden' }}>
        <TableContainer>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell>Image</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Brand</TableCell>
                <TableCell>Categories</TableCell>
                <TableCell>Price</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Created</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredProducts.map(product => (
                <TableRow key={product._id} hover>
                  <TableCell>
                    <Avatar
                      src={product.images[0]}
                      variant="rounded"
                      sx={{ width: 60, height: 60 }}
                    >
                      <ImageIcon />
                    </Avatar>
                  </TableCell>
                  <TableCell>
                    <Box>
                                        <Typography variant="body2" fontWeight="medium">
                    {product.name || 'Unknown Product'}
                  </Typography>
                      <Typography variant="caption" color="textSecondary">
                        {product.description?.substring(0, 50)}...
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{product.brand?.name || 'Unknown Brand'}</Typography>
                  </TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={0.5} flexWrap="wrap">
                      {product.categories?.map(category => (
                        <Chip
                          key={category._id}
                          label={category.name || 'Unknown Category'}
                          size="small"
                          sx={{ mb: 0.5 }}
                        />
                      ))}
                    </Stack>
                  </TableCell>
                  <TableCell>
                    <Box>
                      <Typography variant="body2" fontWeight="medium">
                        {formatPrice(product.price)}
                      </Typography>
                      {product.discountPrice && (
                        <Typography variant="caption" color="error">
                          {formatPrice(product.discountPrice)}
                        </Typography>
                      )}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={product.status.toUpperCase()}
                      color={getStatusColor(product.status) as 'success' | 'error' | 'warning' | 'default'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{formatDate(product.createdAt)}</Typography>
                  </TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={1}>
                      <Tooltip title="View Details">
                        <IconButton size="small">
                          <VisibilityIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Edit Product">
                        <IconButton size="small" onClick={() => handleOpenDialog(product)}>
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete Product">
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleDelete(product._id)}
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

      {/* Add/Edit Product Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {selectedProduct ? `Edit Product: ${selectedProduct.name || 'Unknown Product'}` : 'Add New Product'}
        </DialogTitle>
        <DialogContent>
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
              <Box sx={{ flex: '1 1 100%' }}>
                <TextField
                  fullWidth
                  label="Product Name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </Box>
              <Box sx={{ flex: '1 1 100%' }}>
                <TextField
                  fullWidth
                  label="Description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  multiline
                  rows={3}
                />
              </Box>
              <Box sx={{ flex: '1 1 calc(50% - 8px)' }}>
                <TextField
                  fullWidth
                  label="Price"
                  name="price"
                  type="number"
                  value={formData.price}
                  onChange={handleInputChange}
                  required
                  InputProps={{
                    startAdornment: <Typography variant="body2">₫</Typography>,
                  }}
                />
              </Box>
              <Box sx={{ flex: '1 1 calc(50% - 8px)' }}>
                <TextField
                  fullWidth
                  label="Discount Price"
                  name="discountPrice"
                  type="number"
                  value={formData.discountPrice}
                  onChange={handleInputChange}
                  InputProps={{
                    startAdornment: <Typography variant="body2">₫</Typography>,
                  }}
                />
              </Box>
              <Box sx={{ flex: '1 1 calc(50% - 8px)' }}>
                <FormControl fullWidth>
                  <InputLabel>Brand</InputLabel>
                  <Select
                    name="brand"
                    value={formData.brand}
                    onChange={handleSelectChange}
                    label="Brand"
                    required
                  >
                    {brands?.map(brand => (
                      <MenuItem key={brand._id} value={brand._id}>
                        {brand.name || 'Unknown Brand'}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
              <Box sx={{ flex: '1 1 calc(50% - 8px)' }}>
                <FormControl fullWidth>
                  <InputLabel>Status</InputLabel>
                  <Select
                    name="status"
                    value={formData.status}
                    onChange={handleSelectChange}
                    label="Status"
                  >
                    <MenuItem value="active">Active</MenuItem>
                    <MenuItem value="inactive">Inactive</MenuItem>
                    <MenuItem value="draft">Draft</MenuItem>
                  </Select>
                </FormControl>
              </Box>
              <Box sx={{ flex: '1 1 100%' }}>
                <FormControl fullWidth>
                  <InputLabel>Categories</InputLabel>
                  <Select
                    multiple
                    name="categories"
                    value={formData.categories}
                    onChange={handleSelectChange}
                    label="Categories"
                  >
                    {categories?.map(category => (
                      <MenuItem key={category._id} value={category._id}>
                        {category.name || 'Unknown Category'}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {selectedProduct ? 'Update Product' : 'Create Product'}
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
