'use client';

import { useState, useRef, useEffect } from 'react';
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

export default function VerifyOTPForm() {
  const t = useTranslations('verifyOTP');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    // Start timer when component mounts
    const interval = setInterval(() => {
      setTimer(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          setCanResend(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleChange = (index: number, value: string) => {
    if (value.length > 1) {
      value = value.slice(0, 1);
    }

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Move to next input if value is entered
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 6).split('');
    const newOtp = [...otp];
    pastedData.forEach((value, index) => {
      if (index < 6) {
        newOtp[index] = value;
      }
    });
    setOtp(newOtp);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (otp.some(digit => !digit)) {
      setError(t('error.incompleteOTP'));
      return;
    }

    setLoading(true);
    try {
      console.log('Verifying OTP...');
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}${API_ENDPOINTS.AUTH.VERIFY_OTP}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          body: JSON.stringify({
            otp: otp.join(''),
            email: localStorage.getItem('resetEmail'),
          }),
        }
      );

      // Check if response is JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Server returned non-JSON response');
      }

      const data = await response.json();
      console.log('Verify OTP response:', data);

      if (!response.ok) {
        console.error('Verify OTP failed:', data);
        setError(data.message || t('error.verificationFailed'));
        return;
      }

      // If verification successful, redirect to reset password page with token
      window.location.href = `/auth/reset-password?token=${data.data.token}`;
    } catch (err) {
      console.error('Verify OTP error:', err);
      setError(t('error.unknownError'));
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (!canResend) return;

    setLoading(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}${API_ENDPOINTS.AUTH.FORGOT_PASSWORD}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          body: JSON.stringify({
            email: localStorage.getItem('resetEmail'),
          }),
        }
      );

      // Check if response is JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Server returned non-JSON response');
      }

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || t('error.resendFailed'));
        return;
      }

      // Reset timer and OTP
      setTimer(60);
      setCanResend(false);
      setOtp(['', '', '', '', '', '']);
      setError('');
    } catch (err) {
      console.error('Resend OTP error:', err);
      setError(t('error.unknownError'));
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
            {/* OTP Input Fields */}
            <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
              {otp.map((digit, index) => (
                <TextField
                  key={index}
                  inputRef={el => (inputRefs.current[index] = el)}
                  value={digit}
                  onChange={e => handleChange(index, e.target.value)}
                  onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => handleKeyDown(index, e)}
                  onPaste={handlePaste}
                  inputProps={{
                    maxLength: 1,
                    style: {
                      textAlign: 'center',
                      fontSize: '1.5rem',
                      fontWeight: 600,
                    },
                  }}
                  sx={{
                    width: '50px',
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
              ))}
            </Box>

            {/* Timer and Resend */}
            <Box sx={{ textAlign: 'center' }}>
              {timer > 0 ? (
                <Typography variant="body2" color="gray">
                  {t('resendIn', { seconds: timer })}
                </Typography>
              ) : (
                <Button
                  onClick={handleResendOTP}
                  disabled={loading || !canResend}
                  sx={{
                    color: 'black',
                    textTransform: 'none',
                    fontWeight: 600,
                    '&:hover': {
                      textDecoration: 'underline',
                    },
                  }}
                >
                  {t('resendOTP')}
                </Button>
              )}
            </Box>

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
                  {t('verifying')}
                </Box>
              ) : (
                t('verifyButton')
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
