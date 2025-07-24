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
        api.get<Category[]>(API_ENDPOINTS.MANAGER.CATEGORIES),
        api.get<Brand[]>(API_ENDPOINTS.MANAGER.BRANDS),
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
          Products Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
          sx={{
            px: 3,
            py: 1.5,
            borderRadius: 2,
            textTransform: 'none',
            fontWeight: 600,
            fontFamily: "'Inter', 'Roboto', 'Noto Sans', 'Segoe UI', sans-serif",
            background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
            boxShadow: '0 3px 5px 2px rgba(33, 203, 243, .3)',
            '&:hover': {
              background: 'linear-gradient(45deg, #1976D2 30%, #1CB5E0 90%)',
              transform: 'translateY(-1px)',
              boxShadow: '0 6px 10px 4px rgba(33, 203, 243, .3)',
            },
            transition: 'all 0.2s ease-in-out'
          }}
        >
          Add Product
        </Button>
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
              placeholder="Search products by name, description, ID, or brand..."
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
                      borderColor: 'primary.main',
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
              disabled={!searchTerm && statusFilter === 'all' && categoryFilter === 'all' && brandFilter === 'all'}
              sx={{
                borderRadius: 2,
                px: 3,
                py: 1.5,
                fontWeight: 500,
                textTransform: 'none',
                fontFamily: "'Inter', 'Roboto', 'Noto Sans', 'Segoe UI', sans-serif",
                '&:hover': {
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
                Status
              </Typography>
              <FormControl sx={{ 
                minWidth: 150,
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  fontFamily: "'Inter', 'Roboto', 'Noto Sans', 'Segoe UI', sans-serif",
                  '&:hover': {
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'primary.main',
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
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="inactive">Inactive</MenuItem>
                  <MenuItem value="draft">Draft</MenuItem>
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
                Category
              </Typography>
              <FormControl sx={{ 
                minWidth: 150,
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  fontFamily: "'Inter', 'Roboto', 'Noto Sans', 'Segoe UI', sans-serif",
                  '&:hover': {
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'primary.main',
                    },
                  },
                },
              }}>
                <Select
                  value={categoryFilter}
                  onChange={e => setCategoryFilter(e.target.value)}
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
                  <MenuItem value="all">All Categories</MenuItem>
                  {categories.map(category => (
                    <MenuItem key={category._id} value={category._id}>
                      {category.name}
                    </MenuItem>
                  ))}
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
                Brand
              </Typography>
              <FormControl sx={{ 
                minWidth: 150,
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  fontFamily: "'Inter', 'Roboto', 'Noto Sans', 'Segoe UI', sans-serif",
                  '&:hover': {
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'primary.main',
                    },
                  },
                },
              }}>
                <Select
                  value={brandFilter}
                  onChange={e => setBrandFilter(e.target.value)}
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
                  <MenuItem value="all">All Brands</MenuItem>
                  {brands.map(brand => (
                    <MenuItem key={brand._id} value={brand._id}>
                      {brand.name}
                    </MenuItem>
                  ))}
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
                {filteredProducts.length} of {products.length} products
              </Typography>
            </Box>
          </Box>
        </Stack>
      </Paper>

      {/* Products Summary Cards */}
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
                Total Products
              </Typography>
              <Typography 
                variant="h4"
                sx={{
                  fontFamily: "'Inter', 'Roboto', 'Noto Sans', 'Segoe UI', sans-serif",
                  fontWeight: 700,
                }}
              >
                {filteredProducts.length}
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
                Active Products
              </Typography>
              <Typography 
                variant="h4" 
                color="success.main"
                sx={{
                  fontFamily: "'Inter', 'Roboto', 'Noto Sans', 'Segoe UI', sans-serif",
                  fontWeight: 700,
                }}
              >
                {filteredProducts.filter(product => product.status === 'active').length}
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
                Inactive Products
              </Typography>
              <Typography 
                variant="h4" 
                color="error.main"
                sx={{
                  fontFamily: "'Inter', 'Roboto', 'Noto Sans', 'Segoe UI', sans-serif",
                  fontWeight: 700,
                }}
              >
                {filteredProducts.filter(product => product.status === 'inactive').length}
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
                Draft Products
              </Typography>
              <Typography 
                variant="h4" 
                color="warning.main"
                sx={{
                  fontFamily: "'Inter', 'Roboto', 'Noto Sans', 'Segoe UI', sans-serif",
                  fontWeight: 700,
                }}
              >
                {filteredProducts.filter(product => product.status === 'draft').length}
              </Typography>
            </CardContent>
          </Card>
        </Box>
      </Box>

      {/* Products Table */}
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
                  Image
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
                  Name
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
                  Brand
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
                  Categories
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
                  Price
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
                      <Typography 
                        variant="body2" 
                        fontWeight="medium"
                        sx={{
                          fontFamily: "'Inter', 'Roboto', 'Noto Sans', 'Segoe UI', sans-serif",
                        }}
                      >
                        {product.name || 'Unknown Product'}
                      </Typography>
                      <Typography 
                        variant="caption" 
                        color="textSecondary"
                        sx={{
                          fontFamily: "'Inter', 'Roboto', 'Noto Sans', 'Segoe UI', sans-serif",
                        }}
                      >
                        {product.description?.substring(0, 50)}...
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
                      {product.brand?.name || 'Unknown Brand'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={0.5} flexWrap="wrap">
                      {product.categories?.map(category => (
                        <Chip
                          key={category._id}
                          label={category.name || 'Unknown Category'}
                          size="small"
                          sx={{ 
                            mb: 0.5,
                            fontFamily: "'Inter', 'Roboto', 'Noto Sans', 'Segoe UI', sans-serif",
                          }}
                        />
                      ))}
                    </Stack>
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
                        {formatPrice(product.price)}
                      </Typography>
                      {product.discountPrice && (
                        <Typography 
                          variant="caption" 
                          color="error"
                          sx={{
                            fontFamily: "'Inter', 'Roboto', 'Noto Sans', 'Segoe UI', sans-serif",
                          }}
                        >
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
                      sx={{
                        fontFamily: "'Inter', 'Roboto', 'Noto Sans', 'Segoe UI', sans-serif",
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <Typography 
                      variant="body2"
                      sx={{
                        fontFamily: "'Inter', 'Roboto', 'Noto Sans', 'Segoe UI', sans-serif",
                      }}
                    >
                      {formatDate(product.createdAt)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={1}>
                      <Tooltip title="View Details">
                        <IconButton 
                          size="small"
                          onClick={() => handleOpenDialog(product)}
                          sx={{
                            color: 'primary.main',
                            '&:hover': {
                              backgroundColor: 'rgba(25, 118, 210, 0.08)',
                              transform: 'scale(1.1)',
                            },
                            transition: 'all 0.2s ease-in-out',
                          }}
                        >
                          <VisibilityIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Edit Product">
                        <IconButton 
                          size="small" 
                          onClick={() => handleOpenDialog(product)}
                          sx={{
                            color: 'primary.main',
                            '&:hover': {
                              backgroundColor: 'rgba(25, 118, 210, 0.08)',
                              transform: 'scale(1.1)',
                            },
                            transition: 'all 0.2s ease-in-out',
                          }}
                        >
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete Product">
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleDelete(product._id)}
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

      {/* Add/Edit Product Dialog */}
      <Dialog 
        open={openDialog} 
        onClose={handleCloseDialog} 
        maxWidth="md" 
        fullWidth
        PaperProps={{
          sx: {
            maxHeight: '90vh',
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
        sx={{
          '& .MuiDialog-container': {
            alignItems: 'center',
          },
        }}
        slotProps={{
          backdrop: {
            sx: {
              backdropFilter: 'blur(8px)',
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
            }
          }
        }}
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
          <Typography variant="h5" sx={{
            fontWeight: 700,
            fontFamily: "'Inter', 'Roboto', 'Noto Sans', 'Segoe UI', sans-serif",
            color: 'text.primary'
          }}>
            {selectedProduct ? `${selectedProduct.name ? 'Edit' : 'View'} Product: ${selectedProduct.name || 'Unknown Product'}` : 'Add New Product'}
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ 
          p: 4,
          maxHeight: '60vh',
          overflowY: 'auto',
          background: (theme) => theme.palette.mode === 'dark'
            ? 'linear-gradient(135deg, rgba(20, 25, 35, 0.8) 0%, rgba(15, 20, 30, 0.8) 100%)'
            : 'linear-gradient(135deg, rgba(252, 254, 255, 0.8) 0%, rgba(245, 248, 252, 0.8) 100%)',
          // Custom scrollbar styling
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
              ? 'linear-gradient(135deg, rgba(100, 120, 150, 0.6) 0%, rgba(80, 100, 130, 0.8) 100%)'
              : 'linear-gradient(135deg, rgba(25, 118, 210, 0.4) 0%, rgba(21, 101, 192, 0.6) 100%)',
            borderRadius: '10px',
            border: (theme) => theme.palette.mode === 'dark'
              ? '1px solid rgba(100, 120, 150, 0.3)'
              : '1px solid rgba(25, 118, 210, 0.3)',
          },
          '&::-webkit-scrollbar-thumb:hover': {
            background: (theme) => theme.palette.mode === 'dark'
              ? 'linear-gradient(135deg, rgba(120, 140, 170, 0.8) 0%, rgba(100, 120, 150, 1) 100%)'
              : 'linear-gradient(135deg, rgba(25, 118, 210, 0.6) 0%, rgba(21, 101, 192, 0.8) 100%)',
          },
          '&::-webkit-scrollbar-thumb:active': {
            background: (theme) => theme.palette.mode === 'dark'
              ? 'linear-gradient(135deg, rgba(140, 160, 190, 1) 0%, rgba(120, 140, 170, 1) 100%)'
              : 'linear-gradient(135deg, rgba(25, 118, 210, 0.8) 0%, rgba(21, 101, 192, 1) 100%)',
          },
          // Firefox scrollbar
          scrollbarWidth: 'thin',
          scrollbarColor: (theme) => theme.palette.mode === 'dark'
            ? 'rgba(100, 120, 150, 0.6) rgba(30, 40, 60, 0.3)'
            : 'rgba(25, 118, 210, 0.4) rgba(0, 0, 0, 0.05)',
        }}>
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
              <Box sx={{ flex: '1 1 100%' }}>
                <TextField
                  fullWidth
                  label="Product Name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      fontFamily: "'Inter', 'Roboto', 'Noto Sans', 'Segoe UI', sans-serif",
                    },
                    '& .MuiInputBase-input': {
                      fontFamily: "'Inter', 'Roboto', 'Noto Sans', 'Segoe UI', sans-serif",
                    },
                    '& .MuiInputLabel-root': {
                      fontFamily: "'Inter', 'Roboto', 'Noto Sans', 'Segoe UI', sans-serif",
                    },
                  }}
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
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      fontFamily: "'Inter', 'Roboto', 'Noto Sans', 'Segoe UI', sans-serif",
                    },
                    '& .MuiInputBase-input': {
                      fontFamily: "'Inter', 'Roboto', 'Noto Sans', 'Segoe UI', sans-serif",
                    },
                    '& .MuiInputLabel-root': {
                      fontFamily: "'Inter', 'Roboto', 'Noto Sans', 'Segoe UI', sans-serif",
                    },
                  }}
                />
              </Box>
              <Box sx={{ flex: '1 1 calc(50% - 12px)' }}>
                <TextField
                  fullWidth
                  label="Price"
                  name="price"
                  type="number"
                  value={formData.price}
                  onChange={handleInputChange}
                  required
                  InputProps={{
                    startAdornment: <Typography variant="body2" sx={{ fontFamily: "'Inter', 'Roboto', 'Noto Sans', 'Segoe UI', sans-serif" }}>₫</Typography>,
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      fontFamily: "'Inter', 'Roboto', 'Noto Sans', 'Segoe UI', sans-serif",
                    },
                    '& .MuiInputBase-input': {
                      fontFamily: "'Inter', 'Roboto', 'Noto Sans', 'Segoe UI', sans-serif",
                    },
                    '& .MuiInputLabel-root': {
                      fontFamily: "'Inter', 'Roboto', 'Noto Sans', 'Segoe UI', sans-serif",
                    },
                  }}
                />
              </Box>
              <Box sx={{ flex: '1 1 calc(50% - 12px)' }}>
                <TextField
                  fullWidth
                  label="Discount Price"
                  name="discountPrice"
                  type="number"
                  value={formData.discountPrice}
                  onChange={handleInputChange}
                  InputProps={{
                    startAdornment: <Typography variant="body2" sx={{ fontFamily: "'Inter', 'Roboto', 'Noto Sans', 'Segoe UI', sans-serif" }}>₫</Typography>,
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      fontFamily: "'Inter', 'Roboto', 'Noto Sans', 'Segoe UI', sans-serif",
                    },
                    '& .MuiInputBase-input': {
                      fontFamily: "'Inter', 'Roboto', 'Noto Sans', 'Segoe UI', sans-serif",
                    },
                    '& .MuiInputLabel-root': {
                      fontFamily: "'Inter', 'Roboto', 'Noto Sans', 'Segoe UI', sans-serif",
                    },
                  }}
                />
              </Box>
              <Box sx={{ flex: '1 1 calc(50% - 12px)' }}>
                <FormControl fullWidth sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    fontFamily: "'Inter', 'Roboto', 'Noto Sans', 'Segoe UI', sans-serif",
                  },
                  '& .MuiInputLabel-root': {
                    fontFamily: "'Inter', 'Roboto', 'Noto Sans', 'Segoe UI', sans-serif",
                  },
                }}>
                  <InputLabel>Brand</InputLabel>
                  <Select
                    name="brand"
                    value={formData.brand}
                    onChange={handleSelectChange}
                    label="Brand"
                    required
                    sx={{
                      fontFamily: "'Inter', 'Roboto', 'Noto Sans', 'Segoe UI', sans-serif",
                    }}
                  >
                    {brands?.map(brand => (
                      <MenuItem key={brand._id} value={brand._id} sx={{
                        fontFamily: "'Inter', 'Roboto', 'Noto Sans', 'Segoe UI', sans-serif",
                      }}>
                        {brand.name || 'Unknown Brand'}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
              <Box sx={{ flex: '1 1 calc(50% - 12px)' }}>
                <FormControl fullWidth sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    fontFamily: "'Inter', 'Roboto', 'Noto Sans', 'Segoe UI', sans-serif",
                  },
                  '& .MuiInputLabel-root': {
                    fontFamily: "'Inter', 'Roboto', 'Noto Sans', 'Segoe UI', sans-serif",
                  },
                }}>
                  <InputLabel>Status</InputLabel>
                  <Select
                    name="status"
                    value={formData.status}
                    onChange={handleSelectChange}
                    label="Status"
                    sx={{
                      fontFamily: "'Inter', 'Roboto', 'Noto Sans', 'Segoe UI', sans-serif",
                    }}
                  >
                    <MenuItem value="active" sx={{
                      fontFamily: "'Inter', 'Roboto', 'Noto Sans', 'Segoe UI', sans-serif",
                    }}>Active</MenuItem>
                    <MenuItem value="inactive" sx={{
                      fontFamily: "'Inter', 'Roboto', 'Noto Sans', 'Segoe UI', sans-serif",
                    }}>Inactive</MenuItem>
                    <MenuItem value="draft" sx={{
                      fontFamily: "'Inter', 'Roboto', 'Noto Sans', 'Segoe UI', sans-serif",
                    }}>Draft</MenuItem>
                  </Select>
                </FormControl>
              </Box>
              <Box sx={{ flex: '1 1 100%' }}>
                <FormControl fullWidth sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    fontFamily: "'Inter', 'Roboto', 'Noto Sans', 'Segoe UI', sans-serif",
                  },
                  '& .MuiInputLabel-root': {
                    fontFamily: "'Inter', 'Roboto', 'Noto Sans', 'Segoe UI', sans-serif",
                  },
                }}>
                  <InputLabel>Categories</InputLabel>
                  <Select
                    multiple
                    name="categories"
                    value={formData.categories}
                    onChange={handleSelectChange}
                    label="Categories"
                    sx={{
                      fontFamily: "'Inter', 'Roboto', 'Noto Sans', 'Segoe UI', sans-serif",
                    }}
                  >
                    {categories?.map(category => (
                      <MenuItem key={category._id} value={category._id} sx={{
                        fontFamily: "'Inter', 'Roboto', 'Noto Sans', 'Segoe UI', sans-serif",
                      }}>
                        {category.name || 'Unknown Category'}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{
          background: (theme) => theme.palette.mode === 'dark'
            ? 'linear-gradient(135deg, rgba(25, 35, 50, 0.95) 0%, rgba(30, 40, 60, 0.95) 100%)'
            : 'linear-gradient(135deg, rgba(248, 250, 252, 0.95) 0%, rgba(255, 255, 255, 0.95) 100%)',
          borderTop: (theme) => theme.palette.mode === 'dark'
            ? '1px solid rgba(100, 120, 150, 0.3)'
            : '1px solid rgba(0,0,0,0.1)',
          px: 4,
          py: 3,
          gap: 2,
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
              '&:hover': {
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
              background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
              boxShadow: '0 3px 5px 2px rgba(33, 203, 243, .3)',
              '&:hover': {
                background: 'linear-gradient(45deg, #1976D2 30%, #1CB5E0 90%)',
                transform: 'translateY(-1px)',
                boxShadow: '0 6px 10px 4px rgba(33, 203, 243, .3)',
              },
              transition: 'all 0.2s ease-in-out'
            }}
          >
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
                backgroundColor: 'rgba(25, 118, 210, 0.08)',
              },
            },
          }}
        />
      </Box>
    </Box>
  );
} 