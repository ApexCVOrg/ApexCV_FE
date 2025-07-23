'use client';

import React, { useState, useEffect } from 'react';
import {
  Typography,
  Box,
  Button,
  TextField,
  Alert,
  CircularProgress,
  InputAdornment,
  Chip,
  Avatar,
  useTheme,
  useMediaQuery,
  Container,
} from '@mui/material';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import Person from '@mui/icons-material/Person';
import Email from '@mui/icons-material/Email';
import Phone from '@mui/icons-material/Phone';
import VerifiedUser from '@mui/icons-material/VerifiedUser';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import LockIcon from '@mui/icons-material/Lock';
import Height from '@mui/icons-material/Height';
import MonitorWeight from '@mui/icons-material/MonitorWeight';
import Straighten from '@mui/icons-material/Straighten';
import { profileService, UserProfile, Address } from '@/services/profile';
import { validateProfileData } from '@/lib/utils/profileValidation';
import { styled } from '@mui/material/styles';
import { useTheme as useCustomTheme } from '@/hooks/useTheme';
import { THEME } from '@/lib/constants/constants';

const ProfileHeader = styled(Box)(({ theme }) => ({
  background: theme.palette.mode === 'dark' 
    ? 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)'
    : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  borderBottom: `1px solid ${theme.palette.mode === 'dark' ? '#333' : '#e0e0e0'}`,
  padding: '80px 0 32px 0',
  textAlign: 'center',
  color: '#fff',
  position: 'relative',
  overflow: 'hidden',
  fontFamily: '"Be Vietnam Pro", "Inter", "Roboto", "Helvetica", "Arial", sans-serif',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.05"%3E%3Ccircle cx="30" cy="30" r="2"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
    opacity: 0.3,
  },
}));

const ProfileCard = styled(Box)(({ theme }) => ({
  borderRadius: 28,
  boxShadow: theme.palette.mode === 'dark' 
    ? '0 8px 32px rgba(0,0,0,0.4)'
    : '0 8px 32px rgba(0,0,0,0.1)',
  padding: theme.spacing(0, 0, 4, 0),
  background: theme.palette.mode === 'dark' ? '#1a1a1a' : '#fff',
  maxWidth: 800,
  margin: 'auto',
  marginTop: -32,
  position: 'relative',
  zIndex: 2,
  border: `1px solid ${theme.palette.mode === 'dark' ? '#333' : '#e0e0e0'}`,
  backdropFilter: 'blur(10px)',
  transition: 'all 0.3s ease',
  fontFamily: '"Be Vietnam Pro", "Inter", "Roboto", "Helvetica", "Arial", sans-serif',
  '&:hover': {
    boxShadow: theme.palette.mode === 'dark' 
      ? '0 12px 48px rgba(0,0,0,0.6)'
      : '0 12px 48px rgba(0,0,0,0.15)',
    transform: 'translateY(-2px)',
  },
}));

const ModernInput = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: 16,
    background: theme.palette.mode === 'dark' ? '#2a2a2a' : '#fafafa',
    transition: 'all 0.3s ease',
    fontFamily: '"Be Vietnam Pro", "Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    '& fieldset': {
      borderColor: theme.palette.mode === 'dark' ? '#444' : '#bdbdbd',
      borderWidth: 2,
      transition: 'border-color 0.3s ease',
    },
    '&:hover fieldset': {
      borderColor: theme.palette.mode === 'dark' ? '#666' : '#222',
    },
    '&.Mui-focused fieldset': {
      borderColor: theme.palette.mode === 'dark' ? '#90caf9' : '#1976d2',
      borderWidth: 2,
    },
    '&:hover': {
      background: theme.palette.mode === 'dark' ? '#333' : '#f5f5f5',
      transform: 'translateY(-1px)',
    },
  },
  '& .MuiInputLabel-root': {
    color: theme.palette.mode === 'dark' ? '#ccc' : '#222',
    fontWeight: 600,
    fontSize: 15,
    transition: 'color 0.3s ease',
    fontFamily: '"Be Vietnam Pro", "Inter", "Roboto", "Helvetica", "Arial", sans-serif',
  },
  '& .MuiInputBase-input': {
    color: theme.palette.mode === 'dark' ? '#fff' : '#000',
    fontFamily: '"Be Vietnam Pro", "Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    '&::placeholder': {
      color: theme.palette.mode === 'dark' ? '#888' : '#666',
    },
  },
  '& .MuiInputAdornment-root': {
    color: theme.palette.mode === 'dark' ? '#888' : '#666',
  },
}));

