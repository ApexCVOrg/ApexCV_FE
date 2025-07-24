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
import BlockIcon from '@mui/icons-material/Block';
import LockOpenIcon from '@mui/icons-material/LockOpen';

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
  const [banFilter, setBanFilter] = useState<string>('all');

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

  // Thêm state cho dialog ban user
  const [banDialog, setBanDialog] = useState<{ open: boolean; user: User | null }>({
    open: false,
    user: null,
  });
  const [banReason, setBanReason] = useState('');

  const t = useTranslations('admin.users');

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

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

    // Filter by ban status
    if (banFilter === 'banned') {
      filtered = filtered.filter(user => user.status === 'locked');
    } else if (banFilter === 'notBanned') {
      filtered = filtered.filter(user => user.status !== 'locked');
    }

    setFilteredUsers(filtered);
  };

  // Apply filters when search terms or filters change
  useEffect(() => {
    filterUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm, roleFilter, statusFilter, verificationFilter, banFilter, users]);

  // Clear all filters
  const clearFilters = () => {
    setSearchTerm('');
    setRoleFilter('all');
    setStatusFilter('all');
    setVerificationFilter('all');
    setBanFilter('all');
  };

  // Fetch users with pagination
  const fetchUsers = async () => {
    try {
      setLoading(true);

      // Use CUSTOMERS endpoint for direct array response
      const response = await api.get<User[]>(API_ENDPOINTS.ADMIN.CUSTOMERS, {
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
        ? `${API_ENDPOINTS.ADMIN.CUSTOMERS}/${selectedUser._id}`
        : API_ENDPOINTS.ADMIN.CUSTOMERS;
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
      await api.delete(`${API_ENDPOINTS.ADMIN.CUSTOMERS}/${id}`);

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

  // Hàm mở dialog ban user
  const handleOpenBanDialog = (user: User) => {
    setBanDialog({ open: true, user });
    setBanReason('');
  };
  const handleCloseBanDialog = () => {
    setBanDialog({ open: false, user: null });
    setBanReason('');
  };
  // Gọi API ban user
  const handleBanUser = async () => {
    if (!banDialog.user) return;
    if (!banReason.trim()) {
      setSnackbar({ open: true, message: 'Ban reason is required', severity: 'error' });
      return;
    }
    try {
      await api.patch(`${API_ENDPOINTS.ADMIN.USERS}/${banDialog.user._id}/status`, {
        status: 'locked',
        reason: banReason,
      });
      setSnackbar({ open: true, message: `User banned successfully`, severity: 'success' });
      handleCloseBanDialog();
      fetchUsers();
    } catch (err: unknown) {
      setSnackbar({
        open: true,
        message: (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to ban user',
        severity: 'error',
      });
    }
  };
  // Gọi API mở user
  const handleUnlockUser = async (user: User) => {
    try {
      await api.patch(`${API_ENDPOINTS.ADMIN.USERS}/${user._id}/status`, { status: 'active' });
      setSnackbar({ open: true, message: `User unlocked successfully`, severity: 'success' });
      fetchUsers();
    } catch (err: unknown) {
      setSnackbar({
        open: true,
        message: (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to unlock user',
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
      maxWidth: 1600,
      mx: 'auto',
      pt: { xs: 4, md: 6 },
      px: { xs: 1, md: 2 },
      overflowX: 'auto'
    }}>
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        mb={3}
        sx={{ flexWrap: 'wrap' }}
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
            textTransform: 'none',
            fontWeight: 600,
            fontFamily: "'Inter', 'Roboto', 'Noto Sans', 'Segoe UI', sans-serif",
            background: 'linear-gradient(45deg, #f44336 30%, #d32f2f 90%)',
            boxShadow: '0 3px 5px 2px rgba(244, 67, 54, .3)',
            '&:hover': {
              background: 'linear-gradient(45deg, #d32f2f 30%, #c62828 90%)',
              transform: 'translateY(-1px)',
              boxShadow: '0 6px 10px 4px rgba(244, 67, 54, .3)',
            },
            transition: 'all 0.2s ease-in-out'
          }}
        >
          {t('addNew')}
        </Button>
      </Stack>

      {/* Search and Filter Section */}
      <Paper sx={{ 
        width: '100%',
        maxWidth: '100%',
        p: 3, 
        mb: 3, 
        overflow: 'hidden',
        borderRadius: 3,
        boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
        background: (theme) => theme.palette.mode === 'dark' 
          ? 'linear-gradient(135deg, rgba(25, 35, 50, 0.95) 0%, rgba(30, 40, 60, 0.95) 100%)'
          : 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(248,250,252,0.95) 100%)',
        border: (theme) => theme.palette.mode === 'dark'
          ? '1px solid rgba(100, 120, 150, 0.3)'
          : '1px solid rgba(0,0,0,0.06)',
      }}>
        <Stack spacing={2}>
          {/* Search Bar */}
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <TextField
              placeholder={t('search.searchUsers')}
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              sx={{ 
                flexGrow: 1,
                minWidth: { xs: 200, md: 250 },
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  fontSize: '0.95rem',
                  fontFamily: "'Inter', 'Roboto', 'Noto Sans', 'Segoe UI', sans-serif",
                  '&:hover': {
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'error.main',
                    },
                  },
                },
                '& .MuiInputBase-input': {
                  fontFamily: "'Inter', 'Roboto', 'Noto Sans', 'Segoe UI', sans-serif",
                  py: 1.5,
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
                verificationFilter === 'all' &&
                banFilter === 'all'
              }
              sx={{
                borderRadius: 2,
                px: 3,
                py: 1.5,
                fontWeight: 500,
                fontSize: '0.95rem',
                textTransform: 'none',
                fontFamily: "'Inter', 'Roboto', 'Noto Sans', 'Segoe UI', sans-serif",
                borderColor: 'error.main',
                color: 'error.main',
                '&:hover': {
                  borderColor: 'error.dark',
                  backgroundColor: 'rgba(244, 67, 54, 0.04)',
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
              gap: 2,
              flexWrap: { xs: 'nowrap', md: 'wrap' },
              alignItems: 'center',
              width: '100%',
              overflowX: { xs: 'auto', md: 'visible' },
              pb: { xs: 1, md: 0 },
              minWidth: { xs: 'max-content', md: 'auto' },
              // Custom scrollbar for filter row on mobile
              '&::-webkit-scrollbar': {
                height: '6px',
              },
              '&::-webkit-scrollbar-track': {
                background: (theme) => theme.palette.mode === 'dark'
                  ? 'rgba(60, 30, 30, 0.3)'
                  : 'rgba(0, 0, 0, 0.05)',
                borderRadius: '10px',
              },
              '&::-webkit-scrollbar-thumb': {
                background: (theme) => theme.palette.mode === 'dark'
                  ? 'linear-gradient(135deg, rgba(244, 67, 54, 0.6) 0%, rgba(211, 47, 47, 0.8) 100%)'
                  : 'linear-gradient(135deg, rgba(244, 67, 54, 0.4) 0%, rgba(211, 47, 47, 0.6) 100%)',
                borderRadius: '10px',
              },
            }}
          >
            <FormControl sx={{ 
              minWidth: { xs: 100, md: 120 },
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
                fontSize: '0.95rem',
                fontFamily: "'Inter', 'Roboto', 'Noto Sans', 'Segoe UI', sans-serif",
                '&:hover': {
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'error.main',
                  },
                },
              },
              '& .MuiInputLabel-root': {
                fontSize: '0.95rem',
                fontFamily: "'Inter', 'Roboto', 'Noto Sans', 'Segoe UI', sans-serif",
              },
            }}>
              <InputLabel>{t('role')}</InputLabel>
              <Select
                value={roleFilter}
                onChange={e => setRoleFilter(e.target.value)}
                label={t('role')}
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

            <FormControl sx={{ 
              minWidth: { xs: 100, md: 120 },
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
                fontSize: '0.95rem',
                fontFamily: "'Inter', 'Roboto', 'Noto Sans', 'Segoe UI', sans-serif",
                '&:hover': {
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'error.main',
                  },
                },
              },
              '& .MuiInputLabel-root': {
                fontSize: '0.95rem',
                fontFamily: "'Inter', 'Roboto', 'Noto Sans', 'Segoe UI', sans-serif",
              },
            }}>
              <InputLabel>{t('status')}</InputLabel>
              <Select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                label={t('status')}
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

            <FormControl sx={{ 
              minWidth: { xs: 120, md: 150 },
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
                fontSize: '0.95rem',
                fontFamily: "'Inter', 'Roboto', 'Noto Sans', 'Segoe UI', sans-serif",
                '&:hover': {
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'error.main',
                  },
                },
              },
              '& .MuiInputLabel-root': {
                fontSize: '0.95rem',
                fontFamily: "'Inter', 'Roboto', 'Noto Sans', 'Segoe UI', sans-serif",
              },
            }}>
              <InputLabel>{t('verification')}</InputLabel>
              <Select
                value={verificationFilter}
                onChange={e => setVerificationFilter(e.target.value)}
                label={t('verification')}
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

            <FormControl sx={{ 
              minWidth: { xs: 120, md: 150 },
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
                fontSize: '0.95rem',
                fontFamily: "'Inter', 'Roboto', 'Noto Sans', 'Segoe UI', sans-serif",
                '&:hover': {
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'error.main',
                  },
                },
              },
              '& .MuiInputLabel-root': {
                fontSize: '0.95rem',
                fontFamily: "'Inter', 'Roboto', 'Noto Sans', 'Segoe UI', sans-serif",
              },
            }}>
              <InputLabel>{t('banFilter.label')}</InputLabel>
              <Select
                value={banFilter}
                onChange={e => setBanFilter(e.target.value)}
                label={t('banFilter.label')}
                sx={{
                  '& .MuiSelect-select': {
                    fontSize: '0.875rem',
                    fontWeight: 500,
                    py: 1.5,
                    fontFamily: "'Inter', 'Roboto', 'Noto Sans', 'Segoe UI', sans-serif",
                  },
                }}
              >
                <MenuItem value="all">{t('banFilter.all')}</MenuItem>
                <MenuItem value="banned">{t('banFilter.banned')}</MenuItem>
                <MenuItem value="notBanned">{t('banFilter.notBanned')}</MenuItem>
              </Select>
            </FormControl>

            {/* Results Count */}
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              ml: { xs: 0, md: 'auto' },
              mt: { xs: 2, md: 0 },
              px: 2,
              py: 1,
              borderRadius: 2,
              backgroundColor: (theme) => theme.palette.mode === 'dark' 
                ? 'rgba(255,255,255,0.08)' 
                : 'rgba(0,0,0,0.04)',
              flexShrink: 0,
              minWidth: 'max-content',
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
        maxWidth: '100%',
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
        <Table stickyHeader sx={{ width: '100%' }}>
          <TableHead>
            <TableRow sx={{ 
              backgroundColor: (theme) => theme.palette.mode === 'dark' 
                ? 'rgba(255,255,255,0.08)' 
                : 'rgba(0,0,0,0.08)' 
            }}>
              <TableCell sx={{ 
                fontWeight: 700, 
                fontSize: '0.85rem',
                color: (theme) => theme.palette.mode === 'dark' ? '#f44336' : '#d32f2f',
                borderBottom: (theme) => theme.palette.mode === 'dark'
                  ? '2px solid rgba(244, 67, 54, 0.3)'
                  : '2px solid rgba(244, 67, 54, 0.2)',
                fontFamily: "'Inter', 'Roboto', 'Noto Sans', 'Segoe UI', sans-serif",
                background: (theme) => theme.palette.mode === 'dark'
                  ? 'linear-gradient(135deg, rgba(50, 25, 25, 0.95) 0%, rgba(40, 20, 20, 0.95) 100%)'
                  : 'linear-gradient(135deg, rgba(255, 245, 245, 0.95) 0%, rgba(252, 240, 240, 0.95) 100%)',
                                width: '80px',
                padding: '12px 10px',
              }}>{t('avatar')}</TableCell>
              <TableCell sx={{
                fontWeight: 700, 
                fontSize: '0.85rem',
                color: (theme) => theme.palette.mode === 'dark' ? '#f44336' : '#d32f2f',
                borderBottom: (theme) => theme.palette.mode === 'dark'
                  ? '2px solid rgba(244, 67, 54, 0.3)'
                  : '2px solid rgba(244, 67, 54, 0.2)',
                fontFamily: "'Inter', 'Roboto', 'Noto Sans', 'Segoe UI', sans-serif",
                background: (theme) => theme.palette.mode === 'dark'
                  ? 'linear-gradient(135deg, rgba(50, 25, 25, 0.95) 0%, rgba(40, 20, 20, 0.95) 100%)'
                  : 'linear-gradient(135deg, rgba(255, 245, 245, 0.95) 0%, rgba(252, 240, 240, 0.95) 100%)',
                width: '16%',
                padding: '12px 10px',
              }}>{t('username')}</TableCell>
              <TableCell sx={{
                fontWeight: 700, 
                fontSize: '0.85rem',
                color: (theme) => theme.palette.mode === 'dark' ? '#f44336' : '#d32f2f',
                borderBottom: (theme) => theme.palette.mode === 'dark'
                  ? '2px solid rgba(244, 67, 54, 0.3)'
                  : '2px solid rgba(244, 67, 54, 0.2)',
                fontFamily: "'Inter', 'Roboto', 'Noto Sans', 'Segoe UI', sans-serif",
                background: (theme) => theme.palette.mode === 'dark'
                  ? 'linear-gradient(135deg, rgba(50, 25, 25, 0.95) 0%, rgba(40, 20, 20, 0.95) 100%)'
                  : 'linear-gradient(135deg, rgba(255, 245, 245, 0.95) 0%, rgba(252, 240, 240, 0.95) 100%)',
                width: '22%',
                padding: '12px 10px',
              }}>{t('email')}</TableCell>
              <TableCell sx={{
                fontWeight: 700, 
                fontSize: '0.85rem',
                color: (theme) => theme.palette.mode === 'dark' ? '#f44336' : '#d32f2f',
                borderBottom: (theme) => theme.palette.mode === 'dark'
                  ? '2px solid rgba(244, 67, 54, 0.3)'
                  : '2px solid rgba(244, 67, 54, 0.2)',
                fontFamily: "'Inter', 'Roboto', 'Noto Sans', 'Segoe UI', sans-serif",
                background: (theme) => theme.palette.mode === 'dark'
                  ? 'linear-gradient(135deg, rgba(50, 25, 25, 0.95) 0%, rgba(40, 20, 20, 0.95) 100%)'
                  : 'linear-gradient(135deg, rgba(255, 245, 245, 0.95) 0%, rgba(252, 240, 240, 0.95) 100%)',
                width: '16%',
                padding: '12px 10px',
              }}>{t('fullName')}</TableCell>
              <TableCell sx={{ 
                fontWeight: 700, 
                fontSize: '0.85rem',
                color: (theme) => theme.palette.mode === 'dark' ? '#f44336' : '#d32f2f',
                borderBottom: (theme) => theme.palette.mode === 'dark'
                  ? '2px solid rgba(244, 67, 54, 0.3)'
                  : '2px solid rgba(244, 67, 54, 0.2)',
                fontFamily: "'Inter', 'Roboto', 'Noto Sans', 'Segoe UI', sans-serif",
                background: (theme) => theme.palette.mode === 'dark'
                  ? 'linear-gradient(135deg, rgba(50, 25, 25, 0.95) 0%, rgba(40, 20, 20, 0.95) 100%)'
                  : 'linear-gradient(135deg, rgba(255, 245, 245, 0.95) 0%, rgba(252, 240, 240, 0.95) 100%)',
                display: { xs: 'none', md: 'table-cell' },
                width: '12%',
                padding: '12px 10px',
              }}>{t('phone')}</TableCell>
              <TableCell sx={{ 
                fontWeight: 700, 
                fontSize: '0.85rem',
                color: (theme) => theme.palette.mode === 'dark' ? '#f44336' : '#d32f2f',
                borderBottom: (theme) => theme.palette.mode === 'dark'
                  ? '2px solid rgba(244, 67, 54, 0.3)'
                  : '2px solid rgba(244, 67, 54, 0.2)',
                fontFamily: "'Inter', 'Roboto', 'Noto Sans', 'Segoe UI', sans-serif",
                background: (theme) => theme.palette.mode === 'dark'
                  ? 'linear-gradient(135deg, rgba(50, 25, 25, 0.95) 0%, rgba(40, 20, 20, 0.95) 100%)'
                  : 'linear-gradient(135deg, rgba(255, 245, 245, 0.95) 0%, rgba(252, 240, 240, 0.95) 100%)',
                width: '9%',
                padding: '12px 10px',
              }}>{t('role')}</TableCell>
              <TableCell sx={{ 
                fontWeight: 700, 
                fontSize: '0.85rem',
                color: (theme) => theme.palette.mode === 'dark' ? '#f44336' : '#d32f2f',
                borderBottom: (theme) => theme.palette.mode === 'dark'
                  ? '2px solid rgba(244, 67, 54, 0.3)'
                  : '2px solid rgba(244, 67, 54, 0.2)',
                fontFamily: "'Inter', 'Roboto', 'Noto Sans', 'Segoe UI', sans-serif",
                background: (theme) => theme.palette.mode === 'dark'
                  ? 'linear-gradient(135deg, rgba(50, 25, 25, 0.95) 0%, rgba(40, 20, 20, 0.95) 100%)'
                  : 'linear-gradient(135deg, rgba(255, 245, 245, 0.95) 0%, rgba(252, 240, 240, 0.95) 100%)',
                width: '9%',
                padding: '12px 10px',
              }}>{t('status')}</TableCell>
              <TableCell sx={{ 
                fontWeight: 700, 
                fontSize: '0.85rem',
                color: (theme) => theme.palette.mode === 'dark' ? '#f44336' : '#d32f2f',
                borderBottom: (theme) => theme.palette.mode === 'dark'
                  ? '2px solid rgba(244, 67, 54, 0.3)'
                  : '2px solid rgba(244, 67, 54, 0.2)',
                fontFamily: "'Inter', 'Roboto', 'Noto Sans', 'Segoe UI', sans-serif",
                background: (theme) => theme.palette.mode === 'dark'
                  ? 'linear-gradient(135deg, rgba(50, 25, 25, 0.95) 0%, rgba(40, 20, 20, 0.95) 100%)'
                  : 'linear-gradient(135deg, rgba(255, 245, 245, 0.95) 0%, rgba(252, 240, 240, 0.95) 100%)',
                display: { xs: 'none', lg: 'table-cell' },
                width: '11%',
                padding: '12px 10px',
              }}>{t('verification')}</TableCell>
              <TableCell sx={{ 
                fontWeight: 700, 
                fontSize: '0.85rem',
                color: (theme) => theme.palette.mode === 'dark' ? '#f44336' : '#d32f2f',
                borderBottom: (theme) => theme.palette.mode === 'dark'
                  ? '2px solid rgba(244, 67, 54, 0.3)'
                  : '2px solid rgba(244, 67, 54, 0.2)',
                fontFamily: "'Inter', 'Roboto', 'Noto Sans', 'Segoe UI', sans-serif",
                background: (theme) => theme.palette.mode === 'dark'
                  ? 'linear-gradient(135deg, rgba(50, 25, 25, 0.95) 0%, rgba(40, 20, 20, 0.95) 100%)'
                  : 'linear-gradient(135deg, rgba(255, 245, 245, 0.95) 0%, rgba(252, 240, 240, 0.95) 100%)',
                display: { xs: 'none', lg: 'table-cell' },
                width: '9%',
                padding: '12px 10px',
              }}>{t('addresses')}</TableCell>
              <TableCell sx={{ 
                fontWeight: 700, 
                fontSize: '0.85rem',
                color: (theme) => theme.palette.mode === 'dark' ? '#f44336' : '#d32f2f',
                borderBottom: (theme) => theme.palette.mode === 'dark'
                  ? '2px solid rgba(244, 67, 54, 0.3)'
                  : '2px solid rgba(244, 67, 54, 0.2)',
                fontFamily: "'Inter', 'Roboto', 'Noto Sans', 'Segoe UI', sans-serif",
                background: (theme) => theme.palette.mode === 'dark'
                  ? 'linear-gradient(135deg, rgba(50, 25, 25, 0.95) 0%, rgba(40, 20, 20, 0.95) 100%)'
                  : 'linear-gradient(135deg, rgba(255, 245, 245, 0.95) 0%, rgba(252, 240, 240, 0.95) 100%)',
                display: { xs: 'none', md: 'table-cell' },
                width: '13%',
                padding: '12px 10px',
              }}>{t('createdAt')}</TableCell>
              <TableCell align="right" sx={{ 
                fontWeight: 700, 
                fontSize: '0.85rem',
                color: (theme) => theme.palette.mode === 'dark' ? '#f44336' : '#d32f2f',
                borderBottom: (theme) => theme.palette.mode === 'dark'
                  ? '2px solid rgba(244, 67, 54, 0.3)'
                  : '2px solid rgba(244, 67, 54, 0.2)',
                fontFamily: "'Inter', 'Roboto', 'Noto Sans', 'Segoe UI', sans-serif",
                background: (theme) => theme.palette.mode === 'dark'
                  ? 'linear-gradient(135deg, rgba(50, 25, 25, 0.95) 0%, rgba(40, 20, 20, 0.95) 100%)'
                  : 'linear-gradient(135deg, rgba(255, 245, 245, 0.95) 0%, rgba(252, 240, 240, 0.95) 100%)',
                width: '150px',
                padding: '12px 10px',
              }}>{t('actions')}</TableCell>
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
                <TableRow key={user._id} sx={{
                  '&:hover': {
                    backgroundColor: (theme) => theme.palette.mode === 'dark'
                      ? 'rgba(255,255,255,0.05)'
                      : 'rgba(0,0,0,0.04)',
                  }
                }}>
                  <TableCell sx={{ 
                    width: '80px',
                    padding: '12px 10px',
                    fontSize: '0.85rem'
                  }}>
                    <Avatar src={user.avatar} alt={user.fullName} sx={{ width: 40, height: 40 }}>
                      {user.fullName?.charAt(0) || user.username?.charAt(0)}
                    </Avatar>
                  </TableCell>
                  <TableCell sx={{ 
                    width: '16%',
                    padding: '12px 10px',
                    fontSize: { xs: '0.8rem', md: '0.85rem' },
                    fontWeight: 500,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}>{user.username}</TableCell>
                  <TableCell sx={{ 
                    width: '22%',
                    padding: '12px 10px',
                    fontSize: '0.85rem',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}>{user.email}</TableCell>
                  <TableCell sx={{ 
                    width: '16%',
                    padding: '12px 10px',
                    fontSize: '0.85rem',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}>{user.fullName}</TableCell>
                  <TableCell sx={{ 
                    display: { xs: 'none', md: 'table-cell' },
                    width: '12%',
                    padding: '12px 10px',
                    fontSize: '0.85rem'
                  }}>{user.phone}</TableCell>
                  <TableCell sx={{ 
                    width: '9%',
                    padding: '12px 10px',
                    fontSize: '0.85rem'
                  }}>
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
                      sx={{ fontSize: '0.75rem', height: '24px' }}
                    />
                  </TableCell>
                  <TableCell sx={{ 
                    width: '9%',
                    padding: '12px 10px',
                    fontSize: '0.85rem'
                  }}>
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
                      sx={{ fontSize: '0.75rem', height: '24px' }}
                    />
                  </TableCell>
                  <TableCell sx={{ 
                    display: { xs: 'none', lg: 'table-cell' },
                    width: '11%',
                    padding: '12px 10px',
                    fontSize: '0.85rem'
                  }}>
                    <Chip
                      label={
                        user.isVerified
                          ? t('verificationStatus.verified')
                          : t('verificationStatus.unverified')
                      }
                      color={user.isVerified ? 'success' : 'default'}
                      size="small"
                      sx={{ fontSize: '0.75rem', height: '24px' }}
                    />
                  </TableCell>
                  <TableCell sx={{ 
                    display: { xs: 'none', lg: 'table-cell' },
                    width: '9%',
                    padding: '12px 10px',
                    fontSize: '0.85rem'
                  }}>
                    <Tooltip title={getDefaultAddress(user.addresses)}>
                      <Chip
                        label={`${getAddressCount(user.addresses)}`}
                        size="small"
                        variant="outlined"
                        sx={{ fontSize: '0.75rem', height: '24px' }}
                      />
                    </Tooltip>
                  </TableCell>
                  <TableCell sx={{ 
                    display: { xs: 'none', md: 'table-cell' },
                    width: '13%',
                    padding: '12px 10px',
                    fontSize: '0.85rem'
                  }}>
                    {mounted
                      ? formatDate(user.createdAt)
                      : new Date(user.createdAt).toISOString().slice(0, 10)}
                  </TableCell>
                  <TableCell align="right" sx={{ 
                    width: '150px',
                    padding: '12px 10px'
                  }}>
                    <IconButton 
                      size="medium" 
                      onClick={() => handleOpenDialog(user)} 
                      sx={{ 
                        mr: 0.5,
                        p: 1,
                        '& .MuiSvgIcon-root': { fontSize: '1.2rem' }
                      }}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton 
                      size="medium" 
                      onClick={() => handleDelete(user._id)} 
                      color="error"
                      sx={{ 
                        mr: 0.5,
                        p: 1,
                        '& .MuiSvgIcon-root': { fontSize: '1.2rem' }
                      }}
                    >
                      <DeleteIcon />
                    </IconButton>
                    {user.status === 'locked' ? (
                      <Tooltip title="Unlock user">
                        <IconButton
                          size="medium"
                          color="success"
                          onClick={() => handleUnlockUser(user)}
                          sx={{ 
                            p: 1,
                            '& .MuiSvgIcon-root': { fontSize: '1.2rem' }
                          }}
                        >
                          <LockOpenIcon />
                        </IconButton>
                      </Tooltip>
                    ) : (
                      <Tooltip title="Ban user">
                        <IconButton
                          size="medium"
                          color="warning"
                          onClick={() => handleOpenBanDialog(user)}
                          sx={{ 
                            p: 1,
                            '& .MuiSvgIcon-root': { fontSize: '1.2rem' }
                          }}
                        >
                          <BlockIcon />
                        </IconButton>
                      </Tooltip>
                    )}
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
                  backgroundColor: 'rgba(244, 67, 54, 0.08)',
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
              ? '1px solid rgba(244, 67, 54, 0.3)'
              : '1px solid rgba(244, 67, 54, 0.2)',
            borderRadius: 3,
            boxShadow: '0 20px 60px rgba(244, 67, 54, 0.3)',
          }
        }}
      >
        <DialogTitle sx={{
          background: (theme) => theme.palette.mode === 'dark'
            ? 'linear-gradient(135deg, rgba(50, 25, 25, 0.95) 0%, rgba(60, 30, 30, 0.95) 100%)'
            : 'linear-gradient(135deg, rgba(255, 245, 245, 0.95) 0%, rgba(252, 240, 240, 0.95) 100%)',
          borderBottom: (theme) => theme.palette.mode === 'dark'
            ? '1px solid rgba(244, 67, 54, 0.3)'
            : '1px solid rgba(244, 67, 54, 0.2)',
          py: 3,
          px: 4,
        }}>
          <Typography variant="h5" component="div" sx={{
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
              ? 'linear-gradient(135deg, rgba(35, 20, 20, 0.8) 0%, rgba(30, 15, 15, 0.8) 100%)'
              : 'linear-gradient(135deg, rgba(255, 252, 252, 0.8) 0%, rgba(252, 245, 245, 0.8) 100%)',
            // Custom scrollbar styling
            '&::-webkit-scrollbar': {
              width: '8px',
            },
            '&::-webkit-scrollbar-track': {
              background: (theme) => theme.palette.mode === 'dark'
                ? 'rgba(60, 30, 30, 0.3)'
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
                ? 'linear-gradient(135deg, rgba(244, 67, 54, 1) 0%, rgba(211, 47, 47, 1) 100%)'
                : 'linear-gradient(135deg, rgba(244, 67, 54, 0.8) 0%, rgba(211, 47, 47, 1) 100%)',
            },
            // Firefox scrollbar
            scrollbarWidth: 'thin',
            scrollbarColor: (theme) => theme.palette.mode === 'dark'
              ? 'rgba(244, 67, 54, 0.6) rgba(60, 30, 30, 0.3)'
              : 'rgba(244, 67, 54, 0.4) rgba(0, 0, 0, 0.05)',
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
                        color: 'error.main',
                      },
                      '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                        backgroundColor: 'error.main',
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
              ? 'linear-gradient(135deg, rgba(50, 25, 25, 0.95) 0%, rgba(60, 30, 30, 0.95) 100%)'
              : 'linear-gradient(135deg, rgba(255, 245, 245, 0.95) 0%, rgba(252, 240, 240, 0.95) 100%)',
            borderTop: (theme) => theme.palette.mode === 'dark'
              ? '1px solid rgba(244, 67, 54, 0.3)'
              : '1px solid rgba(244, 67, 54, 0.2)',
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
                background: 'linear-gradient(45deg, #f44336 30%, #d32f2f 90%)',
                boxShadow: '0 3px 5px 2px rgba(244, 67, 54, .3)',
                '&:hover': {
                  background: 'linear-gradient(45deg, #d32f2f 30%, #c62828 90%)',
                  transform: 'translateY(-1px)',
                  boxShadow: '0 6px 10px 4px rgba(244, 67, 54, .3)',
                },
                transition: 'all 0.2s ease-in-out'
              }}
            >
              {selectedUser ? t('update') : t('create')}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Dialog nhập lý do ban */}
      <Dialog 
        open={banDialog.open} 
        onClose={handleCloseBanDialog} 
        maxWidth="xs" 
        fullWidth
        PaperProps={{
          sx: {
            maxHeight: '90vh',
            background: (theme) => theme.palette.mode === 'dark'
              ? 'linear-gradient(135deg, rgba(26, 26, 46, 0.98) 0%, rgba(0, 0, 0, 0.98) 100%)'
              : 'linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, rgba(248, 250, 252, 0.98) 100%)',
            backdropFilter: 'blur(10px)',
            border: (theme) => theme.palette.mode === 'dark'
              ? '1px solid rgba(244, 67, 54, 0.3)'
              : '1px solid rgba(244, 67, 54, 0.2)',
            borderRadius: 3,
            boxShadow: '0 20px 60px rgba(244, 67, 54, 0.3)',
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
      >
        <DialogTitle sx={{
          background: (theme) => theme.palette.mode === 'dark'
            ? 'linear-gradient(135deg, rgba(50, 25, 25, 0.95) 0%, rgba(60, 30, 30, 0.95) 100%)'
            : 'linear-gradient(135deg, rgba(255, 245, 245, 0.95) 0%, rgba(252, 240, 240, 0.95) 100%)',
          borderBottom: (theme) => theme.palette.mode === 'dark'
            ? '1px solid rgba(244, 67, 54, 0.3)'
            : '1px solid rgba(244, 67, 54, 0.2)',
          py: 3,
          px: 4,
        }}>
          <Typography variant="h6" sx={{
            fontWeight: 700,
            fontFamily: "'Inter', 'Roboto', 'Noto Sans', 'Segoe UI', sans-serif",
            color: 'text.primary'
          }}>
            Ban User
          </Typography>
        </DialogTitle>
        <DialogContent sx={{
          p: 4,
          background: (theme) => theme.palette.mode === 'dark'
            ? 'linear-gradient(135deg, rgba(35, 20, 20, 0.8) 0%, rgba(30, 15, 15, 0.8) 100%)'
            : 'linear-gradient(135deg, rgba(255, 252, 252, 0.8) 0%, rgba(252, 245, 245, 0.8) 100%)',
        }}>
          <Typography mb={2} sx={{
            fontFamily: "'Inter', 'Roboto', 'Noto Sans', 'Segoe UI', sans-serif",
          }}>
            Please enter the reason for banning user <b>{banDialog.user?.username}</b>:
          </Typography>
          <TextField
            label="Ban Reason"
            value={banReason}
            onChange={e => setBanReason(e.target.value)}
            fullWidth
            multiline
            minRows={2}
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
        </DialogContent>
        <DialogActions sx={{
          background: (theme) => theme.palette.mode === 'dark'
            ? 'linear-gradient(135deg, rgba(50, 25, 25, 0.95) 0%, rgba(60, 30, 30, 0.95) 100%)'
            : 'linear-gradient(135deg, rgba(255, 245, 245, 0.95) 0%, rgba(252, 240, 240, 0.95) 100%)',
          borderTop: (theme) => theme.palette.mode === 'dark'
            ? '1px solid rgba(244, 67, 54, 0.3)'
            : '1px solid rgba(244, 67, 54, 0.2)',
          px: 4,
          py: 3,
          gap: 2,
        }}>
          <Button 
            onClick={handleCloseBanDialog}
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
            onClick={handleBanUser} 
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
                background: 'linear-gradient(45deg, #d32f2f 30%, #c62828 90%)',
                transform: 'translateY(-1px)',
                boxShadow: '0 6px 10px 4px rgba(244, 67, 54, .3)',
              },
              transition: 'all 0.2s ease-in-out'
            }}
          >
            Ban
          </Button>
        </DialogActions>
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