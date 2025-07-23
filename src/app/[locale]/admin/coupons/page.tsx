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
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import api from '@/services/api';
import { API_ENDPOINTS } from '@/lib/constants/constants';
import { useTranslations } from 'next-intl';
import dayjs from 'dayjs';

interface Coupon {
  _id: string;
  code: string;
  type: 'percentage' | 'fixed';
  value: number;
  minOrderValue: number;
  maxUsage: number;
  used: number;
  expiresAt: string;
  isActive: boolean;
}

const defaultForm: Partial<Coupon> = {
  code: '',
  type: 'percentage',
  value: 0,
  minOrderValue: 0,
  maxUsage: 1,
  expiresAt: '',
  isActive: true,
};

export default function CouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [editCoupon, setEditCoupon] = useState<Coupon | null>(null);
  const [form, setForm] = useState<Partial<Coupon>>(defaultForm);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({ open: false, message: '', severity: 'success' });
  const [confirmDelete, setConfirmDelete] = useState<{ open: boolean; coupon: Coupon | null }>({
    open: false,
    coupon: null,
  });

  const t = useTranslations('admin.coupons');

  const fetchCoupons = async () => {
    setLoading(true);
    try {
      const res = await api.get<{ data: Coupon[] }>(API_ENDPOINTS.ADMIN.COUPONS);
      setCoupons(res.data.data || []);
    } catch {
      setCoupons([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const handleOpenDialog = (coupon?: Coupon) => {
    if (coupon) {
      setEditCoupon(coupon);
      setForm({ ...coupon, expiresAt: dayjs(coupon.expiresAt).format('YYYY-MM-DD') });
    } else {
      setEditCoupon(null);
      setForm(defaultForm);
    }
    setOpenDialog(true);
  };
  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditCoupon(null);
    setForm(defaultForm);
  };

  const handleFormChange = (field: keyof Coupon) => (e: React.ChangeEvent<HTMLInputElement> | { target: { value: string } }) => {
    setForm(prev => ({ ...prev, [field]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Validate
    if (!form.code || !form.value || !form.minOrderValue || !form.maxUsage || !form.expiresAt) {
      setSnackbar({ open: true, message: t('errors.required'), severity: 'error' });
      return;
    }
    if (form.value <= 0 || form.minOrderValue <= 0 || form.maxUsage <= 0) {
      setSnackbar({ open: true, message: t('errors.positive'), severity: 'error' });
      return;
    }
    try {
      if (editCoupon) {
        await api.patch(`${API_ENDPOINTS.ADMIN.COUPONS}/${editCoupon._id}`, form);
        setSnackbar({ open: true, message: t('updated'), severity: 'success' });
      } else {
        await api.post(API_ENDPOINTS.ADMIN.COUPONS, form);
        setSnackbar({ open: true, message: t('created'), severity: 'success' });
      }
      handleCloseDialog();
      fetchCoupons();
    } catch (err: unknown) {
      setSnackbar({
        open: true,
        message: (err as { response?: { data?: { message?: string } } })?.response?.data?.message || t('errors.server'),
        severity: 'error',
      });
    }
  };

  const handleDelete = async () => {
    if (!confirmDelete.coupon) return;
    try {
      await api.delete(`${API_ENDPOINTS.ADMIN.COUPONS}/${confirmDelete.coupon._id}`);
      setSnackbar({ open: true, message: t('deleted'), severity: 'success' });
      setConfirmDelete({ open: false, coupon: null });
      fetchCoupons();
    } catch {
      setSnackbar({ open: true, message: t('errors.server'), severity: 'error' });
    }
  };

  // Helper: highlight sắp hết hạn (3 ngày)
  const isExpiringSoon = (expiresAt: string) => {
    const now = dayjs();
    const exp = dayjs(expiresAt);
    return exp.diff(now, 'day') <= 3 && exp.isAfter(now);
  };

  return (
    <Box sx={{ 
      width: '100%', 
      maxWidth: 1600, 
      mx: 'auto', 
      p: { xs: 1, md: 3 }, 
      overflowX: 'auto',
      background: 'transparent',
      minHeight: '100vh',
    }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography 
          variant="h4" 
          sx={{
            fontWeight: 700,
            fontFamily: "'Inter', 'Roboto', 'Noto Sans', 'Segoe UI', sans-serif",
            background: 'linear-gradient(45deg, #f44336 30%, #d32f2f 90%)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            textShadow: '0 2px 4px rgba(244, 67, 54, 0.3)',
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
      <TableContainer 
        component={Paper}
        sx={{
          background: (theme) => theme.palette.mode === 'dark'
            ? 'linear-gradient(135deg, rgba(26, 26, 46, 0.95) 0%, rgba(22, 22, 39, 0.95) 100%)'
            : 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.95) 100%)',
          backdropFilter: 'blur(10px)',
          border: (theme) => theme.palette.mode === 'dark'
            ? '1px solid rgba(244, 67, 54, 0.2)'
            : '1px solid rgba(244, 67, 54, 0.1)',
          borderRadius: 3,
          boxShadow: '0 8px 32px rgba(244, 67, 54, 0.15)',
        }}
      >
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{
                background: (theme) => theme.palette.mode === 'dark'
                  ? 'linear-gradient(135deg, rgba(50, 25, 25, 0.95) 0%, rgba(40, 20, 20, 0.95) 100%)'
                  : 'linear-gradient(135deg, rgba(255, 245, 245, 0.95) 0%, rgba(252, 240, 240, 0.95) 100%)',
                fontWeight: 700,
                fontFamily: "'Inter', 'Roboto', 'Noto Sans', 'Segoe UI', sans-serif",
                color: (theme) => theme.palette.mode === 'dark' ? '#f44336' : '#d32f2f',
                borderBottom: (theme) => theme.palette.mode === 'dark'
                  ? '2px solid rgba(244, 67, 54, 0.3)'
                  : '2px solid rgba(244, 67, 54, 0.2)',
              }}>{t('code')}</TableCell>
              <TableCell sx={{
                background: (theme) => theme.palette.mode === 'dark'
                  ? 'linear-gradient(135deg, rgba(50, 25, 25, 0.95) 0%, rgba(40, 20, 20, 0.95) 100%)'
                  : 'linear-gradient(135deg, rgba(255, 245, 245, 0.95) 0%, rgba(252, 240, 240, 0.95) 100%)',
                fontWeight: 700,
                fontFamily: "'Inter', 'Roboto', 'Noto Sans', 'Segoe UI', sans-serif",
                color: (theme) => theme.palette.mode === 'dark' ? '#f44336' : '#d32f2f',
                borderBottom: (theme) => theme.palette.mode === 'dark'
                  ? '2px solid rgba(244, 67, 54, 0.3)'
                  : '2px solid rgba(244, 67, 54, 0.2)',
              }}>{t('type')}</TableCell>
              <TableCell sx={{
                background: (theme) => theme.palette.mode === 'dark'
                  ? 'linear-gradient(135deg, rgba(50, 25, 25, 0.95) 0%, rgba(40, 20, 20, 0.95) 100%)'
                  : 'linear-gradient(135deg, rgba(255, 245, 245, 0.95) 0%, rgba(252, 240, 240, 0.95) 100%)',
                fontWeight: 700,
                fontFamily: "'Inter', 'Roboto', 'Noto Sans', 'Segoe UI', sans-serif",
                color: (theme) => theme.palette.mode === 'dark' ? '#f44336' : '#d32f2f',
                borderBottom: (theme) => theme.palette.mode === 'dark'
                  ? '2px solid rgba(244, 67, 54, 0.3)'
                  : '2px solid rgba(244, 67, 54, 0.2)',
              }}>{t('value')}</TableCell>
              <TableCell sx={{
                background: (theme) => theme.palette.mode === 'dark'
                  ? 'linear-gradient(135deg, rgba(50, 25, 25, 0.95) 0%, rgba(40, 20, 20, 0.95) 100%)'
                  : 'linear-gradient(135deg, rgba(255, 245, 245, 0.95) 0%, rgba(252, 240, 240, 0.95) 100%)',
                fontWeight: 700,
                fontFamily: "'Inter', 'Roboto', 'Noto Sans', 'Segoe UI', sans-serif",
                color: (theme) => theme.palette.mode === 'dark' ? '#f44336' : '#d32f2f',
                borderBottom: (theme) => theme.palette.mode === 'dark'
                  ? '2px solid rgba(244, 67, 54, 0.3)'
                  : '2px solid rgba(244, 67, 54, 0.2)',
              }}>{t('minOrderValue')}</TableCell>
              <TableCell sx={{
                background: (theme) => theme.palette.mode === 'dark'
                  ? 'linear-gradient(135deg, rgba(50, 25, 25, 0.95) 0%, rgba(40, 20, 20, 0.95) 100%)'
                  : 'linear-gradient(135deg, rgba(255, 245, 245, 0.95) 0%, rgba(252, 240, 240, 0.95) 100%)',
                fontWeight: 700,
                fontFamily: "'Inter', 'Roboto', 'Noto Sans', 'Segoe UI', sans-serif",
                color: (theme) => theme.palette.mode === 'dark' ? '#f44336' : '#d32f2f',
                borderBottom: (theme) => theme.palette.mode === 'dark'
                  ? '2px solid rgba(244, 67, 54, 0.3)'
                  : '2px solid rgba(244, 67, 54, 0.2)',
              }}>{t('used')}</TableCell>
              <TableCell sx={{
                background: (theme) => theme.palette.mode === 'dark'
                  ? 'linear-gradient(135deg, rgba(50, 25, 25, 0.95) 0%, rgba(40, 20, 20, 0.95) 100%)'
                  : 'linear-gradient(135deg, rgba(255, 245, 245, 0.95) 0%, rgba(252, 240, 240, 0.95) 100%)',
                fontWeight: 700,
                fontFamily: "'Inter', 'Roboto', 'Noto Sans', 'Segoe UI', sans-serif",
                color: (theme) => theme.palette.mode === 'dark' ? '#f44336' : '#d32f2f',
                borderBottom: (theme) => theme.palette.mode === 'dark'
                  ? '2px solid rgba(244, 67, 54, 0.3)'
                  : '2px solid rgba(244, 67, 54, 0.2)',
              }}>{t('expiresAt')}</TableCell>
              <TableCell sx={{
                background: (theme) => theme.palette.mode === 'dark'
                  ? 'linear-gradient(135deg, rgba(50, 25, 25, 0.95) 0%, rgba(40, 20, 20, 0.95) 100%)'
                  : 'linear-gradient(135deg, rgba(255, 245, 245, 0.95) 0%, rgba(252, 240, 240, 0.95) 100%)',
                fontWeight: 700,
                fontFamily: "'Inter', 'Roboto', 'Noto Sans', 'Segoe UI', sans-serif",
                color: (theme) => theme.palette.mode === 'dark' ? '#f44336' : '#d32f2f',
                borderBottom: (theme) => theme.palette.mode === 'dark'
                  ? '2px solid rgba(244, 67, 54, 0.3)'
                  : '2px solid rgba(244, 67, 54, 0.2)',
              }}>{t('status')}</TableCell>
              <TableCell align="right" sx={{
                background: (theme) => theme.palette.mode === 'dark'
                  ? 'linear-gradient(135deg, rgba(50, 25, 25, 0.95) 0%, rgba(40, 20, 20, 0.95) 100%)'
                  : 'linear-gradient(135deg, rgba(255, 245, 245, 0.95) 0%, rgba(252, 240, 240, 0.95) 100%)',
                fontWeight: 700,
                fontFamily: "'Inter', 'Roboto', 'Noto Sans', 'Segoe UI', sans-serif",
                color: (theme) => theme.palette.mode === 'dark' ? '#f44336' : '#d32f2f',
                borderBottom: (theme) => theme.palette.mode === 'dark'
                  ? '2px solid rgba(244, 67, 54, 0.3)'
                  : '2px solid rgba(244, 67, 54, 0.2)',
              }}>{t('actions')}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={8} align="center" sx={{
                  fontFamily: "'Inter', 'Roboto', 'Noto Sans', 'Segoe UI', sans-serif",
                  py: 4,
                }}>
                  Loading...
                </TableCell>
              </TableRow>
            ) : coupons.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} align="center" sx={{
                  fontFamily: "'Inter', 'Roboto', 'Noto Sans', 'Segoe UI', sans-serif",
                  py: 4,
                }}>
                  {t('empty')}
                </TableCell>
              </TableRow>
            ) : (
              coupons.map(coupon => (
                <TableRow
                  key={coupon._id}
                  sx={{
                    bgcolor: isExpiringSoon(coupon.expiresAt) 
                      ? 'rgba(255, 251, 230, 0.3)' 
                      : 'transparent',
                    '&:hover': {
                      background: (theme) => theme.palette.mode === 'dark'
                        ? 'linear-gradient(135deg, rgba(50, 25, 25, 0.1) 0%, rgba(40, 20, 20, 0.1) 100%)'
                        : 'linear-gradient(135deg, rgba(255, 245, 245, 0.3) 0%, rgba(252, 240, 240, 0.3) 100%)',
                      transform: 'translateY(-1px)',
                      boxShadow: '0 4px 8px rgba(244, 67, 54, 0.1)',
                    },
                    transition: 'all 0.2s ease-in-out',
                  }}
                >
                  <TableCell sx={{
                    fontFamily: "'Inter', 'Roboto', 'Noto Sans', 'Segoe UI', sans-serif",
                    fontWeight: 600,
                  }}>{coupon.code}</TableCell>
                  <TableCell sx={{
                    fontFamily: "'Inter', 'Roboto', 'Noto Sans', 'Segoe UI', sans-serif",
                  }}>
                    <Chip
                      label={coupon.type === 'percentage' ? '%' : '₫'}
                      color={coupon.type === 'percentage' ? 'primary' : 'secondary'}
                      size="small"
                      sx={{
                        fontFamily: "'Inter', 'Roboto', 'Noto Sans', 'Segoe UI', sans-serif",
                        fontWeight: 600,
                      }}
                    />
                  </TableCell>
                  <TableCell sx={{
                    fontFamily: "'Inter', 'Roboto', 'Noto Sans', 'Segoe UI', sans-serif",
                    fontWeight: 500,
                  }}>
                    {coupon.type === 'percentage'
                      ? `${coupon.value}%`
                      : `${coupon.value.toLocaleString()}₫`}
                  </TableCell>
                  <TableCell sx={{
                    fontFamily: "'Inter', 'Roboto', 'Noto Sans', 'Segoe UI', sans-serif",
                  }}>{coupon.minOrderValue.toLocaleString()}₫</TableCell>
                  <TableCell sx={{
                    fontFamily: "'Inter', 'Roboto', 'Noto Sans', 'Segoe UI', sans-serif",
                  }}>
                    {coupon.used} / {coupon.maxUsage}
                  </TableCell>
                  <TableCell sx={{
                    fontFamily: "'Inter', 'Roboto', 'Noto Sans', 'Segoe UI', sans-serif",
                  }}>
                    <Tooltip title={dayjs(coupon.expiresAt).format('YYYY-MM-DD HH:mm')}>
                      <span>{dayjs(coupon.expiresAt).format('YYYY-MM-DD')}</span>
                    </Tooltip>
                  </TableCell>
                  <TableCell sx={{
                    fontFamily: "'Inter', 'Roboto', 'Noto Sans', 'Segoe UI', sans-serif",
                  }}>
                    <Chip
                      label={coupon.isActive ? t('active') : t('expired')}
                      color={coupon.isActive ? 'success' : ('default' as const)}
                      size="small"
                      sx={{
                        fontFamily: "'Inter', 'Roboto', 'Noto Sans', 'Segoe UI', sans-serif",
                        fontWeight: 600,
                      }}
                    />
                  </TableCell>
                  <TableCell align="right">
                    <IconButton 
                      size="small" 
                      onClick={() => handleOpenDialog(coupon)}
                      sx={{
                        color: '#f44336',
                        '&:hover': {
                          background: 'rgba(244, 67, 54, 0.1)',
                          transform: 'scale(1.1)',
                        },
                        transition: 'all 0.2s ease-in-out',
                        mr: 1,
                      }}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => setConfirmDelete({ open: true, coupon })}
                      sx={{
                        color: '#f44336',
                        '&:hover': {
                          background: 'rgba(244, 67, 54, 0.1)',
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
      {/* Form Dialog */}
      <Dialog 
        open={openDialog} 
        onClose={handleCloseDialog} 
        maxWidth="sm" 
        fullWidth
        PaperProps={{
          sx: {
            maxHeight: '85vh',
            overflow: 'hidden',
            background: (theme) => theme.palette.mode === 'dark'
              ? 'linear-gradient(135deg, rgba(26, 26, 46, 0.98) 0%, rgba(0, 0, 0, 0.98) 100%)'
              : 'linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, rgba(248, 250, 252, 0.98) 100%)',
            backdropFilter: 'blur(10px)',
            border: (theme) => theme.palette.mode === 'dark'
              ? '1px solid rgba(244, 67, 54, 0.3)'
              : '1px solid rgba(244, 67, 54, 0.2)',
            borderRadius: 3,
            boxShadow: '0 20px 60px rgba(244, 67, 54, 0.3)',
            '&::-webkit-scrollbar': {
              display: 'none',
            },
            '-ms-overflow-style': 'none',
            'scrollbar-width': 'none',
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
            {editCoupon ? t('edit') : t('addNew')}
          </Typography>
        </DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent sx={{
            p: 4,
            overflow: 'hidden',
            maxHeight: 'calc(85vh - 180px)',
            background: (theme) => theme.palette.mode === 'dark'
              ? 'linear-gradient(135deg, rgba(35, 20, 20, 0.8) 0%, rgba(30, 15, 15, 0.8) 100%)'
              : 'linear-gradient(135deg, rgba(255, 252, 252, 0.8) 0%, rgba(252, 245, 245, 0.8) 100%)',
            '&::-webkit-scrollbar': {
              display: 'none',
            },
            '-ms-overflow-style': 'none',
            'scrollbar-width': 'none',
          }}>
            <Stack spacing={2}>
              <TextField
                label={t('code')}
                value={form.code}
                onChange={handleFormChange('code')}
                required
                fullWidth
                inputProps={{ maxLength: 20 }}
                disabled={!!editCoupon}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    fontFamily: "'Inter', 'Roboto', 'Noto Sans', 'Segoe UI', sans-serif",
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#f44336',
                    },
                  },
                  '& .MuiInputBase-input': {
                    fontFamily: "'Inter', 'Roboto', 'Noto Sans', 'Segoe UI', sans-serif",
                  },
                  '& .MuiInputLabel-root': {
                    fontFamily: "'Inter', 'Roboto', 'Noto Sans', 'Segoe UI', sans-serif",
                    '&.Mui-focused': {
                      color: '#f44336',
                    },
                  },
                }}
              />
              <FormControl fullWidth required sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  fontFamily: "'Inter', 'Roboto', 'Noto Sans', 'Segoe UI', sans-serif",
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#f44336',
                  },
                },
                '& .MuiInputLabel-root': {
                  fontFamily: "'Inter', 'Roboto', 'Noto Sans', 'Segoe UI', sans-serif",
                  '&.Mui-focused': {
                    color: '#f44336',
                  },
                },
              }}>
                <InputLabel>{t('type')}</InputLabel>
                <Select
                  value={form.type}
                  onChange={handleFormChange('type')}
                  label={t('type')}
                  sx={{
                    fontFamily: "'Inter', 'Roboto', 'Noto Sans', 'Segoe UI', sans-serif",
                  }}
                >
                  <MenuItem value="percentage" sx={{
                    fontFamily: "'Inter', 'Roboto', 'Noto Sans', 'Segoe UI', sans-serif",
                  }}>%</MenuItem>
                  <MenuItem value="fixed" sx={{
                    fontFamily: "'Inter', 'Roboto', 'Noto Sans', 'Segoe UI', sans-serif",
                  }}>₫</MenuItem>
                </Select>
              </FormControl>
              <TextField
                label={t('value')}
                type="number"
                value={form.value}
                onChange={handleFormChange('value')}
                required
                fullWidth
                inputProps={{ min: 1 }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    fontFamily: "'Inter', 'Roboto', 'Noto Sans', 'Segoe UI', sans-serif",
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#f44336',
                    },
                  },
                  '& .MuiInputBase-input': {
                    fontFamily: "'Inter', 'Roboto', 'Noto Sans', 'Segoe UI', sans-serif",
                  },
                  '& .MuiInputLabel-root': {
                    fontFamily: "'Inter', 'Roboto', 'Noto Sans', 'Segoe UI', sans-serif",
                    '&.Mui-focused': {
                      color: '#f44336',
                    },
                  },
                }}
              />
              <TextField
                label={t('minOrderValue')}
                type="number"
                value={form.minOrderValue}
                onChange={handleFormChange('minOrderValue')}
                required
                fullWidth
                inputProps={{ min: 1 }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    fontFamily: "'Inter', 'Roboto', 'Noto Sans', 'Segoe UI', sans-serif",
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#f44336',
                    },
                  },
                  '& .MuiInputBase-input': {
                    fontFamily: "'Inter', 'Roboto', 'Noto Sans', 'Segoe UI', sans-serif",
                  },
                  '& .MuiInputLabel-root': {
                    fontFamily: "'Inter', 'Roboto', 'Noto Sans', 'Segoe UI', sans-serif",
                    '&.Mui-focused': {
                      color: '#f44336',
                    },
                  },
                }}
              />
              <TextField
                label={t('maxUsage')}
                type="number"
                value={form.maxUsage}
                onChange={handleFormChange('maxUsage')}
                required
                fullWidth
                inputProps={{ min: 1 }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    fontFamily: "'Inter', 'Roboto', 'Noto Sans', 'Segoe UI', sans-serif",
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#f44336',
                    },
                  },
                  '& .MuiInputBase-input': {
                    fontFamily: "'Inter', 'Roboto', 'Noto Sans', 'Segoe UI', sans-serif",
                  },
                  '& .MuiInputLabel-root': {
                    fontFamily: "'Inter', 'Roboto', 'Noto Sans', 'Segoe UI', sans-serif",
                    '&.Mui-focused': {
                      color: '#f44336',
                    },
                  },
                }}
              />
              <TextField
                label={t('expiresAt')}
                type="date"
                value={form.expiresAt}
                onChange={handleFormChange('expiresAt')}
                required
                fullWidth
                InputLabelProps={{ shrink: true }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    fontFamily: "'Inter', 'Roboto', 'Noto Sans', 'Segoe UI', sans-serif",
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#f44336',
                    },
                  },
                  '& .MuiInputBase-input': {
                    fontFamily: "'Inter', 'Roboto', 'Noto Sans', 'Segoe UI', sans-serif",
                  },
                  '& .MuiInputLabel-root': {
                    fontFamily: "'Inter', 'Roboto', 'Noto Sans', 'Segoe UI', sans-serif",
                    '&.Mui-focused': {
                      color: '#f44336',
                    },
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
              {editCoupon ? t('update') : t('create')}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
      {/* Confirm Delete Dialog */}
      <Dialog
        open={confirmDelete.open}
        onClose={() => setConfirmDelete({ open: false, coupon: null })}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: {
            overflow: 'hidden',
            background: (theme) => theme.palette.mode === 'dark'
              ? 'linear-gradient(135deg, rgba(26, 26, 46, 0.98) 0%, rgba(0, 0, 0, 0.98) 100%)'
              : 'linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, rgba(248, 250, 252, 0.98) 100%)',
            backdropFilter: 'blur(10px)',
            border: (theme) => theme.palette.mode === 'dark'
              ? '1px solid rgba(244, 67, 54, 0.3)'
              : '1px solid rgba(244, 67, 54, 0.2)',
            borderRadius: 3,
            boxShadow: '0 20px 60px rgba(244, 67, 54, 0.3)',
            '&::-webkit-scrollbar': {
              display: 'none',
            },
            '-ms-overflow-style': 'none',
            'scrollbar-width': 'none',
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
            {t('confirmDeleteTitle')}
          </Typography>
        </DialogTitle>
        <DialogContent sx={{
          p: 4,
          background: (theme) => theme.palette.mode === 'dark'
            ? 'linear-gradient(135deg, rgba(35, 20, 20, 0.8) 0%, rgba(30, 15, 15, 0.8) 100%)'
            : 'linear-gradient(135deg, rgba(255, 252, 252, 0.8) 0%, rgba(252, 245, 245, 0.8) 100%)',
        }}>
          <Typography sx={{
            fontFamily: "'Inter', 'Roboto', 'Noto Sans', 'Segoe UI', sans-serif",
          }}>
          {t('confirmDeleteMsg', { code: confirmDelete.coupon?.code ?? '' })}
          </Typography>
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
            onClick={() => setConfirmDelete({ open: false, coupon: null })}
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
            onClick={handleDelete} 
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
            {t('delete')}
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