const ModernButton = styled(Button)(({ theme }) => ({
  borderRadius: 24,
  fontWeight: 700,
  fontSize: '1rem',
  padding: '12px 32px',
  textTransform: 'none',
  boxShadow: theme.palette.mode === 'dark' 
    ? '0 4px 16px rgba(0,0,0,0.3)'
    : '0 4px 16px rgba(0,0,0,0.1)',
  background: theme.palette.mode === 'dark' 
    ? 'linear-gradient(45deg, #1976d2, #42a5f5)'
    : 'linear-gradient(45deg, #1976d2, #42a5f5)',
  color: '#fff',
  transition: 'all 0.3s ease',
  fontFamily: '"Be Vietnam Pro", "Inter", "Roboto", "Helvetica", "Arial", sans-serif',
  '&:hover': {
    background: theme.palette.mode === 'dark' 
      ? 'linear-gradient(45deg, #1565c0, #1976d2)'
      : 'linear-gradient(45deg, #1565c0, #1976d2)',
    color: '#fff',
    transform: 'translateY(-2px)',
    boxShadow: theme.palette.mode === 'dark' 
      ? '0 8px 24px rgba(0,0,0,0.4)'
      : '0 8px 24px rgba(0,0,0,0.2)',
  },
  '&.Mui-disabled': {
    background: theme.palette.mode === 'dark' ? '#444' : '#e0e0e0',
    color: theme.palette.mode === 'dark' ? '#888' : '#888',
    transform: 'none',
  },
}));

const AddressCard = styled(Box)(({ theme }) => ({
  background: theme.palette.mode === 'dark' ? '#2a2a2a' : '#fafafa',
  borderRadius: 20,
  boxShadow: theme.palette.mode === 'dark' 
    ? '0 4px 16px rgba(0,0,0,0.3)'
    : '0 4px 16px rgba(0,0,0,0.08)',
  padding: theme.spacing(3),
  marginBottom: theme.spacing(3),
  position: 'relative',
  border: `1px solid ${theme.palette.mode === 'dark' ? '#444' : '#e0e0e0'}`,
  transition: 'all 0.3s ease',
  backdropFilter: 'blur(10px)',
  fontFamily: '"Be Vietnam Pro", "Inter", "Roboto", "Helvetica", "Arial", sans-serif',
  '&:hover': {
    boxShadow: theme.palette.mode === 'dark' 
      ? '0 8px 32px rgba(0,0,0,0.5)'
      : '0 8px 32px rgba(0,0,0,0.15)',
    transform: 'translateY(-4px)',
  },
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '4px',
    background: 'linear-gradient(90deg, #667eea, #764ba2)',
    borderRadius: '20px 20px 0 0',
  },
}));

const SectionTitle = styled(Typography)(({ theme }) => ({
  fontWeight: 800,
  marginBottom: theme.spacing(2),
  color: theme.palette.mode === 'dark' ? '#fff' : '#1a1a1a',
  position: 'relative',
  fontFamily: '"Be Vietnam Pro", "Inter", "Roboto", "Helvetica", "Arial", sans-serif',
  '&::after': {
    content: '""',
    position: 'absolute',
    bottom: -8,
    left: 0,
    width: 60,
    height: 4,
    background: 'linear-gradient(90deg, #667eea, #764ba2)',
    borderRadius: 2,
  },
}));

