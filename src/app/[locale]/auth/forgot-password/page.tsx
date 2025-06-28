'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Mail, ArrowLeft } from 'lucide-react';
import { useTranslations } from 'next-intl';
import {
  Box,
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Link as MuiLink,
  InputAdornment,
  Alert,
} from '@mui/material';
import { API_ENDPOINTS } from '@/lib/constants/constants';

export default function ForgotPasswordForm() {
  const t = useTranslations('forgotPassword');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const validateEmail = (email: string): string => {
    if (!email) {
      return t('errors.emailRequired');
    }
    if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(email)) {
      return t('errors.invalidEmail');
    }
    return '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    const emailError = validateEmail(email);
    if (emailError) {
      setError(emailError);
      return;
    }

    setLoading(true);
    try {
      console.log('Sending forgot password request...');
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}${API_ENDPOINTS.AUTH.FORGOT_PASSWORD}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email }),
        }
      );

      const data = await response.json();
      console.log('Forgot password response:', data);

      if (!response.ok) {
        console.error('Forgot password failed:', data);
        setError(data.message || t('errors.sendFailed'));
        return;
      }

      // Save email to localStorage for OTP verification
      localStorage.setItem('resetEmail', email);

      // Get current locale from URL
      const pathParts = window.location.pathname.split('/');
      const currentLocale = pathParts[1] || 'en';

      // Redirect to verify OTP page
      window.location.href = `/${currentLocale}/auth/verify-otp`;
    } catch (err) {
      console.error('Forgot password error:', err);
      setError(t('errors.unknownError'));
    } finally {
      setLoading(false);
    }
  };

  const handleResendEmail = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}${API_ENDPOINTS.AUTH.FORGOT_PASSWORD}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || t('errors.resendFailed'));
        return;
      }

      setSuccess(true);
    } catch (err) {
      console.error('Resend email error:', err);
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

            {!success ? (
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
            ) : (
              <Box>
                <Typography
                  variant="body1"
                  sx={{
                    color: 'green',
                    fontSize: '0.95rem',
                    fontWeight: 600,
                    mb: 1,
                  }}
                >
                  {t('emailSent')}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    color: 'gray',
                    fontSize: '0.875rem',
                    lineHeight: 1.5,
                  }}
                >
                  {t('checkEmail')}
                </Typography>
              </Box>
            )}
          </Box>

          {!success ? (
            <Box
              component="form"
              onSubmit={handleSubmit}
              sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}
            >
              {/* Email Field */}
              <TextField
                label={t('emailLabel')}
                variant="outlined"
                required
                fullWidth
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder={t('emailPlaceholder')}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Mail className="text-black" />
                    </InputAdornment>
                  ),
                }}
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
                  '& .MuiInputLabel-root': {
                    color: 'black',
                    fontWeight: 600,
                    '&.Mui-focused': {
                      color: 'black',
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
                    {t('sendingEmail')}
                  </Box>
                ) : (
                  t('sendResetLink')
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
          ) : (
            <Box sx={{ textAlign: 'center' }}>
              <Button
                variant="outlined"
                onClick={handleResendEmail}
                disabled={loading}
                sx={{
                  borderColor: 'black',
                  color: 'black',
                  borderRadius: 0,
                  py: 1.5,
                  px: 4,
                  fontWeight: 600,
                  '&:hover': {
                    borderColor: 'black',
                    bgcolor: 'rgba(0, 0, 0, 0.04)',
                  },
                }}
              >
                {loading ? t('sendingEmail') : t('resendEmail')}
              </Button>
            </Box>
          )}
        </Paper>
      </Box>
    </Container>
  );
}
