'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  InputAdornment,
  IconButton,
  CircularProgress,
  Link as MuiLink,
  Checkbox,
  FormControlLabel,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Person,
  Email,
  AccountCircle,
  Phone,
} from '@mui/icons-material';

import { useAuth } from '@/hooks/useAuth';
import { ROUTES } from '@/constants/routes';

export default function RegisterPage() {
  const t = useTranslations('register');
  const router = useRouter();
  const { register } = useAuth();

  // Registration form state
  const [formData, setFormData] = useState({
    username: '',
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    address: {
      recipientName: '',
      street: '',
      city: '',
      state: '',
      country: '',
      phone: '',
      isDefault: false,
    },
  });

  // UI state
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const errorMessages: Record<string, string> = {
    username_required: t('errors.usernameRequired'),
    username_taken: t('errors.usernameTaken'),
    email_required: t('errors.emailRequired'),
    invalid_email: t('errors.invalidEmail'),
    email_already_used: t('errors.emailAlreadyUsed'),
    password_required: t('errors.passwordRequired'),
    password_too_short: t('errors.passwordTooShort'),
    passwords_do_not_match: t('errors.passwordsDoNotMatch'),
    server_error: t('errors.serverError'),
  };

  // Registration handlers
  const handleChange =
    (field: keyof typeof formData) => (e: React.ChangeEvent<HTMLInputElement>) => {
      setFormData(prev => ({ ...prev, [field]: e.target.value }));
    };

  const handleAddressChange =
    (field: keyof typeof formData.address) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const value = field === 'isDefault' ? (e.target as HTMLInputElement).checked : e.target.value;
      setFormData(prev => ({
        ...prev,
        address: {
          ...prev.address,
          [field]: value,
        },
      }));
    };

  const handleClickShowPassword = () => setShowPassword(show => !show);
  const handleClickShowConfirmPassword = () => setShowConfirmPassword(show => !show);

  const handleRegistrationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setFieldErrors({});

    if (formData.password !== formData.confirmPassword) {
      setFieldErrors({ confirmPassword: errorMessages.passwords_do_not_match });
      return;
    }

    setLoading(true);
    try {
      const response = await register(
        formData.email,
        formData.password,
        formData.fullName,
        formData.username,
        formData.phone,
        [formData.address]
      );

      if (!response?.success) {
        setError(
          response?.message
            ? errorMessages[response.message] || response.message
            : t('registrationFailed')
        );

        if (response?.errors) {
          const fieldErrs: Record<string, string> = {};
          for (const key in response.errors) {
            fieldErrs[key] = errorMessages[response.errors[key]] || response.errors[key];
          }
          setFieldErrors(fieldErrs);
        }
        setLoading(false);
        return;
      }

      // Store email for verification and redirect to verify-email page
      localStorage.setItem('pendingEmail', formData.email);
      router.push(ROUTES.VERIFY_EMAIL);
    } catch (err) {
      setError(t('registrationFailed'));
      console.error('Registration error:', err);
    } finally {
      setLoading(false);
    }
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
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Typography
              variant="h3"
              sx={{ fontWeight: 900, letterSpacing: '-0.02em', color: 'black', mb: 1 }}
            >
              {t('title')}
            </Typography>
            <Typography
              variant="body1"
              sx={{
                color: 'gray',
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                fontSize: '0.875rem',
              }}
            >
              {t('subtitle')}{' '}
              <MuiLink component={Link} href={ROUTES.LOGIN} color="primary" underline="hover">
                {t('loginLink')}
              </MuiLink>
            </Typography>
          </Box>

          <Box
            component="form"
            onSubmit={handleRegistrationSubmit}
            sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}
          >
            <TextField
              label={t('username')}
              variant="outlined"
              required
              fullWidth
              value={formData.username}
              onChange={handleChange('username')}
              error={Boolean(fieldErrors.username)}
              helperText={fieldErrors.username}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <AccountCircle sx={{ color: 'black' }} />
                  </InputAdornment>
                ),
              }}
              sx={inputStyle}
            />
            <TextField
              label={t('fullName')}
              variant="outlined"
              required
              fullWidth
              value={formData.fullName}
              onChange={handleChange('fullName')}
              error={Boolean(fieldErrors.fullName)}
              helperText={fieldErrors.fullName}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Person sx={{ color: 'black' }} />
                  </InputAdornment>
                ),
              }}
              sx={inputStyle}
            />
            <TextField
              label={t('email')}
              variant="outlined"
              required
              fullWidth
              type="email"
              value={formData.email}
              onChange={handleChange('email')}
              error={Boolean(fieldErrors.email)}
              helperText={fieldErrors.email}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Email sx={{ color: 'black' }} />
                  </InputAdornment>
                ),
              }}
              sx={inputStyle}
            />
            <TextField
              label={t('password')}
              variant="outlined"
              required
              fullWidth
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={handleChange('password')}
              error={Boolean(fieldErrors.password)}
              helperText={fieldErrors.password}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={handleClickShowPassword} edge="end">
                      {showPassword ? (
                        <VisibilityOff sx={{ color: 'black' }} />
                      ) : (
                        <Visibility sx={{ color: 'black' }} />
                      )}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={inputStyle}
            />
            <TextField
              label={t('confirmPassword')}
              variant="outlined"
              required
              fullWidth
              type={showConfirmPassword ? 'text' : 'password'}
              value={formData.confirmPassword}
              onChange={handleChange('confirmPassword')}
              error={Boolean(fieldErrors.confirmPassword)}
              helperText={fieldErrors.confirmPassword}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={handleClickShowConfirmPassword} edge="end">
                      {showConfirmPassword ? (
                        <VisibilityOff sx={{ color: 'black' }} />
                      ) : (
                        <Visibility sx={{ color: 'black' }} />
                      )}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={inputStyle}
            />
            <TextField
              label={t('phone')}
              variant="outlined"
              required
              fullWidth
              type="tel"
              value={formData.phone}
              onChange={handleChange('phone')}
              error={Boolean(fieldErrors.phone)}
              helperText={fieldErrors.phone}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Phone sx={{ color: 'black' }} />
                  </InputAdornment>
                ),
              }}
              sx={inputStyle}
            />

            <Typography variant="h6" sx={{ mt: 3, mb: 1, fontWeight: 700, color: 'black' }}>
              {t('addressTitle')}
            </Typography>

            <TextField
              label={t('recipientName')}
              variant="outlined"
              required
              fullWidth
              value={formData.address.recipientName}
              onChange={handleAddressChange('recipientName')}
              error={Boolean(fieldErrors['address.recipientName'])}
              helperText={fieldErrors['address.recipientName']}
              sx={inputStyle}
            />
            <TextField
              label={t('street')}
              variant="outlined"
              required
              fullWidth
              value={formData.address.street}
              onChange={handleAddressChange('street')}
              error={Boolean(fieldErrors['address.street'])}
              helperText={fieldErrors['address.street']}
              sx={inputStyle}
            />
            <TextField
              label={t('city')}
              variant="outlined"
              required
              fullWidth
              value={formData.address.city}
              onChange={handleAddressChange('city')}
              error={Boolean(fieldErrors['address.city'])}
              helperText={fieldErrors['address.city']}
              sx={inputStyle}
            />
            <TextField
              label={t('state')}
              variant="outlined"
              required
              fullWidth
              value={formData.address.state}
              onChange={handleAddressChange('state')}
              error={Boolean(fieldErrors['address.state'])}
              helperText={fieldErrors['address.state']}
              sx={inputStyle}
            />
            <TextField
              label={t('country')}
              variant="outlined"
              required
              fullWidth
              value={formData.address.country}
              onChange={handleAddressChange('country')}
              error={Boolean(fieldErrors['address.country'])}
              helperText={fieldErrors['address.country']}
              sx={inputStyle}
            />
            <TextField
              label={t('addressPhone')}
              variant="outlined"
              required
              fullWidth
              value={formData.address.phone}
              onChange={handleAddressChange('phone')}
              error={Boolean(fieldErrors['address.phone'])}
              helperText={fieldErrors['address.phone']}
              sx={inputStyle}
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={formData.address.isDefault}
                  onChange={handleAddressChange('isDefault')}
                  color="primary"
                />
              }
              label={t('setAsDefaultAddress')}
            />

            {error && (
              <Typography color="error" variant="body2" sx={{ mt: 1, textAlign: 'center' }}>
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
              {loading ? <CircularProgress size={24} color="inherit" /> : t('register')}
            </Button>
          </Box>

          <Box sx={{ textAlign: 'center', mt: 3 }}>
            <Typography variant="body2" sx={{ color: 'gray' }}>
              {t('alreadyHaveAccount')}{' '}
              <MuiLink
                component={Link}
                href={ROUTES.LOGIN}
                color="primary"
                underline="hover"
                sx={{ fontWeight: 'bold' }}
              >
                {t('signIn')}
              </MuiLink>
            </Typography>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
}

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