export default function ProfilePage() {
  const t = useTranslations('profile');
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const theme = useTheme();
  const { theme: customTheme } = useCustomTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    addresses: [] as Address[],
    height: '',
    weight: '',
    footLength: '',
  });

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login');
      return;
    }

    const fetchUserData = async () => {
      try {
        setLoading(true);
        const userData = await profileService.getProfile();
        setUser(userData);
        setFormData({
          fullName: userData.fullName || '',
          email: userData.email || '',
          phone: userData.phone || '',
          addresses: userData.addresses || [],
          height: userData.height?.toString() || '',
          weight: userData.weight?.toString() || '',
          footLength: userData.footLength?.toString() || '',
        });
        console.log('Loaded user data - Original footLength (mm):', userData.footLength);
        console.log('FootLength (mm):', userData.footLength || 'N/A');
      } catch {
        setError('Failed to load user data');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [router, isAuthenticated]);

  const handleEdit = () => setIsEditing(true);
  const handleCancel = () => {
    setIsEditing(false);
    setFormData({
      fullName: user?.fullName || '',
      email: user?.email || '',
      phone: user?.phone || '',
      addresses: user?.addresses || [],
      height: user?.height?.toString() || '',
      weight: user?.weight?.toString() || '',
      footLength: user?.footLength?.toString() || '',
    });
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      setError(null);

      const updateData = {
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        addresses: formData.addresses,
        height: formData.height ? parseFloat(formData.height) : undefined,
        weight: formData.weight ? parseFloat(formData.weight) : undefined,
        footLength: formData.footLength ? parseFloat(formData.footLength) : undefined,
      };

      console.log('Form data before validation:', formData);
      console.log('Form footLength type:', typeof formData.footLength, 'value:', formData.footLength);
      console.log('Update data for validation:', updateData);
      console.log('Update footLength type:', typeof updateData.footLength, 'value:', updateData.footLength);

      const validation = validateProfileData(updateData);
      console.log('Validation result:', validation);
      
      if (!validation.isValid) {
        setError(validation.errors.join(', '));
        return;
      }

      if (formData.email !== user?.email) {
        const token = localStorage.getItem('auth_token');
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || 'https://nidas-be.onrender.com/api'}/auth/send-email-change-verification`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ email: formData.email }),
          }
        );
        const data: { message?: string } = await response.json();
        if (!response.ok) {
          setError(data.message || 'Failed to send verification code');
          return;
        }
        localStorage.setItem('pendingEmail', formData.email);
        router.push('/auth/verify-email');
        return;
      }

      console.log('Sending update data:', updateData);

      const updatedUser = await profileService.updateProfile(updateData);
      setUser(updatedUser);
      setIsEditing(false);
    } catch (error: unknown) {
      console.error('Profile update error:', error);
      if (error && typeof error === 'object' && 'response' in error && error.response && typeof error.response === 'object' && 'data' in error.response && error.response.data && typeof error.response.data === 'object' && 'message' in error.response.data) {
        setError((error.response.data as { message: string }).message);
      } else if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('Failed to update profile');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddressChange = (index: number, field: keyof Address, value: string) => {
    setFormData(prev => ({
      ...prev,
      addresses: prev.addresses.map((addr, i) =>
        i === index ? { ...addr, [field]: value } : addr
      ),
    }));
  };

  const handleAddAddress = () => {
    setFormData(prev => ({
      ...prev,
      addresses: [
        ...prev.addresses,
        {
          recipientName: '',
          street: '',
          city: '',
          state: '',
          country: '',
          addressNumber: '',
          isDefault: false,
        },
      ],
    }));
  };

  const handleDeleteAddress = (index: number) => {
    setFormData(prev => ({
      ...prev,
      addresses: prev.addresses.filter((_, i) => i !== index),
    }));
  };

  if (loading) {
    return (
      <Box 
        display="flex" 
        justifyContent="center" 
        alignItems="center" 
        minHeight="80vh"
        bgcolor={customTheme === THEME.LIGHT ? '#f5f5f5' : '#000'}
      >
        <CircularProgress 
          size={60} 
          sx={{ 
            color: customTheme === THEME.LIGHT ? '#1976d2' : '#90caf9' 
          }} 
        />
      </Box>
    );
  }

  return (
    <Box sx={{ 
      minHeight: '100vh', 
      background: customTheme === THEME.LIGHT 
        ? 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)'
        : 'linear-gradient(135deg, #0f0f23 0%, #1a1a2e 100%)',
      fontFamily: '"Be Vietnam Pro", "Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    }}>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        <ProfileHeader>
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Avatar
              src={user?.avatar}
              sx={{
                width: 128,
                height: 128,
                margin: '0 auto',
                boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
                border: '4px solid rgba(255,255,255,0.2)',
                marginBottom: 2,
                backdropFilter: 'blur(10px)',
              }}
            />
          </motion.div>
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <Typography 
              variant="h3" 
              sx={{ 
                fontWeight: 900, 
                mt: 2, 
                letterSpacing: '-0.02em',
                textShadow: '0 2px 8px rgba(0,0,0,0.3)',
                fontFamily: '"Be Vietnam Pro", "Inter", "Roboto", "Helvetica", "Arial", sans-serif',
              }}
            >
              {user?.fullName}
            </Typography>
          </motion.div>
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center', gap: 1, flexWrap: 'wrap' }}>
              {user?.role && (
                <Chip
                  icon={<VerifiedUser />}
                  label={user.role.toUpperCase()}
                  color="default"
                  variant="filled"
                  sx={{ 
                    fontWeight: 700, 
                    fontSize: 14, 
                    bgcolor: 'rgba(255,255,255,0.2)',
                    color: '#fff',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255,255,255,0.3)',
                  }}
                />
              )}
              {user?.isVerified && (
                <Chip
                  icon={<VerifiedUser />}
                  label="Verified"
                  color="success"
                  variant="filled"
                  sx={{ 
                    fontWeight: 700, 
                    fontSize: 14,
                    bgcolor: 'rgba(76, 175, 80, 0.9)',
                    backdropFilter: 'blur(10px)',
                  }}
                />
              )}
            </Box>
          </motion.div>
        </ProfileHeader>
      </motion.div>

      <Container maxWidth="lg" sx={{ py: 4 }}>
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          <ProfileCard>
            <Box sx={{ p: { xs: 2, md: 4 } }}>
              <AnimatePresence mode="wait">
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Alert 
                      severity="error" 
                      sx={{ 
                        mb: 3,
                        borderRadius: 2,
                        '& .MuiAlert-icon': {
                          color: '#f44336',
                        },
                      }}
                    >
                      {error}
                    </Alert>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Personal Information Section */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 1.0 }}
              >
                <SectionTitle variant="h5" sx={{ mb: 3 }}>
                  {t('personalInfo')}
                </SectionTitle>
                <Box sx={{ 
                  display: 'grid', 
                  gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, 
                  gap: 3,
                  mb: 4
                }}>
                  <ModernInput
                    fullWidth
                    label={t('fullName')}
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Person />
                        </InputAdornment>
                      ),
                    }}
                  />
                  <ModernInput
                    fullWidth
                    label={t('email')}
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Email />
                        </InputAdornment>
                      ),
                    }}
                  />
                  <ModernInput
                    fullWidth
                    label={t('phone')}
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Phone />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Box>
              </motion.div>

              {/* Body Measurements Section */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 1.2 }}
              >
                <Box sx={{ mt: 5, mb: 4 }}>
                  <SectionTitle variant="h5" sx={{ mb: 2 }}>
                    Thông tin cơ thể (cho gợi ý size)
                  </SectionTitle>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      mb: 3,
                      color: customTheme === THEME.LIGHT ? '#666' : '#ccc',
                      fontStyle: 'italic',
                      fontFamily: '"Be Vietnam Pro", "Inter", "Roboto", "Helvetica", "Arial", sans-serif',
                    }}
                  >
                    Cập nhật thông tin cơ thể để nhận gợi ý size chính xác hơn
                  </Typography>
                  <Box sx={{ 
                    display: 'grid', 
                    gridTemplateColumns: { xs: '1fr', md: '1fr 1fr 1fr' }, 
                    gap: 3 
                  }}>
                    <ModernInput
                      fullWidth
                      label="Chiều cao (cm)"
                      name="height"
                      type="number"
                      value={formData.height}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      inputProps={{ min: 100, max: 250 }}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Height />
                          </InputAdornment>
                        ),
                        endAdornment: <InputAdornment position="end">cm</InputAdornment>,
                      }}
                    />
                    <ModernInput
                      fullWidth
                      label="Cân nặng (kg)"
                      name="weight"
                      type="number"
                      value={formData.weight}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      inputProps={{ min: 20, max: 200 }}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <MonitorWeight />
                          </InputAdornment>
                        ),
                        endAdornment: <InputAdornment position="end">kg</InputAdornment>,
                      }}
                    />
                    <ModernInput
                      fullWidth
                      label="Chiều dài chân (mm)"
                      name="footLength"
                      type="number"
                      value={formData.footLength}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      inputProps={{ min: 150, max: 350 }}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Straighten />
                          </InputAdornment>
                        ),
                        endAdornment: <InputAdornment position="end">mm</InputAdornment>,
                      }}
                    />
                  </Box>
                </Box>
              </motion.div>

              {/* Addresses Section */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 1.4 }}
              >
                <Box sx={{ mt: 5 }}>
                  <SectionTitle variant="h5" sx={{ mb: 2 }}>
                    {t('addresses')}
                  </SectionTitle>
                  {formData.addresses.length === 0 && (
                    <Typography 
                      sx={{ 
                        mb: 3,
                        color: customTheme === THEME.LIGHT ? '#666' : '#ccc',
                        fontStyle: 'italic',
                        textAlign: 'center',
                        py: 4,
                        fontFamily: '"Be Vietnam Pro", "Inter", "Roboto", "Helvetica", "Arial", sans-serif',
                      }}
                    >
                      {t('noAddress')}
                    </Typography>
                  )}
                  <AnimatePresence>
                    {formData.addresses.map((address, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.4, delay: index * 0.1 }}
                      >
                        <AddressCard>
                          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
                            {isEditing && (
                              <ModernButton
                                variant="outlined"
                                color="error"
                                startIcon={<DeleteIcon />}
                                onClick={() => handleDeleteAddress(index)}
                                size="small"
                                sx={{ 
                                  borderRadius: 12, 
                                  fontWeight: 700,
                                  background: 'rgba(244, 67, 54, 0.1)',
                                  borderColor: '#f44336',
                                  color: '#f44336',
                                  '&:hover': {
                                    background: 'rgba(244, 67, 54, 0.2)',
                                    borderColor: '#d32f2f',
                                    color: '#d32f2f',
                                  },
                                }}
                              >
                                {t('delete')}
                              </ModernButton>
                            )}
                          </Box>
                          <Box
                            sx={{
                              display: 'grid',
                              gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
                              gap: 2,
                            }}
                          >
                            <ModernInput
                              fullWidth
                              label={t('recipientName')}
                              value={address.recipientName}
                              onChange={e => handleAddressChange(index, 'recipientName', e.target.value)}
                              disabled={!isEditing}
                            />
                            <ModernInput
                              fullWidth
                              label={t('street')}
                              value={address.street}
                              onChange={e => handleAddressChange(index, 'street', e.target.value)}
                              disabled={!isEditing}
                            />
                            <ModernInput
                              fullWidth
                              label={t('city')}
                              value={address.city}
                              onChange={e => handleAddressChange(index, 'city', e.target.value)}
                              disabled={!isEditing}
                            />
                            <ModernInput
                              fullWidth
                              label={t('state')}
                              value={address.state}
                              onChange={e => handleAddressChange(index, 'state', e.target.value)}
                              disabled={!isEditing}
                            />
                            <ModernInput
                              fullWidth
                              label={t('country')}
                              value={address.country}
                              onChange={e => handleAddressChange(index, 'country', e.target.value)}
                              disabled={!isEditing}
                            />
                            <ModernInput
                              fullWidth
                              label={t('addressNumber')}
                              value={address.addressNumber}
                              onChange={e => handleAddressChange(index, 'addressNumber', e.target.value)}
                              disabled={!isEditing}
                            />
                          </Box>
                        </AddressCard>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                  {isEditing && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4 }}
                    >
                      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                        <ModernButton
                          variant="contained"
                          startIcon={<AddIcon />}
                          onClick={handleAddAddress}
                          sx={{
                            background: 'linear-gradient(45deg, #4caf50, #66bb6a)',
                            '&:hover': {
                              background: 'linear-gradient(45deg, #388e3c, #4caf50)',
                            },
                          }}
                        >
                          {t('addAddress')}
                        </ModernButton>
                      </Box>
                    </motion.div>
                  )}
                </Box>
              </motion.div>

              {/* Action Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 1.6 }}
              >
                <Box sx={{ 
                  mt: 6, 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  gap: 2,
                  flexWrap: 'wrap',
                }}>
                  <ModernButton
                    variant="outlined"
                    startIcon={<LockIcon />}
                    onClick={() => router.push('/auth/change-password')}
                    sx={{
                      borderColor: customTheme === THEME.LIGHT ? '#666' : '#888',
                      color: customTheme === THEME.LIGHT ? '#666' : '#ccc',
                      background: 'rgba(255,255,255,0.05)',
                      '&:hover': {
                        borderColor: customTheme === THEME.LIGHT ? '#000' : '#fff',
                        color: customTheme === THEME.LIGHT ? '#000' : '#fff',
                        backgroundColor: 'rgba(255,255,255,0.1)',
                      },
                    }}
                  >
                    {t('changePassword')}
                  </ModernButton>
                  <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                    {!isEditing ? (
                      <ModernButton 
                        variant="contained" 
                        startIcon={<EditIcon />} 
                        onClick={handleEdit}
                      >
                        {t('editProfile')}
                      </ModernButton>
                    ) : (
                      <>
                        <ModernButton
                          variant="outlined"
                          startIcon={<CancelIcon />}
                          onClick={handleCancel}
                          sx={{ 
                            background: 'rgba(255,255,255,0.05)',
                            color: customTheme === THEME.LIGHT ? '#222' : '#fff', 
                            borderColor: customTheme === THEME.LIGHT ? '#222' : '#fff',
                            '&:hover': {
                              background: 'rgba(255,255,255,0.1)',
                            },
                          }}
                        >
                          {t('cancel')}
                        </ModernButton>
                        <ModernButton 
                          variant="contained" 
                          startIcon={<SaveIcon />} 
                          onClick={handleSave}
                          sx={{
                            background: 'linear-gradient(45deg, #4caf50, #66bb6a)',
                            '&:hover': {
                              background: 'linear-gradient(45deg, #388e3c, #4caf50)',
                            },
                          }}
                        >
                          {t('saveChanges')}
                        </ModernButton>
                      </>
                    )}
                  </Box>
                </Box>
              </motion.div>
            </Box>
          </ProfileCard>
        </motion.div>
      </Container>
    </Box>
  );
}
