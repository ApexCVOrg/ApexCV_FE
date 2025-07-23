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
  Avatar,
  Tooltip,
  Switch,
  FormControlLabel,
  Pagination,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import api from '@/services/api';
import { API_ENDPOINTS, SUCCESS_MESSAGES, ERROR_MESSAGES } from '@/lib/constants/constants';
import { useTranslations } from 'next-intl';

interface Address {
  recipientName: string;
  street: string;
  city: string;
  state: string;
  country: string;
  addressNumber?: string;
  isDefault: boolean;
}

interface User {
  _id: string;
  username: string;
  email: string;
  fullName: string;
  phone: string;
  role: 'user' | 'admin' | 'manager';
  isVerified: boolean;
  addresses: Address[];
  createdAt: string;
  status?: string;
  updatedAt?: string;
  avatar?: string;
}

interface UserFormData {
  username: string;
  email: string;
  fullName: string;
  phone: string;
  role: 'user' | 'admin' | 'manager';
  status: string;
  isVerified: boolean;
  addresses: Address[];
}

export default function CustomersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // Pagination states
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);

  // Search and filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [verificationFilter, setVerificationFilter] = useState<string>('all');

  const [formData, setFormData] = useState<UserFormData>({
    username: '',
    email: '',
    fullName: '',
    phone: '',
    role: 'user',
    status: 'active',
    isVerified: false,
    addresses: [],
  });

  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({ open: false, message: '', severity: 'success' });

  const t = useTranslations('manager.users');

  // Search and filter function
  const filterUsers = () => {
    let filtered = users || [];

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        user =>
          user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.phone.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by role
    if (roleFilter !== 'all') {
      filtered = filtered.filter(user => user.role === roleFilter);
    }

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(user => user.status === statusFilter);
    }

    // Filter by verification status
    if (verificationFilter !== 'all') {
      const isVerified = verificationFilter === 'verified';
      filtered = filtered.filter(user => user.isVerified === isVerified);
    }

    setFilteredUsers(filtered);
  };

  // Apply filters when search terms or filters change
  useEffect(() => {
    filterUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm, roleFilter, statusFilter, verificationFilter, users]);

  // Clear all filters
  const clearFilters = () => {
    setSearchTerm('');
    setRoleFilter('all');
    setStatusFilter('all');
    setVerificationFilter('all');
  };

  // Fetch users with pagination
  const fetchUsers = async () => {
    try {
      setLoading(true);

      // Use CUSTOMERS endpoint for direct array response
      const response = await api.get<User[]>(API_ENDPOINTS.MANAGER.CUSTOMERS, {
        params: { page, limit },
      });

      // Parse resp.data directly as User[] array
      setUsers(response.data);

      // Set pagination info
      setTotalUsers(response.data.length);
      setTotalPages(Math.ceil(response.data.length / limit));
    } catch (error) {
      console.error('Error fetching users:', error);
      setSnackbar({ open: true, message: ERROR_MESSAGES.NETWORK_ERROR, severity: 'error' });
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, limit]);

  // Handle page change
  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
  };

  // Handle form input changes
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  // Open dialog for add or edit
  const handleOpenDialog = (user?: User) => {
    if (user) {
      setSelectedUser(user);
      setFormData({
        username: user.username,
        email: user.email,
        fullName: user.fullName,
        phone: user.phone,
        role: user.role,
        status: user.status || 'active',
        isVerified: user.isVerified,
        addresses: user.addresses,
      });
    } else {
      setSelectedUser(null);
      setFormData({
        username: '',
        email: '',
        fullName: '',
        phone: '',
        role: 'user',
        status: 'active',
        isVerified: false,
        addresses: [],
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedUser(null);
    setFormData({
      username: '',
      email: '',
      fullName: '',
      phone: '',
      role: 'user',
      status: 'active',
      isVerified: false,
      addresses: [],
    });
  };

  // Submit form add/edit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const url = selectedUser
        ? `${API_ENDPOINTS.MANAGER.CUSTOMERS}/${selectedUser._id}`
        : API_ENDPOINTS.MANAGER.CUSTOMERS;
      const method = selectedUser ? 'put' : 'post';

      await api[method](url, formData);

      setSnackbar({
        open: true,
        message: selectedUser
          ? SUCCESS_MESSAGES.MANAGER.USER_UPDATED
          : SUCCESS_MESSAGES.MANAGER.USER_CREATED,
        severity: 'success',
      });

      handleCloseDialog();
      fetchUsers();
    } catch {
      setSnackbar({
        open: true,
        message: ERROR_MESSAGES.MANAGER.INVALID_USER_DATA,
        severity: 'error',
      });
    }
  };

  // Delete user
  const handleDelete = async (id: string) => {
    if (!window.confirm(t('deleteConfirm'))) return;

    try {
      await api.delete(`${API_ENDPOINTS.MANAGER.CUSTOMERS}/${id}`);

      setSnackbar({
        open: true,
        message: SUCCESS_MESSAGES.MANAGER.USER_DELETED,
        severity: 'success',
      });

      fetchUsers();
    } catch {
      setSnackbar({
        open: true,
        message: ERROR_MESSAGES.MANAGER.INVALID_USER_DATA,
        severity: 'error',
      });
    }
  };

  // Helper: Format date
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

  // Helper: Get address count
  const getAddressCount = (addresses: Address[]) => {
    return addresses ? addresses.length : 0;
  };

  // Helper: Get default address
  const getDefaultAddress = (addresses: Address[]) => {
    if (!addresses || addresses.length === 0) return '-';
    const defaultAddr = addresses.find(addr => addr.isDefault);
    if (defaultAddr) {
      return `${defaultAddr.recipientName} - ${defaultAddr.city}, ${defaultAddr.country}`;
    }
    return `${addresses[0].recipientName} - ${addresses[0].city}, ${addresses[0].country}`;
  };

  return (
    <Box sx={{ 
      width: '100%', 
      maxWidth: '100%', 
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
              placeholder={t('search.searchUsers')}
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
              disabled={
                !searchTerm &&
                roleFilter === 'all' &&
                statusFilter === 'all' &&
                verificationFilter === 'all'
              }
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
                {t('role')}
              </Typography>
              <FormControl sx={{ 
                minWidth: 120,
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
                value={roleFilter}
                onChange={e => setRoleFilter(e.target.value)}
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
                <MenuItem value="all">{t('search.allRoles')}</MenuItem>
                <MenuItem value="user">{t('roles.user')}</MenuItem>
                <MenuItem value="admin">{t('roles.admin')}</MenuItem>
                <MenuItem value="manager">{t('roles.manager')}</MenuItem>
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
                {t('status')}
              </Typography>
              <FormControl sx={{ 
                minWidth: 120,
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
                <MenuItem value="active">{t('statuses.active')}</MenuItem>
                <MenuItem value="inactive">{t('statuses.inactive')}</MenuItem>
                <MenuItem value="suspended">{t('statuses.suspended')}</MenuItem>
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
                {t('verification')}
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
                value={verificationFilter}
                onChange={e => setVerificationFilter(e.target.value)}
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
                <MenuItem value="all">{t('search.allVerification')}</MenuItem>
                <MenuItem value="verified">{t('verificationStatus.verified')}</MenuItem>
                <MenuItem value="unverified">{t('verificationStatus.unverified')}</MenuItem>
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
                  filtered: filteredUsers.length,
                  total: totalUsers,
                  itemType: t('search.users'),
                })}
              </Typography>
            </Box>
          </Box>
        </Stack>
      </Paper>

      <TableContainer component={Paper} sx={{
        width: '100%',
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
        <Table sx={{
          width: '100%',
          tableLayout: 'fixed',
          '& .MuiTableRow-root:hover': {
            backgroundColor: (theme) => theme.palette.mode === 'dark'
              ? 'rgba(255,255,255,0.05)'
              : 'rgba(0,0,0,0.02)',
            transition: 'background-color 0.2s ease-in-out',
          },
        }}>
          <TableHead>
            <TableRow sx={{ 
              backgroundColor: (theme) => theme.palette.mode === 'dark' 
                ? 'rgba(255,255,255,0.12)' 
                : 'rgba(0,0,0,0.12)' 
            }}>
                              <TableCell sx={{ 
                  fontWeight: 700, 
                  fontSize: '0.95rem',
                  color: 'text.primary',
                  borderBottom: (theme) => theme.palette.mode === 'dark'
                    ? '2px solid rgba(255,255,255,0.15)'
                    : '2px solid rgba(0,0,0,0.2)',
                  fontFamily: "'Inter', 'Roboto', 'Noto Sans', 'Segoe UI', sans-serif",
                  backgroundColor: (theme) => theme.palette.mode === 'dark' 
                    ? 'rgba(255,255,255,0.12)' 
                    : 'rgba(0,0,0,0.12)',
                  py: 2,
                  width: '8%',
                }}>
                  {t('avatar')}
                </TableCell>
              <TableCell sx={{ 
                fontWeight: 700, 
                fontSize: '0.95rem',
                color: 'text.primary',
                borderBottom: (theme) => theme.palette.mode === 'dark'
                  ? '2px solid rgba(255,255,255,0.15)'
                  : '2px solid rgba(0,0,0,0.2)',
                fontFamily: "'Inter', 'Roboto', 'Noto Sans', 'Segoe UI', sans-serif",
                backgroundColor: (theme) => theme.palette.mode === 'dark' 
                  ? 'rgba(255,255,255,0.12)' 
                  : 'rgba(0,0,0,0.12)',
                py: 2,
                width: '10%',
              }}>
                {t('username')}
              </TableCell>
              <TableCell sx={{ 
                fontWeight: 700, 
                fontSize: '0.95rem',
                color: 'text.primary',
                borderBottom: (theme) => theme.palette.mode === 'dark'
                  ? '2px solid rgba(255,255,255,0.15)'
                  : '2px solid rgba(0,0,0,0.2)',
                fontFamily: "'Inter', 'Roboto', 'Noto Sans', 'Segoe UI', sans-serif",
                backgroundColor: (theme) => theme.palette.mode === 'dark' 
                  ? 'rgba(255,255,255,0.12)' 
                  : 'rgba(0,0,0,0.12)',
                py: 2,
                width: '15%',
              }}>
                {t('email')}
              </TableCell>
              <TableCell sx={{ 
                fontWeight: 700, 
                fontSize: '0.95rem',
                color: 'text.primary',
                borderBottom: (theme) => theme.palette.mode === 'dark'
                  ? '2px solid rgba(255,255,255,0.15)'
                  : '2px solid rgba(0,0,0,0.2)',
                fontFamily: "'Inter', 'Roboto', 'Noto Sans', 'Segoe UI', sans-serif",
                backgroundColor: (theme) => theme.palette.mode === 'dark' 
                  ? 'rgba(255,255,255,0.12)' 
                  : 'rgba(0,0,0,0.12)',
                py: 2,
                width: '12%',
              }}>
                {t('fullName')}
              </TableCell>
              <TableCell sx={{ 
                fontWeight: 700, 
                fontSize: '0.95rem',
                color: 'text.primary',
                borderBottom: (theme) => theme.palette.mode === 'dark'
                  ? '2px solid rgba(255,255,255,0.15)'
                  : '2px solid rgba(0,0,0,0.2)',
                fontFamily: "'Inter', 'Roboto', 'Noto Sans', 'Segoe UI', sans-serif",
                backgroundColor: (theme) => theme.palette.mode === 'dark' 
                  ? 'rgba(255,255,255,0.12)' 
                  : 'rgba(0,0,0,0.12)',
                py: 2,
                width: '10%',
              }}>
                {t('phone')}
              </TableCell>
              <TableCell sx={{ 
                fontWeight: 700, 
                fontSize: '0.95rem',
                color: 'text.primary',
                borderBottom: (theme) => theme.palette.mode === 'dark'
                  ? '2px solid rgba(255,255,255,0.15)'
                  : '2px solid rgba(0,0,0,0.2)',
                fontFamily: "'Inter', 'Roboto', 'Noto Sans', 'Segoe UI', sans-serif",
                backgroundColor: (theme) => theme.palette.mode === 'dark' 
                  ? 'rgba(255,255,255,0.12)' 
                  : 'rgba(0,0,0,0.12)',
                py: 2,
                width: '8%',
              }}>
                {t('role')}
              </TableCell>
              <TableCell sx={{ 
                fontWeight: 700, 
                fontSize: '0.95rem',
                color: 'text.primary',
                borderBottom: (theme) => theme.palette.mode === 'dark'
                  ? '2px solid rgba(255,255,255,0.15)'
                  : '2px solid rgba(0,0,0,0.2)',
                fontFamily: "'Inter', 'Roboto', 'Noto Sans', 'Segoe UI', sans-serif",
                backgroundColor: (theme) => theme.palette.mode === 'dark' 
                  ? 'rgba(255,255,255,0.12)' 
                  : 'rgba(0,0,0,0.12)',
                py: 2,
                width: '8%',
              }}>
                {t('status')}
              </TableCell>
              <TableCell sx={{ 
                fontWeight: 700, 
                fontSize: '0.95rem',
                color: 'text.primary',
                borderBottom: (theme) => theme.palette.mode === 'dark'
                  ? '2px solid rgba(255,255,255,0.15)'
                  : '2px solid rgba(0,0,0,0.2)',
                fontFamily: "'Inter', 'Roboto', 'Noto Sans', 'Segoe UI', sans-serif",
                backgroundColor: (theme) => theme.palette.mode === 'dark' 
                  ? 'rgba(255,255,255,0.12)' 
                  : 'rgba(0,0,0,0.12)',
                py: 2,
                width: '10%',
              }}>
                {t('verification')}
              </TableCell>
              <TableCell sx={{ 
                fontWeight: 700, 
                fontSize: '0.95rem',
                color: 'text.primary',
                borderBottom: (theme) => theme.palette.mode === 'dark'
                  ? '2px solid rgba(255,255,255,0.15)'
                  : '2px solid rgba(0,0,0,0.2)',
                fontFamily: "'Inter', 'Roboto', 'Noto Sans', 'Segoe UI', sans-serif",
                backgroundColor: (theme) => theme.palette.mode === 'dark' 
                  ? 'rgba(255,255,255,0.12)' 
                  : 'rgba(0,0,0,0.12)',
                py: 2,
                width: '8%',
              }}>
                {t('addresses')}
              </TableCell>
              <TableCell sx={{ 
                fontWeight: 700, 
                fontSize: '0.95rem',
                color: 'text.primary',
                borderBottom: (theme) => theme.palette.mode === 'dark'
                  ? '2px solid rgba(255,255,255,0.15)'
                  : '2px solid rgba(0,0,0,0.2)',
                fontFamily: "'Inter', 'Roboto', 'Noto Sans', 'Segoe UI', sans-serif",
                backgroundColor: (theme) => theme.palette.mode === 'dark' 
                  ? 'rgba(255,255,255,0.12)' 
                  : 'rgba(0,0,0,0.12)',
                py: 2,
                width: '12%',
              }}>
                {t('createdAt')}
              </TableCell>
              <TableCell align="right" sx={{ 
                fontWeight: 700, 
                fontSize: '0.95rem',
                color: 'text.primary',
                borderBottom: (theme) => theme.palette.mode === 'dark'
                  ? '2px solid rgba(255,255,255,0.15)'
                  : '2px solid rgba(0,0,0,0.2)',
                fontFamily: "'Inter', 'Roboto', 'Noto Sans', 'Segoe UI', sans-serif",
                backgroundColor: (theme) => theme.palette.mode === 'dark' 
                  ? 'rgba(255,255,255,0.12)' 
                  : 'rgba(0,0,0,0.12)',
                py: 2,
                width: '9%',
              }}>
                {t('actions')}
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={11} align="center">
                  {t('loading')}
                </TableCell>
              </TableRow>
            ) : users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={11} align="center">
                  {t('noUsers')}
                </TableCell>
              </TableRow>
            ) : Array.isArray(filteredUsers) ? (
              filteredUsers.map(user => (
                <TableRow 
                  key={user._id}
                  sx={{
                    '&:hover': {
                      backgroundColor: (theme) => theme.palette.mode === 'dark'
                        ? 'rgba(255,255,255,0.05)'
                        : 'rgba(0,0,0,0.02)',
                    },
                    transition: 'background-color 0.2s ease-in-out',
                  }}
                >
                  <TableCell sx={{ py: 2 }}>
                    <Avatar 
                      src={user.avatar} 
                      alt={user.fullName} 
                      sx={{ 
                        width: 40, 
                        height: 40,
                        fontSize: '1rem',
                        fontWeight: 600,
                        backgroundColor: (theme) => theme.palette.primary.main,
                      }}
                    >
                      {user.fullName?.charAt(0) || user.username?.charAt(0)}
                    </Avatar>
                  </TableCell>
                  <TableCell sx={{ 
                    py: 2,
                    fontFamily: "'Inter', 'Roboto', 'Noto Sans', 'Segoe UI', sans-serif",
                    fontWeight: 500,
                  }}>
                    {user.username}
                  </TableCell>
                  <TableCell sx={{ 
                    py: 2,
                    fontFamily: "'Inter', 'Roboto', 'Noto Sans', 'Segoe UI', sans-serif",
                  }}>
                    {user.email}
                  </TableCell>
                  <TableCell sx={{ 
                    py: 2,
                    fontFamily: "'Inter', 'Roboto', 'Noto Sans', 'Segoe UI', sans-serif",
                    fontWeight: 500,
                  }}>
                    {user.fullName}
                  </TableCell>
                  <TableCell sx={{ 
                    py: 2,
                    fontFamily: "'Inter', 'Roboto', 'Noto Sans', 'Segoe UI', sans-serif",
                  }}>
                    {user.phone}
                  </TableCell>
                  <TableCell sx={{ py: 2 }}>
                    <Chip
                      label={t(`roles.${user.role}`)}
                      color={
                        user.role === 'admin'
                          ? 'error'
                          : user.role === 'manager'
                            ? 'warning'
                            : 'default'
                      }
                      size="small"
                      sx={{
                        fontWeight: 600,
                        fontSize: '0.75rem',
                        height: 24,
                        '& .MuiChip-label': {
                          px: 1,
                        },
                      }}
                    />
                  </TableCell>
                  <TableCell sx={{ py: 2 }}>
                    <Chip
                      label={t(`statuses.${user.status || 'active'}`)}
                      color={
                        user.status === 'active'
                          ? 'success'
                          : user.status === 'suspended'
                            ? 'error'
                            : 'default'
                      }
                      size="small"
                      sx={{
                        fontWeight: 600,
                        fontSize: '0.75rem',
                        height: 24,
                        '& .MuiChip-label': {
                          px: 1,
                        },
                      }}
                    />
                  </TableCell>
                  <TableCell sx={{ py: 2 }}>
                    <Chip
                      label={
                        user.isVerified
                          ? t('verificationStatus.verified')
                          : t('verificationStatus.unverified')
                      }
                      color={user.isVerified ? 'success' : 'default'}
                      size="small"
                      sx={{
                        fontWeight: 600,
                        fontSize: '0.75rem',
                        height: 24,
                        '& .MuiChip-label': {
                          px: 1,
                        },
                      }}
                    />
                  </TableCell>
                  <TableCell sx={{ py: 2 }}>
                    <Tooltip title={getDefaultAddress(user.addresses)}>
                      <Chip
                        label={`${getAddressCount(user.addresses)} ${t('addresses')}`}
                        size="small"
                        variant="outlined"
                        sx={{
                          fontWeight: 500,
                          fontSize: '0.75rem',
                          height: 24,
                          '& .MuiChip-label': {
                            px: 1,
                          },
                        }}
                      />
                    </Tooltip>
                  </TableCell>
                  <TableCell sx={{ 
                    py: 2,
                    fontFamily: "'Inter', 'Roboto', 'Noto Sans', 'Segoe UI', sans-serif",
                    fontSize: '0.875rem',
                  }}>
                    {formatDate(user.createdAt)}
                  </TableCell>
                  <TableCell align="center" sx={{ py: 2 }}>
                    <Box sx={{ 
                      display: 'flex', 
                      justifyContent: 'center', 
                      alignItems: 'center',
                      gap: 1,
                    }}>
                      <IconButton 
                        size="small" 
                        onClick={() => handleOpenDialog(user)} 
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
                      <IconButton 
                        size="small" 
                        onClick={() => handleDelete(user._id)} 
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
                    </Box>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={11} align="center">
                  {t('loading')}
                </TableCell>
              </TableRow>
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
            {selectedUser ? t('editUser') : t('addUser')}
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
                name="username"
                label={t('username')}
                value={formData.username}
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
                name="email"
                label={t('email')}
                type="email"
                value={formData.email}
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
                name="fullName"
                label={t('fullName')}
                value={formData.fullName}
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
                name="phone"
                label={t('phone')}
                value={formData.phone}
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

              <FormControl fullWidth required sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  fontFamily: "'Inter', 'Roboto', 'Noto Sans', 'Segoe UI', sans-serif",
                },
                '& .MuiInputLabel-root': {
                  fontFamily: "'Inter', 'Roboto', 'Noto Sans', 'Segoe UI', sans-serif",
                },
              }}>
                <InputLabel>{t('role')}</InputLabel>
                <Select
                  name="role"
                  value={formData.role}
                  onChange={e =>
                    setFormData(prev => ({
                      ...prev,
                      role: e.target.value as 'user' | 'admin' | 'manager',
                    }))
                  }
                  label={t('role')}
                  sx={{
                    fontFamily: "'Inter', 'Roboto', 'Noto Sans', 'Segoe UI', sans-serif",
                  }}
                >
                  <MenuItem value="user" sx={{
                    fontFamily: "'Inter', 'Roboto', 'Noto Sans', 'Segoe UI', sans-serif",
                  }}>
                    {t('roles.user')}
                  </MenuItem>
                  <MenuItem value="admin" sx={{
                    fontFamily: "'Inter', 'Roboto', 'Noto Sans', 'Segoe UI', sans-serif",
                  }}>
                    {t('roles.admin')}
                  </MenuItem>
                  <MenuItem value="manager" sx={{
                    fontFamily: "'Inter', 'Roboto', 'Noto Sans', 'Segoe UI', sans-serif",
                  }}>
                    {t('roles.manager')}
                  </MenuItem>
                </Select>
              </FormControl>

              <FormControl fullWidth required sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  fontFamily: "'Inter', 'Roboto', 'Noto Sans', 'Segoe UI', sans-serif",
                },
                '& .MuiInputLabel-root': {
                  fontFamily: "'Inter', 'Roboto', 'Noto Sans', 'Segoe UI', sans-serif",
                },
              }}>
                <InputLabel>{t('status')}</InputLabel>
                <Select
                  name="status"
                  value={formData.status}
                  onChange={e => setFormData(prev => ({ ...prev, status: e.target.value }))}
                  label={t('status')}
                  sx={{
                    fontFamily: "'Inter', 'Roboto', 'Noto Sans', 'Segoe UI', sans-serif",
                  }}
                >
                  <MenuItem value="active" sx={{
                    fontFamily: "'Inter', 'Roboto', 'Noto Sans', 'Segoe UI', sans-serif",
                  }}>
                    {t('statuses.active')}
                  </MenuItem>
                  <MenuItem value="inactive" sx={{
                    fontFamily: "'Inter', 'Roboto', 'Noto Sans', 'Segoe UI', sans-serif",
                  }}>
                    {t('statuses.inactive')}
                  </MenuItem>
                  <MenuItem value="suspended" sx={{
                    fontFamily: "'Inter', 'Roboto', 'Noto Sans', 'Segoe UI', sans-serif",
                  }}>
                    {t('statuses.suspended')}
                  </MenuItem>
                </Select>
              </FormControl>

              <FormControlLabel
                control={
                  <Switch
                    checked={formData.isVerified}
                    onChange={e => setFormData(prev => ({ ...prev, isVerified: e.target.checked }))}
                    sx={{
                      '& .MuiSwitch-switchBase.Mui-checked': {
                        color: 'primary.main',
                      },
                      '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                        backgroundColor: 'primary.main',
                      },
                    }}
                  />
                }
                label={t('isVerified')}
                sx={{
                  '& .MuiFormControlLabel-label': {
                    fontFamily: "'Inter', 'Roboto', 'Noto Sans', 'Segoe UI', sans-serif",
                    fontWeight: 500,
                  },
                }}
              />
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
              {selectedUser ? t('update') : t('create')}
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
