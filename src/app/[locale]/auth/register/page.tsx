'use client';

import { useState } from 'react';
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
  Link as MuiLink,
  CircularProgress,
} from '@mui/material';
import { useAuth } from '@/hooks/useAuth'; // Assuming you have an auth hook
import { ROUTES } from '@/constants/routes';

export default function RegisterPage() {
  const t = useTranslations('Register');
  const router = useRouter();
  const { register } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (formData.password !== formData.confirmPassword) {
        setError(t('passwordsDoNotMatch'));
        return;
      }

      const response = await register(
        formData.email,
        formData.password,
        formData.email.split('@')[0] // Using email username as fullName for now
      );

      if (response) {
        router.push(ROUTES.LOGIN);
      }
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
        }}
      >
        <Paper elevation={3} sx={{ p: 4, width: '100%' }}>
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Typography variant="h4" component="h1" gutterBottom>
              {t('title')}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {t('subtitle')}{' '}
              <MuiLink component={Link} href={ROUTES.LOGIN} color="primary">
                {t('loginLink')}
              </MuiLink>
            </Typography>
          </Box>

          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
            <TextField
              fullWidth
              id="email"
              name="email"
              type="email"
              label={t('email')}
              required
              margin="normal"
              value={formData.email}
              onChange={e => setFormData({ ...formData, email: e.target.value })}
              disabled={loading}
            />
            <TextField
              fullWidth
              id="password"
              name="password"
              type="password"
              label={t('password')}
              required
              margin="normal"
              value={formData.password}
              onChange={e => setFormData({ ...formData, password: e.target.value })}
              disabled={loading}
            />
            <TextField
              fullWidth
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              label={t('confirmPassword')}
              required
              margin="normal"
              value={formData.confirmPassword}
              onChange={e => setFormData({ ...formData, confirmPassword: e.target.value })}
              disabled={loading}
            />

            {error && (
              <Typography color="error" variant="body2" sx={{ mt: 2, textAlign: 'center' }}>
                {error}
              </Typography>
            )}

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              sx={{ mt: 3 }}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : t('register')}
            </Button>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
}
