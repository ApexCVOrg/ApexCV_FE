'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Avatar,
  CircularProgress,
  Alert,
  InputAdornment,
  Chip,
} from '@mui/material';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
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
import { profileService, UserProfile, Address } from '@/services/profile';
import { styled } from '@mui/material/styles';

const ProfileHeader = styled(Box)({
  background: '#fff',
  borderBottom: '1px solid #e0e0e0',
  padding: '48px 0 32px 0',
  textAlign: 'center',
  color: '#222',
  position: 'relative',
});

const ProfileCard = styled(Paper)(({ theme }) => ({
  borderRadius: 28,
  boxShadow: '0 4px 24px rgba(0,0,0,0.07)',
  padding: theme.spacing(0, 0, 4, 0),
  background: '#fff',
  maxWidth: 600,
  margin: 'auto',
  marginTop: -64,
  position: 'relative',
  zIndex: 2,
  border: '1px solid #e0e0e0',
}));

const ModernInput = styled(TextField)({
  '& .MuiOutlinedInput-root': {
    borderRadius: 12,
    background: '#fafafa',
    '& fieldset': {
      borderColor: '#bdbdbd',
      borderWidth: 2,
    },
    '&:hover fieldset': {
      borderColor: '#222',
    },
    '&.Mui-focused fieldset': {
      borderColor: '#222',
    },
  },
  '& .MuiInputLabel-root': {
    color: '#222',
    fontWeight: 600,
    fontSize: 15,
  },
});

const ModernButton = styled(Button)({
  borderRadius: 24,
  fontWeight: 700,
  fontSize: '1rem',
  padding: '12px 32px',
  textTransform: 'none',
  boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
  background: '#111',
  color: '#fff',
  '&:hover': {
    background: '#222',
    color: '#fff',
  },
  '&.Mui-disabled': {
    background: '#e0e0e0',
    color: '#888',
  },
});

const AddressCard = styled(Box)(({ theme }) => ({
  background: '#fafafa',
  borderRadius: 16,
  boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
  padding: theme.spacing(2),
  marginBottom: theme.spacing(3),
  position: 'relative',
  border: '1px solid #e0e0e0',
  transition: 'box-shadow 0.2s',
  '&:hover': {
    boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
  },
}));

