'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Alert,
  CircularProgress,
} from '@mui/material';
import { useTranslations } from 'next-intl';
import { styled } from '@mui/material/styles';
import LockIcon from '@mui/icons-material/Lock';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import axios from 'axios';

interface ChangePasswordResponse {
  success: boolean;
  message: string;
}

const StyledPaper = styled(Paper)({
  padding: '2rem',
  maxWidth: '500px',
  margin: '2rem auto',
  borderRadius: '12px',
  boxShadow: '0 4px 24px rgba(0,0,0,0.12)',
});

const StyledTextField = styled(TextField)({
  '& .MuiOutlinedInput-root': {
    borderRadius: '12px',
    '& fieldset': {
      borderColor: '#e0e0e0',
    },
    '&:hover fieldset': {
      borderColor: '#000',
    },
    '&.Mui-focused fieldset': {
      borderColor: '#000',
    },
  },
  '& .MuiInputLabel-root': {
    '&.Mui-focused': {
      color: '#000',
    },
  },
});

const StyledButton = styled(Button)({
  borderRadius: '24px',
  padding: '12px 24px',
  fontWeight: 700,
  textTransform: 'none',
  fontSize: '1rem',
  '&.MuiButton-contained': {
    backgroundColor: '#000',
    '&:hover': {
      backgroundColor: '#333',
    },
  },
});

export default function ChangePasswordPage() {
  const t = useTranslations('changePassword');
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (formData.newPassword !== formData.confirmPassword) {
      setError(t('passwordsDoNotMatch'));
      return;
    }

    try {
      setLoading(true);
      const response = await axios.post<ChangePasswordResponse>(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/change-password`,
        {
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('auth_token')}`
          }
        }
      );

      if (response.data.success) {
        setSuccess(t('success'));
        setError('');
        // Clear form
        setFormData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
        // Redirect after 2 seconds
        setTimeout(() => {
          router.push('/profile');
        }, 2000);
      } else {
        setError(response.data.message || t('error'));
      }
    } catch (err: any) {
      setError(err.response?.data?.message || t('error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', py: 4, px: 2 }}>
      <StyledPaper>
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <LockIcon sx={{ fontSize: 48, color: '#000', mb: 2 }} />
          <Typography variant="h4" component="h1" sx={{ fontWeight: 700, mb: 1 }}>
            {t('changePassword')}
          </Typography>
          <Typography color="text.secondary">
            {t('changePasswordDescription')}
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 3 }}>
            {success}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <StyledTextField
            fullWidth
            label={t('currentPassword')}
            name="currentPassword"
            type={showPassword ? 'text' : 'password'}
            value={formData.currentPassword}
            onChange={handleInputChange}
            required
            sx={{ mb: 3 }}
            InputProps={{
              endAdornment: (
                <Button
                  onClick={() => setShowPassword(!showPassword)}
                  sx={{ minWidth: 'auto', p: 1 }}
                >
                  {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                </Button>
              ),
            }}
          />

          <StyledTextField
            fullWidth
            label={t('newPassword')}
            name="newPassword"
            type={showNewPassword ? 'text' : 'password'}
            value={formData.newPassword}
            onChange={handleInputChange}
            required
            sx={{ mb: 3 }}
            InputProps={{
              endAdornment: (
                <Button
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  sx={{ minWidth: 'auto', p: 1 }}
                >
                  {showNewPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                </Button>
              ),
            }}
          />

          <StyledTextField
            fullWidth
            label={t('confirmPassword')}
            name="confirmPassword"
            type={showConfirmPassword ? 'text' : 'password'}
            value={formData.confirmPassword}
            onChange={handleInputChange}
            required
            sx={{ mb: 4 }}
            InputProps={{
              endAdornment: (
                <Button
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  sx={{ minWidth: 'auto', p: 1 }}
                >
                  {showConfirmPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                </Button>
              ),
            }}
          />

          <Box sx={{ display: 'flex', gap: 2 }}>
            <StyledButton
              variant="outlined"
              fullWidth
              onClick={() => router.back()}
              sx={{ borderColor: '#000', color: '#000' }}
            >
              {t('cancel')}
            </StyledButton>
            <StyledButton
              type="submit"
              variant="contained"
              fullWidth
              disabled={loading}
            >
              {loading ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                t('changePassword')
              )}
            </StyledButton>
          </Box>
        </form>
      </StyledPaper>
    </Box>
  );
} 