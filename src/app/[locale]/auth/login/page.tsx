'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Eye, EyeOff, User, Lock } from 'lucide-react';
import { useTranslations } from 'next-intl';
import {
  Box,
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Checkbox,
  FormControlLabel,
  Link as MuiLink,
  InputAdornment,
  IconButton,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { API_ENDPOINTS } from '@/lib/constants/constants';
import { useTheme } from '@/hooks/useTheme';
import { THEME } from '@/lib/constants/constants';

// Local storage keys for Remember Me functionality
const REMEMBER_ME_KEY = 'remember_me_credentials';
const REMEMBER_ME_ENABLED_KEY = 'remember_me_enabled';

interface SavedCredentials {
  username: string;
  password: string;
}

export default function LoginForm() {
  const t = useTranslations('login');
  const { theme } = useTheme();
  const pathname = usePathname();
  const locale = pathname?.split('/')[1] || 'vi';

  const [formData, setFormData] = useState({
    username: '',
    password: '',
    rememberMe: false,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [banDialogOpen, setBanDialogOpen] = useState(false);
  const [banReason, setBanReason] = useState('');

  // Load saved credentials on component mount
  useEffect(() => {
    const loadSavedCredentials = () => {
      try {
        const rememberMeEnabled = localStorage.getItem(REMEMBER_ME_ENABLED_KEY) === 'true';
        if (rememberMeEnabled) {
          const savedCredentials = localStorage.getItem(REMEMBER_ME_KEY);
          if (savedCredentials) {
            const credentials: SavedCredentials = JSON.parse(savedCredentials);
            setFormData(prev => ({
              ...prev,
              username: credentials.username,
              password: credentials.password,
              rememberMe: true,
            }));
          }
        }
      } catch (error) {
        console.error('Error loading saved credentials:', error);
        // Clear corrupted data
        localStorage.removeItem(REMEMBER_ME_KEY);
        localStorage.removeItem(REMEMBER_ME_ENABLED_KEY);
      }
    };

    loadSavedCredentials();
  }, []);

  const handleChange =
    (field: keyof typeof formData) => (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = field === 'rememberMe' ? e.target.checked : e.target.value;
      setFormData(prev => ({ ...prev, [field]: value }));
      if (fieldErrors[field]) {
        setFieldErrors(prev => ({ ...prev, [field]: '' }));
      }
    };

  const saveCredentials = (username: string, password: string) => {
    try {
      const credentials: SavedCredentials = { username, password };
      localStorage.setItem(REMEMBER_ME_KEY, JSON.stringify(credentials));
      localStorage.setItem(REMEMBER_ME_ENABLED_KEY, 'true');
    } catch (error) {
      console.error('Error saving credentials:', error);
    }
  };

  const clearSavedCredentials = () => {
    try {
      localStorage.removeItem(REMEMBER_ME_KEY);
      localStorage.removeItem(REMEMBER_ME_ENABLED_KEY);
    } catch (error) {
      console.error('Error clearing saved credentials:', error);
    }
  };

  const validateLogin = (data: typeof formData): Record<string, string> => {
    const errors: Record<string, string> = {};
    if (!data.username) {
      errors.username = t('errors.usernameRequired');
    } else if (data.username.length < 3) {
      errors.username = t('errors.usernameLength');
    }
    if (!data.password) {
      errors.password = t('errors.passwordRequired');
    } else if (data.password.length < 6) {
      errors.password = t('errors.passwordLength');
    }
    return errors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setFieldErrors({});

    const errors = validateLogin(formData);
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}${API_ENDPOINTS.AUTH.LOGIN}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            username: formData.username,
            password: formData.password,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        if (data.errors) {
          setFieldErrors(data.errors);
        } else if (data.message === 'login.errors.banned' && data.reason) {
          setBanReason(data.reason);
          setBanDialogOpen(true);
        } else {
          setError(data.message || 'Login failed');
        }
        return;
      }

      // Handle Remember Me functionality
      if (formData.rememberMe) {
        saveCredentials(formData.username, formData.password);
      } else {
        clearSavedCredentials();
      }

      // Save token based on Remember Me
      if (data.data?.token) {
        localStorage.setItem('auth_token', data.data.token);
      }

      // Redirect
      const pathParts = window.location.pathname.split('/');
      const currentLocale = pathParts[1] || 'en';

      // Lấy role từ response (giả sử trả về data.data.user.role)
      const role = data.data?.user?.role || 'user';

      // Chuyển hướng theo role
      if (role === 'admin') {
        window.location.href = `/${currentLocale}/admin/dashboard`;
      } else if (role === 'manager') {
        window.location.href = `/${currentLocale}/manager/dashboard`;
      } else {
        window.location.href = `/${currentLocale}`;
      }
    } catch (err) {
      setError(t('errors.invalidCredentials'));
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = (provider: string) => {
    if (provider === 'Google') {
      // Redirect to Google OAuth
      window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/auth/google`;
    } else if (provider === 'Facebook') {
      // Redirect to Facebook OAuth
      window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/auth/facebook`;
    }
  };

  return (
    <Box sx={{
      bgcolor: theme === THEME.LIGHT ? '#fff' : '#000',
      color: theme === THEME.LIGHT ? '#000' : '#fff',
      minHeight: '100vh',
      pt: 10, // Add padding top to prevent overflow into header
      fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    }}>
      <Container maxWidth="sm">
        <Box sx={{ py: 4 }}>
          <Paper
            elevation={8}
            sx={{
              p: 4,
              bgcolor: theme === THEME.LIGHT ? '#fff' : '#1a1a1a',
              color: theme === THEME.LIGHT ? '#000' : '#fff',
              borderRadius: 3,
              border: `1px solid ${theme === THEME.LIGHT ? '#e0e0e0' : '#333'}`,
              boxShadow: theme === THEME.LIGHT 
                ? '0 8px 32px rgba(0,0,0,0.1)' 
                : '0 8px 32px rgba(0,0,0,0.5)',
              backdropFilter: 'blur(10px)',
              '&:hover': {
                boxShadow: theme === THEME.LIGHT 
                  ? '0 12px 40px rgba(0,0,0,0.15)' 
                  : '0 12px 40px rgba(0,0,0,0.6)',
                transform: 'translateY(-2px)',
                transition: 'all 0.3s ease',
              },
              fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
            }}
          >
            <Box sx={{ textAlign: 'center', mb: 4 }}>
              <Typography
                variant="h3"
                sx={{
                  fontWeight: 800,
                  letterSpacing: '-0.02em',
                  color: theme === THEME.LIGHT ? '#000' : '#fff',
                  mb: 1,
                  background: theme === THEME.LIGHT 
                    ? 'linear-gradient(45deg, #333, #666)' 
                    : 'linear-gradient(45deg, #fff, #ccc)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  textAlign: 'center',
                  fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
                }}
              >
                {t('title')}
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  color: theme === THEME.LIGHT ? '#666' : '#ccc',
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                  fontSize: '0.875rem',
                  fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
                }}
              >
                {t('noAccount')}{' '}
                <MuiLink
                  component={Link}
                  href={`/${locale}/auth/register`}
                  sx={{
                    color: theme === THEME.LIGHT ? '#333' : '#fff',
                    textDecoration: 'underline',
                    '&:hover': { 
                      color: theme === THEME.LIGHT ? '#555' : '#ccc',
                    },
                  }}
                >
                  {t('registerNow')}
                </MuiLink>
              </Typography>
            </Box>

            <Box
              component="form"
              onSubmit={handleSubmit}
              sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}
            >
              {/* Username */}
              <TextField
                label={t('usernameLabel')}
                variant="outlined"
                required
                fullWidth
                value={formData.username}
                onChange={handleChange('username')}
                error={!!fieldErrors.username}
                helperText={fieldErrors.username}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <User className="text-black" />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
                    '& fieldset': { 
                      borderColor: theme === THEME.LIGHT ? '#e0e0e0' : '#444', 
                      borderWidth: 1 
                    },
                    '&:hover fieldset': { 
                      borderColor: theme === THEME.LIGHT ? '#333' : '#666' 
                    },
                    '&.Mui-focused fieldset': { 
                      borderColor: theme === THEME.LIGHT ? '#333' : '#fff',
                      borderWidth: 2,
                    },
                  },
                  '& .MuiInputLabel-root': {
                    color: theme === THEME.LIGHT ? '#666' : '#ccc',
                    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
                    '&.Mui-focused': { 
                      color: theme === THEME.LIGHT ? '#333' : '#fff' 
                    },
                  },
                  '& .MuiInputBase-input': {
                    color: theme === THEME.LIGHT ? '#000' : '#fff',
                    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
                  },
                }}
              />

              {/* Password */}
              <TextField
                label={t('passwordLabel')}
                variant="outlined"
                required
                fullWidth
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={handleChange('password')}
                error={!!fieldErrors.password}
                helperText={fieldErrors.password}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Lock className="text-black" />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                        {showPassword ? <EyeOff /> : <Eye />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
                    '& fieldset': { 
                      borderColor: theme === THEME.LIGHT ? '#e0e0e0' : '#444', 
                      borderWidth: 1 
                    },
                    '&:hover fieldset': { 
                      borderColor: theme === THEME.LIGHT ? '#333' : '#666' 
                    },
                    '&.Mui-focused fieldset': { 
                      borderColor: theme === THEME.LIGHT ? '#333' : '#fff',
                      borderWidth: 2,
                    },
                  },
                  '& .MuiInputLabel-root': {
                    color: theme === THEME.LIGHT ? '#666' : '#ccc',
                    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
                    '&.Mui-focused': { 
                      color: theme === THEME.LIGHT ? '#333' : '#fff' 
                    },
                  },
                  '& .MuiInputBase-input': {
                    color: theme === THEME.LIGHT ? '#000' : '#fff',
                    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
                  },
                }}
              />

              {/* Remember Me + Forgot Password */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.rememberMe}
                      onChange={handleChange('rememberMe')}
                      sx={{
                        color: theme === THEME.LIGHT ? '#000' : '#fff',
                        '&.Mui-checked': { 
                          color: theme === THEME.LIGHT ? '#000' : '#fff' 
                        },
                      }}
                    />
                  }
                  label={t('rememberMe')}
                  sx={{ color: theme === THEME.LIGHT ? '#000' : '#fff' }}
                />
                <MuiLink
                  component={Link}
                  href={`/${locale}/auth/forgot-password`}
                  sx={{
                    color: theme === THEME.LIGHT ? '#333' : '#fff',
                    textDecoration: 'none',
                    '&:hover': { textDecoration: 'underline' },
                  }}
                >
                  {t('forgotPassword')}
                </MuiLink>
              </Box>

              {/* Error */}
              {error && (
                <Box sx={{ bgcolor: 'error.main', p: 2, borderRadius: 1, textAlign: 'center' }}>
                  <Typography sx={{ color: 'white', fontWeight: 500 }}>{error}</Typography>
                </Box>
              )}
              {/* Ban Dialog */}
              <Dialog open={banDialogOpen} onClose={() => setBanDialogOpen(false)}>
                <DialogTitle>{t('errors.bannedTitle') || 'Tài khoản bị khóa'}</DialogTitle>
                <DialogContent>
                  <Typography>{t('errors.banned') || 'Tài khoản của bạn đã bị khóa.'}</Typography>
                  <Typography color="error" sx={{ mt: 2 }}>
                    {banReason}
                  </Typography>
                </DialogContent>
                <DialogActions>
                  <Button onClick={() => setBanDialogOpen(false)} color="primary" autoFocus>
                    OK
                  </Button>
                </DialogActions>
              </Dialog>

              {/* Submit */}
              <Button
                type="submit"
                variant="contained"
                fullWidth
                disabled={loading}
                sx={{
                  bgcolor: theme === THEME.LIGHT ? '#333' : '#fff',
                  color: theme === THEME.LIGHT ? '#fff' : '#333',
                  borderRadius: 2,
                  py: 1.5,
                  fontWeight: 700,
                  fontSize: '1.1rem',
                  textTransform: 'uppercase',
                  letterSpacing: 1,
                  boxShadow: theme === THEME.LIGHT 
                    ? '0 4px 12px rgba(51, 51, 51, 0.3)' 
                    : '0 4px 12px rgba(255, 255, 255, 0.2)',
                  transition: 'all 0.3s ease',
                  fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
                  '&:hover': { 
                    bgcolor: theme === THEME.LIGHT ? '#555' : '#f0f0f0',
                    transform: 'translateY(-2px)',
                    boxShadow: theme === THEME.LIGHT 
                      ? '0 8px 20px rgba(51, 51, 51, 0.4)' 
                      : '0 8px 20px rgba(255, 255, 255, 0.3)',
                  },
                  '&:active': {
                    transform: 'translateY(0)',
                  },
                  '&.Mui-disabled': { 
                    bgcolor: theme === THEME.LIGHT ? '#ccc' : '#666',
                    transform: 'none',
                    boxShadow: 'none',
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
                    {t('loggingIn')}
                  </Box>
                ) : (
                  t('loginButton')
                )}
              </Button>

              {/* Divider */}
              <Box sx={{ position: 'relative', my: 3 }}>
                <Divider sx={{ 
                  borderColor: theme === THEME.LIGHT ? '#e0e0e0' : '#444', 
                  borderWidth: 1 
                }} />
                <Box
                  sx={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    bgcolor: 'transparent',
                    px: 3,
                    py: 1,
                  }}
                >
                  <Typography sx={{ 
                    color: theme === THEME.LIGHT ? '#000' : '#fff', 
                    fontWeight: 600, 
                    letterSpacing: '0.1em',
                    fontSize: '0.875rem',
                    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
                  }}>
                    OR
                  </Typography>
                </Box>
              </Box>

              {/* Social Logins */}
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Button
                  variant="outlined"
                  fullWidth
                  onClick={() => handleSocialLogin('Google')}
                  sx={{
                    borderColor: theme === THEME.LIGHT ? '#e0e0e0' : '#444',
                    color: theme === THEME.LIGHT ? '#666' : '#ccc',
                    borderRadius: 2,
                    py: 1.5,
                    fontWeight: 600,
                    transition: 'all 0.3s ease',
                    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
                    '&:hover': { 
                      borderColor: theme === THEME.LIGHT ? '#333' : '#666',
                      bgcolor: theme === THEME.LIGHT ? '#f8f9fa' : '#333',
                      transform: 'translateY(-1px)',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    },
                  }}
                >
                  <Box component="span" sx={{ mr: 1 }}>
                    <svg width="20" height="20" viewBox="0 0 24 24">
                      {/* Google Icon */}
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      />
                    </svg>
                  </Box>
                  {t('loginWithGoogle')}
                </Button>

                <Button
                  variant="contained"
                  fullWidth
                  onClick={() => handleSocialLogin('Facebook')}
                  sx={{
                    bgcolor: '#1877F2',
                    color: 'white',
                    borderColor: '#1877F2',
                    borderRadius: 2,
                    py: 1.5,
                    fontWeight: 600,
                    transition: 'all 0.3s ease',
                    boxShadow: '0 4px 12px rgba(24, 119, 242, 0.3)',
                    '&:hover': { 
                      bgcolor: '#166FE5', 
                      borderColor: '#166FE5',
                      transform: 'translateY(-1px)',
                      boxShadow: '0 8px 20px rgba(24, 119, 242, 0.4)',
                    },
                  }}
                >
                  <Box component="span" sx={{ mr: 1 }}>
                    <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                      {/* Facebook Icon */}
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                    </svg>
                  </Box>
                  {t('loginWithFacebook')}
                </Button>
              </Box>

              {/* Terms */}
              <Box sx={{ textAlign: 'center', mt: 4 }}>
                <Typography
                  variant="body2"
                  sx={{
                    color: theme === THEME.LIGHT ? '#666' : '#ccc',
                    textAlign: 'center',
                    mt: 2,
                    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
                  }}
                >
                  By logging in, you agree to our{' '}
                  <MuiLink
                    component={Link}
                    href={`/${locale}/terms`}
                    sx={{
                      color: theme === THEME.LIGHT ? '#333' : '#fff',
                      textDecoration: 'underline',
                      '&:hover': { 
                        color: theme === THEME.LIGHT ? '#555' : '#ccc',
                      },
                    }}
                  >
                    {t('termsOfService')}
                  </MuiLink>
                  {' '}và{' '}
                  <MuiLink
                    component={Link}
                    href={`/${locale}/privacy`}
                    sx={{
                      color: theme === THEME.LIGHT ? '#333' : '#fff',
                      textDecoration: 'underline',
                      '&:hover': { 
                        color: theme === THEME.LIGHT ? '#555' : '#ccc',
                      },
                    }}
                  >
                    {t('privacyPolicy')}
                  </MuiLink>
                  .
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Box>
      </Container>
    </Box>
  );
}