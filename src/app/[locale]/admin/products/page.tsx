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
  Pagination,
  useTheme,
  Avatar,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import ImageIcon from '@mui/icons-material/Image';
import api from '@/services/api';
import { API_ENDPOINTS, SUCCESS_MESSAGES, ERROR_MESSAGES } from '@/lib/constants/constants';
import { Checkbox, ListItemText } from '@mui/material';
import { PRODUCT_LABELS } from '@/types/components/label';
import { useTranslations } from 'next-intl';

interface Category {
  _id: string;
  name: string;
  parentCategory?: string | null;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
  __v?: number;
}

interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  categories: (string | Category)[];
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
  brand?: string | Brand;
  label?: string[];
  images?: string[];
}

interface ProductFormData {
  name: string;
  description: string;
  price: number;
  discountPrice?: number;
  categories: string[];
  brand: string;
  images: string[];
  sizes: { size: string; stock: number }[];
  colors: string[];
  tags: string[];
  status: 'active' | 'inactive';
  label?: string[];
}

interface Brand {
  _id: string;
  name: string;
}

export default function ProductsPage() {
  const theme = useTheme();
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Pagination states
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);

  // Search and filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [brandFilter, setBrandFilter] = useState<string>('all');

  const [formData, setFormData] = useState<ProductFormData>({
    name: '',
    description: '',
    price: 0,
    discountPrice: undefined,
    categories: [],
    brand: '',
    images: [],
    sizes: [],
    colors: [],
    tags: [],
    status: 'active',
    label: [],
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
  const [colorInput, setColorInput] = useState('');
  const [imageInput, setImageInput] = useState('');

  const t = useTranslations('manager.products');

  // 1. Get subCategories (categories with parentCategory != null)
  const subCategories = categories.filter(cat => cat.parentCategory);

  // Search and filter function
  const filterProducts = () => {
    let filtered = products || [];

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        product =>
          product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(product => product.status === statusFilter);
    }

    // Filter by category
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(product => product.categories.includes(categoryFilter));
    }

    // Filter by brand
    if (brandFilter !== 'all') {
      filtered = filtered.filter(product => {
        const brandId = typeof product.brand === 'string' ? product.brand : product.brand?._id;
        return brandId === brandFilter;
      });
    }

    setFilteredProducts(filtered);
  };

  // Apply filters when search terms or filters change
  useEffect(
    () => {
      filterProducts();
    }, // eslint-disable-next-line react-hooks/exhaustive-deps
    [searchTerm, statusFilter, categoryFilter, brandFilter, products]
  );

  // Clear all filters
  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setCategoryFilter('all');
    setBrandFilter('all');
  };

  // Fetch products and categories with pagination
  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await api.get<Product[]>(API_ENDPOINTS.MANAGER.PRODUCTS, {
        params: { page, limit },
      });
      setProducts(res.data);
      setTotalProducts(res.data.length);
      setTotalPages(Math.ceil(res.data.length / limit));
    } catch {
      setSnackbar({ open: true, message: ERROR_MESSAGES.NETWORK_ERROR, severity: 'error' });
    } finally {
      setLoading(false);
    }
  };
  const fetchCategories = async () => {
    try {
      const res = await api.get<Category[]>(API_ENDPOINTS.MANAGER.CATEGORIES);
      setCategories(res.data);
    } catch {}
  };
  const fetchBrands = async () => {
    try {
      const res = await api.get<Brand[]>(API_ENDPOINTS.MANAGER.BRANDS);
      setBrands(res.data);
    } catch {}
  };

  useEffect(
    () => {
      fetchProducts();
      fetchCategories();
      fetchBrands();
    }, // eslint-disable-next-line react-hooks/exhaustive-deps
    [page, limit]
  );

  // Handle page change
  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
  };

  // Form handlers
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleOpenDialog = (product?: Product) => {
    if (product) {
      setSelectedProduct(product);
      setFormData({
        name: product.name,
        description: product.description,
        price: product.price,
        discountPrice: undefined,
        categories: (product.categories || []).map(cat => typeof cat === 'string' ? cat : cat._id || ''),
        brand: '',
        images: [],
        sizes: [],
        colors: [],
        tags: [],
        status: product.status,
        label: Array.isArray(product.label) ? product.label : product.label ? [product.label] : [],
      });
    } else {
      setSelectedProduct(null);
      setFormData({
        name: '',
        description: '',
        price: 0,
        discountPrice: undefined,
        categories: [],
        brand: '',
        images: [],
        sizes: [],
        colors: [],
        tags: [],
        status: 'active',
        label: [],
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
      discountPrice: undefined,
      categories: [],
      brand: '',
      images: [],
      sizes: [],
      colors: [],
      tags: [],
      status: 'active',
      label: [],
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = selectedProduct
        ? `${API_ENDPOINTS.MANAGER.PRODUCTS}/${selectedProduct._id}`
        : API_ENDPOINTS.MANAGER.PRODUCTS;
      const method = selectedProduct ? 'put' : 'post';
      const submitData = {
        ...formData,
        categories: formData.categories,
        label: formData.label,
      };
      await api[method](url, submitData);
      setSnackbar({
        open: true,
        message: selectedProduct
          ? SUCCESS_MESSAGES.MANAGER.PRODUCT_UPDATED
          : SUCCESS_MESSAGES.MANAGER.PRODUCT_CREATED,
        severity: 'success',
      });
      handleCloseDialog();
      fetchProducts();
    } catch {
      setSnackbar({
        open: true,
        message: ERROR_MESSAGES.MANAGER.INVALID_PRODUCT_DATA,
        severity: 'error',
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm(t('deleteConfirm'))) return;
    try {
      await api.delete(`${API_ENDPOINTS.MANAGER.PRODUCTS}/${id}`);
      setSnackbar({
        open: true,
        message: SUCCESS_MESSAGES.MANAGER.PRODUCT_DELETED,
        severity: 'success',
      });
      fetchProducts();
    } catch {
      setSnackbar({
        open: true,
        message: ERROR_MESSAGES.MANAGER.INVALID_PRODUCT_DATA,
        severity: 'error',
      });
    }
  };

  // Handler động cho tags/colors/images/sizes
  const handleAddTag = (type: 'tags' | 'colors', value: string) => {
    if (!value) return;
    setFormData(prev => ({ ...prev, [type]: [...prev[type], value] }));
  };
  const handleDeleteTag = (type: 'tags' | 'colors', idx: number) => {
    setFormData(prev => ({ ...prev, [type]: prev[type].filter((_, i) => i !== idx) }));
  };
  const handleAddImage = (url: string) => {
    if (!url) return;
    setFormData(prev => ({ ...prev, images: [...prev.images, url] }));
  };
  const handleDeleteImage = (idx: number) => {
    setFormData(prev => ({ ...prev, images: prev.images.filter((_, i) => i !== idx) }));
  };
  const handleAddSize = () => {
    setFormData(prev => ({ ...prev, sizes: [...prev.sizes, { size: '', stock: 0 }] }));
  };
  const handleSizeChange = (idx: number, field: 'size' | 'stock', value: string | number) => {
    setFormData(prev => ({
      ...prev,
      sizes: prev.sizes.map((s, i) => (i === idx ? { ...s, [field]: value } : s)),
    }));
  };
  const handleDeleteSize = (idx: number) => {
    setFormData(prev => ({ ...prev, sizes: prev.sizes.filter((_, i) => i !== idx) }));
  };

  // Helper: Lấy tên brand từ objectId hoặc object
  const getBrandName = (brand: string | Brand | undefined) => {
    if (!brand) return '-';
    if (typeof brand === 'string') {
      const found = brands.find(b => b._id === brand);
      return found ? found.name : brand;
    } else if (typeof brand === 'object' && brand !== null) {
      return brand.name;
    }
    return '-';
  };

  // Helper: Lấy tên category dạng parent-sub
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const getCategoryDisplay = (cat: any) => {
    if (!cat) return '';
    
    // If cat is a string (ID), find the category object
    if (typeof cat === 'string') {
      const category = categories.find(c => c._id === cat);
      if (!category) return cat;
      if (category.parentCategory) {
        const parent = categories.find(c => c._id === category.parentCategory);
        return parent ? `${parent.name} - ${category.name}` : category.name;
      }
      return category.name;
    }
    
    // If cat is an object
    if (typeof cat === 'object' && cat !== null) {
      if (cat.parentCategory && cat.parentCategory.name) {
        return `${cat.parentCategory.name} - ${cat.name}`;
      }
      return cat.name || 'Unknown Category';
    }
    
    return String(cat);
  };

  // Helper: Format ngày tháng
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Box
      sx={{
        width: '100%',
        maxWidth: 1400,
        mx: 'auto',
        p: { xs: 2, md: 4 },
        pt: { xs: 4, md: 6 },
        overflowX: 'auto',
      }}
    >
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
          sx={{ 
            fontWeight: 800,
            fontSize: { xs: '1.75rem', md: '2.25rem' },
            letterSpacing: '0.5px',
            color: 'text.primary',
            fontFamily: "'Inter', 'Roboto', 'Noto Sans', 'Segoe UI', sans-serif",
          }}
        >
          Admin Products Management
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
              disabled={
                !searchTerm &&
                statusFilter === 'all' &&
                categoryFilter === 'all' &&
                brandFilter === 'all'
              }
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
                  borderColor: 'error.main',
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
                Status
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
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="inactive">Inactive</MenuItem>
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
                      borderColor: 'error.main',
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
                      borderColor: 'error.main',
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
                {filteredProducts.length} of {totalProducts} products
              </Typography>
            </Box>
          </Box>
        </Stack>
      </Paper>

      <TableContainer
        component={Paper}
        sx={{ 
          width: '100%', 
          overflowX: 'auto', 
          mt: 0,
          borderRadius: 3,
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
          background: (theme) => theme.palette.mode === 'dark' 
            ? 'linear-gradient(135deg, rgba(25, 35, 50, 0.95) 0%, rgba(30, 40, 60, 0.95) 100%)'
            : 'background.paper',
          border: (theme) => theme.palette.mode === 'dark'
            ? '1px solid rgba(100, 120, 150, 0.3)'
            : '1px solid rgba(0,0,0,0.06)',
        }}
      >
        <Table sx={{ width: '100%' }}>
          <TableHead>
            <TableRow sx={{ 
              backgroundColor: (theme) => theme.palette.mode === 'dark' 
                ? 'rgba(255,255,255,0.08)' 
                : 'rgba(0,0,0,0.08)' 
            }}>
              <TableCell sx={{ 
                fontWeight: 700, 
                fontSize: '0.95rem', 
                py: 2, 
                width: 100,
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
                py: 2, 
                width: 180,
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
                py: 2, 
                width: 260,
                color: 'text.primary',
                borderBottom: (theme) => theme.palette.mode === 'dark'
                  ? '2px solid rgba(255,255,255,0.1)'
                  : '2px solid rgba(0,0,0,0.15)',
                fontFamily: "'Inter', 'Roboto', 'Noto Sans', 'Segoe UI', sans-serif",
                backgroundColor: (theme) => theme.palette.mode === 'dark' 
                  ? 'rgba(255,255,255,0.08)' 
                  : 'rgba(0,0,0,0.08)',
              }}>
                Description
              </TableCell>
              <TableCell sx={{ 
                fontWeight: 700, 
                fontSize: '0.95rem', 
                py: 2, 
                width: 100,
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
                py: 2, 
                width: 180,
                color: 'text.primary',
                borderBottom: (theme) => theme.palette.mode === 'dark'
                  ? '2px solid rgba(255,255,255,0.1)'
                  : '2px solid rgba(0,0,0,0.15)',
                fontFamily: "'Inter', 'Roboto', 'Noto Sans', 'Segoe UI', sans-serif",
                backgroundColor: (theme) => theme.palette.mode === 'dark' 
                  ? 'rgba(255,255,255,0.08)' 
                  : 'rgba(0,0,0,0.08)',
              }}>
                Category
              </TableCell>
              <TableCell sx={{ 
                fontWeight: 700, 
                fontSize: '0.95rem', 
                py: 2, 
                width: 120,
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
                py: 2, 
                width: 100,
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
                py: 2, 
                width: 180,
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
                py: 2, 
                width: 120,
                color: 'text.primary',
                borderBottom: (theme) => theme.palette.mode === 'dark'
                  ? '2px solid rgba(255,255,255,0.1)'
                  : '2px solid rgba(0,0,0,0.15)',
                fontFamily: "'Inter', 'Roboto', 'Noto Sans', 'Segoe UI', sans-serif",
                backgroundColor: (theme) => theme.palette.mode === 'dark' 
                  ? 'rgba(255,255,255,0.08)' 
                  : 'rgba(0,0,0,0.08)',
              }}>
                Label
              </TableCell>
              <TableCell
                align="right"
                sx={{ 
                  fontWeight: 700, 
                  fontSize: '0.95rem', 
                  py: 2, 
                  width: 100,
                  color: 'text.primary',
                  borderBottom: (theme) => theme.palette.mode === 'dark'
                    ? '2px solid rgba(255,255,255,0.1)'
                    : '2px solid rgba(0,0,0,0.15)',
                  fontFamily: "'Inter', 'Roboto', 'Noto Sans', 'Segoe UI', sans-serif",
                  backgroundColor: (theme) => theme.palette.mode === 'dark' 
                    ? 'rgba(255,255,255,0.08)' 
                    : 'rgba(0,0,0,0.08)',
                }}
              >
                Actions
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow key="loading">
                <TableCell colSpan={10} align="center" sx={{ py: 4, fontSize: '1.2rem' }}>
                  {t('loading')}
                </TableCell>
              </TableRow>
            ) : filteredProducts.length === 0 ? (
              <TableRow key="empty">
                <TableCell colSpan={10} align="center" sx={{ py: 4, fontSize: '1.2rem' }}>
                  {t('noProducts')}
                </TableCell>
              </TableRow>
            ) : (
              filteredProducts.map(product => (
                <TableRow key={product._id} sx={{ fontSize: '1rem', height: 64 }}>
                  <TableCell
                    sx={{ fontSize: '1rem', py: 2, whiteSpace: 'normal', wordBreak: 'break-word' }}
                  >
                    <Avatar
                      src={product.images?.[0]}
                      alt={product.name}
                      variant="rounded"
                      sx={{ 
                        width: 60, 
                        height: 60,
                        border: '1px solid rgba(0,0,0,0.12)',
                      }}
                    >
                      <ImageIcon />
                    </Avatar>
                  </TableCell>
                  <TableCell
                    sx={{ fontSize: '1rem', py: 2, whiteSpace: 'normal', wordBreak: 'break-word' }}
                  >
                    {product.name}
                  </TableCell>
                  <TableCell
                    sx={{ fontSize: '1rem', py: 2, whiteSpace: 'normal', wordBreak: 'break-word' }}
                  >
                    <Typography variant="body2">{product.description}</Typography>
                  </TableCell>
                  <TableCell sx={{ fontSize: '1rem', py: 2, whiteSpace: 'normal' }}>
                    <Typography variant="body2" fontWeight="bold">
                      ${product.price.toLocaleString()}
                    </Typography>
                  </TableCell>
                  <TableCell
                    sx={{ fontSize: '1rem', py: 2, whiteSpace: 'normal', wordBreak: 'break-word' }}
                  >
                    {product.categories && product.categories.length > 0
                      ? product.categories.map(getCategoryDisplay).join(', ')
                      : '-'}
                  </TableCell>
                  <TableCell sx={{ fontSize: '1rem', py: 2, whiteSpace: 'normal' }}>
                    {getBrandName(product.brand)}
                  </TableCell>
                  <TableCell sx={{ fontSize: '1rem', py: 2, whiteSpace: 'normal' }}>
                    <Chip
                      label={product.status}
                      color={product.status === 'active' ? 'success' : 'default'}
                      size="small"
                      variant="outlined"
                      sx={{
                        fontWeight: 'bold',
                        textTransform: 'uppercase',
                        fontSize: '0.85rem',
                        '&.MuiChip-colorSuccess': {
                          backgroundColor: '#e8f5e8',
                          color: '#2e7d32',
                          borderColor: '#4caf50',
                        },
                        '&.MuiChip-colorDefault': {
                          backgroundColor: '#f5f5f5',
                          color: '#666',
                          borderColor: '#ddd',
                        },
                      }}
                    />
                  </TableCell>
                  <TableCell sx={{ fontSize: '1rem', py: 2, whiteSpace: 'normal' }}>
                    {formatDate(product.createdAt)}
                  </TableCell>
                  <TableCell sx={{ fontSize: '1rem', py: 2, whiteSpace: 'normal' }}>
                    {product.label && product.label.length > 0 ? (
                      <Stack direction="row" spacing={0.5} flexWrap="wrap">
                        {product.label.map((l, idx) => {
                          const labelObj = PRODUCT_LABELS.find(opt => opt.value === l);
                          return (
                            <Chip
                              key={l + '-' + idx}
                              label={labelObj ? labelObj.label : l}
                              size="small"
                              variant="outlined"
                              sx={{
                                fontSize: '0.8rem',
                                height: '22px',
                                backgroundColor: '#f0f8ff',
                                borderColor: '#1976d2',
                                color: '#1976d2',
                                m: 0.2,
                              }}
                            />
                          );
                        })}
                      </Stack>
                    ) : (
                      '-'
                    )}
                  </TableCell>
                  <TableCell align="right" sx={{ fontSize: '1rem', py: 2, whiteSpace: 'normal' }}>
                    <IconButton
                      size="small"
                      onClick={() => handleOpenDialog(product)}
                      sx={{ 
                        mr: 1,
                        color: 'info.main',
                        '&:hover': {
                          backgroundColor: 'rgba(33, 150, 243, 0.08)',
                          transform: 'scale(1.1)',
                        },
                        transition: 'all 0.2s ease-in-out',
                      }}
                    >
                      <VisibilityIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleOpenDialog(product)}
                      sx={{ 
                        mr: 1,
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
                    <IconButton
                      size="small"
                      onClick={() => handleDelete(product._id)}
                      color="error"
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
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination */}
      {totalPages > 1 && (
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
            showFirstButton
            showLastButton
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
      )}

      {/* Dialog Add/Edit */}
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
          <Typography variant="h5" component="div" sx={{
            fontWeight: 700,
            fontFamily: "'Inter', 'Roboto', 'Noto Sans', 'Segoe UI', sans-serif",
            color: 'text.primary'
          }}>
            {selectedProduct ? `${selectedProduct.name ? 'Edit' : 'View'} Product: ${selectedProduct.name || 'Unknown Product'}` : 'Add New Product'}
          </Typography>
        </DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent sx={{ 
            p: 4,
            maxHeight: '60vh',
            overflowY: 'auto',
            background: (theme) => theme.palette.mode === 'dark'
              ? 'linear-gradient(135deg, rgba(20, 25, 35, 0.8) 0%, rgba(15, 20, 30, 0.8) 100%)'
              : 'linear-gradient(135deg, rgba(252, 254, 255, 0.8) 0%, rgba(245, 248, 252, 0.8) 100%)',
            // Custom scrollbar styling - Red theme for admin
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
                ? 'linear-gradient(135deg, rgba(244, 67, 54, 0.6) 0%, rgba(211, 47, 47, 0.8) 100%)'
                : 'linear-gradient(135deg, rgba(244, 67, 54, 0.4) 0%, rgba(211, 47, 47, 0.6) 100%)',
              borderRadius: '10px',
              border: (theme) => theme.palette.mode === 'dark'
                ? '1px solid rgba(244, 67, 54, 0.3)'
                : '1px solid rgba(244, 67, 54, 0.3)',
            },
            '&::-webkit-scrollbar-thumb:hover': {
              background: (theme) => theme.palette.mode === 'dark'
                ? 'linear-gradient(135deg, rgba(244, 67, 54, 0.8) 0%, rgba(211, 47, 47, 1) 100%)'
                : 'linear-gradient(135deg, rgba(244, 67, 54, 0.6) 0%, rgba(211, 47, 47, 0.8) 100%)',
            },
            '&::-webkit-scrollbar-thumb:active': {
              background: (theme) => theme.palette.mode === 'dark'
                ? 'linear-gradient(135deg, rgba(244, 67, 54, 1) 0%, rgba(183, 28, 28, 1) 100%)'
                : 'linear-gradient(135deg, rgba(244, 67, 54, 0.8) 0%, rgba(211, 47, 47, 1) 100%)',
            },
            // Firefox scrollbar - Red theme
            scrollbarWidth: 'thin',
            scrollbarColor: (theme) => theme.palette.mode === 'dark'
              ? 'rgba(244, 67, 54, 0.6) rgba(30, 40, 60, 0.3)'
              : 'rgba(244, 67, 54, 0.4) rgba(0, 0, 0, 0.05)',
          }}>
            <Stack spacing={3}>
              <TextField
                name="name"
                label="Product Name"
                value={formData.name}
                onChange={handleInputChange}
                required
                fullWidth
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
              <TextField
                name="description"
                label="Description"
                value={formData.description}
                onChange={handleInputChange}
                multiline
                rows={3}
                fullWidth
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
              <Box sx={{ display: 'flex', gap: 2 }}>
                <TextField
                  name="price"
                  label="Price"
                  type="number"
                  value={formData.price}
                  onChange={handleInputChange}
                  required
                  fullWidth
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
                <TextField
                  name="discountPrice"
                  label="Discount Price"
                  type="number"
                  value={formData.discountPrice || ''}
                  onChange={handleInputChange}
                  fullWidth
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

              <Box sx={{ display: 'flex', gap: 2 }}>
                <FormControl fullWidth required sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    fontFamily: "'Inter', 'Roboto', 'Noto Sans', 'Segoe UI', sans-serif",
                  },
                  '& .MuiInputLabel-root': {
                    fontFamily: "'Inter', 'Roboto', 'Noto Sans', 'Segoe UI', sans-serif",
                  },
                }}>
                  <InputLabel id="status-label">Status</InputLabel>
                  <Select
                    labelId="status-label"
                    value={formData.status}
                    onChange={e =>
                      setFormData(prev => ({
                        ...prev,
                        status: e.target.value as 'active' | 'inactive',
                      }))
                    }
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
                  </Select>
                </FormControl>

                <TextField
                  name="brand"
                  label="Brand"
                  value={formData.brand}
                  onChange={e => setFormData(prev => ({ ...prev, brand: e.target.value }))}
                  select
                  SelectProps={{ native: true }}
                  required
                  fullWidth
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
                >
                  <option value="">Select Brand</option>
                  {brands.map(brand => (
                    <option key={brand._id} value={brand._id}>
                      {brand.name}
                    </option>
                  ))}
                </TextField>
              </Box>

              <FormControl fullWidth required sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  fontFamily: "'Inter', 'Roboto', 'Noto Sans', 'Segoe UI', sans-serif",
                },
                '& .MuiInputLabel-root': {
                  fontFamily: "'Inter', 'Roboto', 'Noto Sans', 'Segoe UI', sans-serif",
                },
              }}>
                <InputLabel id="categories-label">Categories</InputLabel>
                <Select
                  labelId="categories-label"
                  multiple
                  value={formData.categories}
                  onChange={e => {
                    const { value } = e.target;
                    const categories = typeof value === 'string' ? value.split(',') : value;
                    setFormData(prev => ({
                      ...prev,
                      categories: categories as string[],
                    }));
                  }}
                  label="Categories"
                  sx={{
                    fontFamily: "'Inter', 'Roboto', 'Noto Sans', 'Segoe UI', sans-serif",
                  }}
                  renderValue={selected => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {selected.map((value, idx) => {
                        const categoryId = value as string;
                        const category = categories.find(cat => cat._id === categoryId);
                        const displayName = category?.name || categoryId || 'Unknown';
                        return <Chip key={categoryId + '-' + idx} label={displayName} sx={{
                          fontFamily: "'Inter', 'Roboto', 'Noto Sans', 'Segoe UI', sans-serif",
                        }} />;
                      })}
                    </Box>
                  )}
                >
                  {categories.map(cat => (
                    <MenuItem key={cat._id} value={cat._id} sx={{
                      fontFamily: "'Inter', 'Roboto', 'Noto Sans', 'Segoe UI', sans-serif",
                    }}>
                      <Checkbox checked={formData.categories.indexOf(cat._id) > -1} />
                      <ListItemText primary={cat.name} sx={{
                        '& .MuiTypography-root': {
                          fontFamily: "'Inter', 'Roboto', 'Noto Sans', 'Segoe UI', sans-serif",
                        }
                      }} />
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Stack>
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
                borderColor: 'error.main',
                color: 'error.main',
                '&:hover': {
                  borderColor: 'error.main',
                  backgroundColor: 'rgba(211, 47, 47, 0.08)',
                  transform: 'translateY(-1px)',
                },
                transition: 'all 0.2s ease-in-out'
              }}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
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
              {selectedProduct ? 'Update Product' : 'Create Product'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
      >
        <Alert
          onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}