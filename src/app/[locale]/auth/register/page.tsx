'use client';

import React, { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
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
export default function RegisterPage() {
  const t = useTranslations('register');
  const router = useRouter();
  const pathname = usePathname();
  const { register } = useAuth();

  // Lấy locale từ pathname nếu có dạng /vi/... hoặc /en/...
  const locale = pathname?.split('/')[1] || 'vi';

  // Registration form state
  const initialFormData = {
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
      addressNumber: '',
      isDefault: false,
    },
  };
  const [formData, setFormData] = useState(initialFormData);

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

  // Hàm validate FE cho các trường đăng ký
  function validateRegister(formData: typeof initialFormData): Record<string, string> {
    const errors: Record<string, string> = {};

    // Username
    if (!formData.username) {
      errors.username = 'Vui lòng nhập tên đăng nhập';
    } else if (formData.username.length < 3) {
      errors.username = 'Tên đăng nhập phải có ít nhất 3 ký tự';
    } else if (formData.username.length > 20) {
      errors.username = 'Tên đăng nhập tối đa 20 ký tự';
    }

    // Password
    if (!formData.password) {
      errors.password = 'Vui lòng nhập mật khẩu';
    } else if (formData.password.length < 8) {
      errors.password = 'Mật khẩu phải có ít nhất 8 ký tự';
    }

    // Confirm password
    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Mật khẩu xác nhận không khớp';
    }

    // Email
    if (!formData.email) {
      errors.email = 'Vui lòng nhập email';
    } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(formData.email)) {
      errors.email = 'Email không hợp lệ';
    }

    // Full name
    if (!formData.fullName) {
      errors.fullName = 'Vui lòng nhập họ tên';
    } else if (formData.fullName.length < 2) {
      errors.fullName = 'Họ tên phải có ít nhất 2 ký tự';
    }

    // Phone
    if (!formData.phone) {
      errors.phone = 'Vui lòng nhập số điện thoại';
    } else if (!/^[0-9]{9,11}$/.test(formData.phone)) {
      errors.phone = 'Số điện thoại không hợp lệ (chỉ chứa số, 9-11 ký tự)';
    }

    // Địa chỉ nhà (address)
    if (!formData.address.recipientName) {
      errors['address.recipientName'] = 'Vui lòng nhập tên người nhận';
    }
    if (!formData.address.street) {
      errors['address.street'] = 'Vui lòng nhập đường';
    }
    if (!formData.address.city) {
      errors['address.city'] = 'Vui lòng nhập thành phố';
    }
    if (!formData.address.state) {
      errors['address.state'] = 'Vui lòng nhập tỉnh/thành phố';
    }
    if (!formData.address.country) {
      errors['address.country'] = 'Vui lòng nhập quốc gia';
    }

    return errors;
  }

  const handleRegistrationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setFieldErrors({});

    // FE validate
    const errors = validateRegister(formData);
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
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
        // Nếu có errors dạng object
        if (response?.errors) {
          setFieldErrors(response.errors);
        }
        // Nếu có validationErrors dạng array
        if (response?.validationErrors) {
          const fieldErrs: Record<string, string> = {};
          response.validationErrors.forEach((err: { field: string; message: string }) => {
            fieldErrs[err.field] = errorMessages[err.message] || err.message;
          });
          setFieldErrors(fieldErrs);
        }
        // Nếu chỉ có message chung
        setError(
          response?.message
            ? errorMessages[response.message] || response.message
            : t('registrationFailed')
        );
        setLoading(false);
        return;
      }

      // Store email for verification and redirect to verify-email page
      localStorage.setItem('pendingEmail', formData.email);
      router.push(`/${locale}/auth/verify-email`);
    } catch (err) {
      setError(t('registrationFailed'));
      console.error('Registration error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Add error display component
  const ErrorDisplay = ({ field }: { field: string }) => {
    if (!fieldErrors[field]) return null;
    return (
      <Typography
        color="error"
        variant="caption"
        sx={{
          display: 'block',
          mt: 0.5,
          ml: 2,
          fontSize: '0.75rem',
          fontWeight: 500
        }}
      >
        {fieldErrors[field]}
      </Typography>
    );
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
              <MuiLink component={Link} href={`/${locale}/auth/login`} color="primary" underline="hover">
                {t('loginLink')}
              </MuiLink>
            </Typography>
          </Box>

          {/* Social Login Buttons */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 3 }}>
            <Button
              variant="outlined"
              fullWidth
              startIcon={<img src="/google-icon.svg" alt="Google" style={{ width: 24, height: 24 }} />}
              onClick={() => window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/auth/google`}
              sx={{
                borderRadius: 0,
                borderColor: 'black',
                borderWidth: 2,
                color: 'black',
                fontWeight: 600,
                textTransform: 'none',
                '&:hover': {
                  borderColor: 'black',
                  backgroundColor: 'rgba(0, 0, 0, 0.04)',
                },
              }}
            >
              {t('continueWithGoogle')}
            </Button>

            <Button
              variant="outlined"
              fullWidth
              startIcon={<img src="/facebook-icon.svg" alt="Facebook" style={{ width: 24, height: 24 }} />}
              onClick={() => window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/auth/facebook`}
              sx={{
                borderRadius: 0,
                borderColor: 'black',
                borderWidth: 2,
                color: 'black',
                fontWeight: 600,
                textTransform: 'none',
                '&:hover': {
                  borderColor: 'black',
                  backgroundColor: 'rgba(0, 0, 0, 0.04)',
                },
              }}
            >
              {t('continueWithFacebook')}
            </Button>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <Box sx={{ flex: 1, height: 1, backgroundColor: 'gray' }} />
            <Typography sx={{ mx: 2, color: 'gray' }}>{t('orRegisterWithEmail')}</Typography>
            <Box sx={{ flex: 1, height: 1, backgroundColor: 'gray' }} />
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
            <ErrorDisplay field="username" />

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
            <ErrorDisplay field="fullName" />

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
            <ErrorDisplay field="email" />

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
            <ErrorDisplay field="password" />

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
            <ErrorDisplay field="confirmPassword" />

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
            <ErrorDisplay field="phone" />

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
            <ErrorDisplay field="address.recipientName" />

            <TextField
              label={t('addressNumber')}
              variant="outlined"
              fullWidth
              value={formData.address.addressNumber}
              onChange={handleAddressChange('addressNumber')}
              error={Boolean(fieldErrors['address.addressNumber'])}
              helperText={fieldErrors['address.addressNumber']}
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
            <ErrorDisplay field="address.street" />

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
            <ErrorDisplay field="address.city" />

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
            <ErrorDisplay field="address.state" />

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
            <ErrorDisplay field="address.country" />

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

            {/* General error message */}
            {error && (
              <Typography
                color="error"
                variant="body2"
                sx={{
                  textAlign: 'center',
                  mt: 2,
                  p: 1,
                  backgroundColor: 'rgba(211, 47, 47, 0.1)',
                  borderRadius: 1
                }}
              >
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
                href={`/${locale}/auth/login`}
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
