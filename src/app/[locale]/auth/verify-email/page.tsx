'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  CircularProgress,
} from '@mui/material';
import { VerifiedUser } from '@mui/icons-material';
import { ROUTES } from '@/constants/routes';

interface VerifyEmailResponse {
  success: boolean;
  message: string;
}

export default function VerifyEmailPage() {
  const t = useTranslations('register');
  const router = useRouter();
  const [verificationCode, setVerificationCode] = useState('');
  const [registeredEmail, setRegisteredEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const storedEmail = localStorage.getItem('pendingEmail');
    if (!storedEmail) {
      router.push(ROUTES.REGISTER);
      return;
    }
    setRegisteredEmail(storedEmail);
  }, [router]);

  const handleVerificationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:5000/api/auth/verify-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({ email: registeredEmail, code: verificationCode }),
      });

      const data: VerifyEmailResponse = await response.json();

      if (data.success) {
        localStorage.removeItem('pendingEmail');
        router.push(ROUTES.LOGIN);
      } else {
        setError(data.message || 'Verification failed');
      }
    } catch (err) {
      setError('Server error');
    } finally {
      setLoading(false);
    }
  };

  const handleBackToRegistration = () => {
    localStorage.removeItem('pendingEmail');
    router.push(ROUTES.REGISTER);
  };

  const inputStyle = {
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
      '&.Mui-error fieldset': {
        borderColor: 'red',
      },
    },
    '& .MuiInputLabel-root': {
      color: 'black',
      fontWeight: 600,
      '&.Mui-focused': {
        color: 'black',
      },
      '&.Mui-error': {
        color: 'red',
      },
    },
    '& .MuiFormHelperText-root': {
      color: 'red',
      fontWeight: 500,
    },
  };

  const buttonStyle = {
    borderRadius: 0,
    backgroundColor: 'black',
    color: 'white',
    fontWeight: 900,
    fontSize: '1.1rem',
    letterSpacing: '0.1em',
    padding: '16px',
    mt: 2,
    '&:hover': { backgroundColor: '#333' },
    '&:active': { backgroundColor: '#000' },
  };

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          py: 4,
          backgroundColor: 'black',
        }}
      >
        <Paper
          elevation={3}
          sx={{
            p: 4,
            width: '100%',
            backgroundColor: 'white',
            borderRadius: 0,
            border: '2px solid black',
          }}
        >
          <Box component="form" onSubmit={handleVerificationSubmit}>
            <Box sx={{ textAlign: 'center', mb: 4 }}>
              <VerifiedUser sx={{ fontSize: 64, color: 'black', mb: 2 }} />
              <Typography
                variant="h3"
                sx={{ fontWeight: 900, letterSpacing: '-0.02em', color: 'black', mb: 1 }}
              >
                Verify Email
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  color: 'gray',
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                  fontSize: '0.875rem',
                  mb: 2,
                }}
              >
                Please enter the 6-digit verification code sent to:
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  color: 'black',
                  fontWeight: 600,
                  fontSize: '1rem',
                }}
              >
                {registeredEmail}
              </Typography>
            </Box>

            <TextField
              label="Verification Code"
              variant="outlined"
              required
              fullWidth
              value={verificationCode}
              onChange={e => setVerificationCode(e.target.value)}
              inputProps={{
                maxLength: 6,
                style: { textAlign: 'center', fontSize: '1.5rem', letterSpacing: '0.5em' },
              }}
              sx={inputStyle}
            />

            {error && (
              <Typography color="error" variant="body2" sx={{ textAlign: 'center', mt: 2 }}>
                {error}
              </Typography>
            )}

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={loading}
              sx={buttonStyle}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : 'Verify Email'}
            </Button>

            <Button
              onClick={handleBackToRegistration}
              fullWidth
              variant="outlined"
              size="large"
              sx={{
                mt: 2,
                borderRadius: 0,
                borderColor: 'black',
                color: 'black',
                fontWeight: 600,
                '&:hover': { borderColor: '#333', backgroundColor: '#f5f5f5' },
              }}
            >
              Back to Registration
            </Button>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
}
