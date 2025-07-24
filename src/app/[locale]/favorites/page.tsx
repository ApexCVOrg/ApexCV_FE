'use client';

import React, { useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Button,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tooltip,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import FavoriteIcon from '@mui/icons-material/Favorite';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import ProductCard from '@/components/card';
import { useFavorites } from '@/hooks/useFavorites';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/hooks/useTheme';
import { THEME } from '@/lib/constants/constants';
import api from '@/services/api';
import { useEffect } from 'react';

export default function FavoritesPage() {
  const t = useTranslations('favorites');
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const { theme } = useTheme();
  const isDark = theme === THEME.DARK;
  const { favorites, favoritesCount, loading, error, clearAllFavorites } = useFavorites();
  const [clearDialogOpen, setClearDialogOpen] = useState(false);
  const [clearing, setClearing] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [averageRatings, setAverageRatings] = useState<Record<string, number>>({});

  // Redirect to login if not authenticated
  React.useEffect(() => {
    setMounted(true);
    if (!isAuthenticated) {
      // Get current locale from URL
      const currentLocale = window.location.pathname.split('/')[1];
      const loginUrl =
        currentLocale === 'en' || currentLocale === 'vi'
          ? `/${currentLocale}/auth/login`
          : '/vi/auth/login';
      router.push(loginUrl);
    }
  }, [isAuthenticated, router]);

  useEffect(() => {
    const fetchAverages = async () => {
      const ratings: Record<string, number> = {};
      await Promise.all(favorites.map(async (product) => {
        try {
          const res = await api.get(`/reviews/average/${product._id}`);
          const data = res.data as { average: number };
          ratings[product._id] = data.average || 0;
        } catch {
          ratings[product._id] = 0;
        }
      }));
      setAverageRatings(ratings);
    };
    if (favorites.length > 0) fetchAverages();
  }, [favorites]);

  const handleClearAll = async () => {
    setClearing(true);
    try {
      await clearAllFavorites();
      setClearDialogOpen(false);
    } catch (error) {
      console.error('Error clearing favorites:', error);
    } finally {
      setClearing(false);
    }
  };

  if (!mounted || !isAuthenticated) {
    return null; // Will redirect to login
  }

  return (
    <Box 
      sx={{ 
        backgroundColor: isDark ? '#000' : '#fff',
        minHeight: '100vh',
        width: '100%',
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        overflowY: 'auto',
        zIndex: 1,
      }}
    >
      <Container 
        maxWidth="xl" 
        sx={{ 
          py: 4,
          pt: 12, // Add top padding to avoid header overlap
          backgroundColor: 'transparent',
        }}
      >
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <FavoriteIcon sx={{ fontSize: 32, color: 'error.main' }} />
          <Typography 
            variant="h4" 
            component="h1" 
            sx={{ 
              fontWeight: 'bold',
              color: isDark ? '#e0e0e0' : '#333',
            }}
          >
            {t('title')}
          </Typography>
          {favoritesCount > 0 && (
            <Typography 
              variant="h6" 
              sx={{ 
                color: isDark ? '#ccc' : '#666',
              }}
            >
              ({favoritesCount} {t('items')})
            </Typography>
          )}
        </Box>

        {favoritesCount > 0 && (
          <Tooltip title={t('clearAllTooltip')}>
            <Button
              variant="outlined"
              color="error"
              startIcon={<DeleteIcon />}
              onClick={() => setClearDialogOpen(true)}
              sx={{ 
                minWidth: 120,
                borderColor: isDark ? '#d32f2f' : undefined,
                color: isDark ? '#f44336' : undefined,
                '&:hover': {
                  borderColor: isDark ? '#f44336' : undefined,
                  backgroundColor: isDark ? 'rgba(244, 67, 54, 0.08)' : undefined,
                },
              }}
            >
              {t('clearAll')}
            </Button>
          </Tooltip>
        )}
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert 
          severity="error" 
          sx={{ 
            mb: 3,
            backgroundColor: isDark ? '#1a1a1a' : undefined,
            color: isDark ? '#e0e0e0' : undefined,
            '& .MuiAlert-icon': {
              color: isDark ? '#f44336' : undefined,
            },
          }}
        >
          {error}
        </Alert>
      )}

      {/* Loading State */}
      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress 
            size={60} 
            sx={{ 
              color: isDark ? '#90caf9' : '#1976d2',
            }}
          />
        </Box>
      )}

      {/* Empty State */}
      {!loading && favoritesCount === 0 && (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            py: 8,
            textAlign: 'center',
          }}
        >
          <FavoriteIcon sx={{ 
            fontSize: 80, 
            color: isDark ? '#666' : '#ccc', 
            mb: 2 
          }} />
          <Typography 
            variant="h5" 
            sx={{ 
              color: isDark ? '#ccc' : '#666',
              mb: 1,
            }}
            gutterBottom
          >
            {t('emptyTitle')}
          </Typography>
          <Typography 
            variant="body1" 
            sx={{ 
              color: isDark ? '#999' : '#666',
              mb: 3, 
              maxWidth: 400 
            }}
          >
            {t('emptyDescription')}
          </Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={() => router.push('/')}
            sx={{ 
              minWidth: 200,
              backgroundColor: isDark ? '#90caf9' : '#1976d2',
              '&:hover': {
                backgroundColor: isDark ? '#64b5f6' : '#1565c0',
              },
            }}
          >
            {t('startShopping')}
          </Button>
        </Box>
      )}

      {/* Favorites Grid */}
      {!loading && favoritesCount > 0 && (
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              sm: 'repeat(2, 1fr)',
              md: 'repeat(3, 1fr)',
              lg: 'repeat(4, 1fr)',
            },
            gap: 3,
          }}
        >
          {favorites.map(product => (
            <Box key={product._id}>
              <ProductCard
                _id={product._id}
                productId={product._id}
                name={product.name}
                image={product.images[0] || '/assets/images/placeholder.jpg'}
                price={product.price}
                discountPrice={product.discountPrice}
                tags={product.tags}
                brand={product.brand}
                categories={product.categories}
                averageRating={averageRatings[product._id] ?? 0}
              />
            </Box>
          ))}
        </Box>
      )}

      {/* Clear All Dialog */}
      <Dialog 
        open={clearDialogOpen} 
        onClose={() => setClearDialogOpen(false)}
        PaperProps={{
          sx: {
            backgroundColor: isDark ? '#1a1a1a' : '#fff',
            color: isDark ? '#e0e0e0' : '#333',
          }
        }}
      >
        <DialogTitle sx={{ color: isDark ? '#e0e0e0' : '#333' }}>
          {t('clearAllConfirmTitle')}
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ color: isDark ? '#ccc' : '#666' }}>
            {t('clearAllConfirmMessage', { count: favoritesCount })}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setClearDialogOpen(false)} 
            disabled={clearing}
            sx={{ 
              color: isDark ? '#90caf9' : '#1976d2',
              '&:hover': {
                backgroundColor: isDark ? 'rgba(144, 202, 249, 0.08)' : undefined,
              },
            }}
          >
            {t('cancel')}
          </Button>
          <Button
            onClick={handleClearAll}
            color="error"
            variant="contained"
            disabled={clearing}
            startIcon={clearing ? <CircularProgress size={16} /> : <DeleteIcon />}
            sx={{ 
              backgroundColor: isDark ? '#d32f2f' : undefined,
              '&:hover': {
                backgroundColor: isDark ? '#c62828' : undefined,
              },
            }}
          >
            {clearing ? t('clearing') : t('clearAll')}
          </Button>
        </DialogActions>
      </Dialog>
      </Container>
    </Box>
  );
}
