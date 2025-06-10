'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { useTranslations } from 'next-intl';
import {
  Box,
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Link as MuiLink,
  Alert,
} from '@mui/material';
import { API_ENDPOINTS } from '@/lib/constants/constants';

export default function ResetPasswordForm() {
  const t = useTranslations('resetPassword');
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [formData, setFormData] = useState({
    newPassword: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validate passwords
    if (formData.newPassword.length < 6) {
      setError(t('errors.passwordTooShort'));
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      setError(t('errors.passwordsDoNotMatch'));
      return;
    }

    if (!token) {
      setError(t('errors.missingToken'));
      return;
    }

    setLoading(true);
    try {
      console.log('Resetting password...');
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}${API_ENDPOINTS.AUTH.RESET_PASSWORD}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          body: JSON.stringify({
            token,
            newPassword: formData.newPassword,
          }),
        }
      );

      // Check if response is JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Server returned non-JSON response');
      }

      const data = await response.json();
      console.log('Reset password response:', data);

      if (!response.ok) {
        console.error('Reset password failed:', data);
        setError(data.message || t('errors.resetFailed'));
        return;
      }

      // Clear reset email from localStorage
      localStorage.removeItem('resetEmail');

      // Redirect to login page
      router.push('/auth/login');
    } catch (err) {
      console.error('Reset password error:', err);
      setError(t('errors.unknownError'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm">
      <Box>
        <Paper
          elevation={3}
          sx={{
            p: 4,
            width: '100%',
            bgcolor: 'white',
            borderRadius: 0,
            border: '2px solid black',
          }}
        >
          {/* Header */}
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Typography
              variant="h3"
              sx={{
                fontWeight: 900,
                letterSpacing: '-0.02em',
                color: 'black',
                mb: 2,
              }}
            >
              {t('title')}
            </Typography>
            <Typography
              variant="body1"
              sx={{
                color: 'gray',
                fontSize: '0.95rem',
                lineHeight: 1.6,
                mb: 2,
              }}
            >
              {t('description')}
            </Typography>
          </Box>

          <Box
            component="form"
            onSubmit={handleSubmit}
            sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}
          >
            {/* New Password */}
            <TextField
              name="newPassword"
              type="password"
              label={t('newPassword')}
              value={formData.newPassword}
              onChange={handleChange}
              required
              fullWidth
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 0,
                  '& fieldset': {
                    borderColor: 'black',
                    borderWidth: 2,
                  },
                  '&:hover fieldset': {
                    borderColor: 'black',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: 'black',
                  },
                },
              }}
            />

            {/* Confirm Password */}
            <TextField
              name="confirmPassword"
              type="password"
              label={t('confirmPassword')}
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              fullWidth
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 0,
                  '& fieldset': {
                    borderColor: 'black',
                    borderWidth: 2,
                  },
                  '&:hover fieldset': {
                    borderColor: 'black',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: 'black',
                  },
                },
              }}
            />

            {/* Error Message */}
            {error && (
              <Alert
                severity="error"
                sx={{
                  borderRadius: 0,
                  '& .MuiAlert-message': {
                    fontWeight: 500,
                  },
                }}
              >
                {error}
              </Alert>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              variant="contained"
              fullWidth
              disabled={loading}
              sx={{
                bgcolor: 'black',
                color: 'white',
                borderRadius: 0,
                py: 1.5,
                fontWeight: 700,
                fontSize: '1rem',
                letterSpacing: '0.05em',
                '&:hover': {
                  bgcolor: 'gray.800',
                },
                '&.Mui-disabled': {
                  bgcolor: 'gray.400',
                },
              }}
            >
              {loading ? (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box
                    sx={{
                      width: 20,
                      height: 20,
                      border: '2px solid white',
                      borderTop: '2px solid transparent',
                      borderRadius: '50%',
                      animation: 'spin 1s linear infinite',
                      '@keyframes spin': {
                        '0%': { transform: 'rotate(0deg)' },
                        '100%': { transform: 'rotate(360deg)' },
                      },
                    }}
                  />
                  {t('resetting')}
                </Box>
              ) : (
                t('resetButton')
              )}
            </Button>

            {/* Back to Login */}
            <Box sx={{ textAlign: 'center', mt: 2 }}>
              <MuiLink
                component={Link}
                href="/auth/login"
                sx={{
                  color: 'black',
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 1,
                  fontWeight: 600,
                  '&:hover': {
                    textDecoration: 'underline',
                  },
                }}
              >
                <ArrowLeft size={16} />
                {t('backToLogin')}
              </MuiLink>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
}
