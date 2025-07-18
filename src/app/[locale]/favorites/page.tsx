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

export default function FavoritesPage() {
  const t = useTranslations('favorites');
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const {
    favorites,
    favoritesCount,
    loading,
    error,
    clearAllFavorites,
  } = useFavorites();
  const [clearDialogOpen, setClearDialogOpen] = useState(false);
  const [clearing, setClearing] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Redirect to login if not authenticated
  React.useEffect(() => {
    setMounted(true);
    if (!isAuthenticated) {
      router.push('/auth/login');
    }
  }, [isAuthenticated, router]);

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
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <FavoriteIcon sx={{ fontSize: 32, color: 'error.main' }} />
          <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>
            {t('title')}
          </Typography>
          {favoritesCount > 0 && (
            <Typography variant="h6" color="text.secondary">
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
              sx={{ minWidth: 120 }}
            >
              {t('clearAll')}
            </Button>
          </Tooltip>
        )}
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Loading State */}
      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress size={60} />
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
          <FavoriteIcon sx={{ fontSize: 80, color: 'grey.400', mb: 2 }} />
          <Typography variant="h5" color="text.secondary" gutterBottom>
            {t('emptyTitle')}
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3, maxWidth: 400 }}>
            {t('emptyDescription')}
          </Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={() => router.push('/')}
            sx={{ minWidth: 200 }}
          >
            {t('startShopping')}
          </Button>
        </Box>
      )}

      {/* Favorites Grid */}
      {!loading && favoritesCount > 0 && (
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)', lg: 'repeat(4, 1fr)' }, gap: 3 }}>
          {favorites.map((product) => (
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
                onAddToCart={() => console.log('Add to cart:', product._id)}
              />
            </Box>
          ))}
        </Box>
      )}

      {/* Clear All Dialog */}
      <Dialog open={clearDialogOpen} onClose={() => setClearDialogOpen(false)}>
        <DialogTitle>{t('clearAllConfirmTitle')}</DialogTitle>
        <DialogContent>
          <Typography>
            {t('clearAllConfirmMessage', { count: favoritesCount })}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setClearDialogOpen(false)} disabled={clearing}>
            {t('cancel')}
          </Button>
          <Button
            onClick={handleClearAll}
            color="error"
            variant="contained"
            disabled={clearing}
            startIcon={clearing ? <CircularProgress size={16} /> : <DeleteIcon />}
          >
            {clearing ? t('clearing') : t('clearAll')}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
} 