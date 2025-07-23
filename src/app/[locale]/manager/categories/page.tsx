'use client';
import { useRouter } from 'next/navigation';
import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Stack,
  Chip,
  Alert,
  Snackbar,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Pagination,
} from '@mui/material';
import { useTranslations } from 'next-intl';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import { API_ENDPOINTS, SUCCESS_MESSAGES, ERROR_MESSAGES } from '@/lib/constants/constants';
import api from '@/services/api';
import { Category } from '@/types/components/category';

type CategoryStatus = 'active' | 'inactive';

interface CategoryFormData {
  name: string;
  description: string;
  status: CategoryStatus;
  parentCategory?: string;
}

type ParentCategory = { _id: string; name: string };

export default function CategoriesPage() {
  const router = useRouter();
  const t = useTranslations('manager.categories');

  const [categories, setCategories] = useState<Category[]>([]);
  const [filteredCategories, setFilteredCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Pagination states
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCategories, setTotalCategories] = useState(0);

  // Search and filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const [openDialog, setOpenDialog] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);

  const [formData, setFormData] = useState<CategoryFormData>({
    name: '',
    description: '',
    status: 'active',
    parentCategory: '',
  });

  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({ open: false, message: '', severity: 'success' });

  // Search and filter function
  const filterCategories = () => {
    let filtered = categories || [];

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        category =>
          category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (category.description &&
            category.description.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(category => category.status === statusFilter);
    }

    setFilteredCategories(filtered);
  };

  // Apply filters when search terms or filters change

  useEffect(() => {
    filterCategories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm, statusFilter, categories]);

  // Clear all filters
  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
  };

  // Fetch categories with pagination
  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await api.get<Category[]>(API_ENDPOINTS.MANAGER.CATEGORIES, {
        params: { page, limit },
      });
      setCategories(response.data);
      setTotalCategories(response.data.length);
      setTotalPages(Math.ceil(response.data.length / limit));
      setError(null);
    } catch {
      setError(ERROR_MESSAGES.NETWORK_ERROR);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      router.push('/login');
    } else {
      fetchCategories();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router, page, limit]);

  // Handle page change
  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
  };

  // Handle form input changes
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | { target: { name: string; value: string } }
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  // Open dialog for add or edit
  const handleOpenDialog = (category?: Category) => {
    if (category) {
      setSelectedCategory(category);
      setFormData({
        name: category.name,
        description: category.description,
        status: category.status,
        parentCategory:
          typeof category.parentCategory === 'object' && category.parentCategory !== null
            ? (category.parentCategory as ParentCategory)._id
            : '',
      });
    } else {
      setSelectedCategory(null);
      setFormData({
        name: '',
        description: '',
        status: 'active',
        parentCategory: '',
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedCategory(null);
    setFormData({
      name: '',
      description: '',
      status: 'active',
      parentCategory: '',
    });
  };

  // Submit form add/edit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (selectedCategory && formData.parentCategory === selectedCategory._id) {
      setSnackbar({
        open: true,
        message: t('error.cannotSelectSelfAsParent'),
        severity: 'error',
      });
      return;
    }

    try {
      const url = selectedCategory
        ? `${API_ENDPOINTS.MANAGER.CATEGORIES}/${selectedCategory._id}`
        : API_ENDPOINTS.MANAGER.CATEGORIES;
      const method = selectedCategory ? 'put' : 'post';

      await api[method](url, formData);

      setSnackbar({
        open: true,
        message: selectedCategory
          ? SUCCESS_MESSAGES.MANAGER.CATEGORY_UPDATED
          : SUCCESS_MESSAGES.MANAGER.CATEGORY_CREATED,
        severity: 'success',
      });

      handleCloseDialog();
      fetchCategories();
    } catch {
      setSnackbar({
        open: true,
        message: ERROR_MESSAGES.MANAGER.INVALID_CATEGORY_DATA,
        severity: 'error',
      });
    }
  };

  // Delete category
  const handleDelete = async (id: string) => {
    if (!window.confirm(t('deleteConfirm'))) return;

    try {
      await api.delete(`${API_ENDPOINTS.MANAGER.CATEGORIES}/${id}`);

      setSnackbar({
        open: true,
        message: SUCCESS_MESSAGES.MANAGER.CATEGORY_DELETED,
        severity: 'success',
      });

      fetchCategories();
    } catch {
      setSnackbar({
        open: true,
        message: ERROR_MESSAGES.MANAGER.INVALID_CATEGORY_DATA,
        severity: 'error',
      });
    }
  };

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
          {t('title')}
        </Typography>
        <Button 
          variant="contained" 
          startIcon={<AddIcon />} 
          onClick={() => handleOpenDialog()}
          sx={{
            px: 3,
            py: 1.5,
            borderRadius: 2,
            fontWeight: 600,
            textTransform: 'none',
            fontSize: '0.95rem',
            fontFamily: "'Inter', 'Roboto', 'Noto Sans', 'Segoe UI', sans-serif",
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            '&:hover': {
              boxShadow: '0 6px 20px rgba(0,0,0,0.2)',
              transform: 'translateY(-1px)',
            },
            transition: 'all 0.2s ease-in-out',
          }}
        >
          {t('addNew')}
        </Button>
      </Stack>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

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
              placeholder={t('search.searchCategories')}
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
              disabled={!searchTerm && statusFilter === 'all'}
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
              {t('search.clearFilters')}
            </Button>
          </Box>

          {/* Filter Row */}
          <Box
            sx={{
              display: 'flex',
              gap: 3,
              flexWrap: 'wrap',
              alignItems: 'center',
              width: '100%',
              overflowX: 'auto',
            }}
          >
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
                  <MenuItem value="all">{t('search.allStatus')}</MenuItem>
                  <MenuItem value="active">{t('status.active')}</MenuItem>
                  <MenuItem value="inactive">{t('status.inactive')}</MenuItem>
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
                {t('search.resultsCount', {
                  filtered: filteredCategories.length,
                  total: totalCategories,
                  itemType: t('search.categories'),
                })}
              </Typography>
            </Box>
          </Box>
        </Stack>
      </Paper>

      <TableContainer component={Paper} sx={{ 
        maxWidth: '100%', 
        overflowX: 'auto',
        borderRadius: 3,
        boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
        background: (theme) => theme.palette.mode === 'dark' 
          ? 'linear-gradient(135deg, rgba(25, 35, 50, 0.95) 0%, rgba(30, 40, 60, 0.95) 100%)'
          : 'background.paper',
        border: (theme) => theme.palette.mode === 'dark'
          ? '1px solid rgba(100, 120, 150, 0.3)'
          : '1px solid rgba(0,0,0,0.06)',
      }}>
        <Table>
          <TableHead>
            <TableRow sx={{ 
              backgroundColor: (theme) => theme.palette.mode === 'dark' 
                ? 'rgba(255,255,255,0.05)' 
                : 'rgba(0,0,0,0.02)' 
            }}>
              <TableCell sx={{ 
                fontWeight: 700, 
                fontSize: '0.95rem',
                color: 'text.primary',
                borderBottom: '2px solid rgba(0,0,0,0.1)',
                fontFamily: "'Inter', 'Roboto', 'Noto Sans', 'Segoe UI', sans-serif",
              }}>
                {t('name')}
              </TableCell>
              <TableCell sx={{ 
                fontWeight: 700, 
                fontSize: '0.95rem',
                color: 'text.primary',
                borderBottom: '2px solid rgba(0,0,0,0.1)',
                fontFamily: "'Inter', 'Roboto', 'Noto Sans', 'Segoe UI', sans-serif",
              }}>
                {t('description')}
              </TableCell>
              <TableCell sx={{ 
                fontWeight: 700, 
                fontSize: '0.95rem',
                color: 'text.primary',
                borderBottom: '2px solid rgba(0,0,0,0.1)',
                fontFamily: "'Inter', 'Roboto', 'Noto Sans', 'Segoe UI', sans-serif",
              }}>
                {t('parentCategory')}
              </TableCell>
              <TableCell sx={{ 
                fontWeight: 700, 
                fontSize: '0.95rem',
                color: 'text.primary',
                borderBottom: '2px solid rgba(0,0,0,0.1)',
                fontFamily: "'Inter', 'Roboto', 'Noto Sans', 'Segoe UI', sans-serif",
              }}>
                {t('statusLabel')}
              </TableCell>
              <TableCell sx={{ 
                fontWeight: 700, 
                fontSize: '0.95rem',
                color: 'text.primary',
                borderBottom: '2px solid rgba(0,0,0,0.1)',
                fontFamily: "'Inter', 'Roboto', 'Noto Sans', 'Segoe UI', sans-serif",
              }}>
                {t('createdAt')}
              </TableCell>
              <TableCell align="right" sx={{ 
                fontWeight: 700, 
                fontSize: '0.95rem',
                color: 'text.primary',
                borderBottom: '2px solid rgba(0,0,0,0.1)',
                fontFamily: "'Inter', 'Roboto', 'Noto Sans', 'Segoe UI', sans-serif",
              }}>
                {t('actions')}
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  {t('loading')}
                </TableCell>
              </TableRow>
            ) : categories.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  {t('noCategories')}
                </TableCell>
              </TableRow>
            ) : (
              filteredCategories.map(category => (
                <TableRow key={typeof category._id === 'string' ? category._id : ''}>
                  <TableCell>{category.name}</TableCell>
                  <TableCell>{category.description}</TableCell>
                  <TableCell>
                    {category.parentCategory ? category.parentCategory.name : '-'}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={t(`status.${category.status}`)}
                      color={category.status === 'active' ? 'success' : 'default'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {category.createdAt ? new Date(category.createdAt).toLocaleDateString() : '-'}
                  </TableCell>
                  <TableCell align="right">
                    <IconButton
                      size="small"
                      onClick={() => handleOpenDialog(category)}
                      sx={{ 
                        mr: 1,
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
                    <IconButton
                      size="small"
                      onClick={() =>
                        handleDelete(typeof category._id === 'string' ? category._id : '')
                      }
                      sx={{
                        color: 'error.main',
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
                  backgroundColor: 'rgba(25, 118, 210, 0.08)',
                },
              },
            }}
          />
        </Box>
      )}

      {/* Add/Edit Dialog */}
      <Dialog 
        open={openDialog} 
        onClose={handleCloseDialog} 
        maxWidth="sm" 
        fullWidth
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
            {selectedCategory ? t('editCategory') : t('addCategory')}
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
            <Stack spacing={3}>
              <TextField
                name="name"
                label={t('name')}
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
                label={t('description')}
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

              <FormControl fullWidth sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  fontFamily: "'Inter', 'Roboto', 'Noto Sans', 'Segoe UI', sans-serif",
                },
                '& .MuiInputLabel-root': {
                  fontFamily: "'Inter', 'Roboto', 'Noto Sans', 'Segoe UI', sans-serif",
                },
              }}>
                <InputLabel>{t('parentCategory')}</InputLabel>
                <Select
                  name="parentCategory"
                  value={formData.parentCategory || ''}
                  onChange={handleInputChange}
                  label={t('parentCategory')}
                  sx={{
                    fontFamily: "'Inter', 'Roboto', 'Noto Sans', 'Segoe UI', sans-serif",
                  }}
                >
                  <MenuItem value="" sx={{
                    fontFamily: "'Inter', 'Roboto', 'Noto Sans', 'Segoe UI', sans-serif",
                  }}>
                    {t('none')}
                  </MenuItem>
                  {categories
                    .filter(cat => {
                      // Chỉ lấy các category không có parentCategory hoặc parentCategory là null/undefined
                      return (
                        !cat.parentCategory ||
                        (typeof cat.parentCategory === 'string' && cat.parentCategory === '') ||
                        (typeof cat.parentCategory === 'object' && cat.parentCategory === null)
                      );
                    })
                    .map(parentCat => (
                      <MenuItem key={parentCat._id} value={parentCat._id} sx={{
                        fontFamily: "'Inter', 'Roboto', 'Noto Sans', 'Segoe UI', sans-serif",
                      }}>
                        {parentCat.name}
                      </MenuItem>
                    ))}
                </Select>
              </FormControl>

              <FormControl fullWidth sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  fontFamily: "'Inter', 'Roboto', 'Noto Sans', 'Segoe UI', sans-serif",
                },
                '& .MuiInputLabel-root': {
                  fontFamily: "'Inter', 'Roboto', 'Noto Sans', 'Segoe UI', sans-serif",
                },
              }}>
                <InputLabel>{t('statusLabel')}</InputLabel>
                <Select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  label={t('statusLabel')}
                  sx={{
                    fontFamily: "'Inter', 'Roboto', 'Noto Sans', 'Segoe UI', sans-serif",
                  }}
                >
                  <MenuItem value="active" sx={{
                    fontFamily: "'Inter', 'Roboto', 'Noto Sans', 'Segoe UI', sans-serif",
                  }}>
                    {t('status.active')}
                  </MenuItem>
                  <MenuItem value="inactive" sx={{
                    fontFamily: "'Inter', 'Roboto', 'Noto Sans', 'Segoe UI', sans-serif",
                  }}>
                    {t('status.inactive')}
                  </MenuItem>
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
                '&:hover': {
                  transform: 'translateY(-1px)',
                },
                transition: 'all 0.2s ease-in-out'
              }}
            >
              {t('cancel')}
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
              {selectedCategory ? t('update') : t('create')}
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