export default function ProfilePage() {
  const t = useTranslations('profile');
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    addresses: [] as Address[],
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
        });
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
    });
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      if (formData.email !== user?.email) {
        const token = localStorage.getItem('auth_token');
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/send-email-change-verification`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({ email: formData.email }),
        });
        const data = await response.json();
        if (!response.ok) {
          setError(data.message || 'Failed to send verification code');
          return;
        }
        localStorage.setItem('pendingEmail', formData.email);
        router.push('/auth/verify-email');
        return;
      }
      const updatedUser = await profileService.updateProfile(formData);
      setUser(updatedUser);
      setIsEditing(false);
    } catch {
      setError('Failed to update profile');
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
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', background: '#f5f5f5' }}>
      <ProfileHeader>
        <Avatar
          src={user?.avatar}
          sx={{ width: 128, height: 128, margin: '0 auto', boxShadow: '0 4px 24px rgba(0,0,0,0.12)', border: '4px solid #fff', marginBottom: 2 }}
        />
        <Typography variant="h3" sx={{ fontWeight: 900, mt: 2, letterSpacing: '-0.02em' }}>{user?.fullName}</Typography>
        <Box sx={{ mt: 1, display: 'flex', justifyContent: 'center', gap: 1 }}>
          {user?.role && (
            <Chip icon={<VerifiedUser />} label={user.role.toUpperCase()} color="default" variant="filled" sx={{ fontWeight: 700, fontSize: 14, bgcolor: '#222', color: '#fff' }} />
          )}
          {user?.isVerified && (
            <Chip icon={<VerifiedUser />} label="Verified" color="success" variant="filled" sx={{ fontWeight: 700, fontSize: 14 }} />
          )}
        </Box>
      </ProfileHeader>
      <ProfileCard>
        <Box sx={{ p: { xs: 2, md: 4 } }}>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
            <ModernInput fullWidth label={t('fullName')} name="fullName" value={formData.fullName} onChange={handleInputChange} disabled={!isEditing} InputProps={{ startAdornment: (<InputAdornment position="start"><Person /></InputAdornment>) }} />
            <ModernInput fullWidth label={t('email')} name="email" value={formData.email} onChange={handleInputChange} disabled={!isEditing} InputProps={{ startAdornment: (<InputAdornment position="start"><Email /></InputAdornment>) }} />
            <ModernInput fullWidth label={t('phone')} name="phone" value={formData.phone} onChange={handleInputChange} disabled={!isEditing} InputProps={{ startAdornment: (<InputAdornment position="start"><Phone /></InputAdornment>) }} />
          </Box>

          <Box sx={{ mt: 5 }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2, color: '#222' }}>{t('addresses')}</Typography>
            {formData.addresses.length === 0 && <Typography color="text.secondary" sx={{ mb: 2 }}>{t('noAddress')}</Typography>}
            {formData.addresses.map((address, index) => (
              <AddressCard key={index}>
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 1 }}>
                  {isEditing && <Button variant="outlined" color="error" startIcon={<DeleteIcon />} onClick={() => handleDeleteAddress(index)} size="small" sx={{ borderRadius: 12, fontWeight: 700 }}>{t('delete')}</Button>}
                </Box>
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
                  <ModernInput fullWidth label={t('recipientName')} value={address.recipientName} onChange={(e) => handleAddressChange(index, 'recipientName', e.target.value)} disabled={!isEditing} />
                  <ModernInput fullWidth label={t('street')} value={address.street} onChange={(e) => handleAddressChange(index, 'street', e.target.value)} disabled={!isEditing} />
                  <ModernInput fullWidth label={t('city')} value={address.city} onChange={(e) => handleAddressChange(index, 'city', e.target.value)} disabled={!isEditing} />
                  <ModernInput fullWidth label={t('state')} value={address.state} onChange={(e) => handleAddressChange(index, 'state', e.target.value)} disabled={!isEditing} />
                  <ModernInput fullWidth label={t('country')} value={address.country} onChange={(e) => handleAddressChange(index, 'country', e.target.value)} disabled={!isEditing} />
                  <ModernInput fullWidth label={t('addressNumber')} value={address.addressNumber} onChange={(e) => handleAddressChange(index, 'addressNumber', e.target.value)} disabled={!isEditing} />
                </Box>
              </AddressCard>
            ))}
            {isEditing && <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}><ModernButton variant="contained" startIcon={<AddIcon />} onClick={handleAddAddress}>{t('addAddress')}</ModernButton></Box>}
          </Box>

          <Box sx={{ mt: 6, display: 'flex', justifyContent: 'space-between', gap: 2 }}>
            <ModernButton
              variant="outlined"
              startIcon={<LockIcon />}
              onClick={() => router.push('/auth/change-password')}
              sx={{ 
                borderColor: '#666', 
                color: '#666',
                '&:hover': {
                  borderColor: '#000',
                  color: '#000',
                  backgroundColor: 'rgba(0, 0, 0, 0.04)'
                }
              }}
            >
              {t('changePassword')}
            </ModernButton>
            <Box sx={{ display: 'flex', gap: 2 }}>
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
                    sx={{ background: 'white', color: '#222', borderColor: '#222' }}
                  >
                    {t('cancel')}
                  </ModernButton>
                  <ModernButton
                    variant="contained"
                    startIcon={<SaveIcon />}
                    onClick={handleSave}
                  >
                    {t('saveChanges')}
                  </ModernButton>
                </>
              )}
            </Box>
          </Box>
        </Box>
      </ProfileCard>
    </Box>
  );
}
